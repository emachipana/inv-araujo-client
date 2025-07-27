import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/ui/navbar/navbar.component';
import { AuthService } from './services/auth.service';
import { LoginModalService } from './services/login-modal.service';
import { NgxSpinnerModule } from 'ngx-spinner';
import { Colors } from './constants/index.constants';
import { DialogModule } from 'primeng/dialog';
import { MatIconModule } from '@angular/material/icon';
import { NgClass } from '@angular/common';
import { InputComponent } from "./shared/ui/input/input.component";
import { ButtonComponent } from "./shared/ui/buttons/button/button.component";
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { messageGenerator } from './shared/ui/input/message-generator';
import { AuthRequest } from './shared/models/AuthRequest';
import { HotToastService } from '@ngxpert/hot-toast';
import { SpinnerComponent } from "./shared/ui/spinner/spinner.component";
import { DataService } from './services/data.service';
import { FooterComponent } from "./shared/ui/footer/footer.component";
import { CartModalComponent } from "./shared/ui/cart-modal/cart-modal.component";
import { CartService } from './services/cart.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, ReactiveFormsModule, NgxSpinnerModule, DialogModule, MatIconModule, NgClass, InputComponent, ButtonComponent, SpinnerComponent, FooterComponent, CartModalComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  _authService = inject(AuthService);
  _loginModalService = inject(LoginModalService);
  _dataService = inject(DataService);
  _cartService = inject(CartService);
  router = inject(Router);
  toast = inject(HotToastService);
  isLoading = false;
  isGoogleLoading = false;
  colors = Colors;

  form = new FormGroup({
    username: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', []),
  });

  onGoogleSignIn(): void {
    this.isGoogleLoading = true;
    this._authService.loginWithGoogle().then((response) => {
      if(response.data.action === "register") {
        this._loginModalService.close();
        this.router.navigate(["/registro"]);
        this.isGoogleLoading = false;
        this.toast.success("Completa tu registro");
        return;
      }

      this.isGoogleLoading = false;
      this.toast.success("Bienvenido nuevamente");
      this._loginModalService.close();
    }).catch((error) => {
      let errorMessage = 'Error al iniciar sesión con Google. Por favor vuelve a intentarlo';
      
      if (error.code) {
        switch (error.code) {
          case 'auth/popup-closed-by-user':
            errorMessage = 'Cerraste la ventana. Por favor vuelve a intentarlo';
            break;
          case 'auth/cancelled-popup-request':
            errorMessage = 'Solicitud de autenticación cancelada. Por favor vuelve a intentarlo';
            break;
          case 'auth/popup-blocked':
            errorMessage = 'El navegador está bloqueando la ventana emergente. Por favor, permite las ventanas emergentes para este sitio';
            break;
        }
      }
        
      this.toast.error(errorMessage);
      this.isGoogleLoading = false;
    });
  }

  ngOnInit(): void {
    this._loginModalService.currentAction$.subscribe((action) => {
      if (action === 'login') {
        this.form.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
      } else {
        this.form.get('password')?.clearValidators();
      }
      this.form.get('password')?.updateValueAndValidity();
    });
  }


  changeAction(action: "login" | "register"): void {
    this._loginModalService.currentAction$.next(action);
  }

  errorMessage = messageGenerator;

  onSubmit(): void {
    if(this.form.invalid) return;
    const credentials = this.form.value;
    this.isLoading = true;

    // login
    if(this._loginModalService.currentAction$.value === "login") {
      this._authService.login(credentials as AuthRequest).subscribe({
        next: (_response) => {
          this._loginModalService.close();
          this.isLoading = false;
          this.toast.success("Bienvenido nuevamente");
        },
        error: (error) => {
          console.log(error);
          const message: string = error.error.message;
          this.toast.error(message.includes("Bad credentials") ? "Credenciales incorrectas" : message);
          this.isLoading = false;
        }
      });
      return;
    }

    // register
    this._authService.generateCode(credentials.username || "").subscribe({
      next: (_response) => {
        this.isLoading = false;
        this.toast.success("El código de verificación fue enviado a tu correo");
        this._loginModalService.close();
        this.router.navigate(["/registro"]);
      },
      error: (error) => {
        console.log(error);
        const message: string = error.error.message;
        this.toast.error(message);
        this.isLoading = false;
      }
    });
  }
}
