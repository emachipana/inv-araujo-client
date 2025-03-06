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
import { matchPasswordValidator } from './shared/validators/matchpassword.validator';
import { AuthRequest } from './shared/models/AuthRequest';
import { HotToastService } from '@ngxpert/hot-toast';
import { SpinnerComponent } from "./shared/ui/spinner/spinner.component";
import { DataService } from './services/data.service';
import { FooterComponent } from "./shared/ui/footer/footer.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, ReactiveFormsModule, NgxSpinnerModule, DialogModule, MatIconModule, NgClass, InputComponent, ButtonComponent, SpinnerComponent, FooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  _authService = inject(AuthService);
  _loginModalService = inject(LoginModalService);
  _dataService = inject(DataService);
  router = inject(Router);
  toast = inject(HotToastService);
  isLoading = false;
  colors = Colors;

  form = new FormGroup({
    username: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    confirmPassword: new FormControl('')
  }, { validators: matchPasswordValidator(this._loginModalService)});

  changeAction(action: "login" | "register"): void {
    this._loginModalService.currentAction = action;
  }

  errorMessage = messageGenerator;

  onSubmit(): void {
    if(this.form.invalid) return;
    const { confirmPassword, ...credentials } = this.form.value;
    this.isLoading = true;

    if(this._loginModalService.currentAction === "login") {
      this._authService.login(credentials as AuthRequest).subscribe({
        next: (response) => {
          this._loginModalService.close();
          this.isLoading = false;
          this.toast.success(response.message);
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

    this._authService.register(credentials as AuthRequest).subscribe({
      next: (response) => {
        this._loginModalService.close();
        this.isLoading = false;
        this.toast.success(response.message);
        this.router.navigate(["/complete-register"]);
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
