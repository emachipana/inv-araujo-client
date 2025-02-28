import { FormGroup } from "@angular/forms";

type errors = {
  minlength?: number,
  maxlength?: number
}

export const errorMessage = (form: FormGroup, name: string, errors: errors): string => {
  const input = form.get(name);
  if(!input || !input.touched) return "";

  if(input.hasError("required")) return "Este campo es obligatorio";

  if(input.hasError("minlength")) return `El mínimo son ${errors.minlength} caracteres`;

  if(input.hasError("maxlength")) return `El máximo son ${errors.maxlength} caracteres`;

  if(input.hasError("email")) return "El formato es incorrecto";

  return "";
}
