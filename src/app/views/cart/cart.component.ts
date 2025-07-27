import { Component, inject, OnInit } from '@angular/core';
import { CartService } from '../../services/cart.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { DialogModule } from 'primeng/dialog';
import { CommonModule } from '@angular/common';
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
import { HotToastService } from '@ngxpert/hot-toast';
import { FormControl, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { PaymentComponent } from "./payment/payment.component";
import { messageGenerator } from '../../shared/ui/input/message-generator';
import { SunatService } from '../../services/sunat.service';
import { BehaviorSubject } from 'rxjs';
import { Order } from '../../shared/models/Order';
import { ShippingCardComponent } from "../../shared/ui/shipping-card/shipping-card.component";
import { ShippingOption } from '../../shared/models/ShippingOption';
import { Warehouse } from '../../shared/models/Warehouse';
import { MapComponent } from '../../shared/ui/map/map.component';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule, 
    DialogModule,
    ProductItemComponent,
    ButtonComponent, 
    InputComponent, 
    SelectComponent, 
    PaymentComponent, 
    ShippingCardComponent,
    MapComponent
  ],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss'
})
export class CartComponent implements OnInit {
  currentTab: "cart" | "checkout" | "success" = "cart";
  _cartService = inject(CartService);
  _sunatService = inject(SunatService);
  _loginModalService = inject(LoginModalService);
  _authService = inject(AuthService);
  displayMapDialog = false;
  _dataService = inject(DataService);
  router = inject(Router);
  
  totalCart: number = 0;
  totalWithoutIGV: number = 0;
  igv: number = 0;
  toast = inject(HotToastService);
  private route = inject(ActivatedRoute);
  departmentOptions: SelectOption[] = departments.map((dep) => ({id: dep.id_ubigeo, content: dep.nombre_ubigeo}));
  currentDep: number = 0;
  provinceOptions: SelectOption[] = [];
  clientLogged: Client | undefined;
  isGettingClient: boolean = false;
  shipType$ = new BehaviorSubject<"ENVIO_AGENCIA" | "RECOJO_ALMACEN" | null>(null);
  documentType: "DNI" | "RUC" | undefined;
  invoicePreference: "BOLETA" | "FACTURA" | undefined;
  disableDocumentType: boolean = false;
  isDocLoaded: boolean = false;
  isWarehouseLoaded: boolean = false;
  clientAddress: string = "";
  isInitialLoad: boolean = true;
  warehouseSelected: Warehouse | null = null;
  orderId: number = 0;
  availableHours: SelectOption[] = [];
  minDate: string;
  errorMessage = messageGenerator;
  updateInvoiceDetail: boolean = false;
  shippingOptions: ShippingOption[] = [
    {
      id: 'RECOJO_ALMACEN',
      title: 'Recojo en almacén',
      subtitle: 'Huancayo, Sapallanga',
      value: 'RECOJO_ALMACEN',
      checked: false
    },
    {
      id: 'ENVIO_AGENCIA',
      title: 'Envio por Agencia Shalom',
      subtitle: 'Pago contra entrega',
      value: 'ENVIO_AGENCIA',
      checked: false
    }
  ];

  invoiceDetailForm = new FormGroup({
    documentType: new FormControl('', [Validators.required]),
    document: new FormControl('', [Validators.required, Validators.pattern(/^\d+$/)]),
    rsocial: new FormControl('', [Validators.required]),
    invoicePreference: new FormControl('', [Validators.required]),
    address: new FormControl('')
  });

  agencyForm = new FormGroup({
    department: new FormControl('', [Validators.required]),
    city: new FormControl('', [Validators.required]),
    fullName: new FormControl('', [Validators.required]),
    dni: new FormControl('', [Validators.required, Validators.pattern(/^\d+$/), Validators.minLength(8), Validators.maxLength(8)]),
    phone: new FormControl('', [Validators.required, Validators.pattern(/^\d+$/), Validators.minLength(9), Validators.maxLength(9)]),
  });

  warehouseForm = new FormGroup({
    date: new FormControl('', [Validators.required]),
    time: new FormControl({ value: '', disabled: true }, [Validators.required])
  });

  constructor() {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinutes = now.getMinutes();
    
    if (currentHour > 17 || (currentHour === 17 && currentMinutes >= 30)) {
      now.setDate(now.getDate() + 1);
    }
    
    this.minDate = now.toISOString().split('T')[0];
  }

  showMapDialog() {
    if (!this.warehouseSelected) return;
    this.displayMapDialog = true;
  }

  ngOnInit(): void {
    this.warehouseForm.get('date')?.valueChanges.subscribe((date) => {
      const timeControl = this.warehouseForm.get('time');
      timeControl?.disable();
      timeControl?.setValue('');
      
      if (date) {
        this._dataService.getAvailableHours(date).subscribe({
          next: (hours: string[]) => {
            this.availableHours = hours.map((hour) => ({id: hour, content: hour}));
            if (hours.length > 0) {
              timeControl?.enable();
            } else {
              this.toast.warning('No hay horarios disponibles para la fecha seleccionada');
            }
          },
          error: (error) => {
            console.error('Error fetching available hours:', error);
            this.toast.error('Error al cargar los horarios disponibles');
          }
        });
      }
    });

    this._dataService.loadWarehouses().subscribe((warehouses) => {
      this.warehouseSelected = warehouses[0];
    });

    this._authService.currentUser$.subscribe(user => {
      if (user?.clientId) {
        this._authService.getClient(user.clientId).subscribe();
      }
    });

    this._authService.currentClient$.subscribe(client => {
      if (client) {
        this.clientLogged = client;
        const clientAddress = client.invoiceDetail?.address || '';
        this.isDocLoaded = true;
        this.documentType = client.invoiceDetail?.documentType as "RUC" | "DNI";
        this.invoicePreference = client.invoiceDetail?.invoicePreference as "BOLETA" | "FACTURA";

        this.invoiceDetailForm.patchValue({
          documentType: client.invoiceDetail?.documentType,
          document: client.invoiceDetail?.document,
          rsocial: client.invoiceDetail?.rsocial || '',
          invoicePreference: client.invoiceDetail?.invoicePreference || 'BOLETA',
          address: clientAddress === "-" ? "" : clientAddress
        });
      }
    });

    this.route.queryParams.subscribe(params => {
      let tab = params['tab'];
      if(tab === "success") tab = "checkout";

      if(tab === "checkout" && !this._authService.isLoggedIn()) {
        this._loginModalService.open('login', true);
        this.toast.warning("Primero inicia sesión o registrate");
        this.router.navigate([], {queryParams: {tab: "cart"}});
        return;
      }

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

    this.invoiceDetailForm.get("invoicePreference")?.valueChanges.subscribe((preference) => {
      // if(this.isInitialLoad) return;

      this.invoicePreference = preference as "BOLETA" | "FACTURA";
      if (this.invoicePreference === "FACTURA") {
        this.invoiceDetailForm.get('documentType')?.setValue("RUC");
        this.disableDocumentType = true;
      } else {
        this.disableDocumentType = false;
      }
    });

    this.invoiceDetailForm.get('documentType')?.valueChanges.subscribe((type) => {
      if(this.isInitialLoad) return;

      this.documentType = type as "DNI" | "RUC";
      const documentField = this.invoiceDetailForm.get('document');
      const addressField = this.invoiceDetailForm.get('address');
      
      documentField?.reset();
      documentField?.setValidators([
        Validators.required,
        Validators.minLength(this.documentType === 'DNI' ? 8 : 11),
        Validators.maxLength(this.documentType === 'DNI' ? 8 : 11)
      ]);
      documentField?.updateValueAndValidity();
      
      addressField?.setValidators([]);

      if(this.documentType === "RUC") {
        addressField?.setValidators([
          Validators.required
        ]);
      }
      
      addressField?.updateValueAndValidity();
    });

    this.invoiceDetailForm.get('document')?.valueChanges.subscribe((value) => {
      if (this.isInitialLoad) return;
      
      if (value?.length === (this.documentType === 'DNI' ? 8 : 11)) {
        this.getData(this.documentType ?? "DNI", value);
      } else {
        this.invoiceDetailForm.get('rsocial')?.setValue('');
        this.invoiceDetailForm.get('address')?.setValue('');
        this.isDocLoaded = false;
      }
    });

    this.agencyForm.get('department')?.valueChanges.subscribe((dep) => {
      this.agencyForm.get('city')?.setValue('');
      this.currentDep = +(dep ?? "");
      this.provinceOptions = provinces[String(this.currentDep)]?.map((province) => ({id: province.id_ubigeo, content: province.nombre_ubigeo}));
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

        if(type === "RUC") {
          this.clientAddress = response.direccion;
          this.invoiceDetailForm.get('address')?.setValue(response.direccion);
        }

        this.invoiceDetailForm.get('rsocial')?.setValue(rsocial);
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
    if(!this._authService.isLoggedIn() && tab === "checkout") {
      this._loginModalService.open('login', true);
      this.toast.warning("Primero inicia sesión o registrate");
      this.router.navigate([], {queryParams: {tab: "cart"}});
      return;
    }

    this.currentTab = tab;

    if(tab === "checkout") {
      this.router.navigate([], {queryParams: {tab: "checkout"}});
      return;
    }

    this.router.navigate([], {queryParams: {tab: null}})
  }

  onShipChange(type: "ENVIO_AGENCIA" | "RECOJO_ALMACEN"): void {
    this.shipType$.next(type);
    this.shippingOptions.forEach((option) => {
      option.checked = option.value === type;
    });
  }

  onPay(order: Order): void {
    this.currentTab = "success";
    this.orderId = order.id;
    this._cartService.clearCart();
  }

  onOrderDetail(): void {
    if(this.clientLogged) {
      this.router.navigate([`/perfil/pedidos`]);
    }
  }
}
