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


class PartialUpdateModelForm(forms.ModelForm):

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        for field in self.fields.values():
            field.required = False


class UserProfileForm(PartialUpdateModelForm):
    phone = forms.CharField(
        validators=[phone_validator],
        required=False
    )

    class Meta:
        model = UserProfile
        fields = ["phone", "city", "address"]


class UserUpdateForm(PartialUpdateModelForm):

    class Meta:
        model = User
        fields = ["username", "first_name", "last_name", "email"]

    def clean_username(self):
        if "username" not in self.data:
            return self.instance.username

        username = self.cleaned_data.get("username")

        if not username:
            raise forms.ValidationError(_("Nickname не може бути порожнім"))

        if User.objects.filter(username__iexact=username).exclude(pk=self.instance.pk).exists():
            raise forms.ValidationError(_("Цей нікнейм вже зайнятий"))

        return username

    def clean_email(self):
        if "email" not in self.data:
            return self.instance.email

        email = self.cleaned_data.get("email")

        if not email:
            raise forms.ValidationError(_("Email не може бути порожнім"))

        if User.objects.filter(email__iexact=email).exclude(pk=self.instance.pk).exists():
            raise forms.ValidationError(_("Цей email вже використовується"))

        return email


class RegisterForm(UserCreationForm):
    email = forms.EmailField(label="Email", required=True)
    first_name = forms.CharField(label=_("Ім'я"), required=False)
    last_name = forms.CharField(label=_("Фамілія"), required=False)

    class Meta:
        model = User
        fields = ("username", "first_name", "last_name", "email", "password1", "password2")

    def clean_username(self):
        username = self.cleaned_data["username"]
        # перевірка на унікальність незалежно від регістру
        if User.objects.filter(username__iexact=username).exists():
            raise forms.ValidationError(_("Користувач з таким нікнеймом вже існує"))

        return username

    def clean_email(self):
        email = self.cleaned_data["email"].lower()

        if User.objects.filter(email__iexact=email).exists():
            raise forms.ValidationError(_("Користувач з таким email вже існує"))

        return email

    def save(self, commit=True):
        user = super().save(commit=False)

        user.email = self.cleaned_data["email"]
        user.first_name = self.cleaned_data.get("first_name", "")
        user.last_name = self.cleaned_data.get("last_name", "")

        if commit:
            user.save()

        return user


class UserPasswordChangeForm(PasswordChangeForm):

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        for field in self.fields.values():
            field.widget.attrs["class"] = "form-control"
