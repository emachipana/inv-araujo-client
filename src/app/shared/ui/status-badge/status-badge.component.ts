import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Colors } from '../../../constants/index.constants';

type StatusType = 'PENDIENTE' | 'PAGADO' | 'ENTREGADO' | 'CANCELADO' | 'ENVIO_AGENCIA' | 'RECOJO_ALMACEN';

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
  @Input() status: StatusType = 'PENDIENTE';

  statusConfig: Record<StatusType, StatusConfig> = {
    PENDIENTE: {
      text: 'Pendiente',
      bgColor: Colors.yellow_light,
      textColor: Colors.yellow_hover,
    },
    PAGADO: {
      text: 'Pagado',
      bgColor: Colors.blue_light,
      textColor: Colors.blue,
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
    ENVIO_AGENCIA: {
      text: 'Traslado sin costo',
      bgColor: Colors.persian_light,
      textColor: Colors.persian,
    },
    RECOJO_ALMACEN: {
      text: 'Sin costo adicional',
      bgColor: Colors.blue_light,
      textColor: Colors.blue,
    }
  };

  get currentStatus() {
    return this.statusConfig[this.status];
  }
}
