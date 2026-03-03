// Для отримання актуальної суми товара в корзині, виведення в консоль куплених товарів
export class CartItem {
  constructor(id, title, quantity, price) {
    this.id = id;
    this.title = title;
    this.quantity = quantity;
    this.price = price;
  }

  getQuantity() {
    return this.quantity;
  }

  getTotal() {
    return this.quantity * this.price;
  }

  setQuantity(newQuantity) {
    this.quantity = newQuantity;
  }
}
