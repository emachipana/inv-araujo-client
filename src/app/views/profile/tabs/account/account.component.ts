import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../../../../services/auth.service';
import { User } from '../../../../shared/models/User';
import { ButtonComponent } from "../../../../shared/ui/buttons/button/button.component";
import { HotToastService } from '@ngxpert/hot-toast';
import { SpinnerComponent } from "../../../../shared/ui/spinner/spinner.component";
import { NgStyle } from '@angular/common';
import { InputComponent } from "../../../../shared/ui/input/input.component";
import { SelectComponent } from "../../../../shared/ui/select/select.component";
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { messageGenerator } from '../../../../shared/ui/input/message-generator';
import { Client } from '../../../../shared/models/Client';
import { SelectOption } from '../../../../shared/models/SelectOption';
import { departments } from '../../../../data/places';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [ButtonComponent, SpinnerComponent, NgStyle, InputComponent, SelectComponent, ReactiveFormsModule],
  templateUrl: './account.component.html',
  styleUrl: './account.component.scss'
})
export class AccountComponent implements OnInit {
  _authService = inject(AuthService);
  toast = inject(HotToastService);

  currentUser: User | null = this._authService.currentUser$.value;
  isGettingClient: boolean = false;
  invoicePreference: "BOLETA" | "FACTURA" | undefined;
  disableDocumentType: boolean = false;
  documentType: "DNI" | "RUC" | undefined;
  isDocLoaded: boolean = false;
  departmentOptions: SelectOption[] = departments.map((dep) => ({id: dep.id_ubigeo, content: dep.nombre_ubigeo}));
  currentDep: number = 0;
  provinceOptions: SelectOption[] = [];

  profileForm = new FormGroup({
    invoicePreference: new FormControl('', Validators.required),
    documentType: new FormControl('', Validators.required),
    document: new FormControl('', Validators.required),
    rsocial: new FormControl('', Validators.required),
    address: new FormControl('', Validators.required),
    phone: new FormControl('', Validators.required),
    city: new FormControl(''),
    department: new FormControl(''),
  });

  userImage = this.currentUser?.image?.url || 'default-avatar.jpg';
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

    this.invoicePreference = client.invoicePreference;
    this.documentType = client.documentType;
    this.isDocLoaded = true;
    this.profileForm.get("document")?.setValue(client.document);
    this.profileForm.get("rsocial")?.setValue(client.rsocial);
    this.profileForm.get("address")?.setValue(client.address || "");
    this.profileForm.get("invoicePreference")?.setValue(client.invoicePreference);
    this.profileForm.get("documentType")?.setValue(client.documentType);
  }
}
