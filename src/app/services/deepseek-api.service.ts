import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DeepseekApiService {
  apiKey = environment.secretEnvironment.DEEPSEEK_API_KEY;
  baseUrl = "https://openrouter.ai/api/v1/chat/completions";

  constructor(private http: HttpClient) { }

  sendToDeepSeek(prompt: string) {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json'
    });

    const body = {
      model: 'deepseek/deepseek-chat-v3-0324:free',
      messages: [
        {role: 'user', content: prompt}
      ]
    };

    return this.http.post(this.baseUrl, body, { headers });
  }
}
