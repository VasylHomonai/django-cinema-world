from django.views.generic import ListView, DetailView
from django.db.models import Prefetch, ExpressionWrapper, BooleanField, Q
from django.utils.translation import get_language
from django.http import Http404
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from .models import Product, ProductTranslation


# Create your views here.
class ProductListView(ListView):
    model = Product
    template_name = "cinema/products.html"
    context_object_name = "products"
    paginate_by = 8

    def get_queryset(self):
        language = get_language()

        return (
            Product.objects
            .filter(
                is_active=True,
                translations__lang=language
            )
            .annotate(
                in_stock=ExpressionWrapper(
                    Q(quantity__gt=0),
                    output_field=BooleanField()
                )
            )
            .prefetch_related(
                Prefetch(
                    "translations",
                    queryset=ProductTranslation.objects.filter(lang=language),
                    to_attr="current_translation"
                )
            )
            .order_by('-in_stock', 'id')
        )

    def get(self, request, *args, **kwargs):
        """
        Зберігаємо номер поточної сторінки в сесії
        """
        page = request.GET.get('page', 1)
        request.session['last_product_list_page'] = page
        return super().get(request, *args, **kwargs)

    def paginate_queryset(self, queryset, page_size):
        """Перевизначаємо пагінацію, щоб при порожній сторінці поверталася остання доступна"""
        paginator = Paginator(queryset, page_size)
        page = self.request.GET.get('page', 1)
        try:
            page_obj = paginator.page(page)
        except (EmptyPage, PageNotAnInteger):
            page_obj = paginator.page(paginator.num_pages)
        return (paginator, page_obj, page_obj.object_list, page_obj.has_other_pages())


class ProductDetailView(DetailView):
    model = Product
    template_name = "cinema/product_detail.html"
    context_object_name = "product"

    def get_object(self, queryset=None):
        slug_or_id = self.kwargs.get("slug_or_id")
        language = get_language()

        # спроба знайти продукт по slug
        product = Product.objects.filter(
            slug=slug_or_id,
            is_active=True
        ).first()

        # якщо не знайдено по slug, пробуємо як id
        if not product:
            try:
                product = Product.objects.get(
                    id=int(slug_or_id),
                    is_active=True
                )
            except (Product.DoesNotExist, ValueError):
                raise Http404("Продукт не знайдено")

        # додамо в продукт атрибут current_translation для шаблону
        product.current_translation = product.translations.filter(lang=language)
        return product

    def get_context_data(self, **kwargs):
        """
        Додаємо останню сторінку пагінації в контекст для кнопки "На головну"
        """
        context = super().get_context_data(**kwargs)
        context['last_page'] = self.request.session.get('last_product_list_page', 1)
        return context
