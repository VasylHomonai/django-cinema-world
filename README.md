# django-cinema-world
CinemaWorld allows users to explore a movie catalog, view trailers, and conveniently reserve cinema seats online, built with Django and PostgreSQL.

Запуск проєкуту в dev середовищі:
В backend\Dockerfile додано змінну DJANGO_SETTINGS_MODULE (ENV DJANGO_SETTINGS_MODULE=config.settings.dev) яка і 
відповідає за dev середовище:
docker compose up --build -d

Запуск проєкуту в prod середовищі:
Або змінити в backend\Dockerfile змінну DJANGO_SETTINGS_MODULE (ENV DJANGO_SETTINGS_MODULE=config.settings.prod) і 
запустити проєкт:
docker compose up --build -d
Або писати новий docker-compose з Dockerfile для prod