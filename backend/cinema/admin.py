from django.contrib import admin
from .models import Product, ProductTranslation

# Register your models here.
class ProductTranslationInline(admin.StackedInline):
    model = ProductTranslation
    extra = 1
    readonly_fields = ('created_at', 'updated_at')


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('id', 'name_uk', 'price', 'quantity', 'is_active', 'created_at', 'updated_at')
    inlines = [ProductTranslationInline]
    list_display_links = ("name_uk",)

    def name_uk(self, obj):
        translation = obj.translations.filter(lang='uk').first()
        return translation.name if translation else "-"

    name_uk.short_description = "Назва (UK)"
