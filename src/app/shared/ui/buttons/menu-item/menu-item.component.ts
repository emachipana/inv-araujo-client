import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';

@Component({
  selector: 'menu-item',
  standalone: true,
  imports: [],
  templateUrl: './menu-item.component.html',
  styleUrl: './menu-item.component.scss'
})
export class MenuItemComponent {
  @Input({required: true}) name: string = "";
  @Output() onClick = new EventEmitter<void>();

  handleClick() {
    this.onClick.emit();
  }
}
