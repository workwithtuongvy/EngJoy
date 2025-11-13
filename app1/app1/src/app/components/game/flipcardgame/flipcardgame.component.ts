import { CommonModule } from '@angular/common';
import { Component, AfterViewInit, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { HeaderComponent } from '../../header/header.component';
import { SideBarComponent } from '../../side-bar/side-bar.component';
import { HeadergameComponent } from '../headergame/headergame.component';

import { Word } from '../../../model/word.model';
import { WordsetService } from '../../../services/wordset.service';
import { WordSet } from '../../../model/wordset.model';
import { AutoFontDirective } from '../../../directives/auto-font.directive';
import { GameSessionService } from '../../../services/game-session.service';
import { GameSession } from '../../../model/game-session.model';
import { UserService } from '../../../services/user.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-flipcardgame',
  standalone: true,
  imports: [CommonModule, HeaderComponent, SideBarComponent, 
    HeadergameComponent, AutoFontDirective, RouterModule],
  templateUrl: './flipcardgame.component.html',
  styleUrl: './flipcardgame.component.css'
})
export class FlipcardgameComponent implements OnInit, AfterViewInit {

  //#region 1. Giao diện: theme tối/sáng
  isDarkMode: boolean = true;
  toggleTheme(): void {
    this.isDarkMode = !this.isDarkMode;
  }
  //#endregion

  //#region 2. Đồng hồ đếm thời gian
  elapsedSeconds: number = 0;
  timerInterval: any;

  startTimer(): void {
    this.timerInterval = setInterval(() => {
      this.elapsedSeconds++;
    }, 1000);
  }

  get formattedTime(): string {
    const minutes = Math.floor(this.elapsedSeconds / 60).toString().padStart(2, '0');
    const seconds = (this.elapsedSeconds % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  }
  //#endregion

  //#region 3. Scroll xuống khung chơi khi khởi tạo
  ngAfterViewInit(): void {
    const target = document.getElementById('maingame');
    target?.scrollIntoView({ behavior: 'smooth' });
    this.startTimer();
  }
  //#endregion

  //#region 4. Logic game flip card

  //#region 4.1. Khai báo biến trạng thái game
  wordSetId!: number;
  gameModeId!: number;
  cardCount = 12;
  columns = 4;
  rows = 3;

  dictionary: Record<string, string> = {};
  cards: string[] = [];
  flipped: boolean[] = [];
  matched: boolean[] = [];
  selectedIndices: number[] = [];
  isChecking = false;
  hidden: boolean[] = [];
  wordSetTitle: string = '';
  modeName: string = '';
  minFontSize: number = 10;
  maxFontSize: number = 32;

  correctPairs: number = 0;
  flipCount: number = 0;
  isGameOver: boolean = false;
  totalScore: number = 0;
  rank: number | null = null;
  userId: number = 0; // lấy từ session thực tế nếu có
  //#endregion

  //#region 4.2. Khởi tạo game và load dữ liệu từ URL + API
  constructor(
    private route: ActivatedRoute,
    private wordsetService: WordsetService,
    private gameSessionService: GameSessionService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.userService.getCurrentUser().subscribe({
      next: (res) => {
        if (res.isLoggedIn && res.user_id) {
          this.userId = res.user_id;
        } else {
          console.warn('User not logged in or missing ID.');
        }
      },
      error: (err) => {
        console.error('Failed to get current user:', err);
      }
    });
    
    this.wordSetId = +this.route.snapshot.paramMap.get('word_set_id')!;
    this.gameModeId = +this.route.snapshot.paramMap.get('game_mode_id')!;
    this.hidden = Array(this.cardCount).fill(false);

    switch (this.gameModeId) {
      case 4:
        this.cardCount = 12;
        this.columns = 4;
        this.rows = 3;
        this.minFontSize = 32;
        this.maxFontSize = 38;
        break;
      case 5:
        this.cardCount = 20;
        this.columns = 5;
        this.rows = 4;
        this.minFontSize = 28;
        this.maxFontSize = 30;
        break;
      case 6:
        this.cardCount = 30;
        this.columns = 6;
        this.rows = 5;
        break;
      default:
        this.cardCount = 13;
        this.columns = 4;
        this.rows = 3;
    }
    this.modeName = this.columns + 'x' + this.rows;
    this.flipped = Array(this.cardCount).fill(false);
    this.matched = Array(this.cardCount).fill(false);

    const wordCount = this.cardCount / 2;

    this.wordsetService.getWordSetById(this.wordSetId).subscribe({
      next: (res: WordSet) => {
        this.wordSetTitle = res.title;
        this.cards = this.generateCardsFromWords(res.words, wordCount);
      },
      error: (err) => {
        console.error('Không tải được bộ từ:', err);
      }
    });
  }
  //#endregion

  //#region 4.3. Sinh danh sách thẻ (term/definition), tạo từ điển đối chiếu
  generateCardsFromWords(source: Word[], count: number): string[] {
    const shuffled = [...source].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, count);

    this.dictionary = {};
    const cardList: string[] = [];

    selected.forEach(w => {
      this.dictionary[w.term] = w.definition;
      this.dictionary[w.definition] = w.term;
      cardList.push(w.term, w.definition);
    });

    return cardList.sort(() => 0.5 - Math.random());
  }
  //#endregion

  //#region 4.4. Xử lý khi người chơi lật thẻ
  toggleFlip(index: number): void {
    if (this.isChecking || this.flipped[index] || this.matched[index]) return;

    this.flipped[index] = true;
    this.selectedIndices.push(index);
    this.flipCount++;

    if (this.selectedIndices.length === 2) {
      this.isChecking = true;

      const [i1, i2] = this.selectedIndices;
      const c1 = this.cards[i1];
      const c2 = this.cards[i2];

      const isMatch = this.dictionary[c1] === c2 || this.dictionary[c2] === c1;

      setTimeout(() => {
        if (isMatch) {
          this.matched[i1] = true;
          this.matched[i2] = true;
          this.correctPairs++;

          setTimeout(() => {
            this.hidden[i1] = true;
            this.hidden[i2] = true;
            if (this.matched.every(v => v)) {
              this.endGame();
            }
          }, 500);
        } else {
          this.flipped[i1] = false;
          this.flipped[i2] = false;
        }

        this.selectedIndices = [];
        this.isChecking = false;
      }, 800);
    }
  }
  //#endregion

  //#region 4.5. Tính điểm cuối game dựa trên độ chính xác và thời gian
  calculateScore(): number {
    const baseScore = 10000;
    const correctScore = this.correctPairs * 500;
    const optimalFlips = this.correctPairs * 2;
    const extraFlips = Math.max(0, this.flipCount - optimalFlips);
    const accuracyPenalty = extraFlips * 15;
    const timePenalty = this.elapsedSeconds * 5;
    const bonus = this.flipCount === optimalFlips ? 1000 : 0;

    return Math.max(0, baseScore + correctScore + bonus - accuracyPenalty - timePenalty);
  }
  //#endregion

  //#region 4.6. Kết thúc game: dừng timer, tính điểm, gọi API lưu kết quả và lấy rank
  playStartTime: Date = new Date(Date.now() - this.elapsedSeconds * 1000);
  endGame(): void {
    clearInterval(this.timerInterval);
    this.isGameOver = true;
    this.totalScore = this.calculateScore();

    const endDate = new Date(this.playStartTime.getTime() + this.elapsedSeconds * 1000);

    const session = new GameSession({
      user_id: this.userId,
      word_set_id: this.wordSetId,
      play_duration: this.elapsedSeconds,
      end_date: endDate.toISOString(),
      game_mode_id: this.gameModeId,
      score: this.totalScore
    });

    this.gameSessionService.saveGameSession(session).subscribe({
      next: res => {
        console.log("Saved:", res);
        this.rank = res.rank ?? null;
      },
      error: err => console.error("Error saving result:", err)
    });
  }
  //#endregion

  //#region 5. Khởi động lại game
  restartGame(): void {
    this.selectedIndices = [];
    this.isChecking = false;
    this.flipped = Array(this.cardCount).fill(false);
    this.matched = Array(this.cardCount).fill(false);
    this.hidden = Array(this.cardCount).fill(false);
    this.correctPairs = 0;
    this.flipCount = 0;
    this.isGameOver = false;
    this.totalScore = 0;
    this.rank = null;

    const wordCount = this.cardCount / 2;

    this.wordsetService.getWordSetById(this.wordSetId).subscribe({
      next: (res: WordSet) => {
        this.cards = this.generateCardsFromWords(res.words, wordCount);
      },
      error: (err) => {
        console.error('Cannot load word set:', err);
      }
    });

    this.elapsedSeconds = 0;
    this.startTimer();
  }
  //#endregion

  //#region 6. Tạm dừng và tiếp tục game
  isPaused: boolean = false;

  togglePause(): void {
    this.isPaused = !this.isPaused;
    if (this.isPaused) {
      clearInterval(this.timerInterval);
    } else {
      this.startTimer();
    }
  }
  //#endregion
  //#endregion
}
