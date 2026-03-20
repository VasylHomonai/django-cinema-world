import json
import logging

from django.contrib.auth import (authenticate, get_user_model, login, logout,
                                 update_session_auth_hash)
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.shortcuts import render
from django.urls import reverse
from django.utils.translation import gettext_lazy as _
from django.views.decorators.http import require_POST

from .decorators import handle_db_errors
from .forms import (LoginForm, RegisterForm, UserPasswordChangeForm,
                    UserProfileForm, UserUpdateForm)

User = get_user_model()

logger = logging.getLogger(__name__)


# Create your views here.
def format_errors(form):
    return {
        field: [msg["message"] for msg in msgs]
        for field, msgs in form.errors.get_json_data().items()
    }


@handle_db_errors
@require_POST
def login_view(request):
    form = LoginForm(request.POST)

    if not form.is_valid():
        logger.warning(
            "Login attempt with invalid form data: %s (username: %s, IP: %s)",
            form.errors.get_json_data(),
            request.POST.get("username"),
            request.META.get("REMOTE_ADDR")
        )
        return JsonResponse({"status": "error", "errors": format_errors(form)}, status=400)

    username = form.cleaned_data["username"]
    password = form.cleaned_data["password"]

    # Використання кастомного бекенду
    user = authenticate(request, username=username, password=password)

    if user is None:
        logger.warning(
            "Failed login attempt for username: %s (IP: %s)",
            username,
            request.META.get("REMOTE_ADDR")
        )
        return JsonResponse({"status": "error", "message": _("Невірний логін або пароль")}, status=400)

    login(request, user)
    logger.info(
        "User logged in successfully: %s (ID: %s) (IP: %s)",
        username,
        request.user.id,
        request.META.get("REMOTE_ADDR")
    )

    return JsonResponse({"status": "success", "redirect_url": reverse("account:profile")})


@handle_db_errors
@require_POST
def register_view(request):
    form = RegisterForm(request.POST)

    if not form.is_valid():
        logger.warning(
            "Registration attempt with invalid data: %s (username: %s (ID: %s), email: %s, IP: %s)",
            form.errors.get_json_data(),
            request.POST.get("username"),
            request.user.id,
            request.POST.get("email"),
            request.META.get("REMOTE_ADDR")
        )
        return JsonResponse({"status": "error", "errors": format_errors(form)}, status=400)

    user = form.save()
    login(request, user)

    logger.info(
        "User registered successfully: %s (ID: %s) (email: %s)",
        user.username,
        request.user.id,
        user.email
    )
    return JsonResponse({"status": "success", "redirect_url": reverse("account:profile")})


@handle_db_errors
@require_POST
def logout_view(request):
    if request.user.is_authenticated:
        username = request.user.username
        user_id = request.user.id
    else:
        username = "Anonymous"
        user_id = None

    logout(request)

    logger.info(
        "User logged out: %s (ID: %s) (IP: %s)",
        username,
        user_id,
        request.META.get("REMOTE_ADDR")
    )

    return JsonResponse({"status": "success", "redirect_url": reverse("cinema:home")})


@login_required
def profile_view(request):
    return render(request, "accounts/profile.html")


@handle_db_errors
@login_required
@require_POST
def profile_update(request):

    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        logger.warning(
            "Invalid JSON in profile_update by user %s (ID: %s) (IP: %s)",
            request.user.username,
            request.user.id,
            request.META.get("REMOTE_ADDR")
        )
        return JsonResponse({"status": "error", "message": _("Некоректні дані запиту")}, status=400)

    field = data.get("field")
    value = (data.get("value") or "").strip()

    if not field:
        logger.warning(
            "Profile update attempt with missing field by user %s (ID: %s) (IP: %s)",
            request.user.username,
            request.user.id,
            request.META.get("REMOTE_ADDR")
        )
        return JsonResponse({"status": "error", "message": _("Обов'язкове поле")}, status=400)

    user = request.user
    profile = user.profile

    user_fields = ("username", "first_name", "last_name", "email")
    profile_fields = ("phone", "city", "address")

    # USER
    if field in user_fields:
        form = UserUpdateForm(data={field: value}, instance=user)

        if form.is_valid():
            setattr(user, field, form.cleaned_data[field])
            user.save(update_fields=[field])

            logger.info(
                "User %s (ID: %s) updated field '%s' successfully",
                user.username,
                request.user.id,
                field
            )
            return JsonResponse({"status": "success", "value": getattr(user, field)})

        message = form.errors.get(field, [_("Недійсне значення")])[0]

        logger.warning(
            "Invalid update for field '%s' by user %s (ID: %s) (IP: %s): %s",
            field,
            user.username,
            request.user.id,
            request.META.get("REMOTE_ADDR"),
            message
        )
        return JsonResponse({"status": "error", "message": message}, status=400)

    # PROFILE
    elif field in profile_fields:
        form = UserProfileForm(data={field: value}, instance=profile)

        if form.is_valid():
            setattr(profile, field, form.cleaned_data[field])
            profile.save(update_fields=[field])

            logger.info(
                "User %s (ID: %s) updated profile field '%s' successfully",
                user.username,
                request.user.id,
                field
            )
            return JsonResponse({"status": "success", "value": getattr(profile, field)})

        message = form.errors.get(field, [_("Недійсне значення")])[0]

        logger.warning(
            "Invalid update for profile field '%s' by user %s (ID: %s) (IP: %s): %s",
            field,
            user.username,
            request.user.id,
            request.META.get("REMOTE_ADDR"),
            message
        )
        return JsonResponse({"status": "error", "message": message}, status=400)

    # Невідоме поле
    else:
        logger.warning(
            "Unknown field update attempt '%s' by user %s (ID: %s) (IP: %s)",
            field,
            user.username,
            request.user.id,
            request.META.get("REMOTE_ADDR")
        )
        return JsonResponse({"status": "error", "message": _("Неможливо оновити це поле")}, status=400)


@handle_db_errors
@login_required
@require_POST
def profile_change_password(request):
    form = UserPasswordChangeForm(user=request.user, data=request.POST)

    if form.is_valid():
        form.save()
        # щоб сесія не обірвалась після зміни пароля
        update_session_auth_hash(request, request.user)

        logger.info(
            "User %s (ID: %s) successfully changed password",
            request.user.username,
            request.user.id
        )
        return JsonResponse({"status": "success", "message": _("Пароль успішно змінено")})

    errors = format_errors(form)

    logger.warning(
        "User %s (ID: %s) failed to change password. Errors: %s",
        request.user.username,
        request.user.id,
        errors
    )
    return JsonResponse({"status": "error", "errors": errors}, status=400)


@login_required
def orders_view(request):
    """
    Заглушка сторінки 'Мої замовлення'
    після розробки сервісу orders перенесеться туди.
    """
    return render(request, "accounts/orders.html")
