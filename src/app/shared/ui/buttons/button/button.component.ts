import { NgClass } from '@angular/common';
import { booleanAttribute, Component, EventEmitter, Input, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { SpinnerComponent } from "../../spinner/spinner.component";

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [NgClass, MatIconModule, SpinnerComponent],
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss'
})
export class ButtonComponent {
  @Input() theme: 'primary' | 'secondary' | 'warning' | 'danger' = "primary";
  @Input() fontSize: 'font-sm' | 'font-md' | 'font-xl' | 'font-st' | 'font-xxl' = "font-st";
  @Input() icon?: string;
  @Input({transform: booleanAttribute }) isLoading: boolean = false;
  @Input({transform: booleanAttribute }) isDisabled: boolean = false;
  @Output() onClick = new EventEmitter<void>();
  
  handleClick() {
    this.onClick.emit();
  }
}
