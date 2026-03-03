const videoModal = document.getElementById("videoModal");
const videoFrame = document.getElementById("videoFrame");
const closeVideoBtn = document.getElementById("closeVideo");


// Виклик ініціалізації
initVideoModal();


// Ініціалізація відео-модалки
function initVideoModal() {
  // Початковий стан при завантаженні сторінки
  closeVideo();

  // Обробка кліку по кожній кнопці з класом .openVideo
  const videoButtons = document.querySelectorAll(".openVideo");
  videoButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const videoURL = btn.dataset.videoId;                // Беремо повний URL з кнопки
      const videoId = videoURL.split("v=")[1].split("&")[0];            // Отримуємо ID відео після ?v=
      const embedURL = `https://www.youtube.com/embed/${videoId}?autoplay=1`; // Формуємо embed URL
      videoFrame.src = embedURL;                           // Присвоюємо src iframe
      videoModal.style.display = "flex";                  // Відкриваємо модалку
    });
  });

  // Закриття по кнопці "X"
  closeVideoBtn.addEventListener("click", closeVideo);

  // Закриття модалки при кліку поза контентом
  window.addEventListener("click", (e) => {
    if (e.target === videoModal) {
      closeVideo();
    }
  });
};


// Закриває відео та очищає src
function closeVideo() {
  videoModal.style.display = "none";
  videoFrame.src = "";
}
