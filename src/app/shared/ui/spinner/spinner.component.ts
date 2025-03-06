import { NgClass, NgStyle } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'spinner',
  standalone: true,
  imports: [NgStyle, NgClass],
  templateUrl: './spinner.component.html',
  styleUrl: './spinner.component.scss'
})
export class SpinnerComponent {
  @Input() size: 'sm' | 'md' | 'xl' | 'xxl' = "sm";
  @Input() color: 'primary' | 'secondary' | 'danger' | 'warning' | 'main' = "primary";
}
