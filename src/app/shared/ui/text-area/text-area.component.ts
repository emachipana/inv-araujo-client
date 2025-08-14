import { CommonModule } from '@angular/common';
import { Component, computed, forwardRef, input, Input, InputSignal, signal, WritableSignal, Signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'custom-textarea',
  standalone: true,
  imports: [CommonModule, MatIconModule, FormsModule],
  templateUrl: './text-area.component.html',
  styleUrl: './text-area.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TextAreaComponent),
      multi: true
    }
  ]
})
export class TextAreaComponent implements ControlValueAccessor {
  @Input({required: true}) id?: string;
  @Input() label?: string = "";
  @Input() fontSize: 'font-sm' | 'font-md' | 'font-xl' | 'font-xxl' = "font-xl";
  @Input() icon?: string;
  @Input() isDisabled: boolean = false;
  @Input() placeholder: string = "";
  @Input() rows: number = 3; // Default rows for textarea
  @Input() cols: number = 30; // Default cols for textarea
  
  error: InputSignal<string> = input("");
  value: string = "";
  isFocused: WritableSignal<boolean> = signal(false);
  isTouched: WritableSignal<boolean> = signal(false);
  
  color: Signal<'taupe' | 'input-persian' | 'input-red'> = computed(() => {
    if (this.error() && this.isTouched()) return "input-red";
    if (this.isTouched() || this.isFocused()) return "input-persian";
    return "taupe";
  });
  
  onTouched = (): void => {};
  onChange = (val: any) => {};

  onFocus = (): void => this.isFocused.set(true);
  
  onBlur = (): void => {
    this.isFocused.set(false);
    this.isTouched.set(true);
    this.onTouched();
  }

  writeValue(obj: any): void {
    this.value = obj || "";
    // Si hay un valor, marcamos como tocado para mantener el color persa
    if (this.value) {
      this.isTouched.set(true);
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  onInputChange(event: Event): void {
    const val = (event.target as HTMLTextAreaElement).value;
    this.value = val;
    this.onChange(val);
  }
}
