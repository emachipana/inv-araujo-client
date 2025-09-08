import { Component, inject, OnInit } from '@angular/core';
import { MatIcon } from "@angular/material/icon";
import { CardComponent } from "./card/card.component";
import { ButtonComponent } from "../../shared/ui/buttons/button/button.component";
import { InvitroService } from '../../services/invitro.service';
import { HotToastService } from '@ngxpert/hot-toast';
import { QuestionCardComponent } from "./question-card/question-card.component";
import { Router } from '@angular/router';

@Component({
  selector: 'app-invitro',
  standalone: true,
  imports: [MatIcon, CardComponent, ButtonComponent, QuestionCardComponent],
  templateUrl: './invitro.component.html',
  styleUrl: './invitro.component.scss'
})
export class InvitroComponent implements OnInit {
  cards = [
    {
      img: "/laboratorio_1.jpg",
      description: "Nos enfocamos en mejorar la producción y calidad de tus cultivos. Aplicando las mejores prácticas siendo uno de nuestros mejores logros la certificación por SENASA."
    },
    {
      img: "/laboratorio_2.jpg",
      description: "Producimos cultivos sin virus ni enfermedades, aseguramos resultados a gran escala en menor tiempo y sobre todo, incrementamos exponencialmente tu producción de cultivos. Todo con el fin de darte la mejor asistencia."
    },
    {
      img: "/laboratorio_3.jpg",
      description: "En Inversiones Araujo contamos con sistemas de propagación automatizados de última generación, formamos profesionales capacitados y hacemos investigaciones para ofrecerte innovaciones y lo último en tecnología."
    }
  ]

  _invitroService = inject(InvitroService);
  _toast = inject(HotToastService);
  isLoading = false;
  router = inject(Router);

  navigateToStore() {
    this.router.navigate(['/invitro/pedido']);
  }

  ngOnInit(): void {
    this.isLoading = true;
    this._invitroService.loadVarieties().subscribe({
      next: (response) => {
        this.isLoading = false;
      },
      error: (error) => {
        this._toast.error(error.error.message);
        this.isLoading = false;
      }
    });
  }
}
