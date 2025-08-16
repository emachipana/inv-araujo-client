import { Component, inject } from '@angular/core';
import { AuthService } from '../../../../services/auth.service';
import { HotToastService } from '@ngxpert/hot-toast';
import { OnInit } from '@angular/core';
import { User } from '../../../../shared/models/User';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Client } from '../../../../shared/models/Client';
import { SpinnerComponent } from "../../../../shared/ui/spinner/spinner.component";
import { SelectComponent } from "../../../../shared/ui/select/select.component";
import { messageGenerator } from '../../../../shared/ui/input/message-generator';
import { InputComponent } from "../../../../shared/ui/input/input.component";
import { ButtonComponent } from "../../../../shared/ui/buttons/button/button.component";
import { NgStyle } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { SunatService } from '../../../../services/sunat.service';
import { ProfileService } from '../../../../services/profile.service';
import { InvoiceDetail } from '../../../../shared/models/InvoiceDetail';

@Component({
  selector: 'app-invoice',
  standalone: true,
  imports: [SpinnerComponent, SelectComponent, InputComponent, ButtonComponent, NgStyle, ReactiveFormsModule],
  templateUrl: './invoice.component.html',
  styleUrl: './invoice.component.scss'
})
export class InvoiceComponent implements OnInit {
  _authService = inject(AuthService);
  _profileService = inject(ProfileService);
  _sunatService = inject(SunatService);
  toast = inject(HotToastService);

  currentUser: User | null = this._authService.currentUser$.value;
  isGettingClient: boolean = false;
  disableDocumentType: boolean = false;
  documentType: "DNI" | "RUC" | undefined;
  isDocLoaded: boolean = false;
  invoicePreference: "BOLETA" | "FACTURA" | undefined;
  isLoading: boolean = false;

  invoiceDetailForm = new FormGroup({
    document: new FormControl('', Validators.required),
    documentType: new FormControl('', Validators.required),
    rsocial: new FormControl('', Validators.required),
    address: new FormControl('', Validators.required),
    invoicePreference: new FormControl('', Validators.required)
  });

  errorMessage = messageGenerator;

  ngOnInit(): void {
    this.isGettingClient = true;
    this._authService.getClient(this.currentUser?.clientId || -1).subscribe({
      next: (client) => {
        this.isGettingClient = false;
        this.setValueToForm(client);
      },
      error: (error) => {
        this.isGettingClient = false;
        this.toast.error("Error al obtener el cliente");
      }
    });

    this.invoiceDetailForm.get('documentType')?.valueChanges.subscribe((type) => {
      this.documentType = type as "DNI" | "RUC";
      this.invoiceDetailForm.get('document')?.reset();
      this.invoiceDetailForm.get('rsocial')?.reset();
      this.invoiceDetailForm.get('address')?.reset();
      this.invoiceDetailForm.get('document')?.setValidators([
        Validators.required,
        Validators.minLength(this.documentType === 'DNI' ? 8 : 11),
        Validators.maxLength(this.documentType === 'DNI' ? 8 : 11)
      ]);
      this.invoiceDetailForm.get('document')?.updateValueAndValidity();
    });

    this.invoiceDetailForm.get('document')?.valueChanges.subscribe((value) => {
      if (value?.length === (this.documentType === 'DNI' ? 8 : 11)) {
        this.getData(this.documentType ?? "DNI", value);
      } else {
        this.invoiceDetailForm.get('rsocial')?.setValue('');
        this.isDocLoaded = false;
      }
    });

    this.invoiceDetailForm.get("invoicePreference")?.valueChanges.subscribe((preference) => {
      this.invoicePreference = preference as "BOLETA" | "FACTURA";
      if (this.invoicePreference === "FACTURA") {
        this.invoiceDetailForm.get('documentType')?.setValue("RUC");
        this.disableDocumentType = true;
      } else {
        this.disableDocumentType = false;
      }
    });
  }

  setValueToForm(client: Client | null): void {
    this.invoiceDetailForm.disable({ emitEvent: false });
    
    this.isDocLoaded = true;
    this.invoiceDetailForm.patchValue({
      document: client?.invoiceDetail?.document || "",
      rsocial: client?.invoiceDetail?.rsocial || "",
      documentType: client?.invoiceDetail?.documentType || "",
      address: client?.invoiceDetail?.address || "",
      invoicePreference: client?.invoiceDetail?.invoicePreference || ""
    }, { emitEvent: false });

    this.documentType = client?.invoiceDetail?.documentType;
    this.invoicePreference = client?.invoiceDetail?.invoicePreference;

    if(this.invoicePreference === "FACTURA") {
      this.disableDocumentType = true;
    }

    this.invoiceDetailForm.enable({ emitEvent: false });
  }

  getData(type: "DNI" | "RUC", document: string): void {
    this._sunatService.getData(type, document).subscribe({
      next: (response) => {
        if(type === "DNI" && !response.success) {
          this.toast.error("No se encontró información");
          return;
        }
        if(type === "RUC" && !response.razonSocial) {
          this.toast.error("No se encontró información");
          return;
        }

        const rsocial: string = 
          type === "DNI" 
          ? `${response.nombres} ${response.apellidoPaterno} ${response.apellidoMaterno}`
          : `${response.razonSocial}`;

        if(type === "RUC") this.invoiceDetailForm.get('address')?.setValue(response.direccion);

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

  onSubmit(): void {
    if(this.invoiceDetailForm.invalid) return;

    this.isLoading = true;
    const request: InvoiceDetail = {
      id: this._authService.currentClient$.value?.invoiceDetail?.id || -1,
      document: this.invoiceDetailForm.get('document')?.value || "",
      documentType: this.invoiceDetailForm.get('documentType')?.value as "DNI" | "RUC",
      rsocial: this.invoiceDetailForm.get('rsocial')?.value || "",
      address: this.invoiceDetailForm.get('address')?.value || "",
      invoicePreference: this.invoiceDetailForm.get('invoicePreference')?.value as "BOLETA" | "FACTURA",
    } 

    this._profileService.updateInvoiceDetail(request, this._authService.currentClient$.value?.id || -1).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.toast.success("Información actualizada");
        this._authService.currentClient$.next({
          ...this._authService.currentClient$.value!,
          invoiceDetail: response
        });
      },
      error: (error) => {
        this.isLoading = false;
        this.toast.error(error.error.message);
      }
    });
  }
}
