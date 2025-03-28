import { NgClass, TitleCasePipe } from '@angular/common';
import { Component, computed, input, Input, InputSignal, Signal, signal, WritableSignal } from '@angular/core';
import { SelectOption } from '../../models/SelectOption';

@Component({
  selector: 'app-select',
  standalone: true,
  imports: [NgClass, TitleCasePipe],
  templateUrl: './select.component.html',
  styleUrl: './select.component.scss'
})
export class SelectComponent {
  @Input({required: true}) id?: string;
  @Input() label?: string = "";
  @Input() fontSize: 'font-sm' | 'font-md' | 'font-xl' | 'font-xxl' = "font-xl";
  @Input() icon?: string;
  @Input() isDisabled: boolean = false;
  @Input() options: SelectOption[] = [];
  error: InputSignal<string> = input("");
  value: string = "";
  isFocused: WritableSignal<boolean> = signal(false);
  isTouched: WritableSignal<boolean> = signal(false);
  color: Signal<'taupe' | 'input-persian' | 'input-red'> = computed(() => {
    if(this.error() && this.isTouched()) return "input-red";
    if(this.isTouched() || this.isFocused()) return "input-persian";
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
