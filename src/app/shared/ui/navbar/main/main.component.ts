import { Component, computed, inject, OnDestroy, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { InputComponent } from "../../input/input.component";
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../../services/auth.service';
import { LoginModalService } from '../../../../services/login-modal.service';
import { NgClass, TitleCasePipe } from '@angular/common';
import { MenuItemComponent } from '../../buttons/menu-item/menu-item.component';
import { Router } from '@angular/router';
import { CartService } from '../../../../services/cart.service';
import { MenuComponent } from "../../menu/menu.component";
import { ButtonComponent } from "../../buttons/button/button.component";
import { NotificationService } from '../../../../services/notification.service';
import { Product } from '../../../models/Product';
import { SpinnerComponent } from "../../spinner/spinner.component";
import { ProductComponent } from "./product/product.component";

@Component({
  selector: 'main-section',
  standalone: true,
  imports: [MatIconModule, InputComponent, ReactiveFormsModule, NgClass, MenuItemComponent, MenuComponent, ButtonComponent, TitleCasePipe, SpinnerComponent, ProductComponent],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss'
})
export class MainComponent implements OnInit, OnDestroy {
  _authService = inject(AuthService);
  _loginModalService = inject(LoginModalService);
  _notificationService = inject(NotificationService);
  _cartService = inject(CartService);
  router = inject(Router);
  isProfOpen = false;
  isCartOpen = false;
  userFirstName: String = "";
  cartTotal: number = 0;
  isOpenSearch: boolean = false;
  isSearching: boolean = false;
  searchedProducts: Product[] = [];

  form = new FormGroup({
    search: new FormControl('', [Validators.required, Validators.minLength(3)]),
  });

  ngOnInit(): void {
    this._cartService.items$.subscribe((val) => {
      this.cartTotal = this._cartService.getTotal(val);
    });

    this._authService.currentUser$.subscribe((val) => {
      this.userFirstName = val?.fullName.split(" ")[0] ?? "";
    });

    document.addEventListener('click', this.handleClickOutside.bind(this));

    this.form.get("search")?.valueChanges.subscribe((val) => {
      if ((val || "").length >= 3) {
        this.isOpenSearch = true;
        this.isSearching = true;
        this._cartService.searchProducts(val || "").subscribe({
          next: (products) => {
            this.searchedProducts = products;
            this.isSearching = false;
          },
          error: (error) => {
            this.isSearching = false;
            this.searchedProducts = [];
          }
        });
      } else {
        this.isOpenSearch = false;
        this.searchedProducts = [];
      }
    });
  }

  handleProfileClick(action: "register" | "login", handler: VoidFunction): void {
    handler();
    this._loginModalService.open(action);
    this.isProfOpen = false;
  }

  openProfileMenu(handler: VoidFunction) {
    const url = this.router.url;

    if(url.includes("/registro") || url.includes("/perfil")) return;

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

  handleLogout(handler: VoidFunction): void {
    this._authService.logout();
    this.isProfOpen = false;
    handler();
    this.router.navigate(['/']);
  }

  handleProfileMenu(redirectTo: String, handler: VoidFunction) {
    this.router.navigate([redirectTo]);
    this.isProfOpen = false;
    handler();
  }

  closeSearch(event?: Event) {
    if (event) event.stopPropagation();
    
    this.isOpenSearch = false;
    this.form.get('search')?.reset();
  }

  private handleClickOutside = (event: MouseEvent) => {
    const searchElement = document.querySelector('.search-container');
    const target = event.target as HTMLElement;
    
    if (searchElement && !searchElement.contains(target)) {
      this.closeSearch();
    }
  }

  ngOnDestroy(): void {
    document.removeEventListener('click', this.handleClickOutside);
  }
}
