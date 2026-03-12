from django import forms
from django.contrib.auth import get_user_model
from django.contrib.auth.forms import PasswordChangeForm, UserCreationForm
from django.core.validators import RegexValidator
from django.utils.translation import gettext_lazy as _

from .models import UserProfile

User = get_user_model()


phone_validator = RegexValidator(
    regex=r'^\+?\d{9,13}$',
    message=_("Номер телефону має бути у форматі +380XXXXXXXXX або 0XXXXXXXXX")
)


class UserProfileForm(forms.ModelForm):
    phone = forms.CharField(
        validators=[phone_validator],
        required=False,
        label=_("Телефон")
    )

    class Meta:
        model = UserProfile
        fields = ["phone", "city", "address"]


class UserForm(forms.ModelForm):
    email = forms.EmailField(required=True, label="Email")

    class Meta:
        model = User
        fields = ["first_name", "last_name", "email"]


class RegisterForm(UserCreationForm):
    email = forms.EmailField(required=True)
    first_name = forms.CharField(label=_("Ім'я"), required=False)
    last_name = forms.CharField(label=_("Фамілія"), required=False)

    class Meta:
        model = User
        fields = ("username", "first_name", "last_name", "email", "password1", "password2")

    def clean_username(self):
        username = self.cleaned_data["username"].strip()
        # перевірка на унікальність незалежно від регістру
        if User.objects.filter(username__iexact=username).exists():
            raise forms.ValidationError(_("Користувач з таким нікнеймом вже існує"))
        return username

    def clean_email(self):
        email = self.cleaned_data["email"].strip().lower()

        if User.objects.filter(email=email).exists():
            raise forms.ValidationError(_("Користувач з таким email вже існує"))
        return email

    def save(self, commit=True):
        user = super().save(commit=False)
        user.email = self.cleaned_data["email"].lower()
        user.first_name = self.cleaned_data["first_name"]
        user.last_name = self.cleaned_data["last_name"]
        if commit:
            user.save()
        return user


class UserPasswordChangeForm(PasswordChangeForm):
    old_password = forms.CharField(
        label=_("Поточний пароль"),
        strip=False,
        widget=forms.PasswordInput(attrs={"autocomplete": "current-password", "class": "form-control"})
    )
    new_password1 = forms.CharField(
        label=_("Новий пароль"),
        strip=False,
        widget=forms.PasswordInput(attrs={"autocomplete": "new-password", "class": "form-control"})
    )
    new_password2 = forms.CharField(
        label=_("Підтвердження нового пароля"),
        strip=False,
        widget=forms.PasswordInput(attrs={"autocomplete": "new-password", "class": "form-control"})
    )
