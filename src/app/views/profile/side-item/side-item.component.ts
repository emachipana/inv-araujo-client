import { NgClass } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-side-item',
  standalone: true,
  imports: [MatIconModule, NgClass],
  templateUrl: './side-item.component.html',
  styleUrl: './side-item.component.scss'
})
export class SideItemComponent {
  @Input() icon: string = "";
  @Input() name: string = "";
  @Input() currentTab: "cuenta" | "pedidos" | "contraseña" | "notificaciones" = "cuenta";
  @Input() tabIdentifier: "cuenta" | "pedidos" | "contraseña" | "notificaciones" | undefined;
  @Output() tabChange = new EventEmitter<"cuenta" | "pedidos" | "contraseña" | "notificaciones">();

  onTabChange(): void {
    this.tabChange.emit(this.tabIdentifier);
  }
}
