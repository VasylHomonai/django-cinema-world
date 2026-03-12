from django.urls import path

from . import views

app_name = "account"

urlpatterns = [
    path("profile/", views.profile_view, name="profile"),
    path("orders/", views.orders_view, name="orders"),
]
