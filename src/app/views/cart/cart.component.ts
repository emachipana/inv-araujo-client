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
import { PaymentComponent } from "./payment/payment.component";
import { messageGenerator } from '../../shared/ui/input/message-generator';
import { SunatService } from '../../services/sunat.service';
import { BehaviorSubject } from 'rxjs';
import { Order } from '../../shared/models/Order';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [MatIconModule, NgClass, ProductItemComponent, ButtonComponent, InputComponent, SelectComponent, SpinnerComponent, NgStyle, ReactiveFormsModule, PaymentComponent],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss'
})
export class CartComponent implements OnInit {
  currentTab: "cart" | "checkout" | "success" = "cart";
  _cartService = inject(CartService);
  _sunatService = inject(SunatService);
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
  shipType$ = new BehaviorSubject<"ENVIO_AGENCIA" | "RECOJO_ALMACEN">("RECOJO_ALMACEN");
  createAccount: boolean = false;
  documentType: "DNI" | "RUC" | undefined;
  isDocLoaded: boolean = false;
  isWarehouseLoaded: boolean = false;
  warehouses: SelectOption[] = [];
  redirectionLink: String = "";

  errorMessage = messageGenerator;

  form = new FormGroup({
    documentType: new FormControl('', [Validators.required]),
    document: new FormControl('', [Validators.required, Validators.pattern(/^\d+$/)]),
    email: new FormControl('', [Validators.required, Validators.email]),
    rsocial: new FormControl('', [Validators.required]),
    phone: new FormControl('', [Validators.required, Validators.pattern(/^\d+$/)]),
    department: new FormControl('', [Validators.required]),
    city: new FormControl('', [Validators.required]),
    warehouse: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    confirmPassword: new FormControl('')
  }, { validators: matchPasswordValidator()});

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const tab = params['tab'];
      this.currentTab = tab ? tab : "cart";
    });

    this._cartService.items$.subscribe((data) => {
      this.totalCart = this._cartService.getTotal(data);
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

    this.form.get('documentType')?.valueChanges.subscribe((type) => {
      this.documentType = +(type ?? -1) === 1 ? "DNI" : "RUC";
      this.form.get('document')?.reset();
      this.form.get('document')?.setValidators([
        Validators.required,
        Validators.minLength(this.documentType === 'DNI' ? 8 : 11),
        Validators.maxLength(this.documentType === 'DNI' ? 8 : 11)
      ]);
      this.form.get('document')?.updateValueAndValidity();
    });

    this.form.get('document')?.valueChanges.subscribe((value) => {
      if (value?.length === (this.documentType === 'DNI' ? 8 : 11)) {
        this.getData(this.documentType ?? "DNI", value);
      } else {
        this.form.get('rsocial')?.setValue('');
        this.isDocLoaded = false;
      }
    });

    this.form.get('department')?.valueChanges.subscribe((dep) => {
      this.form.get('city')?.setValue('');
      this.currentDep = +(dep ?? "");
      this.provinceOptions = provinces[String(this.currentDep)].map((province) => ({id: province.id_ubigeo, content: province.nombre_ubigeo}));
    });

    this.shipType$.subscribe((data) => {
      if(data === "ENVIO_AGENCIA" || this.isWarehouseLoaded) return;

      this._dataService.getWarehouses().subscribe({
        next: (response) => {
          this.warehouses = response.map((war) => ({id: war.id, content: `${war.name} - ${war.address}`}));
          this.isWarehouseLoaded = true;
        },
        error: (error) => {
          this.toast.error(error.error.message);
        }
      });
    });
  }

  getData(type: "DNI" | "RUC", document: string): void {
    this._sunatService.getData(type, document).subscribe({
      next: (response) => {
        if(type === "DNI" && !response.success) {
          this.toast.error("El DNI no existe");
          return;
        }
        if(type === "RUC" && !response.razonSocial) {
          this.toast.error("El RUC no existe");
          return;
        }

        const rsocial: string = 
          type === "DNI" 
          ? `${response.nombres} ${response.apellidoPaterno} ${response.apellidoMaterno}`
          : `${response.razonSocial}`;

        this.form.get('rsocial')?.setValue(rsocial);
        this.isDocLoaded = true;
      },
      error: (error) => {
        console.error(error);
        this.toast.error(error.error.message);
        this.isDocLoaded = false;
      }
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
    this.shipType$.next(type);
  }

  onPay(order: Order): void {
    this.redirectionLink = `https://api.whatsapp.com/send?phone=51990849369&text=Hola%2C%20quiero%20consultar%20m%C3%A1s%20detalles%20sobre%20mi%20pedido%3A%0ACliente%3A%20${order.client.rsocial}%0A${order.client.documentType}%3A%20${order.client.document}%20`
    this.currentTab = "success";
    this._cartService.clearCart();
  }

  onCreateAccount(): void {
    this.createAccount = !this.createAccount;
    this._loginModalService.currentAction$.next("register");
    console.log(this._loginModalService.currentAction$.value)
  }
}
