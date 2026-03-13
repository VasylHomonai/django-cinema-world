import { setupModal } from '/static/js/modalManager.js';
import { apiPost, apiPostForm } from './utils.js';

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


function switchToRegisterTab() {
    // видаляємо клас active у всіх вкладках
    tabs.forEach(t => t.classList.remove("active"));
    tabContents.forEach(c => c.classList.remove("active"));

    // робимо активною вкладку реєстрації
    document.querySelector('[data-tab="registerTab"]').classList.add("active");
    document.getElementById("registerTab").classList.add("active");
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

    const username = loginForm.username.value.trim();
    const password = loginForm.password.value;

    const data = await apiPost(API_URLS.login, { username, password });

    if (data.status === "no_user") {
        switchToRegisterTab();
        if (username.includes("@")) {
            const input = registerForm.email;
            input.value = data.username.trim();
            input.dispatchEvent(new Event("input"));
        } else {
            const input = registerForm.username;
            input.value = data.username.trim();
            input.dispatchEvent(new Event("input"));
        }
    } else if (data.status === "wrong_password") {
        showError("passwordError", gettext("Невірний пароль."));
    } else if (data.status === "success") {
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

registerForm.username.addEventListener("input", e => {
    e.target.value = e.target.value.trimStart(); // Обрізання пробілів у полі username на початку
});
registerForm.username.addEventListener("blur", e => {
    e.target.value = e.target.value.trim(); // Обрізання пробілів у полі username в кінці
});

registerForm.email.addEventListener("input", e => {
    e.target.value = e.target.value.trimStart(); // Обрізання пробілів у полі email на початку
});
registerForm.email.addEventListener("blur", e => {
    e.target.value = e.target.value.trim(); // Обрізання пробілів у полі email в кінці
});

// Обрізання пробілів у полі first_name
registerForm.first_name.addEventListener("input", e => {
    e.target.value = e.target.value.trimStart();
});

registerForm.first_name.addEventListener("blur", e => {
    e.target.value = e.target.value.trim();
});

// Обрізання пробілів у полі last_name
registerForm.last_name.addEventListener("input", e => {
    e.target.value = e.target.value.trimStart();
});

registerForm.last_name.addEventListener("blur", e => {
    e.target.value = e.target.value.trim();
});


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
