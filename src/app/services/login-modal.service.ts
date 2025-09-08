import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoginModalService {
  isOpen = false;
  getBackToCheckout: boolean = false;
  redirectTo: string = "";
  currentAction$ = new BehaviorSubject<"login" | "register">("login");

  open(action: "login" | "register", redirectAtFinish: boolean = false, redirectTo: string = "") {
    this.isOpen = true;
    this.getBackToCheckout = redirectAtFinish;
    this.redirectTo = redirectTo;
    this.currentAction$.next(action);
  }

  close() {
    this.isOpen = false;
  }
}
