import { setCookie, getCookie } from './cookie.js';
import { initializeQuantityControls, updateCartUI, objCartItems } from '../cart.js';
import { CartItem } from './CartItem.js';
import { sortItemsByTimestamp, clickedItems } from '../main.js';


// Шаблон позиції cart-item для попапа корзини.
function createCartItemElement(id, title, price, imgSrc, quantity = 1) {
  const div = document.createElement("div");
  div.className = "cart-item";
  div.setAttribute("data-id", id);

  div.innerHTML = `
    <button class="remove-item-btn">&times;</button>
    <img src="${imgSrc}" alt="${title}" class="item-img" />
    <span class="item-title">${title}</span>
    <div class="item-details">
      <div class="item-counter">
        <button class="decrease">−</button>
        <input class="quantity" type="number" min="1" max="10" value="${quantity}" />
        <button class="increase">+</button>
      </div>
      <div class="item-price">${price} ₴</div>
    </div>
  `;

  // Окремо додаємо cart-note:
  const note = document.createElement("div");
  note.className = "cart-note";
  note.style.display = "none";
  note.textContent = gettext("Даний товар можна придбати в кількості не більше 10 шт.");

  div.appendChild(note);
  cartItemsContainer.appendChild(div);

  // Додаємо data-id до блоку лічильника, це для куки к-сті товара в кошику.
  const counterDiv = div.querySelector(".item-counter");
  if (counterDiv) {
    counterDiv.setAttribute("data-id", `quantity_${id}`);
  }

  return div;
}


// Додаємо товар по шаблону в контейнер cartItemsContainer:
export function addToCart(id, title, price, image) {
  // Створюємо елемент
  const cartItem = createCartItemElement(id, title, price, image);

  // Додаємо до корзини
  const cartContainer = document.querySelector(".cart-items-container");
  cartContainer.appendChild(cartItem);

  initializeQuantityControls(cartItem);

  // Додається прослуховувач на видалення з корзини
  cartItem.querySelector(".remove-item-btn").addEventListener("click", (e) => {
    // Змінна для того що коли буде видалена остання позиція то закриється попап корзини.
    const isLastItem = cartItemsContainer.children.length === 1;

    if (!isLastItem) {
      e.stopPropagation(); // Цей виклик зупиняє "спливання" події вгору по DOM-дереву, щоб не спрацювала подія клік на закриття попапа
    }

    removeCartItemById(id);
  });

  // "відновлюємо" об'єкт в objCartItems. Якщо об'єкт новий ставимо к-сть на 1
  const objId = `quantity_${id}`;
  let item = objCartItems[objId];
  if (!item) {
    item = new CartItem(objId, title, 1, price);
    objCartItems[objId] = item;
  }

  // Оновлення: стан корзини, загальну суму корзини та позицій, borderTop у Footer попапа корзини.
  updateCartUI();
}


// Функція для видалення товара з корзини. Видаляє куки та оновлення стану кнопки "Купити"
export function removeCartItemById(id) {
  const cartItems = document.querySelectorAll(".cart-item");
  let itemFound = false;
  for (const cartItem of cartItems) {
    if (cartItem.dataset.id === id) {
      // Скидаємо стан кнопки "Купити зараз"
      // Зміна кольору у кнопки "Купити" із зеленого на помаранчевий
      const idBuyNow = id.split("_")[1];
      const button = document.querySelector(`.buyNow[data-id="${idBuyNow}"]`);
      // Якщо кнопка була у стані "clicked", очищаємо
      if (button && getCookie(id) === 'clicked') {
        button.classList.remove('clicked');
        button.textContent = gettext("💸 Купити");
      }

      // Видаляємо з масива clickedItems об'єкт при видаленні товара з корзини
      const index = clickedItems.findIndex(item => item.idCartItem === id);
      if (index !== -1) {
        clickedItems.splice(index, 1);
      }
      // Сортуємо масив clickedItems
      sortItemsByTimestamp(clickedItems);

      // Видаляємо DOM-елемент товару з корзини
      cartItem.remove();

      // Видаляємо cookie (товар з корзини) ставимо max-age=0
      setCookie(id, '', 0);

      // Видаляємо cookie (к-сть товара в корзині) ставимо max-age=0
      const counter = cartItem.querySelector('.item-counter');
      const counterId = counter.dataset.id;
      setCookie(counterId, '', 0);

      // Оновлюємо загальну суму корзини, не видаляючи об'єкт, а просто зануливши к-сть
      objCartItems[`quantity_${id}`].setQuantity(0);

      // Оновлення: стан корзини, загальну суму корзини та позицій, borderTop у Footer попапа корзини.
      updateCartUI();

      itemFound = true;
      break;
    }
  }
  if (!itemFound) {
    console.warn(`Товар з id="${id}" не знайдено в DOM. Можливо, він уже був видалений.`);
  }
}

