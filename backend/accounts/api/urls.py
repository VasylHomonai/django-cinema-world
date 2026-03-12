from django.urls import path

from .. import views

app_name = "account_api"

urlpatterns = [
    path("login/", views.login_view, name="login"),
    path("logout/", views.logout_view, name="logout"),
    path("register/", views.register_view, name="register"),
    path("profile/update/", views.profile_update, name="profile_update"),
    path("profile/change-password/", views.profile_change_password, name="profile_change_password"),
]
