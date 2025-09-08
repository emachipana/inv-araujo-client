import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HotToastService } from '@ngxpert/hot-toast';
import { MatIconModule } from '@angular/material/icon';
import { ButtonModule } from 'primeng/button';
import { SpinnerComponent } from '../../../../../shared/ui/spinner/spinner.component';
import { InvitroOrder } from '../../../../../shared/models/InvitroOrder';
import { ProfileService } from '../../../../../services/profile.service';
import { InvitroService } from '../../../../../services/invitro.service';
import { BehaviorSubject, finalize, forkJoin } from 'rxjs';
import { OrderVariety } from '../../../../../shared/models/OrderVariety';
import { Advance } from '../../../../../shared/models/Advance';
import { StatusBadgeComponent } from "../../../../../shared/ui/status-badge/status-badge.component";
import { VarietyCardComponent } from "./variety-card/variety-card.component";
import { DataService } from '../../../../../services/data.service';
import { ButtonComponent } from "../../../../../shared/ui/buttons/button/button.component";
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Dialog } from "primeng/dialog";
import { PaymentComponent } from '../../../../invitro-store/payment/payment.component';
import { AdvanceRequest } from '../../../../../shared/models/AdvanceRequest';
import { ShippingCardComponent } from "../../../../../shared/ui/shipping-card/shipping-card.component";
import { ShippingOption } from '../../../../../shared/models/ShippingOption';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../../../services/auth.service';
import { SelectOption } from '../../../../../shared/models/SelectOption';
import { departments, provinces } from '../../../../../data/places';
import { messageGenerator } from '../../../../../shared/ui/input/message-generator';
import { Warehouse } from '../../../../../shared/models/Warehouse';
import { InputComponent } from "../../../../../shared/ui/input/input.component";
import { SelectComponent } from "../../../../../shared/ui/select/select.component";
import { formattedTime } from '../../../../../shared/helpers/main';
import { ShippingTypeRequest } from '../../../../../shared/models/ShippingTypeRequest';
import { MapComponent } from "../../../../../shared/ui/map/map.component";
import { UpdateReceiverInfoRequest } from '../../../../../shared/models/UpdateReceiverInfoRequest';
import { PickupInfoRequest } from '../../../../../shared/models/PickupInfoRequest';

@Component({
  selector: 'app-vitro-order-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    ButtonModule,
    SpinnerComponent,
    StatusBadgeComponent,
    VarietyCardComponent,
    ButtonComponent,
    Dialog,
    PaymentComponent,
    ShippingCardComponent,
    ReactiveFormsModule,
    InputComponent,
    SelectComponent,
    MapComponent
],
  templateUrl: './vitro-order-detail.component.html',
  styleUrls: ['./vitro-order-detail.component.scss']
})
export class VitroOrderDetailComponent implements OnInit {
  isLoading = false;
  orderId: number = 0;
  order: InvitroOrder | null = null;
  orderItems: OrderVariety[] = [];
  advances: Advance[] = [];
  totalVarieties: number = 0;
  displayInvoiceDialog: boolean = false;
  displayAdvancesDialog: boolean = false;
  isInvoiceLoading: boolean = false;
  safePdfUrl: SafeResourceUrl | null = null;
  registerNewAdvance: boolean = false;
  isRegisteringAdvance: boolean = false;
  displayShippingDialog: boolean = false;
  shipType$ = new BehaviorSubject<"ENVIO_AGENCIA" | "RECOJO_ALMACEN" | null>(null);
  departmentOptions: SelectOption[] = departments.map((dep) => ({id: dep.id_ubigeo, content: dep.nombre_ubigeo}));
  currentDep: number = 0;
  provinceOptions: SelectOption[] = [];
  minDate: string;
  errorMessage = messageGenerator;
  formatTime = formattedTime;
  warehouseSelected: Warehouse | null = null;
  availableHours: SelectOption[] = [];
  isSubmittingShipping: boolean = false;
  displayMapDialog: boolean = false;
  editShippingDialog: boolean = false;

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

  private _router = inject(Router);
  private _route = inject(ActivatedRoute);
  private _invitroService = inject(InvitroService);
  private _toast = inject(HotToastService);
  private _sanitizer = inject(DomSanitizer);
  private _authService = inject(AuthService);
  _dataService = inject(DataService);

  constructor() {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinutes = now.getMinutes();
    
    if (currentHour > 17 || (currentHour === 17 && currentMinutes >= 30)) {
      now.setDate(now.getDate() + 1);
    }
    
    this.minDate = now.toISOString().split('T')[0];
  }

  ngOnInit(): void {
    this._route.params.subscribe((params: any) => {
      this.orderId = params['id'];
      this.loadOrderDetails();
    });

    this._authService.currentClient$.subscribe(client => {
      if (client && !this.order?.shippingType) {
        this.agencyForm.patchValue({
          fullName: client.rsocial || '',
          dni: client.document || '',
          phone: client.phone || ''
        });
      }
    });

    this.agencyForm.get('department')?.valueChanges.subscribe((dep) => {
      this.agencyForm.get('city')?.setValue('');
      this.currentDep = +(dep ?? "");
      this.provinceOptions = provinces[String(this.currentDep)]?.map((province) => ({id: province.id_ubigeo, content: province.nombre_ubigeo}));
    });

    this.warehouseForm.get('date')?.valueChanges.subscribe((date) => {
      const timeControl = this.warehouseForm.get('time');
      timeControl?.disable();
      timeControl?.setValue('');
      
      if (date) {
        this._dataService.getAvailableHours(date).subscribe({
          next: (hours: string[]) => {
            this.availableHours = hours.map(hour => ({
              id: hour,
              content: this.formatTime(hour)
            }));
            
            if (this.availableHours.length > 0) {
              timeControl?.enable();
            } else {
              this._toast.warning('No hay más horarios disponibles para hoy');
            }
          },
          error: (error) => {
            console.error('Error fetching available hours:', error);
            this._toast.error('Error al cargar los horarios disponibles');
          }
        });
      }
    });

    this._dataService.loadWarehouses().subscribe((warehouses) => {
      this.warehouseSelected = warehouses[0];
    });
  }

  showMapDialog() {
    if (!this.warehouseSelected) return;
    this.displayMapDialog = true;
  }

  openInvoiceDialog() {
    if (this.order?.invoice?.pdfUrl) {
      this.displayInvoiceDialog = true;
      setTimeout(() => {
        this.isInvoiceLoading = true;
        this.getPdfViewerUrl();
      }, 0);
    } else {
      this._toast.error('No se encontró el documento de la factura');
    }
  }

  onShipChange(type: "ENVIO_AGENCIA" | "RECOJO_ALMACEN"): void {
    this.shipType$.next(type);
    this.shippingOptions.forEach((option) => {
      option.checked = option.value === type;
    });
  }

  private getPdfViewerUrl(): void {
    if (!this.order?.invoice?.pdfUrl) {
      this.safePdfUrl = null;
      return;
    }
    
    const url = `https://docs.google.com/viewer?url=${encodeURIComponent(this.order.invoice.pdfUrl)}&embedded=true`;
    
    requestAnimationFrame(() => {
      this.safePdfUrl = this._sanitizer.bypassSecurityTrustResourceUrl(url);
      setTimeout(() => {
        this.isInvoiceLoading = false;
      }, 500);
    });
  }

  onLoadInvoice() {
    this.isInvoiceLoading = false;
  }

  goBack(): void {
    this._router.navigate(['/perfil/pedidos']);
  }

  loadOrderDetails(): void {
    this.isLoading = true;
    
    forkJoin([
      this._invitroService.loadOrder(this.orderId),
      this._invitroService.loadOrderItems(this.orderId),
      this._invitroService.loadAdvances(this.orderId)
    ]).pipe(
      finalize(() => this.isLoading = false)
    ).subscribe(([order, orderItems, advances]) => {
      this.order = order;
      console.log(order);
      this.orderItems = orderItems;
      this.advances = advances;
      this.totalVarieties = orderItems.reduce((acc, cur) => acc + cur.quantity, 0);

      if (order?.shippingType === 'ENVIO_AGENCIA' && order.receiverInfo) {
        const department = departments.find(d => d.nombre_ubigeo === order.department);
        
        if (department) {
          const departmentProvinces = provinces[department.id_ubigeo] || [];
          
          const city = departmentProvinces.find(
            (p: { nombre_ubigeo: string }) => p.nombre_ubigeo === order.city
          );
          
          this.agencyForm.patchValue({
            fullName: order.receiverInfo.fullName || '',
            phone: order.receiverInfo.phone || '',
            dni: order.receiverInfo.document || '',
            department: department.id_ubigeo,
            city: city?.id_ubigeo || ''
          });

          this.currentDep = parseInt(department.id_ubigeo, 10);
          this.provinceOptions = departmentProvinces.map(p => ({
            id: p.id_ubigeo,
            content: p.nombre_ubigeo
          }));
        } else {
          this.agencyForm.patchValue({
            fullName: order.receiverInfo.fullName || '',
            phone: order.receiverInfo.phone || '',
            dni: order.receiverInfo.document || ''
          });
        }
      }
    });
  }

  onRegisterAdvance(): void {
    this.isRegisteringAdvance = true;
    const request: AdvanceRequest = {
      vitroOrderId: this.orderId,
      amount: this.order?.pending || 0,
      paymentType: "TARJETA_ONLINE"
    }

      this._invitroService.registerNewAdvance(request).subscribe({
        next: (advance) => {
          this.advances.push(advance);
          this.order = {...this.order, pending: 0, totalAdvance: (this.order?.totalAdvance || 0) + advance.amount} as InvitroOrder;
          this.isRegisteringAdvance = false;
          this.registerNewAdvance = false;
        },
        error: (error) => {
          console.error(error);
          this._toast.error(error.error.message);
          this.isRegisteringAdvance = false;
        }
      });
  }

  onAdvancesDialogClose(): void {
    this.registerNewAdvance = false;
    this.isRegisteringAdvance = false;
    this.displayAdvancesDialog = false;
  }

  onShippingDialogClose(): void {
    this.displayShippingDialog = false;
  }

  showEditShippingDialog() {
    if(this.order?.location === "AGENCIA" || this.order?.status === "ENTREGADO") return;
    
    this.editShippingDialog = true;
  }

  onAgencySubmit(): void {
    this.isSubmittingShipping = true;
    const request: ShippingTypeRequest = {
      shippingType: "ENVIO_AGENCIA",
      department: departments.find((dep) => dep.id_ubigeo === this.agencyForm?.get('department')?.value)?.nombre_ubigeo ?? "",
      city: provinces[String(this.agencyForm?.get('department')?.value)]
        .find((prov) => prov.id_ubigeo === this.agencyForm?.get('city')?.value)?.nombre_ubigeo ?? "",
      receiverInfo: {
        fullName: this.agencyForm?.get('fullName')?.value || '',
        document: this.agencyForm?.get('dni')?.value || '',
        phone: this.agencyForm?.get('phone')?.value || '',
      }
    }

    this._invitroService.addShippingType(request, this.orderId).subscribe({
      next: (order) => {
        this.order = order;
        this.isSubmittingShipping = false;
        this.displayShippingDialog = false;
      },
      error: (error) => {
        console.error(error);
        this._toast.error(error.error.message);
        this.isSubmittingShipping = false;
      }
    });
  }

  onWarehouseSubmit(): void {
    this.isSubmittingShipping = true;
    const request: ShippingTypeRequest = {
      shippingType: "RECOJO_ALMACEN",
      department: "Junin",
      city: "Huancayo",
      pickupInfo: {
        date: this.warehouseForm?.get('date')?.value || '',
        hour: this.warehouseForm?.get('time')?.value || '',
      }
    }

    this._invitroService.addShippingType(request, this.orderId).subscribe({
      next: (order) => {
        this.order = order;
        this.isSubmittingShipping = false;
        this.displayShippingDialog = false;
      },
      error: (error) => {
        console.error(error);
        this._toast.error(error.error.message);
        this.isSubmittingShipping = false;
      }
    });
  }

  onAgencyUpdate(): void {
    this.isSubmittingShipping = true;
    const request: UpdateReceiverInfoRequest = {
      fullName: this.agencyForm?.get('fullName')?.value || '',
      document: this.agencyForm?.get('dni')?.value || '',
      phone: this.agencyForm?.get('phone')?.value || '',
      department: departments.find((dep) => dep.id_ubigeo === this.agencyForm?.get('department')?.value)?.nombre_ubigeo ?? "",
      city: provinces[String(this.agencyForm?.get('department')?.value)]
        .find((prov) => prov.id_ubigeo === this.agencyForm?.get('city')?.value)?.nombre_ubigeo ?? "",
    }

    this._invitroService.updateReceiverInfo(this.orderId, request).subscribe({
      next: (order) => {
        this.order = order;
        this.isSubmittingShipping = false;
        this.editShippingDialog = false;
      },
      error: (error) => {
        console.error(error);
        this._toast.error(error.error.message);
        this.isSubmittingShipping = false;
      }
    });
  }

  onWarehouseUpdate(): void {
    this.isSubmittingShipping = true;
    const request: PickupInfoRequest = {
      date: this.warehouseForm?.get('date')?.value || '',
      hour: this.warehouseForm?.get('time')?.value || '',
    }

    this._invitroService.updatePickupInfo(this.orderId, request).subscribe({
      next: (order) => {
        this.order = order;
        this.isSubmittingShipping = false;
        this.editShippingDialog = false;
      },
      error: (error) => {
        console.error(error);
        this._toast.error(error.error.message);
        this.isSubmittingShipping = false;
      }
    });
  }
}
