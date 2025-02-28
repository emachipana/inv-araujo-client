import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/ui/navbar/navbar.component';
import { AuthService } from './services/auth.service';
import { LoginModalService } from './services/login-modal.service';
import { NgxSpinnerModule } from 'ngx-spinner';
import { Colors } from './constants/index.constants';
import { DialogModule } from 'primeng/dialog';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, NgxSpinnerModule, DialogModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  _authService = inject(AuthService);
  _loginModalService = inject(LoginModalService);
  colors = Colors;

}
