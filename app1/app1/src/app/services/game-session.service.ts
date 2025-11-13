import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GameSession } from '../model/game-session.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GameSessionService {
  private baseUrl = `${environment.apiUrl}/game-session`;

  constructor(private http: HttpClient) {}

  saveGameSession(session: GameSession): Observable<any> {
    const formData = new FormData();

    formData.append('user_id', session.user_id.toString());
    formData.append('word_set_id', session.word_set_id.toString());
    formData.append('play_date', session.play_date);
    formData.append('play_duration', session.play_duration.toString());
    formData.append('end_date', session.end_date);
    formData.append('game_mode_id', session.game_mode_id.toString());
    formData.append('score', session.score.toString());

    return this.http.post(`${this.baseUrl}/save_game_session.php`, formData);
  }
}
