import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoginModalService {
  isOpen = false;
  currentAction: "login" | "register" = "login";

  open(action: "login" | "register") {
    this.isOpen = true;
    this.currentAction = action;
  }

  close() {
    this.isOpen = false;
  }
}
