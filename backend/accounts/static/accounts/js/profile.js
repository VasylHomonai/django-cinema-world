import { apiPost, apiPostForm } from './utils.js';


function showToast(message) {
    let old = document.querySelector(".toast-message");
    if (old) old.remove();

    let toast = document.createElement("div");
    toast.className = "toast-message";
    toast.innerText = message;

    document.body.appendChild(toast);

    setTimeout(() => toast.classList.add("visible"), 10);
    setTimeout(() => toast.classList.remove("visible"), 2200);
    setTimeout(() => toast.remove(), 2600);
};


function handleSave(container) {
    const input = container.querySelector(".edit-input");

    const rawValue = input.value;
    const value = rawValue.trim();
    const oldValue = (input.dataset.originalValue || "").trim();

    // синхронізуємо input одразу
    input.value = value;

    // якщо значення не змінилось — просто закриваємо редактор
    if (value === oldValue) {
        container.classList.remove("editing");
        return;
    }

    saveField(container);
}


function clearPasswordErrors() {
    document.querySelectorAll("#change-password-section .error-message").forEach(el => {
        el.textContent = "";
        el.style.display = "none";
    });
}


async function saveField(container) {
    if (container.dataset.saving === "true") {
        return;
    }
    container.dataset.saving = "true";

    const input = container.querySelector(".edit-input");
    const saveBtn = container.querySelector(".save-btn");
    const editBtn = container.querySelector(".edit-btn");
    const field = editBtn.dataset.field;

    const value = input.value;
    const trimmedValue = value.trim();
    const oldValue = input.dataset.originalValue || "";

    // Забороняємо збереження порожнього username або email
    if ((field === "username" || field === "email") && trimmedValue === "") {
        showToast(gettext(field === "username"
            ? gettext("Nickname не може бути порожнім")
            : gettext("Email не може бути порожнім")));
        container.dataset.saving = "false";
        return;
    }

    // Якщо нічого не змінилося – закриваємо редактор
    if (value === oldValue) {
        container.classList.remove("editing");
        container.dataset.saving = "false";
        return;
    }

    // loading state
    const originalIcon = saveBtn.innerHTML;
    saveBtn.innerHTML = "⏳";
    saveBtn.disabled = true;

    try {
        const data = await apiPost(API_URLS.profileUpdate, {field, value: trimmedValue});

        if (data.status === "success") {
            const newValue = data.value ?? "";

            // Оновлюємо span по всій сторінці
            document.querySelectorAll(`.user-${field}`).forEach(el => {
                el.innerText = newValue || "—";
            });

            // Оновлюємо інпут і data-original-value
            input.value = newValue;
            input.dataset.originalValue = newValue;

            container.classList.remove("editing");
            showToast(gettext("Збережено"));

        } else {
            console.error("Profile update error:", data);

            if (data.message) {
                showToast(data.message);
            } else {
                showToast(gettext("Не вдалося зберегти зміни"));
            }
        }

    } catch (error) {
        console.error("Profile update error:", error);

        if (error.message) {
            showToast(error.message);
        } else {
            showToast(gettext("Помилка мережі"));
        }
    } finally {
        // restore button
        saveBtn.innerHTML = originalIcon;
        saveBtn.disabled = false;
        container.dataset.saving = "false";
    }
}


async function handleDelete(container) {
    container.classList.remove("editing");

    const deleteBtn = container.querySelector(".delete-btn");
    const input = container.querySelector(".edit-input");
    const span = container.querySelector(".profile-text");

    const field = deleteBtn.dataset.field;
    const currentValue = span?.textContent?.trim();

    // якщо поле пусте — нічого не робимо
    if (!currentValue || currentValue === "—") {
        return;
    }

    try {
        const data = await apiPost(API_URLS.profileUpdate, { field, value: "" });

        if (data.status === "success") {

            // Оновлюємо значення по всій сторінці
            document.querySelectorAll(`.user-${field}`).forEach(el => {
                el.innerText = "—";
            });

            // очищаємо input
            if (input) {
                input.value = "";
                input.dataset.originalValue = "";
            }

            showToast(gettext("Поле очищено"));

        } else {
            console.error("Error clearing field:", data);
            showToast(gettext("Щось пішло не так"));
        }

    } catch (err) {
        console.error("Request failed:", err);
        showToast(gettext("Помилка мережі"));
    }
}


function cancelEdit(container) {
    const input = container.querySelector(".edit-input");
    const text = container.querySelector(".profile-text");

    // повертаємо старе значення
    input.value = text.innerText === "—" ? "" : text.innerText;

    container.classList.remove("editing");
}


function closeAllEditors() {
    document.querySelectorAll(".profile-value.editing").forEach(container => {
        const input = container.querySelector(".edit-input");
        const text = container.querySelector(".profile-text");

        if (input && text) {
            input.value = text.innerText === "—" ? "" : text.innerText;
        }

        container.classList.remove("editing");
    });
}


document.addEventListener("DOMContentLoaded", () => {
    const changePasswordForm = document.getElementById("changePasswordForm");
    const passwordToggle = document.getElementById("passwordToggle");

    document.querySelectorAll(".profile-value").forEach(container => {
        // Редагування профілю
        const editBtn = container.querySelector(".edit-btn");
        const cancelBtn = container.querySelector(".cancel-btn");
        const saveBtn = container.querySelector(".save-btn");
        const input = container.querySelector(".edit-input");
        const deleteBtn = container.querySelector(".delete-btn");
        const span = container.querySelector(".profile-text");

        // EDIT
        if (editBtn) {
            editBtn.addEventListener("click", () => {
                closeAllEditors();
                container.classList.add("editing");

                if (input) {
                    input.focus();
                    input.setSelectionRange(input.value.length, input.value.length);
                }
            });
        }

        // CANCEL
        if (cancelBtn) {
            // щоб кнопка не забирала фокус з input
            cancelBtn.tabIndex = -1;

            // щоб blur не спрацьовував перед cancel
            cancelBtn.addEventListener("mousedown", e => e.preventDefault());

            cancelBtn.addEventListener("click", () => {
                cancelEdit(container);
            });
        }

        // SAVE
        if (saveBtn) {
            // щоб кнопка не забирала фокус з input
            saveBtn.tabIndex = -1;

            // щоб blur не спрацьовував перед save
            saveBtn.addEventListener("mousedown", e => e.preventDefault());

            saveBtn.addEventListener("click", () => {
                handleSave(container);
            });
        }

        // DELETE / CLEAR
        if (deleteBtn) {
            deleteBtn.addEventListener("click", () => {
                handleDelete(container);
            });
        }

        // ENTER / ESC
        if (input) {
            input.addEventListener("keydown", (e) => {

                if (e.key === "Enter") {
                    e.preventDefault();
                    handleSave(container);
                }

                if (e.key === "Escape") {
                    e.preventDefault();
                    cancelEdit(container);
                }

            });

            // AUTOSAVE ON BLUR
            input.addEventListener("blur", () => {
                if (container.classList.contains("editing")) {
                    handleSave(container);
                }
            });
        }
    });

    // Зміна паролю
    if (changePasswordForm) {
        changePasswordForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            clearPasswordErrors();

            const formData = new FormData(changePasswordForm);

            try {
                const json = await apiPostForm(API_URLS.profileChangePassword, formData);;

                if (json.status === "success") {
                    showToast(json.message);
                    changePasswordForm.reset();
                } else if (json.status === "error") {

                    if (json.errors) {
                        for (const field in json.errors) {
                            const el = document.getElementById(`${field}Error`);
                            if (el) {
                                el.textContent = json.errors[field];
                                el.style.display = "block";
                            }
                        }
                    } else if (json.message) {
                        showToast(json.message);
                    }
                }
            } catch (err) {
                console.error(err);
                showToast(gettext("Помилка мережі"));
            }
        });
    }

    // toggle секції зміни паролю
    if (passwordToggle && changePasswordForm) {
        passwordToggle.addEventListener("click", () => {
            changePasswordForm.classList.toggle("collapsed");
            passwordToggle.classList.toggle("active");
        });
    }
});
