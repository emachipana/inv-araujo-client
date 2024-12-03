import { Component } from '@angular/core';
import { InfoComponent } from './info/info.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [InfoComponent],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {

}
