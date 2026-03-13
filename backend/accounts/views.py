import json

from django.contrib.auth import (authenticate, get_user_model, login, logout,
                                 update_session_auth_hash)
from django.contrib.auth.decorators import login_required
from django.db.models import Q
from django.http import JsonResponse
from django.shortcuts import redirect, render
from django.urls import reverse
from django.utils.translation import gettext_lazy as _
from django.views.decorators.http import require_POST

from .forms import (RegisterForm, UserPasswordChangeForm, UserProfileForm,
                    UserUpdateForm)

User = get_user_model()


# Create your views here.
@require_POST
def login_view(request):
    try:
        data = json.loads(request.body)
        username = data.get("username", "").strip()
        password = data.get("password")
    except json.JSONDecodeError:
        username = request.POST.get("username", "").strip()
        password = request.POST.get("password")

    user_obj = User.objects.filter(
        Q(username__iexact=username) | Q(email__iexact=username)
    ).first()

    if not user_obj:
        return JsonResponse({"status": "no_user", "username": username})

    user = authenticate(request, username=user_obj.username, password=password)

    if user:
        login(request, user)

        return JsonResponse({
            "status": "success",
            "redirect_url": reverse("account:profile")
        })

    return JsonResponse({
        "status": "wrong_password"
    })


@require_POST
def register_view(request):
    data = json.loads(request.body)

    # Видаляємо пробіли з username та email
    clean_data = {
        "username": data.get("username", "").strip(),
        "email": data.get("email", "").strip(),
        "first_name": data.get("first_name", "").strip(),
        "last_name": data.get("last_name", "").strip(),
        "password1": data.get("password1", ""),
        "password2": data.get("password2", "")
    }

    form = RegisterForm(clean_data)
    if form.is_valid():
        user = form.save()
        login(request, user)
        return JsonResponse({"status": "success", "redirect_url": reverse("account:profile")})

    # Якщо помилка, повертаємо JSON із полями помилок
    errors = {field: error[0] for field, error in form.errors.items()}
    return JsonResponse({"status": "error", "errors": errors})


@require_POST
def logout_view(request):
    logout(request)
    return redirect("cinema:home")


@login_required
def profile_view(request):
    return render(request, "accounts/profile.html")


@login_required
@require_POST
def profile_update(request):

    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({"status": "error", "message": "Invalid JSON"}, status=400)

    field = data.get("field")
    value = (data.get("value") or "").strip()

    if not field:
        return JsonResponse({"status": "error", "message": "Field required"}, status=400)

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

            return JsonResponse({"status": "success", "value": getattr(user, field)})

        message = form.errors.get(field, [_("Недійсне значення")])[0]

        return JsonResponse({"status": "error", "message": message}, status=400)

    # PROFILE
    elif field in profile_fields:
        form = UserProfileForm(data={field: value}, instance=profile)

        if form.is_valid():
            setattr(profile, field, form.cleaned_data[field])
            profile.save(update_fields=[field])

            return JsonResponse({"status": "success", "value": getattr(profile, field)})

        message = form.errors.get(field, [_("Недійсне значення")])[0]

        return JsonResponse({"status": "error", "message": message}, status=400)

    # Невідоме поле
    else:
        return JsonResponse({"status": "error", "message": "Unknown field"}, status=400)


@login_required
@require_POST
def profile_change_password(request):
    form = UserPasswordChangeForm(user=request.user, data=request.POST)

    if form.is_valid():
        form.save()
        # щоб сесія не обірвалась після зміни пароля
        update_session_auth_hash(request, request.user)

        return JsonResponse({"status": "success", "message": _("Пароль успішно змінено")})

    # Збираємо помилки для JSON
    errors = {
        field: msgs[0]["message"]
        for field, msgs in form.errors.get_json_data().items()
    }

    return JsonResponse({"status": "error", "errors": errors}, status=400)


@login_required
def orders_view(request):
    """
    Заглушка сторінки 'Мої замовлення'
    """
    return render(request, "accounts/orders.html")
