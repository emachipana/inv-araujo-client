import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Colors } from '../../../constants/index.constants';

type StatusType = 'PENDIENTE' | 'TERMINADO' |  'POR_DEFINIR' | 'PAGADO' | 'EN_PRODUCCION' | 'ENTREGADO' | 'CANCELADO' | 'PRODUCT' | 'ENVIADO' | 'ENVIO_AGENCIA' | 'RECOJO_ALMACEN' | 'CARD_ENVIO_AGENCIA' | 'CARD_RECOJO_ALMACEN' | 'APROBADO' | 'RECHAZADO';

interface StatusConfig {
  text: string;
  bgColor: string;
  textColor: string;
}

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './status-badge.component.html',
  styleUrls: ['./status-badge.component.scss']
})
export class StatusBadgeComponent {
  @Input() status: StatusType = "PENDIENTE";
  @Input() text: string = "";
  @Input() fontSize: number = 13;

  statusConfig: Record<StatusType, StatusConfig> = {
    APROBADO: {
      text: 'Aprobado',
      bgColor: Colors.persian_light,
      textColor: Colors.persian,
    },
    RECHAZADO: {
      text: 'Rechazado',
      bgColor: Colors.red_light,
      textColor: Colors.red,
    },
    TERMINADO: {
      text: 'Terminado',
      bgColor: Colors.blue_light,
      textColor: Colors.blue,
    },
    PENDIENTE: {
      text: 'Pendiente',
      bgColor: Colors.yellow_light,
      textColor: Colors.yellow_hover,
    },
    POR_DEFINIR: {
      text: 'Por definir',
      bgColor: Colors.persian_light,
      textColor: Colors.persian,
    },
    PAGADO: {
      text: 'Pagado',
      bgColor: Colors.blue_light,
      textColor: Colors.blue,
    },
    EN_PRODUCCION: {
      text: 'En producción',
      bgColor: Colors.yellow_light,
      textColor: Colors.yellow_hover,
    },
    ENTREGADO: {
      text: 'Entregado',
      bgColor: Colors.persian_light,
      textColor: Colors.persian,
    },
    CANCELADO: {
      text: 'Cancelado',
      bgColor: Colors.red_light,
      textColor: Colors.red,
    },
    ENVIADO: {
      text: 'Enviado',
      bgColor: Colors.purple_light,
      textColor: Colors.purple,
    },
    ENVIO_AGENCIA: {
      text: 'Traslado sin costo',
      bgColor: Colors.purple_light,
      textColor: Colors.purple,
    },
    RECOJO_ALMACEN: {
      text: 'Sin costo adicional',
      bgColor: Colors.blue_light,
      textColor: Colors.blue,
    },
    CARD_ENVIO_AGENCIA: {
      text: 'Envío agencia',
      bgColor: Colors.purple_light,
      textColor: Colors.purple,
    },
    CARD_RECOJO_ALMACEN: {
      text: 'Recojo almacén',
      bgColor: Colors.blue_light,
      textColor: Colors.blue,
    },
    PRODUCT: {
      text: this.text,
      bgColor: Colors.persian_light,
      textColor: Colors.persian,
    }
  };

  get currentStatus() {
    return this.statusConfig[this.status];
  }
}
 