document.addEventListener('DOMContentLoaded', initVideoModal);

function initVideoModal() {
  const videoModal = document.getElementById('videoModal');
  const videoFrame = document.getElementById('videoFrame');
  const closeVideoBtn = document.getElementById('closeVideo');

  if (!videoModal || !videoFrame) return;

  // закриття якщо було відкрите раніше
  closeVideo();

  const videoButtons = document.querySelectorAll('.openVideo');
  videoButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const videoURL = btn.dataset.videoId || '';
      const embedURL = videoURL.replace('watch?v=', 'embed/');
      videoFrame.src = embedURL;
      videoModal.style.display = 'flex';
    });
  });

  if (closeVideoBtn) closeVideoBtn.addEventListener('click', closeVideo);
  window.addEventListener('click', e => {
    if (e.target === videoModal) closeVideo();
  });
}

function closeVideo() {
  const videoModal = document.getElementById('videoModal');
  const videoFrame = document.getElementById('videoFrame');
  if (videoModal) videoModal.style.display = 'none';
  if (videoFrame) videoFrame.src = '';
}
