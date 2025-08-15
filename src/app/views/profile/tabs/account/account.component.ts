import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../../../../services/auth.service';
import { User } from '../../../../shared/models/User';
import { ButtonComponent } from "../../../../shared/ui/buttons/button/button.component";
import { HotToastService } from '@ngxpert/hot-toast';
import { SpinnerComponent } from "../../../../shared/ui/spinner/spinner.component";
import { NgStyle } from '@angular/common';
import { InputComponent } from "../../../../shared/ui/input/input.component";
import { SelectComponent } from "../../../../shared/ui/select/select.component";
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { messageGenerator } from '../../../../shared/ui/input/message-generator';
import { Client } from '../../../../shared/models/Client';
import { SunatService } from '../../../../services/sunat.service';
import { ProfileService } from '../../../../services/profile.service';
import { Observable, concat, of } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { Image as ImageModel } from '../../../../shared/models/Image';
import { UpdateProfileRequest } from '../../../../shared/models/UpdateProfileRequest';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [ButtonComponent, SpinnerComponent, NgStyle, InputComponent, SelectComponent, ReactiveFormsModule],
  templateUrl: './account.component.html',
  styleUrl: './account.component.scss'
})
export class AccountComponent implements OnInit {
  _authService = inject(AuthService);
  _sunatService = inject(SunatService);
  _profileService = inject(ProfileService);
  isLoading: boolean = false;
  toast = inject(HotToastService);

  currentUser: User | null = this._authService.currentUser$.value;
  isGettingClient: boolean = false;
  documentType: "DNI" | "RUC" | undefined;
  isDocLoaded: boolean = false;
  imagePreview: string | ArrayBuffer | null = null;
  file: File | null = null;
  firstTry: number = 0;

  profileForm = new FormGroup({
    documentType: new FormControl('', Validators.required),
    document: new FormControl('', Validators.required),
    rsocial: new FormControl('', Validators.required),
    phone: new FormControl('', [Validators.pattern(/^[0-9]+$/), Validators.minLength(9), Validators.maxLength(9)]),
  });

  userImage = this.currentUser?.image?.url || 'default-avatar.jpg';
  errorMessage = messageGenerator;

  ngOnInit(): void {
    if(this._authService.isClientLoaded()) {
      this.setValueToForm(this._authService.currentClient$.value);
      return;
    }
    this.isGettingClient = true;
    this._authService.getClient(this.currentUser?.clientId || -1).subscribe({
      next: (client) => {
        this.isGettingClient = false;
        this.setValueToForm(client);
      },
      error: (error) => {
        this.isGettingClient = false;
        this.toast.error("Error al obtener el cliente");
      }
    });

    this.profileForm.get('documentType')?.valueChanges.subscribe((type) => {
      this.documentType = type as "DNI" | "RUC";
      if(this.firstTry > 0) {
        this.profileForm.get('document')?.reset();
        this.profileForm.get('rsocial')?.reset();
      }
      this.profileForm.get('document')?.setValidators([
        Validators.required,
        Validators.minLength(this.documentType === 'DNI' ? 8 : 11),
        Validators.maxLength(this.documentType === 'DNI' ? 8 : 11)
      ]);
      this.profileForm.get('document')?.updateValueAndValidity();
      this.firstTry++;
    });

    this.profileForm.get('document')?.valueChanges.subscribe((value) => {
      if (value?.length === (this.documentType === 'DNI' ? 8 : 11)) {
        if(this.firstTry > 0) this.getData(this.documentType ?? "DNI", value);

        this.firstTry++;
      } else {
        this.profileForm.get('rsocial')?.setValue('');
        this.isDocLoaded = false;
      }
    });
  }

  setValueToForm(client: Client | null): void {
    if(!client) return;

    this.isDocLoaded = true;
    this.profileForm.get("document")?.setValue(client.document);
    this.profileForm.get("rsocial")?.setValue(client.rsocial);
    this.profileForm.get("documentType")?.setValue(client.documentType || "");
    this.profileForm.get("phone")?.setValue(client.phone || "");
    this.documentType = client.documentType;
    this.isDocLoaded = true;
  }

  openFilePicker(): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = (event: Event) => {
      const target = event.target as HTMLInputElement;
      const file = target.files?.[0];
      
      if (file) {
        this.previewImage(file);
        this.file = file;
      }
    };
    
    input.click();
  }

  private previewImage(file: File): void {
    const reader = new FileReader();
    
    reader.onload = (e: ProgressEvent<FileReader>) => {
      if (e.target?.result) {
        this.imagePreview = e.target.result as string;
      }
    };
    
    reader.onerror = (e: ProgressEvent<FileReader>) => {
      console.error('Error reading file:', e);
      this.toast.error('Error al cargar la imagen');
    };
    
    reader.readAsDataURL(file);
  }

  getData(type: "DNI" | "RUC", document: string): void {
    this._sunatService.getData(type, document).subscribe({
      next: (response) => {
        if(type === "DNI" && !response.success) {
          this.toast.error("No se encontró información");
          return;
        }
        if(type === "RUC" && !response.razonSocial) {
          this.toast.error("No se encontró información");
          return;
        }

        const rsocial: string = 
          type === "DNI" 
          ? `${response.nombres} ${response.apellidoPaterno} ${response.apellidoMaterno}`
          : `${response.razonSocial}`;

        this.profileForm.get('rsocial')?.setValue(rsocial);
        this.isDocLoaded = true;
      },
      error: (error) => {
        console.error(error);
        this.toast.error(error.error.message);
        this.isDocLoaded = false;
      }
    });
  }

  onSubmit(): void {
    if (this.profileForm.invalid || this.isLoading || !this.currentUser) return;
    
    this.isLoading = true;
    
    // If there's a new image, upload it first
    if (this.file) {
      this._profileService.addImage(this.file).pipe(
        switchMap((image: ImageModel) => this._profileService.updateUser(image.id, this.currentUser!.id)),
        tap((user: User) => {
          this._authService.currentUser$.next(user);
          this.currentUser = user;
        }),
        switchMap(() => this.updateClientProfile())
      ).subscribe({
        error: (error: any) => this.handleProfileUpdateError(error),
        complete: () => this.handleProfileUpdateComplete()
      });
    } else {
      this.updateClientProfile().subscribe({
        error: (error: any) => this.handleProfileUpdateError(error),
        complete: () => this.handleProfileUpdateComplete()
      });
    }
  }
  
  private updateClientProfile(): Observable<Client> {
    const formValue = this.profileForm.value;
    const updateRequest: UpdateProfileRequest = {
      phone: formValue.phone || '',
      rsocial: formValue.rsocial || '',
      document: formValue.document || '',
      documentType: formValue.documentType as "DNI" | "RUC"
    };
    
    return this._profileService.updateProfile(updateRequest, this.currentUser!.clientId).pipe(
      tap((client: Client) => {
        this._authService.currentClient$.next(client);
        this._authService.currentUser$.next({...this._authService.currentUser$.value!, fullName: client.rsocial});
        this.toast.success('Perfil actualizado correctamente');
      })
    );
  }
  
  private handleProfileUpdateError(error: any): void {
    console.error('Error updating profile:', error);
    this.toast.error(error.error?.message || 'Error al actualizar el perfil');
    this.isLoading = false;
  }
  
  private handleProfileUpdateComplete(): void {
    this.isLoading = false;
  }
}
