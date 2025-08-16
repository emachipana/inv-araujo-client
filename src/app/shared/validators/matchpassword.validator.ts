import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";

export function matchPasswordValidator(controlName: string, matchingControlName: string): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const password = control.get(controlName || "password")?.value;
    const confirmPassword = control.get(matchingControlName || "confirmPassword")?.value;

    return password === confirmPassword ? null : { passwordMismatch: true };
  };
}
