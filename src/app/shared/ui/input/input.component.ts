import { CommonModule, TitleCasePipe } from '@angular/common';
import { Component, Input } from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [CommonModule, TitleCasePipe, MatIconModule],
  templateUrl: './input.component.html',
  styleUrl: './input.component.scss'
})
export class InputComponent implements ControlValueAccessor {
  writeValue(obj: any): void {
    throw new Error('Method not implemented.');
  }
  registerOnChange(fn: any): void {
    throw new Error('Method not implemented.');
  }
  registerOnTouched(fn: any): void {
    throw new Error('Method not implemented.');
  }
  setDisabledState?(isDisabled: boolean): void {
    throw new Error('Method not implemented.');
  }
  @Input({required: true}) id?: number;
  @Input({required: true}) label: string = "";
  @Input() fontSize: 'font-sm' | 'font-md' | 'font-xl' | 'font-xxl' = "font-sm";
  @Input() icon?: string;
  @Input() isDisabled: boolean = false;
  @Input({required: true}) placeholder: string = "";
}
