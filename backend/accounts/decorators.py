import logging
from functools import wraps

from django.conf import settings
from django.db import OperationalError
from django.http import JsonResponse
from django.utils.translation import gettext as _

logger = logging.getLogger(__name__)


def handle_db_errors(view_func):
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        try:
            return view_func(request, *args, **kwargs)

        except OperationalError as e:
            logger.error(
                "Database error in %s (IP: %s): %s",
                view_func.__name__,
                request.META.get("REMOTE_ADDR"),
                str(e)
            )

            message = _("Сервіс тимчасово недоступний. Спробуйте пізніше.")

            if settings.DEBUG:
                return JsonResponse({"status": "error", "message": message, "debug": str(e)}, status=500)

            return JsonResponse({"status": "error", "message": message}, status=500)

        except Exception as e:
            logger.exception("Unexpected error in %s", view_func.__name__)

            message = _("Сталася неочікувана помилка")

            if settings.DEBUG:
                return JsonResponse({"status": "error", "message": message, "debug": str(e)}, status=500)

            return JsonResponse({"status": "error", "message": message}, status=500)

    return wrapper
