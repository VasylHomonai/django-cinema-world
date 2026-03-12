export function setupModal(modal, openBtn, closeBtn) {

    openBtn?.addEventListener("click", () => openModal(modal));
    closeBtn?.addEventListener("click", () => closeModal(modal));

    modal.addEventListener("click", (e) => {
        if (e.target === modal) {
            closeModal(modal);
        }
    });
}

export function openModal(modal) {
    if (!modal || modal.classList.contains("active")) return;

    modal.classList.add("active");
    document.body.classList.add("modal-open");
}

function closeModal(modal) {
     if (!modal || !modal.classList.contains("active")) return;

    modal.classList.remove("active");
    document.body.classList.remove("modal-open");
}

document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
        const activeModal = document.querySelector(".modal.active");
        if (activeModal) {
            activeModal.classList.remove("active");
            document.body.classList.remove("modal-open");
        }
    }
});