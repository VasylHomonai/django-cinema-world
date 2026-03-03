/* Ф-ція перевіряє, чи існує хоча б один товар у куках з позначкою clicked.
Повертає true, якщо хоча б один такий товар знайдено, інакше false. */
export function hasClickedItemsInCookies() {
  const cookies = document.cookie.split(';');

  for (const cookie of cookies) {
    const [key, value] = cookie.trim().split('=');
    if (!key || !value) continue;

    const trimmedKey = key.trim();
    const decodedValue = decodeURIComponent(value);

    // Якщо це кількість товару і вона більше 0
    if (trimmedKey.startsWith('quantity_cart') && parseInt(decodedValue) > 0) {
      return true;
    }

    // Якщо це cart_* і статус clicked
    if (trimmedKey.startsWith('cart') && decodedValue.split('|')[0] === 'clicked') {
      return true;
    }
  }

  return false;
}


/* Провірка чи існує в document.cookie кука з конкретним ключем cookieKey і значенням 'clicked'.
Якщо є повертає true, інакше false. */
export function isCookieClicked(cookieKey) {
    const cookies = document.cookie.split(';');
    return cookies.some(cookie => {
        const [key, value] = cookie.trim().split('=');
        if (!key || !value) return false;
        const trimmedKey = key.trim();
        const [status] = decodeURIComponent(value).split('|'); // береться із значення лише частину до | (тобто clicked)
        return trimmedKey === cookieKey && status === 'clicked';
    });
}


/* Ф-ція встановлює cookie в браузері (або видаляє задаючи max-age=0)
Загальна ф-ція додавання куки*/
export function setCookie(name, value, maxAgeSeconds = 31536000) {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAgeSeconds}; samesite=lax`;
}


/* Ф-ція встановлює cookie в браузері (або видаляє задаючи max-age=0). Для додавання товару в корзину
Дана ф-ція задає значення куки з часом її створення, потрібно для збереження товарів в корзині в тій послідовності в
якій вони додаються. Це помітно при F5 */
export function setDateCookie(name, value, maxAgeSeconds = 31536000) {
  const timestamp = Date.now();
  const valueWithDate = `${value}|${timestamp}`;
  document.cookie = `${name}=${encodeURIComponent(valueWithDate)}; path=/; max-age=${maxAgeSeconds}; samesite=lax`;
}


/* Ф-ція шукає і повертає значення cookie за ключем name. Якщо не знаходить, повертає null
Не залежно від того є в значенню куки дата або ні, отримує значення без дати */
export function getCookie(name) {
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [key, value] = cookie.trim().split('=');
    if (key === name && value) {
      const [clickedValue] = decodeURIComponent(value).split('|');
      return clickedValue;
    }
  }
  return null;
}


/* Ф-ція шукає і повертає час створення куки із значення cookie за ключем name. Якщо не знаходить, повертає null
Тобто отримує час із значення куки після символу | (Приклад: clicked|1754062081381)
Дана ф-ція для збереження позицій в корзині в тій послідовності в якій вони і додаються в неї. Інакше F5 змінює їх. */
export function getDateCookie(name) {
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [key, value] = cookie.trim().split('=');
    if (key === name && value) {
      const [, timestamp] = decodeURIComponent(value).split('|');
      return timestamp;
    }
  }
  return null;
}
