import { FormGroup } from "@angular/forms";

type errors = {
  minlength?: number,
  maxlength?: number,
}

export const messageGenerator = (form: FormGroup, name: string, errors: errors): string => {
  const input = form.get(name);
  if(!input || !input.touched) return "";

  if(input.hasError("pattern")) return "Solo se admiten números";

  if(input.hasError("required")) return "Este campo es obligatorio";

  if(input.hasError("minlength")) return `El mínimo son ${errors.minlength} caracteres`;

  if(input.hasError("maxlength")) return `El máximo son ${errors.maxlength} caracteres`;

  if(input.hasError("email")) return "El formato es incorrecto";

  if(name === "confirmPassword" && form.hasError("passwordMismatch")) return "Las contraseñas no coinciden";

  return "";
}
