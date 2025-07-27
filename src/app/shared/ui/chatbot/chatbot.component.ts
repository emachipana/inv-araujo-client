import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ChatBotMessage } from '../../models/ChatBotMessage';
import { ChatbotService } from '../../../services/chatbot.service';
import { finalize } from 'rxjs';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.scss']
})
export class ChatbotComponent implements OnInit {
  readonly botAvatar = "agrobot.png";
  readonly defaultUserAvatar = "default-avatar.jpg";

  isOpen = false;
  messages: ChatBotMessage[] = [];
  userInput = '';
  isLoading = false;
  errorMessage: string | null = null;

  _chatbotService = inject(ChatbotService)
  _authService = inject(AuthService);

  get userAvatar(): string {
    const user = this._authService.currentUser$.value;
    return user?.image?.url || this.defaultUserAvatar;
  }

  ngOnInit(): void {
    this.addWelcomeMessage();
  }

  private addWelcomeMessage() {
    this.addBotMessage('Hola. ¿En qué puedo ayudarte hoy?');
  }

  toggleChat() {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.scrollToBottom();
    }
  }

  sendMessage() {
    const message = this.userInput.trim();
    if (!message || this.isLoading) return;
    
    // Agregar mensaje del usuario
    this.addUserMessage(message);
    this.userInput = '';
    this.errorMessage = null;
    
    // Mostrar indicador de carga
    this.isLoading = true;
    this.addLoadingIndicator();
    
    // Enviar mensaje al servicio
    this._chatbotService.question(message)
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.scrollToBottom();
        })
      )
      .subscribe({
        next: (response) => {
          this.removeLoadingIndicator();
          this.addBotMessage(response);
        },
        error: (error) => {
          console.error('Error al obtener respuesta del chatbot:', error);
          this.removeLoadingIndicator();
          this.errorMessage = 'Lo siento, ha ocurrido un error al procesar tu mensaje. Por favor, inténtalo de nuevo.';
          this.addBotMessage(this.errorMessage);
        }
      });
  }

  private addUserMessage(text: string) {
    this.messages.push({ text, isUser: true });
  }

  private addBotMessage(text: string) {
    this.messages.push({ text, isUser: false });
    this.scrollToBottom();
  }

  private addLoadingIndicator() {
    this.messages.push({ text: '', isUser: false, isLoading: true });
    this.scrollToBottom();
  }

  private removeLoadingIndicator() {
    this.messages = this.messages.filter(m => !m.isLoading);
  }

  private scrollToBottom() {
    // Usamos setTimeout para asegurarnos de que el DOM se haya actualizado
    setTimeout(() => {
      const chatMessages = document.querySelector('.chat-messages');
      if (chatMessages) {
        chatMessages.scrollTop = chatMessages.scrollHeight;
      }
    }, 0);
  }
}
