FROM python:3.12.9-slim

# Python configuration
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Робоча директорія для самого додатку
WORKDIR /usr/src/cinema-world

# Install GNU gettext tools (required for Django translations: makemessages, compilemessages)
RUN apt-get update && apt-get install -y gettext

# Копіюємо залежності та встановлюємо
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# COPY . .  # Наразі монтується в сервісі

# Експортуємо порти
EXPOSE 8000

CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]