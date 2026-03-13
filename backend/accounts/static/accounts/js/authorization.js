import { setupModal } from '/static/js/modalManager.js';
import { apiPostForm } from './utils.js';

const userButton = document.getElementById("userButton");
const authModal = document.getElementById("authModal");
const closeAuthModal = document.getElementById("closeAuthModal");

const tabs = document.querySelectorAll(".auth-tab");
const tabContents = document.querySelectorAll(".auth-tab-content");

const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");

// Ініціалізація модалки
setupModal(authModal, userButton, closeAuthModal);


function showError(elementId, message) {
    const el = document.getElementById(elementId);

    if (el) {
        el.textContent = message;
        el.style.display = "block";
    }
}


// Скидує всі помилки полів
function clearErrors() {
    document.querySelectorAll(".error-message").forEach(el => {
        el.textContent = "";
        el.style.display = "none";
    });
}


// Скидує помилку для конкретного поля
function clearFieldError(fieldName) {
    let errorId;

    if (fieldName === "password1" || fieldName === "password2") {
        errorId = "passwordRegError";
    } else {
        errorId = fieldName + "Error";
    }

    const el = document.getElementById(errorId);

    if (el) {
        el.textContent = "";
        el.style.display = "none";
    }
}


// Обрізання пробілів на полях input
function setupTrimField(field) {
    if (!field) return;

    field.addEventListener("input", e => { e.target.value = e.target.value.trimStart(); });
    field.addEventListener("blur", e => { e.target.value = e.target.value.trim(); });
}


document.addEventListener('DOMContentLoaded', () => {
  const userButton = document.querySelector('.user-button');
  if (!userButton) return;

  const userLink = userButton.querySelector('.user-link');
  if (!userLink) return;

  userLink.addEventListener('click', (e) => {
    e.preventDefault(); // щоб кнопка не перекидала на інший URL
    userButton.classList.toggle('active');
  });

  // Закриття при кліку поза кнопкою
  document.addEventListener('click', (e) => {
    if (!userButton.contains(e.target)) {
      userButton.classList.remove('active');
    }
  });
});


document.querySelectorAll("input[placeholder]").forEach(input => {
    // Керування placeholder: приховати при фокусі, повернути якщо поле порожнє
    input.dataset.placeholder = input.placeholder;

    input.addEventListener("focus", function () {
        this.placeholder = "";
    });

    input.addEventListener("blur", function () {
        if (!this.value) {
            this.placeholder = this.dataset.placeholder;
        }
    });

});


// Авторизація користувача
loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearErrors();

    const formData = new FormData(loginForm);

    const data = await apiPostForm(API_URLS.login, formData);

    if (data.status === "error") {
        showError("passwordError", gettext("Невірний логін або пароль"));
    }

    if (data.status === "success") {
        authModal.style.display = "none";
        window.location.href = data.redirect_url;
    }
});

// Реєстрація користувача
registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    clearErrors();

    const formData = new FormData(e.target);

    const data = await apiPostForm(API_URLS.register, formData);

    if (data.status === "error") {
        for (const field in data.errors) {
            let elId;

            if (field === "password1" || field === "password2") {
                elId = "passwordRegError";
            } else {
                elId = field + "Error";
            }

            showError(elId, data.errors[field]);
        }
    } else if (data.status === "success") {
        window.location.href = data.redirect_url;
    }
});


// Робота з полями для форми авторизації
loginForm.querySelectorAll("input").forEach(input => {
    // Очищення помилки відповідного поля при зміні значення
    input.addEventListener("input", () => {
        clearFieldError(input.name);
    });
});

loginForm.username.addEventListener("input", e => {
    e.target.value = e.target.value.trimStart(); // Обрізання пробілів у полі username на початку
});
loginForm.username.addEventListener("blur", e => {
    e.target.value = e.target.value.trim(); // Обрізання пробілів у полі username в кінці
});

// Робота з полями для форми реєстрації
registerForm.querySelectorAll("input").forEach(input => {
    // Очищення помилки відповідного поля при зміні значення
    input.addEventListener("input", () => {
        clearFieldError(input.name);
    });
});


// Обрізання пробілів у заданих полях на початку та в кінці
[registerForm.username, registerForm.email, registerForm.first_name, registerForm.last_name]
    .forEach(setupTrimField);


// Переключення вкладок
tabs.forEach(tab => {
    tab.addEventListener("click", () => {

        tabs.forEach(t => t.classList.remove("active"));
        tabContents.forEach(c => c.classList.remove("active"));

        tab.classList.add("active");

        const target = tab.dataset.tab;
        document.getElementById(target).classList.add("active");
    });
});
