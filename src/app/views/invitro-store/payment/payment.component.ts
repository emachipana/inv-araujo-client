import { AfterViewInit, Component, EventEmitter, inject, Input, OnInit, Output, ViewChild } from '@angular/core';
import { injectStripe, NgxStripeModule, StripeElementsDirective, StripePaymentElementComponent, StripeService } from 'ngx-stripe';
import { PaymentService } from '../../../services/payment.service';
import { HotToastService } from '@ngxpert/hot-toast';
import { environment } from '../../../../environments/environment';
import { StripeElements, StripeElementsOptions, StripePaymentElementOptions } from '@stripe/stripe-js';
import { ButtonComponent } from '../../../shared/ui/buttons/button/button.component';
import { InvitroService } from '../../../services/invitro.service';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [NgxStripeModule, StripePaymentElementComponent, StripeElementsDirective, ButtonComponent],
  templateUrl: './payment.component.html',
  styleUrl: './payment.component.scss'
})
export class PaymentComponent implements OnInit, AfterViewInit {
  @Output() onPay = new EventEmitter<void>();
  @Output() onCancel = new EventEmitter<void>();
  @Input() isValid: boolean = false;
  @Input() currentTab?: string;
  @Input() isLoading: boolean = false;
  @Input() isAdvance: boolean = false;
  @ViewChild(StripeElementsDirective, { static: false }) stripeElements!: StripeElementsDirective;
  
  private _paymentService = inject(PaymentService);
  private _stripeService = inject(StripeService);
  private toast = inject(HotToastService);
  private _invitroService = inject(InvitroService);

  paymentComplete: boolean = false;
  stripe = injectStripe(environment.stripe_public_key);
  elements!: StripeElements;

  stripeElementsOptions: StripeElementsOptions = {
    locale: 'es',
    clientSecret: "",
  };

  paymentOptions: StripePaymentElementOptions = {
    layout: {
      type: 'tabs',
    },
    fields: {

      billingDetails: {
        name: 'never',
        email: 'never',
        address: 'never',
        phone: 'never'
      }
    },
    paymentMethodOrder: ['card']
  }

  handleCancel(): void {
    this.onCancel.emit();
  }

  ngAfterViewInit(): void {
    this._stripeService.elements(this.stripeElementsOptions).subscribe((elements) => {
      if (elements) {
        this.elements = elements;
      } else {
        this.toast.error("No se pudo inicializar Stripe Elements.");
      }
    });
  }

  ngOnInit(): void {
    this._invitroService.varietiesToOrder$.subscribe((val) => {
      if(this.currentTab !== "checkout") return;

      const total: number = this.isAdvance ? 500 : this._invitroService.varietiesToOrder$.value.reduce((acc, variety) => acc + variety.quantity * variety.variety.price, 0);

      if(total <= 0) return;
      
      this._paymentService.createIntent(total).subscribe({
        next: (response) => {
          const options: StripeElementsOptions = {
            locale: this.stripeElementsOptions.locale,
            clientSecret: response
          }
          
          this.stripeElementsOptions = options;
        },
        error: (error) => {
          console.error(error);
          this.toast.error(error.error.message);
        }
      });
    });
  }

  onPaymentChange(event: any) {
    if(event.complete) this.paymentComplete = true;
  }

  handlePay(): void {
    if (!this.isValid || !this.paymentComplete) return;

    this.onPay.emit();
  }
}
