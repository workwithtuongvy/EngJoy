export class GameSession {
    user_id: number;
    word_set_id: number;
    play_date: string;
    play_duration: number;
    end_date: string;
    game_mode_id: number;
    score: number;
  
    constructor(data: Partial<GameSession>) {
      this.user_id = data.user_id ?? 0;
      this.word_set_id = data.word_set_id ?? 0;
      this.play_date = data.play_date ?? new Date().toISOString();
      this.play_duration = data.play_duration ?? 0;
      this.end_date = data.end_date ?? new Date().toISOString();
      this.game_mode_id = data.game_mode_id ?? 4;
      this.score = data.score ?? 0;
    }
  }
  