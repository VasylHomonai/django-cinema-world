import { showToast } from './profile.js';
import { apiPost } from './utils.js';

let loadingTimer = null;


function startLoadingWithDelay(delay = 500) {
    loadingTimer = setTimeout(() => {
        document.body.classList.add("loading");
    }, delay);
}

function stopLoading() {
    if (loadingTimer) {
        clearTimeout(loadingTimer);
        loadingTimer = null;
    }
    document.body.classList.remove("loading");
}


async function handlePostAction(form, url, { loadingText = "⏳", onSuccess } = {}) {
    // Виконує POST-запит при кліку на кнопку форми і обробляє стан завантаження.
    const btn = form.querySelector("button");
    if (!btn) return;

    const originalText = btn.innerText;
    btn.disabled = true;
    btn.innerText = loadingText;

    startLoadingWithDelay();

    try {
        const data = await apiPost(url);

        if (data.status === "success") {
            if (onSuccess) onSuccess(data);
        } else {
            showToast(data.message);
        }
    } catch (err) {
        showToast(err.message || gettext("Помилка мережі"));
    } finally {
        btn.disabled = false;
        btn.innerText = originalText;
        stopLoading();
    }
}


// --- Logout користувача ---
document.querySelectorAll(".logout-form").forEach(form => {
    form.addEventListener("submit", e => {
        e.preventDefault();
        handlePostAction(form, API_URLS.logout, {
            onSuccess: (data) => window.location.href = data.redirect_url
        });
    });
});


// --- Profile користувача ---
document.querySelectorAll(".profile-btn").forEach(link => {
    link.addEventListener("click", () => {
        startLoadingWithDelay();
    });
});


// --- Мої замовлення ---
document.querySelectorAll(".orders-btn").forEach(link => {
    link.addEventListener("click", () => {
        startLoadingWithDelay();
    });
});
