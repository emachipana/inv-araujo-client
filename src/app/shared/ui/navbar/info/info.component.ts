import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'info',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './info.component.html',
  styleUrl: './info.component.scss'
})
export class InfoComponent {
  isVisible = true;

  hiddenInfo() {
    this.isVisible = false;
  }
}
