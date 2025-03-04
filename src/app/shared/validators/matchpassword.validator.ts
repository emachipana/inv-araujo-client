import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";
import { LoginModalService } from "../../services/login-modal.service";

export function matchPasswordValidator(service: LoginModalService): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if(service.currentAction === "login") return null;

    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;

    return password === confirmPassword ? null : { passwordMismatch: true };
  };
}
