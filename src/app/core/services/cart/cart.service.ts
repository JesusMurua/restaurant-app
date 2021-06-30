import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs'

@Injectable({
  providedIn: 'root'
})
export class CartService {

  public meals: any[] = []
  private cart = new BehaviorSubject<any[]>([]);

  cart$ = this.cart.asObservable();

  constructor() { }

  addCart(meal: any){
    this.meals = [...this.meals, meal]
    this.cart.next(this.meals)
  }
}
