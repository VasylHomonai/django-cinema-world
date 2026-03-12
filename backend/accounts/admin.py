from django.contrib import admin
from django.contrib.auth import get_user_model
from django.contrib.auth.admin import UserAdmin

from .models import UserProfile

# Register your models here.
User = get_user_model()


class UserProfileInline(admin.StackedInline):
    model = UserProfile
    can_delete = False
    extra = 0
    readonly_fields = ("created_at", "updated_at")
    verbose_name_plural = "Профілі користувачів"


admin.site.unregister(User)


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    inlines = (UserProfileInline,)
    list_display = UserAdmin.list_display + ("get_phone",)
    search_fields = UserAdmin.search_fields + ("profile__phone",)
    ordering = ("-date_joined",)

    def get_phone(self, obj):
        return getattr(obj.profile, "phone", None)

    get_phone.short_description = "Phone"
