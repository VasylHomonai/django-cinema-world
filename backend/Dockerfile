FROM python:3.12.9-slim

# Python configuration
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PIP_NO_CACHE_DIR=1

# Django settings для dev
ENV DJANGO_SETTINGS_MODULE=config.settings.dev

# Poetry config
ENV POETRY_VERSION=2.3.2
ENV POETRY_VIRTUALENVS_CREATE=false

# Робоча директорія для додатку
WORKDIR /usr/src/cinema-world

# Install GNU gettext tools (required for Django translations: makemessages, compilemessages)
RUN apt-get update && apt-get install -y gettext && rm -rf /var/lib/apt/lists/*

# Встановлюємо Poetry
RUN pip install poetry==$POETRY_VERSION

# Копіюємо тільки файли залежностей (для кешу)
COPY pyproject.toml poetry.lock ./

# Встановлюємо залежності
RUN poetry install --with dev --no-root --no-interaction --no-ansi

# COPY . .  # Наразі монтується в сервісі

# Експортуємо порти
EXPOSE 8000

CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]