from .base import *

DEBUG = True

ALLOWED_HOSTS = [
    "127.0.0.1",
    "localhost",
]

# Захист cookies
SESSION_COOKIE_SECURE = False
CSRF_COOKIE_SECURE = False


INSTALLED_APPS += [
    'django_extensions',
]

# Email не відправляється реально, просто друкується в консоль
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
