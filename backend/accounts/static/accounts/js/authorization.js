import { setupModal } from '/static/js/modalManager.js';
import { apiPostForm } from './utils.js';

const userButton = document.getElementById("userButton");
const authModal = document.getElementById("authModal");
const closeAuthModal = document.getElementById("closeAuthModal");

const tabs = document.querySelectorAll(".auth-tab");
const tabContents = document.querySelectorAll(".auth-tab-content");

const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");

const usernameInput = loginForm.querySelector("input[name='username']");

// Ініціалізація модалки
setupModal(authModal, userButton, closeAuthModal);


// Показ помилок на полях форми
export function showFieldErrors(form, errors) {
    if (!errors) return;

    for (const [field, errs] of Object.entries(errors)) {
        const input = form.querySelector(`[name="${field}"]`);
        if (!input) continue;

        const errorEl = input.closest(".form-group")?.querySelector(".error-message");

        if (errorEl) {
            errorEl.textContent = errs.join(", ");
            errorEl.style.display = "block";
        }
    }
}


// Показ загальної помилки у формі під певним полем
function showFormError(form, message, inputName) {
    const input = form.querySelector(`[name="${inputName}"]`);
    if (!input) return;

    const errorEl = input.closest(".form-group")?.querySelector(".error-message");

    if (errorEl) {
        errorEl.textContent = message;
        errorEl.style.display = "block";
    }
}


// Скидує всі помилки полів
function clearErrorsForForm(form) {
  form.querySelectorAll(".error-message").forEach(el => {
    el.textContent = "";
    el.style.display = "none";
  });
}


// Скидує помилку для конкретного поля
function clearFieldError(input) {
    const formGroup = input.closest(".form-group");
    if (!formGroup) return;

    const errorEl = formGroup.querySelector(".error-message");

    if (errorEl) {
        errorEl.textContent = "";
        errorEl.style.display = "none";
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
    clearErrorsForForm(loginForm);

    const formData = new FormData(loginForm);

    let data;
    try {
        data = await apiPostForm(API_URLS.login, formData);

        if (data.status === "error") {
            // Помилки по полях
            showFieldErrors(loginForm, data.errors);

            // Загальна помилка
            if (data.message) {
                showFormError(loginForm, data.message, "password");
            }
        }

        if (data.status === "success") {
            authModal.style.display = "none";
            window.location.href = data.redirect_url;
        }
    } catch (err) {
        showFormError(loginForm, gettext("Сервіс тимчасово недоступний. Спробуйте пізніше."), "password");
    }
});

// Реєстрація користувача
registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    clearErrorsForForm(registerForm);

    const formData = new FormData(e.target);

    let data;
    try {
        const data = await apiPostForm(API_URLS.register, formData);

        if (data.status === "error") {
            // Помилки по полях
            showFieldErrors(registerForm, data.errors);

            // Якщо є загальна помилка повторного пароля
            if (data.errors.password2) {
                showFormError(registerForm, data.errors.password2, "password2");
            }
        } else if (data.status === "success") {
            window.location.href = data.redirect_url;
        }
    } catch (err) {
        showFormError(registerForm, gettext("Сервіс тимчасово недоступний. Спробуйте пізніше."), "password2");
    }
});


// Робота з полями для форми авторизації
loginForm.querySelectorAll("input").forEach(input => {
    // Очищення помилки відповідного поля при зміні значення
    input.addEventListener("input", () => {
        clearFieldError(input);
    });
});

// Обрізання пробілів у полі username на початку та в кінці
setupTrimField(usernameInput);

// Робота з полями для форми реєстрації
registerForm.querySelectorAll("input").forEach(input => {
    // Очищення помилки відповідного поля при зміні значення
    input.addEventListener("input", () => {
        clearFieldError(input);
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
