const state = {
  removeBuyClickOutsideListener: null,
  removeCartClickOutsideListener: null,
  removeThanksClickOutsideListener: null,
};


export function getState() {
  return state;
}


export function setRemoveBuyClickOutsideListener(listener) {
  state.removeBuyClickOutsideListener = listener;
}


export function setRemoveCartClickOutsideListener(listener) {
  state.removeCartClickOutsideListener = listener;
}


export function setRemoveThanksClickOutsideListener(listener) {
  state.removeThanksClickOutsideListener = listener;
}


export function enableModalCloseOnOutsideClick(wrapperId, contentSelector) {
  const wrapper = document.getElementById(wrapperId);
  const content = wrapper.querySelector(contentSelector);
  // console.log('enableModalCloseOnOutsideClick для:', wrapperId, wrapper);

  const clickOutsideListener = function (e) {
    // console.log('Клік по:', e.target);

    if (!content.contains(e.target)) {
      // console.log('Клік поза попапом — закриваємо');
      wrapper.style.display = 'none';
      window.removeEventListener('click', clickOutsideListener);
      // console.log('Слухач знятий');
    } /* else {
      console.log('Клік всередині попапа — нічого не робимо');
    } */
  };

  // Додаємо слухача через 0ms затримку, щоб не спрацьовував одразу після відкриття
  setTimeout(() => {
    window.addEventListener('click', clickOutsideListener);
    // console.log('Слухач доданий');
  }, 0);

  // Повертаємо функцію для ручного видалення слухача
  return () => {
    window.removeEventListener('click', clickOutsideListener);
    // console.log('Слухач знятий вручну');
  };
}
