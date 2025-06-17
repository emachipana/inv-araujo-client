import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'menu-item',
  standalone: true,
  imports: [],
  templateUrl: './menu-item.component.html',
  styleUrl: './menu-item.component.scss'
})
export class MenuItemComponent {
  @Output() onClick = new EventEmitter<void>();
  @Input() isNotification: boolean = false;
  @Input() notificationsCount: number = 0;

  handleClick() {
    this.onClick.emit();
  }
}
