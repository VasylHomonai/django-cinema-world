from django.conf import settings
from django.db import models


# Create your models here.
class UserProfile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="profile",
        verbose_name="Користувач"
    )

    phone = models.CharField("Телефон", max_length=13, blank=True)
    city = models.CharField("Місто", max_length=75, blank=True)
    address = models.TextField("Адреса", blank=True)

    created_at = models.DateTimeField("Створено", auto_now_add=True)
    updated_at = models.DateTimeField("Оновлено", auto_now=True)

    def __str__(self):
        return self.user.username

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Профіль користувача"
        verbose_name_plural = "Профілі користувачів"
