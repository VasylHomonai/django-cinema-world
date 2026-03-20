import os
from pathlib import Path

# ──────────── Paths ────────────
BASE_DIR = Path(__file__).resolve().parent.parent
LOG_DIR = BASE_DIR / "logs"
LOG_DIR.mkdir(exist_ok=True)

# ──────────── Консольний лог (вмикається через змінну середовища) ────────────
# export DJANGO_LOG_CONSOLE=1  Linux / macOS
# setx DJANGO_LOG_CONSOLE 1    Windows PowerShell
console_enabled = os.getenv("DJANGO_LOG_CONSOLE", "0") == "1"


# ──────────── Конфігурація логування ────────────
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,

    "formatters": {
        "simple": {
            "format": "%(asctime)s - %(levelname)s - %(name)s - %(message)s",
        },
        "detailed": {
            "format": "%(asctime)s - %(levelname)s - %(name)s - %(message)s - %(pathname)s:%(lineno)d",
        },
    },

    "handlers": {
        # ─── Консольний лог (вмикається через змінну середовища) ───
        "console": {
            "class": "logging.StreamHandler",
            "level": "INFO",
            "formatter": "simple",
        },

        # ─── Основний лог для всіх INFO+ повідомлень ───
        "file": {
            "class": "logging.handlers.TimedRotatingFileHandler",
            "level": "INFO",
            "filename": LOG_DIR / "app.log",
            "when": "midnight",
            "interval": 1,
            "backupCount": 7,
            "encoding": "utf-8",
            "formatter": "simple",
        },

        # ─── Окремий лог для ERROR+ ───
        "errors": {
            "class": "logging.handlers.TimedRotatingFileHandler",
            "level": "ERROR",
            "filename": LOG_DIR / "errors.log",
            "when": "midnight",
            "interval": 1,
            "backupCount": 7,
            "encoding": "utf-8",
            "formatter": "detailed",
        },
    },

    "root": {
        "handlers": ["file", "errors"] + (["console"] if console_enabled else []),
        "level": "INFO",
    },
}
