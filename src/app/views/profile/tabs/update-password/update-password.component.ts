import { Component, inject } from '@angular/core';
import { InputComponent } from "../../../../shared/ui/input/input.component";
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { messageGenerator } from '../../../../shared/ui/input/message-generator';
import { ButtonComponent } from "../../../../shared/ui/buttons/button/button.component";
import { AuthService } from '../../../../services/auth.service';
import { HotToastService } from '@ngxpert/hot-toast';
import { matchPasswordValidator } from '../../../../shared/validators/matchpassword.validator';

@Component({
  selector: 'app-update-password',
  standalone: true,
  imports: [InputComponent, ReactiveFormsModule, ButtonComponent],
  templateUrl: './update-password.component.html',
  styleUrl: './update-password.component.scss'
})
export class UpdatePasswordComponent {
  private _authService = inject(AuthService);
  private _toast = inject(HotToastService);

  updatePasswordForm = new FormGroup({
    currentPassword: new FormControl('', [Validators.required, Validators.minLength(6)]),
    newPassword: new FormControl('', [Validators.required, Validators.minLength(6)]),
    confirmPassword: new FormControl('', [Validators.required, Validators.minLength(6)]),
  }, { validators: matchPasswordValidator('newPassword', 'confirmPassword') });

  isLoading = false;

  errorMessage = messageGenerator;

  onSubmit() {
    this.isLoading = true;

    const request: { currentPassword: string, newPassword: string } = {
      currentPassword: this.updatePasswordForm.get('currentPassword')?.value || "",
      newPassword: this.updatePasswordForm.get('newPassword')?.value || ""
    }

    this._authService.updatePassword(request.currentPassword, request.newPassword).subscribe({
      next: () => {
        this._toast.success('Contraseña actualizada correctamente');
        this.isLoading = false;
        this.updatePasswordForm.reset();
      },
      error: (error) => {
        this._toast.error(error.error.message);
        this.isLoading = false;
      }
    })
  }
}
