import { initApp } from './init-app.js';
import { hasClickedItemsInCookies, setCookie, getCookie, getDateCookie } from './utils/cookie.js';
import {
  getState,
  setRemoveCartClickOutsideListener,
  setRemoveBuyClickOutsideListener,
  enableModalCloseOnOutsideClick,
} from './modalCloser.js';
import { CartItem } from './utils/CartItem.js';
import { resetPhoneNameError, updateCartFooterBorder, clickedItems } from './main.js';


// Створюємо порожній об'єкт для збереження екземплярів класу CartItem
export const objCartItems = {};
// Доступ до об'єкту state в якій змінні: removeCartClickOutsideListener та removeBuyClickOutsideListener:
const state = getState();


document.addEventListener("DOMContentLoaded", () => {
  initCart();
});


async function initCart() {
  const cartButton = document.getElementById("cartButton");
  const orderNow = document.getElementById("orderNow");
  const closeCartPopup = document.getElementById("closeCartPopup");

  try {
    await initApp();
  } catch (error) {
    console.error("Помилка ініціалізації застосунку:", error);
    return;
  }

  // Відкриття корзини
  cartButton?.addEventListener("click", handleCartClick);

  // Закриття попапа корзини
  closeCartPopup?.addEventListener("click", () => {
    document.getElementById("cartPopupWrapper").style.display = "none";

    if (typeof state.removeCartClickOutsideListener === "function") {
      state.removeCartClickOutsideListener();
    }
  });

  // Обробка кнопки "Оформити замовлення"
  orderNow?.addEventListener("click", () => {
    // Закриваємо попап корзини
    document.getElementById("cartPopupWrapper").style.display = "none";

    // Скидаємо валідацію
    resetPhoneNameError();

    // Відкриваємо модалку checkout
    document.getElementById("buyModal").style.display = "flex";

    // Якщо вже був слухач — знімаємо його
    if (typeof state.removeBuyClickOutsideListener === "function") {
      state.removeBuyClickOutsideListener();
    }

    // Вішаємо новий слухач закриття по кліку поза модалкою
    setRemoveBuyClickOutsideListener(
      enableModalCloseOnOutsideClick("buyModal", "#buyModalContent")
    );
  });

  // Оновлення стану корзини
  updateCartState();
}


function handleCartClick() {
  // ігноруємо клік, якщо немає товарів
  if (!hasClickedItemsInCookies()) return;

  // Відкривається попап
  openCartPopup()
}


// Функція відкриття попапа корзини
export function openCartPopup() {
    // Відображається попап корзини одразу при кліку
    document.getElementById('cartPopupWrapper').style.display = 'flex';

    // Якщо вже був слухач для попапу — знімаємо
    if (typeof state.removeCartClickOutsideListener === 'function') {
      state.removeCartClickOutsideListener();
    }

    // Закриття по кліку поза вікном попапа. Вішається слухач у момент відкриття попапу.
    setRemoveCartClickOutsideListener(
      enableModalCloseOnOutsideClick("cartPopupWrapper", "#cartPopup")
    );
}


// Зібрані ф-ції (задачі) які повинні виконуватись в різних місцях
export function updateCartUI() {
  // Оновлюємо стан корзини
  updateCartState();
  // Оновлюється borderTop у Footer попапа корзини.
  updateCartFooterBorder();
  // Оновлюємо загальну суму корзини та позицій
  updateTotal();
}


// Ф-ція для кошика. Відображення к-сті в ньому, зміна картинки при наявності товарів
export function updateCartState() {
  const cartImg = document.getElementById("cartImage");
  const cartTooltip = document.getElementById("cartTooltip");
  const cartCount = document.getElementById("cartCount");
  const cookies = document.cookie.split(';');
  let count = 0;

  for (const cookie of cookies) {
    const [key, value] = cookie.trim().split('=');

    if (key.startsWith('quantity_cart')) {
      const quantity = parseInt(decodeURIComponent(value));
      if (!isNaN(quantity)) {
        count += quantity;
      }
    }
  }

  // Зміна картинки та тултипа
  try {
      if (count > 0) {
        cartImg.src = API_URLS.static + "cinema/images/cart-icon-2.png";
        cartCount.textContent = count;
        cartCount.style.display = "inline-block";
        cartTooltip.textContent = gettext("Перейти до кошика для\nзавершення покупки.");
      } else {
        cartImg.src = API_URLS.static + "cinema/images/cart-icon.png";
        cartCount.style.display = "none";
        cartTooltip.textContent = gettext("У кошику немає товарів.");
      }
  } catch (error) {
       console.error("Помилка при оновленні стану кошика:", error);
  }
}


/* Початок роботи з кнопками decrease, increase та quantity в попапі корзини.
Ініціалізація для всіх .cart-item   */
export function initializeQuantityControls(cartItem) {
  const idCartItem = cartItem.dataset.id; // напр. 'cart_button2'
  const title = cartItem.querySelector('.item-title')?.textContent.trim();
  const image = cartItem.querySelector('.item-img').src;
  const counter = cartItem.querySelector('.item-counter');
  const quantityInput = cartItem.querySelector('.quantity');
  const minusBtn = counter.querySelector('.decrease');
  const plusBtn = counter.querySelector('.increase');
  const priceElement = cartItem.querySelector('.item-price');
  const price = parseFloat(priceElement.textContent);
  const timestamp = getDateCookie(idCartItem);

  if (!counter || !quantityInput) return;

  const id = counter.dataset.id; // напр. 'quantity_cart_button2'

  /* Якщо куки з такою ID ще немає — створюємо її зі значенням 1
  При додаванні товара в корзину відразу створюємо куку для к-сті товара  */
  if (!getCookie(id)) {
    setCookie(id, 1);
  }

  // Отримуємо кількість з куки або 1 за замовчуванням
  let quantity = parseInt(getCookie(id)) || 1;
  quantityInput.value = quantity;

  // Додається об'єкт в objCartItems якщо його ще немає в ньому, або просто оновлюється к-сть.
  let item
  if (!objCartItems.hasOwnProperty(id)) {
    item = new CartItem(id, title, quantity, price);
    objCartItems[id] = item;
  } else {
    item = objCartItems[id];
    item.setQuantity(quantity);
  }

  // Додаємо в масив clickedItems об'єкт при додаванні товара в корзину, якщо ще не додано
  if (!clickedItems.some(item => item.idCartItem === idCartItem)) {
    clickedItems.push({ idCartItem, title, price, image, timestamp: Number(timestamp) });
  }

  // Початкове оновлення
  updateCartItemBorder(cartItem, quantity);

  // Обробник input (вручну введене число). Заборона нечислових значень
  quantityInput.addEventListener('input', () => {
    let val = quantityInput.value;
    if (!/^\d+$/.test(val)) {
      quantityInput.value = quantity;
      return;
    }

    let num = parseInt(val);
    if (num < 1) num = 1;
    if (num > 10) num = 10;
    quantity = num;
    syncItemState(id, quantity, price, item, cartItem, quantityInput, priceElement);
  });

  // Обробник зменшення к-сті
  minusBtn?.addEventListener('click', e => {
    e.stopPropagation();
    if (quantity > 1) {
      quantity--;
      syncItemState(id, quantity, price, item, cartItem, quantityInput, priceElement);
    }
  });

  // Обробник збільшення к-сті
  plusBtn?.addEventListener('click', e => {
    e.stopPropagation();
    if (quantity < 10) {
      quantity++;
      syncItemState(id, quantity, price, item, cartItem, quantityInput, priceElement);
    }
  });
}
// Кінець роботи з кнопками decrease, increase та quantity в попапі корзини.


// Функція для оновлення стилів. Стилізація бордера ітема якщо к-сть = 10
export function updateCartItemBorder(cartItem, quantity) {
  const note = cartItem.querySelector('.cart-note');

  if (quantity === 10) {
    cartItem.classList.add('cart-item-border');

     if (note) {
       note.style.display = 'block';
     }
  } else {
    cartItem.classList.remove('cart-item-border');

    if (note) {
      note.style.display = 'none';
    }
  }
}


// Різні оновлення, які відбуваються при зміні к-сті на позиціях в корзині.
function syncItemState(id, quantity, price, item, cartItem, quantityInput, priceElement) {
  quantityInput.value = quantity;
  setCookie(id, quantity);
  updateCartItemBorder(cartItem, quantity);

  // Оновляємо суму по товару
  item.setQuantity(quantity);
  priceElement.textContent = `${item.getTotal()} ₴`;

  // Оновлення: стан корзини, загальну суму корзини та позицій, borderTop у Footer попапа корзини.
  updateCartUI();
}


// Ф-ція для оновлення загальної суми корзини та суми кожної позицій які в ній
export function updateTotal() {
  let sum = 0;
  Object.entries(objCartItems).forEach(([id, cartItem]) => {
    if (cartItem.quantity > 0) {
      // Видаляємо префікс "quantity_" для пошуку елементів cart-item в DOM
      const cleanKey = id.replace(/^quantity_/, '');
      // Шукаємо DOM-елемент по data-id без префікса
      const cartItemElement = document.querySelector(`[data-id="${cleanKey}"]`);
      if (cartItemElement) {
          const priceElement = cartItemElement.querySelector('.item-price');
          if (priceElement) {
            priceElement.textContent = `${cartItem.getTotal()} ₴`;
          }
      }

      // Сумуються всі позиції корзини для Subtotal
      sum += objCartItems[id].getTotal();
    }
  });
  document.querySelector('.total-price').innerHTML = `${gettext("Разом:")} <strong>${sum} ₴</strong>`;
}


// Ф-ція для передачі в консоль куплених товарів (кнопка "Підтвердити покупку")
export function logPurchasedItems(objCartItems) {
  let count = 1;
  let grandTotal = 0;
  console.log("Куплені товари:");
  for (const key in objCartItems) {
    const item = objCartItems[key];

    if (item.quantity > 0) {
      const title = item.title;
      const quantity = item.quantity;
      const price = item.price;
      const total = item.getTotal();
      grandTotal += total;

      console.log(`   ${count}) Фільм: ${title}, к-сть: ${quantity}, ціна: ${price} ₴, сума: ${total} ₴`);
      count++;
    }
  }
  console.log(`Загальна сума: ${grandTotal} ₴`);
}
