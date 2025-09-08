import { Component, inject, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { FormGroup, Validators, ReactiveFormsModule, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from '../../../../../services/data.service';
import { Order } from '../../../../../shared/models/Order';
import { finalize, forkJoin } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MatIcon } from "@angular/material/icon";
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { SpinnerComponent } from "../../../../../shared/ui/spinner/spinner.component";
import { StatusBadgeComponent } from "../../../../../shared/ui/status-badge/status-badge.component";
import { ProductCardComponent } from "./product-card/product-card.component";
import { OrderItem } from '../../../../../shared/models/OrderItem';
import { HotToastService } from '@ngxpert/hot-toast';
import { Dialog, DialogModule } from "primeng/dialog";
import { Warehouse } from '../../../../../shared/models/Warehouse';
import { MapComponent } from "../../../../../shared/ui/map/map.component";
import { ButtonComponent } from "../../../../../shared/ui/buttons/button/button.component";
import { formattedTime } from '../../../../../shared/helpers/main';
import { ButtonModule } from 'primeng/button';
import { messageGenerator } from '../../../../../shared/ui/input/message-generator';
import { SelectOption } from '../../../../../shared/models/SelectOption';
import { departments, provinces } from '../../../../../data/places';
import { SelectComponent } from "../../../../../shared/ui/select/select.component";
import { InputComponent } from "../../../../../shared/ui/input/input.component";
import { PickupInfoRequest } from '../../../../../shared/models/PickupInfoRequest';
import { UpdateReceiverInfoRequest } from '../../../../../shared/models/UpdateReceiverInfoRequest';
import { CancelRequest } from '../../../../../shared/models/CancelRequest';
import { CancelOrderRequest } from '../../../../../shared/models/CancelOrderRequest';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatIcon,
    SpinnerComponent,
    StatusBadgeComponent,
    ProductCardComponent,
    Dialog,
    DialogModule,
    MapComponent,
    ButtonComponent,
    ButtonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    SelectComponent,
    InputComponent
],
  templateUrl: './order-detail.component.html',
  styleUrls: ['./order-detail.component.scss']
})
export class OrderDetailComponent implements OnInit {
  isFormSubmitting = false;
  isInvoiceLoading = false;

  warehouseSelected: Warehouse | null = null;
  displayMapDialog: boolean = false;
  displayViewCancelDialog: boolean = false;
  displayNewCancelDialog: boolean = false;
  editShippingDialog: boolean = false;
  displayInvoiceDialog: boolean = false;
  departmentOptions: SelectOption[] = departments.map((dep) => ({id: dep.id_ubigeo, content: dep.nombre_ubigeo}));
  currentDep: number = 0;
  provinceOptions: SelectOption[] = [];
  availableHours: SelectOption[] = [];
  minDate: string;
  cancelRequests: CancelOrderRequest[] = [];
  pendingRequest: boolean = false;

  orderId: number = 0;
  order: Order | null = null;
  orderItems: OrderItem[] = [];
  isLoading: boolean = true;
  totalWithoutIGV: number = 0;
  igv: number = 0;
  _dataService = inject(DataService);
  isAbleToCancel: boolean = false;

  private _route = inject(ActivatedRoute);
  private _router = inject(Router);
  private _toast = inject(HotToastService);
  private _sanitizer = inject(DomSanitizer);

  safePdfUrl: SafeResourceUrl | null = null;

  errorMessage = messageGenerator;

  shippingForm = new FormGroup({
    fullName: new FormControl('', [Validators.required, Validators.minLength(3)]),
    phone: new FormControl('', [Validators.required, Validators.minLength(9), Validators.maxLength(9), Validators.pattern('^[0-9]*$')]),
    document: new FormControl('', [Validators.required, Validators.pattern('^[0-9]*$'), Validators.minLength(8), Validators.maxLength(8)]),
    department: new FormControl('', [Validators.required]),
    city: new FormControl('', [Validators.required]),
  });

  pickupForm = new FormGroup({
    date: new FormControl('', [Validators.required]),
    time: new FormControl({value: '', disabled: true}, [Validators.required]),
  });

  cancelReasons = [
    "Ya no necesito el/los productos",
    "Encontré mejor precio en otro lugar",
    "Cambié de opinión",
    "Demora en la entrega",
    "Otro motivo"
  ];
  
  cancelForm = new FormGroup({
    reason: new FormControl('', [Validators.required]),
    otherReason: new FormControl({value: '', disabled: true}, [Validators.required])
  });

  get showOtherReason() {
    return this.cancelForm.get('reason')?.value === 'Otro motivo';
  }

  selectCancelReason(reason: string) {
    this.cancelForm.patchValue({ reason });
    
    const otherReasonControl = this.cancelForm.get('otherReason');
    if (reason === 'Otro motivo') {
      otherReasonControl?.enable();
      otherReasonControl?.setValidators([Validators.required]);
    } else {
      otherReasonControl?.disable();
      otherReasonControl?.clearValidators();
      otherReasonControl?.reset();
    }
    otherReasonControl?.updateValueAndValidity();
  }

  onCancelOrder() {
    if (this.cancelForm.invalid || !this.order) return;

    this.isFormSubmitting = true;
    const { reason, otherReason } = this.cancelForm.value;
    const cancelReason = reason === 'Otro motivo' ? otherReason : reason;

    const cancelRequest: CancelRequest = {
      reason: cancelReason!,
      orderId: this.orderId
    };

    this._dataService.cancelOrderRequest(cancelRequest).pipe(
      finalize(() => {
        this.isFormSubmitting = false;
        this.displayNewCancelDialog = false;
        this.cancelForm.reset();
      })
    ).subscribe({
      next: (response) => {
        this._toast.success('Solicitud de cancelación enviada correctamente');
        // Add the new cancel request to the array and sort it
        this.cancelRequests = [...this.cancelRequests, response].sort((a, b) => b.id - a.id);
        this.pendingRequest = true; // Since it's a new request, there's now a pending request
      },
      error: (error) => {
        const errorMessage = error.error?.message || 'Ocurrió un error al procesar la solicitud';
        this._toast.error(errorMessage);
      }
    });
  }

  constructor() {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinutes = now.getMinutes();
    
    if (currentHour > 17 || (currentHour === 17 && currentMinutes >= 30)) {
      now.setDate(now.getDate() + 1);
    }
    
    this.minDate = now.toISOString().split('T')[0];
  }

  onShippingSubmit() {
    if (this.shippingForm.valid) {
      this.isFormSubmitting = true;
      
      const department = this.departmentOptions.find(dep => dep.id === this.shippingForm.get('department')?.value);
      const city = this.provinceOptions.find(province => province.id === this.shippingForm.get('city')?.value);

      const receiverInfo: UpdateReceiverInfoRequest = {
        fullName: this.shippingForm.get('fullName')?.value!,
        document: this.shippingForm.get('document')?.value!,
        phone: this.shippingForm.get('phone')?.value!,
        department: department?.content || '',
        city: city?.content || '',
      };

      this._dataService.updateReceiverInfo(this.orderId, receiverInfo).pipe(
        finalize(() => {
          this.isFormSubmitting = false;
          this.editShippingDialog = false;
        })
      ).subscribe({
        next: (updatedOrder) => {
          this.order = updatedOrder;
          this._toast.success('Los datos de envío se actualizaron');
        },
        error: (error) => {
          console.error('Error al actualizar la información de envío:', error);
          this._toast.error('Ocurrió un error al actualizar la información de envío');
        }
      });
    }
  }

  onPickupSubmit() {
    if (this.pickupForm.valid) {
      this.isFormSubmitting = true;
      
      const pickupRequest: PickupInfoRequest = {
        date: this.pickupForm.get('date')?.value!,
        hour: this.pickupForm.get('time')?.value!,
      };

      this._dataService.updatePickupInfo(this.orderId, pickupRequest).pipe(
        finalize(() => {
          this.isFormSubmitting = false;
          this.editShippingDialog = false;
        })
      ).subscribe({
        next: (updatedOrder) => {
          this.order = updatedOrder;
          this._toast.success('Los datos de recojo se actualizaron');
        },
        error: (error) => {
          console.error('Error al actualizar la información de recogida:', error);
          this._toast.error('Ocurrió un error al actualizar la información de recogida');
        }
      });
    }
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

  ngOnInit(): void {
    this._route.params.subscribe((params: any) => {
      this.orderId = params['id'];
      this.loadOrderDetails();
    });

    this._dataService.loadWarehouses().subscribe((warehouses: Warehouse[]) => {
      this.warehouseSelected = warehouses[0];
    });

    this.shippingForm.get('department')?.valueChanges.subscribe((dep) => {
      this.shippingForm.get('city')?.setValue('');
      this.currentDep = +(dep ?? "");
      this.provinceOptions = provinces[String(this.currentDep)]?.map((province) => ({id: province.id_ubigeo, content: province.nombre_ubigeo}));
    });

    this.pickupForm.get('date')?.valueChanges.subscribe((date) => {
      const timeControl = this.pickupForm.get('time');
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
  }

  showMapDialog() {
    if (!this.warehouseSelected) return;
    this.displayMapDialog = true;
  }

  showEditShippingDialog() {
    if(this.order?.location === "AGENCIA" || this.order?.status === "ENTREGADO") return;
    
    this.editShippingDialog = true;
  }

  formatTime = formattedTime;

  private checkIfOrderIsCancelable(orderDate: string | Date): boolean {
    const dateString = orderDate instanceof Date ? orderDate.toISOString() : orderDate;
    const orderDateObj = new Date(dateString);
    
    if (isNaN(orderDateObj.getTime())) {
      return false;
    }
    
    const currentDate = new Date();
    const diffTime = currentDate.getTime() - orderDateObj.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    
    return diffDays < 7;
  }

  loadOrderDetails(): void {
    this.isLoading = true;
    
    forkJoin([
      this._dataService.getOrderById(this.orderId),
      this._dataService.getProductsByOrderId(this.orderId),
      this._dataService.loadCancelRequests(this.orderId)
    ]).pipe(
      finalize(() => this.isLoading = false)
    ).subscribe(([order, products, cancelRequests]) => {
      this.order = order;
      this.orderItems = products || [];
      this.cancelRequests = cancelRequests.sort((a, b) => b.id - a.id);
      this.pendingRequest = !!cancelRequests.find(request => request.rejected === false && request.accepted === false);
      this.calculateTotals();
      
      if (order.date) {
        this.isAbleToCancel = this.checkIfOrderIsCancelable(order.date);
      }

      if (order?.shippingType === 'ENVIO_AGENCIA' && order.receiverInfo) {
        const department = departments.find(d => d.nombre_ubigeo === order.department);
        
        if (department) {
          const departmentProvinces = provinces[department.id_ubigeo] || [];
          
          const city = departmentProvinces.find(
            (p: { nombre_ubigeo: string }) => p.nombre_ubigeo === order.city
          );
          
          this.shippingForm.patchValue({
            fullName: order.receiverInfo.fullName || '',
            phone: order.receiverInfo.phone || '',
            document: order.receiverInfo.document || '',
            department: department.id_ubigeo,
            city: city?.id_ubigeo || ''
          });

          this.currentDep = parseInt(department.id_ubigeo, 10);
          this.provinceOptions = departmentProvinces.map(p => ({
            id: p.id_ubigeo,
            content: p.nombre_ubigeo
          }));
        } else {
          this.shippingForm.patchValue({
            fullName: order.receiverInfo.fullName || '',
            phone: order.receiverInfo.phone || '',
            document: order.receiverInfo.document || ''
          });
        }
      }
    }, (error) => {
      console.error('Error loading order details:', error);
      this._router.navigate(['/perfil/pedidos']);
    });
  }

  calculateTotals(): void {
    if (this.order) {
      this.totalWithoutIGV = this.order.total / 1.18;
      this.igv = this.order.total - this.totalWithoutIGV;
    }
  }

  goBack(): void {
    this._router.navigate(['/perfil/pedidos']);
  }
}
