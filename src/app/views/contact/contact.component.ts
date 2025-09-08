import { Component, inject, OnInit } from '@angular/core';
import { MatIcon } from "@angular/material/icon";
import { BannerInfoComponent } from "../../shared/ui/banner-info/banner-info.component";
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { messageGenerator } from '../../shared/ui/input/message-generator';
import { InputComponent } from "../../shared/ui/input/input.component";
import { ButtonComponent } from "../../shared/ui/buttons/button/button.component";
import { TextAreaComponent } from "../../shared/ui/text-area/text-area.component";
import { DataService } from '../../services/data.service';
import { MessageRequest } from '../../shared/models/MessageRequest';
import { HotToastService } from '@ngxpert/hot-toast';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [MatIcon, BannerInfoComponent, ReactiveFormsModule, InputComponent, ButtonComponent, TextAreaComponent],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss'
})
export class ContactComponent implements OnInit {
  errorMessage = messageGenerator;
  isLoading: boolean = false;
  _dataService = inject(DataService);
  _toast = inject(HotToastService);
  _authService = inject(AuthService);

  messageForm = new FormGroup({
    fullName: new FormControl('', [Validators.required, Validators.minLength(3)]),
    email: new FormControl('', [Validators.required, Validators.email]),
    phone: new FormControl('', [Validators.required, Validators.pattern(/^\d+$/), Validators.minLength(9), Validators.maxLength(9)]),
    content: new FormControl('', [Validators.required, Validators.minLength(10)]),
    subject: new FormControl('', [Validators.required, Validators.minLength(3)])
  })

  ngOnInit(): void {
    this._authService.currentUser$.subscribe(() => {
      if(this._authService.currentClient$.value) {
        this.messageForm.patchValue({
          fullName: this._authService.currentClient$.value?.rsocial?.toLowerCase()?.split(' ').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
          email: this._authService.currentClient$.value?.email,
          phone: this._authService.currentClient$.value?.phone
        });
      } else {
        if(!this._authService.isLoggedIn()) return;

        this._authService.getClient(this._authService.currentUser$.value!.clientId).subscribe((client) => {
          const fullName = client?.rsocial?.toLowerCase()?.split(' ').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  
          this.messageForm.patchValue({
            fullName: fullName,
            email: client?.email,
            phone: client?.phone
          });
        });
      }
    });
  }

  sendMessage() {
    this.isLoading = true;
    const body: MessageRequest = {
      fullName: this.messageForm.value.fullName!,
      email: this.messageForm.value.email!,
      phone: this.messageForm.value.phone!,
      content: this.messageForm.value.content!,
      subject: this.messageForm.value.subject!,
      origin: "INVERSIONES"
    }

    this._dataService.sendMessage(body).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.messageForm.reset();
        this._toast.success('Consulta enviada correctamente');
      },
      error: () => {
        this.isLoading = false;
        this._toast.error('Error al enviar la consulta');
      }
    });
  }
}
