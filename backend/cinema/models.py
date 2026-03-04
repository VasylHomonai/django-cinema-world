from django.db import models
from django.contrib.auth.models import User
from django.utils.text import slugify

# Create your models here.
class Product(models.Model):
    """
    Основна модель продукту, дані спільні для всіх мов
    """
    price = models.PositiveIntegerField("Ціна")
    quantity = models.PositiveIntegerField("Залишок", default=0)
    year = models.PositiveIntegerField("Рік")
    is_active = models.BooleanField("Активний", default=True)
    slug = models.SlugField(unique=True, null=True, blank=True)
    created_at = models.DateTimeField("Створено", auto_now_add=True)
    updated_at = models.DateTimeField("Оновлено", auto_now=True)
    author = models.ForeignKey(
        User,
        verbose_name="Автор",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="products"
    )

    @property
    def translation(self):
        if hasattr(self, "current_translation") and self.current_translation:
            return self.current_translation[0]
        return None

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)

        if not self.slug:
            en_translation = self.translations.filter(lang='en').first()
            if en_translation:
                self.slug = slugify(en_translation.name)
                super().save(update_fields=['slug'])

    @property
    def is_available(self):
        """Товар доступний для покупки, якщо є залишок і він активний"""
        return self.quantity > 0 and self.is_active

    def __str__(self):
        return f"Продукт #{self.id} - {self.price} ₴"


class ProductTranslation(models.Model):
    """
    Мовна версія продукту
    """
    LANG_CHOICES = [
        ('uk', 'Українська'),
        ('en', 'English'),
    ]

    product = models.ForeignKey(
        Product,
        related_name="translations",
        on_delete=models.CASCADE
    )
    lang = models.CharField(
        "Мова",
        max_length=5,
        choices=LANG_CHOICES
    )
    name = models.CharField("Ім'я фільму", max_length=255)
    description = models.TextField("Опис фільму", blank=True, null=True)
    image = models.ImageField("Картинка фільму", upload_to="products/")
    trailer_url = models.URLField("Посилання на трейлер", blank=True, null=True)
    company = models.CharField("Виробник", max_length=255)
    duration = models.CharField("Тривалість", max_length=50)
    country = models.CharField("Країна", max_length=100)
    created_at = models.DateTimeField("Створено", auto_now_add=True)
    updated_at = models.DateTimeField("Оновлено", auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['product', 'lang'], name='unique_product_lang')
        ]  # Забороняє дублювати одну мову для одного продукту

    def __str__(self):
        return f"{self.name} ({self.lang})"
