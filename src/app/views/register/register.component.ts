import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NgxOtpInputComponent, NgxOtpInputComponentOptions } from 'ngx-otp-input';
import { ButtonComponent } from "../../shared/ui/buttons/button/button.component";
import { NgStyle } from '@angular/common';
import { HotToastService } from '@ngxpert/hot-toast';
import { SelectComponent } from "../../shared/ui/select/select.component";
import { messageGenerator } from '../../shared/ui/input/message-generator';
import { InputComponent } from "../../shared/ui/input/input.component";
import { matchPasswordValidator } from '../../shared/validators/matchpassword.validator';
import { LoginModalService } from '../../services/login-modal.service';
import { SunatService } from '../../services/sunat.service';
import { ClientRequest } from '../../shared/models/ClientRequest';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [NgxOtpInputComponent, ButtonComponent, NgStyle, ReactiveFormsModule, SelectComponent, InputComponent],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent implements OnInit {
  @ViewChild('codeInput', { static: false })
  codeInput!: NgxOtpInputComponent;
  isValidatingCode: boolean = false;
  try: number = 0;
  codeIsCorrect: boolean = false;
  isResending: boolean = false;
  disableDocumentType: boolean = false;
  clientAddress: string = "";
  isCreating: boolean = false;

  toast = inject(HotToastService);
  _authService = inject(AuthService);
  _route = inject(ActivatedRoute);
  _loginModalService = inject(LoginModalService);
  _sunatService = inject(SunatService);
  _router = inject(Router);

  errorMessage = messageGenerator;

  otpOptions: NgxOtpInputComponentOptions = {
    otpLength: 6,
    showBlinkingCursor: true,
    regexp: /^[a-zA-Z0-9]+$/
  }
  action: "code" | "register" | "google" = "code";

  registerForm = new FormGroup({
    documentType: new FormControl('', Validators.required),
    document: new FormControl('', Validators.required),
    rsocial: new FormControl('', Validators.required),
    invoicePreference: new FormControl('', Validators.required),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    confirmPassword: new FormControl('')
  }, { validators: matchPasswordValidator()});

  // to register
  documentType: "DNI" | "RUC" | undefined;
  invoicePreference: "BOLETA" | "FACTURA" | undefined;
  isDocLoaded: boolean = false;

  ngOnInit(): void {
    this._route.queryParams.subscribe(params => {
      const registerWithGoogle: boolean = localStorage.getItem("registerWithGoogle") === "true";
      const isCodeValidated: boolean = localStorage.getItem("isCodeValidated") === "true";
      const tab = params['tab'] || "code";
      
      if(registerWithGoogle) {
        this.action = "google";
        this.registerForm.get('rsocial')?.setValue(this._authService.userGoogle?.rsocial || "");
        this.registerForm.get('password')?.setValue("12345678");
        this.registerForm.get('confirmPassword')?.setValue("12345678");
        return;
      }

      if(tab === "register" && !isCodeValidated) {
        this.action = "code";
        return;
      }
      
      if(tab === "code" && isCodeValidated) {
        this.action = "register";
        return;
      }
      
      this.action = tab;
    });

    this.registerForm.get("invoicePreference")?.valueChanges.subscribe((preference) => {
      this.invoicePreference = preference as "BOLETA" | "FACTURA";
      if (this.invoicePreference === "FACTURA") {
        this.registerForm.get('documentType')?.setValue("RUC");
        this.disableDocumentType = true;
      } else {
        this.disableDocumentType = false;
      }
    });

    this.registerForm.get('documentType')?.valueChanges.subscribe((type) => {
      this.documentType = type as "DNI" | "RUC";
      this.registerForm.get('document')?.reset();
      this.registerForm.get('document')?.setValidators([
        Validators.required,
        Validators.minLength(this.documentType === 'DNI' ? 8 : 11),
        Validators.maxLength(this.documentType === 'DNI' ? 8 : 11)
      ]);
      this.registerForm.get('document')?.updateValueAndValidity();
    });

    this.registerForm.get('document')?.valueChanges.subscribe((value) => {
      if (value?.length === (this.documentType === 'DNI' ? 8 : 11)) {
        this.getData(this.documentType ?? "DNI", value);
      } else {
        this.registerForm.get('rsocial')?.setValue('');
        this.isDocLoaded = false;
      }
    });
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

        if(type === "RUC") this.clientAddress = response.direccion;
        console.log(response.direccion);

        this.registerForm.get('rsocial')?.setValue(rsocial);
        this.isDocLoaded = true;
      },
      error: (error) => {
        console.error(error);
        this.toast.error(error.error.message);
        this.isDocLoaded = false;
      }
    });
  }

  validateCode(code: string): void {
    this.isValidatingCode = true;

    const onError = () => {
      this.isValidatingCode = false;
      this.codeInput.reset();
      this.codeIsCorrect = false;
      this.try++;
      this.toast.error("El código es incorrecto");
    }

    this._authService.validateCode(code).subscribe({
      next: (isValid) => {
        if(isValid) {
          this.action = 'register';
          localStorage.setItem("isCodeValidated", "true");
          this._router.navigate([], { queryParams: { tab: 'register' } });
          this.isValidatingCode = false;
          this.toast.success("Código validado");
          return;
        }

        onError();
      },
      error: (_error) => {
        onError();
      }
    });
  }

  resendCode(): void {
    this.isResending = true;
    const email: string = localStorage.getItem("emailToValidate") || "";
    if(!this.codeIsCorrect) this.codeIsCorrect = true;

    this._authService.generateCode(email).subscribe({
      next: (_response) => {
        this.isResending = false;
        this.toast.success("El código de verificación fue reenviado");
      },
      error: (error) => {
        console.log(error);
        const message: string = error.error.message;
        this.toast.error(message);
        this.isResending = false;
      }
    });
  }

  registerWithGoogle(): void {
    if (this.registerForm.invalid) return;
    
    this.isCreating = true;
    const formData = this.registerForm.value;
    
    const clientRequest: ClientRequest = {
      document: formData.document || '',
      documentType: formData.documentType as "DNI" | "RUC",
      rsocial: formData.rsocial || '',
      email: '', // Will be provided by Google
      createdBy: 'CLIENTE',
      invoicePreference: formData.invoicePreference as "BOLETA" | "FACTURA" || 'BOLETA',
      address: this.clientAddress || ''
    };

    this._authService.registerWithGoogle(clientRequest).subscribe({
      next: (response) => {
        this.isCreating = false;
        if (response.data) {
          if(this._loginModalService.getBackToCheckout) {
            this._router.navigate([`/${this._loginModalService.redirectTo}`], {queryParams: {tab: "checkout"}});
            this._loginModalService.getBackToCheckout = false;
            this._loginModalService.redirectTo = "";
            return;
          }

          this._router.navigate(['/perfil']);
        }
      },
      error: (error) => {
        console.error('Error registering with Google:', error);
        this.isCreating = false;
        const message = error.error?.message || 'Error al registrar con Google';
        this.toast.error(message);
      }
    });
  }

  register(): void {
    if (this.registerForm.invalid) return;
    const formData = this.registerForm.value;
    const clientBody: ClientRequest = {
      email: this._authService.userToValidate?.email || localStorage.getItem("emailToValidate") || "",
      document: formData.document || "",
      documentType: formData.documentType as "DNI" | "RUC", 
      invoicePreference: formData.invoicePreference as "BOLETA" | "FACTURA",
      rsocial: formData.rsocial ? formData.rsocial.replace(/["']/g, "") : "",
      createdBy: "CLIENTE",
      address: this.clientAddress || "",
    }

    this.isCreating = true;
    this._authService.createClient(clientBody).subscribe({
      next: (client) => {
        const clientId = client.id;
        if(!clientId || !formData.password) return;

        this._authService.registerNewClient(clientId, formData.password).subscribe({
          next: (_response) => {
            this.toast.success("Registro completado exitosamente");
            localStorage.removeItem("emailToValidate");
            localStorage.removeItem("isCodeValidated");
            localStorage.removeItem("validateCodeId");
            this._authService.userToValidate = null;
            if(this._loginModalService.getBackToCheckout) {
              this._router.navigate([`/${this._loginModalService.redirectTo}`], {queryParams: {tab: "checkout"}});
              this._loginModalService.getBackToCheckout = false;
              this._loginModalService.redirectTo = "";
              return;
            }

            this._router.navigate(['/perfil']);
          },
          error: (error) => {
            console.log(error);
            const message: string = error.error.message;
            this.toast.error(message);
          }
        }).add(() => {
          this.isCreating = false;
        });
      },
      error: (error) => {
        console.log(error);
        const message: string = error.error.message;
        this.toast.error(message);
        this.isCreating = false;
      }
    });
  }
}
