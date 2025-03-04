import { Component, computed, inject, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { InputComponent } from "../../input/input.component";
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../../services/auth.service';
import { LoginModalService } from '../../../../services/login-modal.service';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { Menu } from 'primeng/menu';
import { NgClass } from '@angular/common';
import { MenuItemComponent } from '../../buttons/menu-item/menu-item.component';
import { Router } from '@angular/router';
import { CartService } from '../../../../services/cart.service';

@Component({
  selector: 'main-section',
  standalone: true,
  imports: [MatIconModule, InputComponent, Menu, ReactiveFormsModule, OverlayPanelModule, NgClass, MenuItemComponent],
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
  userFirstName = computed(() => this._authService.currentUser()?.fullName.split(" ")[0]);

  form = new FormGroup({
    search: new FormControl('', [Validators.required, Validators.minLength(3)]),
  });

  ngOnInit(): void {
    this.form.valueChanges.subscribe(val => {
      console.log(val);
      console.log(this.form.get("search"));
    });
  }

  handleProf(action: "register" | "login"): void {
    this._loginModalService.open(action);
    this.isProfOpen = false;
  }
}
