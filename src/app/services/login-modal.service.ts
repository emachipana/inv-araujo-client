import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoginModalService {
  isOpen = false;
  currentAction$ = new BehaviorSubject<"login" | "register">("login");

  open(action: "login" | "register") {
    this.isOpen = true;
    this.currentAction$.next(action);
  }

  close() {
    this.isOpen = false;
  }
}
