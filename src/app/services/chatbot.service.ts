import { inject, Injectable } from '@angular/core';
import { ChatBotMessage } from '../shared/models/ChatBotMessage';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { ApiResponse } from '../shared/models/ApiResponse';
import { ApiConstants } from '../constants/index.constants';

@Injectable({
  providedIn: 'root'
})
export class ChatbotService {
  botMessages: ChatBotMessage[] = [];

  _http = inject(HttpClient);

  question(question: string): Observable<string> {
    return this._http.post<ApiResponse<string>>(`${ApiConstants.chatbot}`, { question }).pipe(
      map(response => response.data)
    );
  }
}
