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

@Component({
  selector: 'app-invoice',
  standalone: true,
  imports: [SpinnerComponent, SelectComponent, InputComponent, ButtonComponent, NgStyle, ReactiveFormsModule],
  templateUrl: './invoice.component.html',
  styleUrl: './invoice.component.scss'
})
export class InvoiceComponent implements OnInit {
  _authService = inject(AuthService);
  toast = inject(HotToastService);

  currentUser: User | null = this._authService.currentUser$.value;
  isGettingClient: boolean = false;
  disableDocumentType: boolean = false;
  documentType: "DNI" | "RUC" | undefined;
  isDocLoaded: boolean = false;

  invoiceDetailForm = new FormGroup({
    document: new FormControl('', Validators.required),
    documentType: new FormControl('', Validators.required),
    rsocial: new FormControl('', Validators.required),
    address: new FormControl('', Validators.required),
    invoicePreference: new FormControl('', Validators.required)
  });

  errorMessage = messageGenerator;

  ngOnInit(): void {
    if(this._authService.isClientLoaded()) {
      this.setValueToForm(this._authService.currentClient$.value);
      return;
    }
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
  }

  setValueToForm(client: Client | null): void {
    if(!client) return;

    this.isDocLoaded = true;
    this.invoiceDetailForm.get("document")?.setValue(client.invoiceDetail?.document || "");
    this.invoiceDetailForm.get("rsocial")?.setValue(client.invoiceDetail?.rsocial || "");
    this.invoiceDetailForm.get("documentType")?.setValue(client.invoiceDetail?.documentType || "");
    this.invoiceDetailForm.get("address")?.setValue(client.invoiceDetail?.address || "");
    this.invoiceDetailForm.get("invoicePreference")?.setValue(client.invoiceDetail?.invoicePreference || "");
  }
}
