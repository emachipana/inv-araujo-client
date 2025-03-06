import { CommonModule, TitleCasePipe } from '@angular/common';
import { Component, computed, forwardRef, input, Input, InputSignal, OnInit, Signal, signal, WritableSignal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'custom-input',
  standalone: true,
  imports: [CommonModule, TitleCasePipe, MatIconModule],
  templateUrl: './input.component.html',
  styleUrl: './input.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true
    }
  ]
})
export class InputComponent implements ControlValueAccessor {
  @Input({required: true}) id?: string;
  @Input() label?: string = "";
  @Input() fontSize: 'font-sm' | 'font-md' | 'font-xl' | 'font-xxl' = "font-xl";
  @Input() icon?: string;
  @Input() isDisabled: boolean = false;
  @Input({required: true}) placeholder: string = "";
  @Input() type: string = "text";
  error: InputSignal<string> = input("");
  value: string = "";
  isFocused: WritableSignal<boolean> = signal(false);
  isTouched: WritableSignal<boolean> = signal(false);
  color: Signal<'taupe' | 'persian' | 'red'> = computed(() => {
    if(this.error() && this.isTouched()) return "red";
    if(this.isTouched() || this.isFocused()) return "persian";
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
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
  
  setDisabledState?(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  onInputChange(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.value = val;
    this.onChange(val);
  }
}
