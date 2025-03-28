import { Component, inject, OnInit } from '@angular/core';
import { CartService } from '../../services/cart.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { NgClass, NgStyle } from '@angular/common';
import { ProductItemComponent } from "./product-item/product-item.component";
import { ButtonComponent } from "../../shared/ui/buttons/button/button.component";
import { LoginModalService } from '../../services/login-modal.service';
import { AuthService } from '../../services/auth.service';
import { InputComponent } from "../../shared/ui/input/input.component";
import { SelectComponent } from "../../shared/ui/select/select.component";
import { departments, provinces } from '../../data/places';
import { SelectOption } from '../../shared/models/SelectOption';
import { Client } from '../../shared/models/Client';
import { DataService } from '../../services/data.service';
import { SpinnerComponent } from "../../shared/ui/spinner/spinner.component";
import { HotToastService } from '@ngxpert/hot-toast';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { matchPasswordValidator } from '../../shared/validators/matchpassword.validator';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [MatIconModule, NgClass, ProductItemComponent, ButtonComponent, InputComponent, SelectComponent, SpinnerComponent, NgStyle, ReactiveFormsModule],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss'
})
export class CartComponent implements OnInit {
  currentTab: "cart" | "checkout" | "success" = "cart";
  _cartService = inject(CartService);
  _loginModalService = inject(LoginModalService);
  _authService = inject(AuthService);
  _dataService = inject(DataService);
  router = inject(Router);
  totalCart: number = 0;
  totalWithoutIGV: number = 0;
  igv: number = 0;
  toast = inject(HotToastService);
  private route = inject(ActivatedRoute);
  departmentOptions: SelectOption[] = departments.map((dep) => ({id: +dep.id_ubigeo, content: dep.nombre_ubigeo}));
  currentDep: number = 0;
  provinceOptions: SelectOption[] = [];
  clientLogged: Client | undefined;
  isGettingClient: boolean = false;
  shipType: "ENVIO_AGENCIA" | "RECOJO_ALMACEN" = "RECOJO_ALMACEN";

  form = new FormGroup({
    username: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    confirmPassword: new FormControl('')
  }, { validators: matchPasswordValidator(this._loginModalService)});

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const tab = params['tab'];
      this.currentTab = tab ? tab : "cart";
    });

    this._cartService.items$.subscribe((data) => {
      this.totalCart = data.reduce((acc, cur) => ((cur.discountPrice ?? cur.price) * cur.quantity) + acc, 0);
      this.totalWithoutIGV = this.totalCart / (1 + 0.18);
      this.igv = this.totalCart - this.totalWithoutIGV;
    });

    this._authService.currentUser$.subscribe((val) => {
      if(val === null) return;

      this.isGettingClient = true;
      this._authService.getClientById(val.clientId).subscribe({
        next: (response) => {
          this.clientLogged = response;
          this.isGettingClient = false;
        },
        error: (_error) => {
          this.isGettingClient = false;
          this.toast.error("El usuario no puede realizar este acción");
          this._authService.logout();
        }
      });
    });
  }

  changeTab(tab: "cart" | "checkout" | "success"): void {
    this.currentTab = tab;

    if(tab === "checkout") {
      this.router.navigate([], {queryParams: {tab: "checkout"}});
      return;
    }

    this.router.navigate([], {queryParams: {tab: null}})
  }

  onShipChange(type: "ENVIO_AGENCIA" | "RECOJO_ALMACEN"): void {
    this.shipType = type;
  }
}
