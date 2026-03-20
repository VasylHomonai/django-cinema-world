from django.contrib import admin, messages
from django.utils import timezone

from .models import Product, ProductTranslation


# Register your models here.
class AuthorRestrictedAdminMixin:
    """
    Обмежує change/delete/actions тільки для власних об'єктів для групи Product Managers
    """
    group_name = "Product Managers"

    def is_product_manager(self, request):
        return request.user.groups.filter(name=self.group_name).exists()

    def filter_queryset_by_author(self, request, queryset):
        if self.is_product_manager(request):
            return queryset.filter(author=request.user)
        return queryset


class ProductTranslationInline(admin.StackedInline):
    model = ProductTranslation
    extra = 1
    readonly_fields = ('created_at', 'updated_at')

    # Обмеження редагування товарів для певної групи користувачів
    def has_change_permission(self, request, obj=None):
        if request.user.groups.filter(name="Product Managers").exists():
            if obj is None:
                return True  # доступ до списку
            return obj.author == request.user
        return super().has_change_permission(request, obj)

    # Обмеження видалення товарів для певної групи користувачів
    def has_delete_permission(self, request, obj=None):
        if request.user.groups.filter(name="Product Managers").exists():
            if obj is None:
                return True
            return obj.author == request.user
        return super().has_delete_permission(request, obj)


@admin.register(Product)
class ProductAdmin(AuthorRestrictedAdminMixin, admin.ModelAdmin):
    list_display = ('id', 'name_uk', 'price', 'quantity', 'is_active', 'author_display', 'created_at', 'updated_at')
    readonly_fields = ['author_display', 'created_at', 'updated_at']
    fields = ['price', 'quantity', 'year', 'is_active', 'slug', 'author_display', 'created_at', 'updated_at']
    list_filter = ('author',)
    search_fields = ('translations__name',)
    inlines = [ProductTranslationInline]
    list_display_links = ("id", "name_uk")
    actions = ['activate_products', 'deactivate_products']

    def name_uk(self, obj):
        translation = obj.translations.filter(lang='uk').first()
        return translation.name if translation else "-"

    name_uk.short_description = "Назва (UK)"

    def author_display(self, obj):
        return obj.author.username if obj.author else "-"

    author_display.short_description = "Автор"
    author_display.admin_order_field = 'author'

    @admin.action(description='Активувати вибрані товари')
    def activate_products(self, request, queryset):
        """Дія для активації товарів"""
        original_count = queryset.count()
        queryset = self.filter_queryset_by_author(request, queryset)
        updated_count = queryset.update(is_active=True, updated_at=timezone.now())

        if updated_count < original_count:
            self.message_user(
                request,
                f"Деякі товари пропущено — ви не є їх автором. {updated_count} / {original_count}",
                level=messages.WARNING
            )

        self.message_user(request, f'{updated_count} товарів активовано.')

    @admin.action(description='Деактивувати вибрані товари')
    def deactivate_products(self, request, queryset):
        """Дія для деактивації товарів"""
        original_count = queryset.count()
        queryset = self.filter_queryset_by_author(request, queryset)
        updated_count = queryset.update(is_active=False, updated_at=timezone.now())

        if updated_count < original_count:
            self.message_user(
                request,
                f"Деякі товари пропущено — ви не є їх автором. {updated_count} / {original_count}",
                level=messages.WARNING
            )

        self.message_user(request, f'{updated_count} товарів деактивовано.')

    class Media:
        js = ('admin/js/deactivate_products.js',)

    # Автоматичне встановлення автора при створенні
    def save_model(self, request, obj, form, change):
        if not obj.author:
            obj.author = request.user
        super().save_model(request, obj, form, change)

    # Обмеження редагування товарів для певної групи користувачів
    def has_change_permission(self, request, obj=None):
        if request.user.groups.filter(name="Product Managers").exists():
            if obj is None:
                return True
            return obj.author == request.user
        return super().has_change_permission(request, obj)

    # Обмеження видалення товарів для певної групи користувачів
    def has_delete_permission(self, request, obj=None):
        if request.user.groups.filter(name="Product Managers").exists():
            if obj is None:
                return True
            return obj.author == request.user
        return super().has_delete_permission(request, obj)
