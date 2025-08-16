import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../../services/auth.service';
import { LoginModalService } from '../../../../services/login-modal.service';
import { NotificationService } from '../../../../services/notification.service';
import { CartService } from '../../../../services/cart.service';
import { Router } from '@angular/router';
import { MenuItemComponent } from '../../buttons/menu-item/menu-item.component';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { debounceTime, distinctUntilChanged, filter, Subject, takeUntil } from 'rxjs';
import { Product } from '../../../models/Product';
import { Notification as AppNotification } from '../../../models/Notification';
import { InputComponent } from "../../input/input.component";
import { NgClass, TitleCasePipe } from '@angular/common';
import { MenuComponent } from "../../menu/menu.component";
import { ButtonComponent } from "../../buttons/button/button.component";
import { SpinnerComponent } from "../../spinner/spinner.component";
import { ProductComponent } from "./product/product.component";

@Component({
  selector: 'main-section',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    InputComponent,
    ReactiveFormsModule,
    FormsModule,
    NgClass,
    MenuItemComponent,
    MenuComponent,
    ButtonComponent,
    TitleCasePipe,
    SpinnerComponent,
    ProductComponent
  ],
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit, OnDestroy {
  _authService = inject(AuthService);
  _loginModalService = inject(LoginModalService);
  _notificationService = inject(NotificationService);
  _cartService = inject(CartService);
  router = inject(Router);
  isProfOpen = false;
  isCartOpen = false;
  userFirstName: string = "";
  cartTotal: number = 0;
  unreadCount: number = 0;
  isOpenSearch: boolean = false;
  isSearching: boolean = false;
  searchedProducts: Product[] = [];
  form: FormGroup = new FormGroup({
    search: new FormControl('', [Validators.required, Validators.minLength(3)])
  });
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this._notificationService.notifications$
      .pipe(takeUntil(this.destroy$))
      .subscribe((notifications: AppNotification[]) => {
        const unread = notifications.filter((n: AppNotification) => !n.isRead);
        this.unreadCount = unread.length;
      });

    this._notificationService.loadUserNotifications();

    this._cartService.items$.pipe(takeUntil(this.destroy$)).subscribe((val) => {
      this.cartTotal = this._cartService.getTotal(val);
    });

    this._authService.currentUser$.subscribe((val) => {
      this.userFirstName = val?.fullName.split(" ")[0] ?? "";
    });

    document.addEventListener('click', this.handleClickOutside.bind(this));

    this.form = new FormGroup({
      search: new FormControl('', [Validators.required, Validators.minLength(3)]),
    });

    this.form.get("search")?.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      filter((val) => (val || "").length >= 3)
    ).subscribe((val) => {
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
    this.destroy$.next();
    this.destroy$.complete();
    document.removeEventListener('click', this.handleClickOutside.bind(this));
  }
}
