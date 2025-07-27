import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoginModalService {
  isOpen = false;
  getBackToCheckout: boolean = false;
  currentAction$ = new BehaviorSubject<"login" | "register">("login");

  open(action: "login" | "register", redirectAtFinish: boolean = false) {
    this.isOpen = true;
    this.getBackToCheckout = redirectAtFinish;
    this.currentAction$.next(action);
  }

  close() {
    this.isOpen = false;
  }
}
