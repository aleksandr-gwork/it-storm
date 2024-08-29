import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  private orderText: string | undefined = '';

  constructor() { }

  setOrderText(orderText: string | undefined) {
    this.orderText = orderText;
  }

  getOrderText() {
    return this.orderText;
  }
}
