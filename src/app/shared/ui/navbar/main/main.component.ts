import { Component, inject, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { InputComponent } from "../../input/input.component";
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../../services/auth.service';
import { LoginModalService } from '../../../../services/login-modal.service';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { NgClass } from '@angular/common';
import { MenuItemComponent } from '../../buttons/menu-item/menu-item.component';

@Component({
  selector: 'main-section',
  standalone: true,
  imports: [MatIconModule, InputComponent, ReactiveFormsModule, OverlayPanelModule, NgClass, MenuItemComponent],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss'
})
export class MainComponent implements OnInit {
  _authService = inject(AuthService);
  _loginModalService = inject(LoginModalService);
  isProfOpen = false;

  form = new FormGroup({
    search: new FormControl('', [Validators.required, Validators.minLength(3)]),
  });

  ngOnInit(): void {
    this.form.valueChanges.subscribe(val => {
      console.log(val);
      console.log(this.form.get("search"));
      // console.log(this.hasError());
    });
  }

  // inputError = (): string => {
  //   const search = this.form.get("search");
  //   if(!search) return false;

  //   return (search.hasError("required") || search.hasError("minlenght")) && search.touched;
  // }

  handleProf(action: "register" | "login"): void {
    this._loginModalService.open(action);
    this.isProfOpen = false;
  }
}
