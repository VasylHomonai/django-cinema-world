document.addEventListener("DOMContentLoaded", function () {
    const actionSelect = document.querySelector('select[name="action"]');
    const form = document.querySelector('#changelist-form');

    if (!actionSelect || !form) return;

    form.addEventListener("submit", function (e) {
        if (actionSelect.value === "deactivate_products") {
            const confirmed = confirm("Ви впевнені, що хочете деактивувати вибрані товари?");
            if (!confirmed) {
                e.preventDefault();
            }
        }
    });
});