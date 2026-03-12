from django.urls import path
from django.views.i18n import JavaScriptCatalog

from .views import ProductDetailView, ProductListView

app_name = 'cinema'

urlpatterns = [
    path('', ProductListView.as_view(), name='home'),
    path("product/<str:slug_or_id>/", ProductDetailView.as_view(), name="product-detail"),
    path('jsi18n/', JavaScriptCatalog.as_view(), name='javascript-catalog'),
]
