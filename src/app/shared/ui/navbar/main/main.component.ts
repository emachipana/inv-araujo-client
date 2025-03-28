import { Component, computed, inject, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { InputComponent } from "../../input/input.component";
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../../services/auth.service';
import { LoginModalService } from '../../../../services/login-modal.service';
import { NgClass } from '@angular/common';
import { MenuItemComponent } from '../../buttons/menu-item/menu-item.component';
import { Router } from '@angular/router';
import { CartService } from '../../../../services/cart.service';
import { MenuComponent } from "../../menu/menu.component";
import { ButtonComponent } from "../../buttons/button/button.component";

@Component({
  selector: 'main-section',
  standalone: true,
  imports: [MatIconModule, InputComponent, ReactiveFormsModule, NgClass, MenuItemComponent, MenuComponent, ButtonComponent],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss'
})
export class MainComponent implements OnInit {
  _authService = inject(AuthService);
  _loginModalService = inject(LoginModalService);
  _cartService = inject(CartService);
  router = inject(Router);
  isProfOpen = false;
  isCartOpen = false;
  userFirstName: String = "";
  cartTotal: number = 0;

  form = new FormGroup({
    search: new FormControl('', [Validators.required, Validators.minLength(3)]),
  });

  ngOnInit(): void {
    this._cartService.items$.subscribe((val) => {
      this.cartTotal = val.reduce((acc, cur) => (cur.quantity * (cur.discountPrice ?? cur.price)) + acc, 0);
    });

    this._authService.currentUser$.subscribe((val) => {
      this.userFirstName = val?.fullName.split(" ")[0] ?? "";
    })
  }

  handleProfileClick(action: "register" | "login", handler: VoidFunction): void {
    handler();
    this._loginModalService.open(action);
    this.isProfOpen = false;
  }

  openProfileMenu(handler: VoidFunction) {
    handler();
    this.isProfOpen = true;
  }

  openCartMenu(handler: VoidFunction) {
    if(this.router.url.includes("carrito")) return;

    handler();
    this.isCartOpen = true;
  }

  closeCartMenu({redirectTo, handler, params = {}}: {redirectTo: String, handler: VoidFunction, params: any}) {
    handler();
    this.router.navigate([redirectTo], {queryParams: params});
    this.isCartOpen = false;
  }
}
