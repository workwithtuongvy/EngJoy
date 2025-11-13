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
import { max } from 'rxjs';
@Component({
  selector: 'app-wordsearchgame',
  standalone: true,
  imports: [CommonModule, HeaderComponent, SideBarComponent, 
    HeadergameComponent, AutoFontDirective, RouterModule], 
  templateUrl: './wordsearchgame.component.html',
  styleUrls: ['./wordsearchgame.component.css']
})
export class WordsearchgameComponent implements AfterViewInit, OnInit {
  //#region 1. Biến giao diện và hệ thống
  isDarkMode: boolean = true;
  isGameOver: boolean = false;
  isPaused: boolean = false;
  elapsedSeconds: number = 0;
  timerInterval: any;

  toggleTheme(): void {
    this.isDarkMode = !this.isDarkMode;
  }

  get formattedTime(): string {
    const m = Math.floor(this.elapsedSeconds / 60).toString().padStart(2, '0');
    const s = (this.elapsedSeconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  ngAfterViewInit(): void {
    this.adjustScale();
    document.getElementById('maingame')?.scrollIntoView({ behavior: 'smooth' });
    this.startTimer();
    document.addEventListener('mouseup', () => this.endSelection());
  }

  startTimer(): void {
    this.timerInterval = setInterval(() => this.elapsedSeconds++, 1000);
  }

  togglePause(): void {
    this.isPaused = !this.isPaused;
    this.isPaused ? clearInterval(this.timerInterval) : this.startTimer();
  }

  adjustScale(): void {
    const base = 18;
    const dim = Math.max(this.grid.length, this.grid[0]?.length || 0);
    document.documentElement.style.setProperty('--grid-scale', (Math.min(1, base / dim)).toString());
  }
  //#endregion

  //#region 2. Biến trò chơi chính
  wordSetId!: number;
  gameModeId!: number;
  userId: number = 0;
  wordSetTitle: string = '';
  modeName: string = '';
  minFontSize: number = 20;
  maxFontSize: number = 28;
  playStartTime: Date = new Date();
  totalScore: number = 0;
  rank: number | null = null;

  terms: string[] = []; // bản đã bỏ khoảng trắng
  rawTerms: string[] = []; // bản gốc có khoảng trắng
  definitions: string[] = [];
  dictionary: Record<string, string> = {};
  grid: string[][] = [];
  matrixRow = 16;
  matrixColumn = 24;

  selectedCells: { row: number; col: number }[] = [];
  foundTerms: Set<string> = new Set();
  foundPaths: { row: number; col: number }[] = [];
  showTermInstead: boolean[] = [];
  showAnswers: boolean[] = [];
  isSelecting: boolean = false;


  constructor(
    private route: ActivatedRoute,
    private wordsetService: WordsetService,
    private gameSessionService: GameSessionService,
    private userService: UserService
  ) {}
  //#endregion

  //#region 3. Khởi tạo game
  ngOnInit(): void {
    this.userService.getCurrentUser().subscribe({
      next: res => { if (res.isLoggedIn && res.user_id) this.userId = res.user_id; }
    });

    this.wordSetId = +this.route.snapshot.paramMap.get('word_set_id')!;
    this.gameModeId = +this.route.snapshot.paramMap.get('game_mode_id')!;

    const wordCount = [0, 5, 10, 15][this.gameModeId] || 10;
    this.minFontSize = [30, 22, 18, 14][this.gameModeId] || 20;
    this.maxFontSize = [32, 28, 27, 21][this.gameModeId] || 28;
    this.modeName = `${wordCount} Words`;

    this.wordsetService.getWordSetById(this.wordSetId).subscribe({
      next: (res: WordSet) => {
        this.wordSetTitle = res.title;

        const validWords = res.words.filter(w => w.term.length <= 20);
        const selected = this.shuffle(validWords).slice(0, wordCount);

        this.rawTerms = selected.map(w => w.term);
        this.terms = selected.map(w => w.term.replace(/\s+/g, '').toUpperCase());
        this.definitions = selected.map(w => w.definition);
        this.dictionary = Object.fromEntries(selected.map(w => [w.term.replace(/\s+/g, ''), w.definition]));

        this.initGrid();
        this.placeWordsInGrid(this.terms);
        this.fillGridWithRandomLetters();
      }
    });

    this.playStartTime = new Date(Date.now());
  }
  //Cac ham phu
  shuffle<T>(arr: T[]): T[] {
    return arr.slice().sort(() => 0.5 - Math.random());
  }
  getRawTermFromDefinition(def: string): string | undefined {
    const index = this.definitions.findIndex(d => d === def);
    return this.rawTerms[index]; // đảm bảo cùng kiểu hiển thị
  }
  // Dùng index thay vì hàm phức tạp để kiểm tra từ đã tìm
  isTermFound(index: number): boolean {
    return this.foundTerms.has(this.terms[index]);
  }



  //#endregion

  //#region 4. Tạo và điền lưới
  initGrid(): void {
    this.grid = Array.from({ length: this.matrixRow }, () => Array(this.matrixColumn).fill(''));
  }

  placeWordsInGrid(words: string[]): void {
    const dirs = [
      { dx: 1, dy: 0 }, { dx: 0, dy: 1 }, { dx: 1, dy: 1 },
      { dx: -1, dy: 0 }, { dx: 0, dy: -1 }, { dx: -1, dy: -1 },
      { dx: 1, dy: -1 }, { dx: -1, dy: 1 }
    ];

    for (const word of words) {
      let placed = false;
      for (let i = 0; i < 100 && !placed; i++) {
        const d = dirs[Math.floor(Math.random() * dirs.length)];
        const row = Math.floor(Math.random() * this.grid.length);
        const col = Math.floor(Math.random() * this.grid[0].length);
        if (this.canPlace(word, row, col, d.dx, d.dy)) {
          for (let j = 0; j < word.length; j++) {
            const r = row + d.dy * j;
            const c = col + d.dx * j;
            this.grid[r][c] = word[j];
          }
          placed = true;
        }
      }
    }
  }

  canPlace(word: string, row: number, col: number, dx: number, dy: number): boolean {
    for (let i = 0; i < word.length; i++) {
      const r = row + dy * i, c = col + dx * i;
      if (r < 0 || r >= this.grid.length || c < 0 || c >= this.grid[0].length || (this.grid[r][c] && this.grid[r][c] !== word[i]))
        return false;
    }
    return true;
  }

  fillGridWithRandomLetters(): void {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (let r = 0; r < this.grid.length; r++)
      for (let c = 0; c < this.grid[r].length; c++)
        if (!this.grid[r][c])
          this.grid[r][c] = letters[Math.floor(Math.random() * letters.length)];
  }
  //#endregion

  //#region 5. Xử lý tương tác chọn từ
  startSelection(row: number, col: number): void {
    this.selectedCells = [{ row, col }];
    this.isSelecting = true;
  }

  continueSelection(row: number, col: number): void {
    if (!this.isSelecting) return;
    const last = this.selectedCells.at(-1)!;
    const dx = col - last.col, dy = row - last.row;

    if (this.selectedCells.length === 1 || (
      dx === (this.selectedCells[1].col - this.selectedCells[0].col) &&
      dy === (this.selectedCells[1].row - this.selectedCells[0].row)
    )) {
      this.selectedCells.push({ row, col });
    }
  }

  endSelection(): void {
    if (!this.isSelecting) return;
    this.isSelecting = false;

    const selectedWord = this.selectedCells.map(c => this.grid[c.row][c.col]).join('');
    const reversed = selectedWord.split('').reverse().join('');
    const found = this.terms.find(t => t === selectedWord || t === reversed);

    if (found && !this.foundTerms.has(found)) {
      this.foundTerms.add(found);
      this.foundPaths.push(...this.selectedCells.map(c => ({ ...c })));
      if (this.foundTerms.size === this.terms.length && !this.isGameOver)
        setTimeout(() => this.endGame(), 1000);
    }

    this.selectedCells = [];
  }

  isCellSelected(row: number, col: number): boolean {
    return this.selectedCells.some(c => c.row === row && c.col === col);
  }

  isCellInFoundTerm(row: number, col: number): boolean {
    return this.foundPaths.some(c => c.row === row && c.col === col);
  }
  //#endregion

  //#region 6. Gợi ý & chuyển đổi định nghĩa
  toggleDefinition(index: number): void {
    this.showTermInstead[index] = !this.showTermInstead[index];
  }

  getTermFromDefinition(def: string): string | undefined {
    return Object.entries(this.dictionary).find(([_, d]) => d === def)?.[0].toUpperCase();
  }

  toggleShowAnswer(index: number): void {
    const def = this.definitions[index];
    const term = this.terms[index]; // ✅ bản đã viết hoa & bỏ space
  
    if (!term || this.foundTerms.has(term)) return;
  
    this.foundTerms.add(term); // ✅ dùng đúng bản đã xử lý
    this.showAnswers[index] = true;
  
    const dirs = [
      { dx: 1, dy: 0 }, { dx: 0, dy: 1 }, { dx: 1, dy: 1 },
      { dx: -1, dy: 0 }, { dx: 0, dy: -1 }, { dx: -1, dy: -1 },
      { dx: 1, dy: -1 }, { dx: -1, dy: 1 }
    ];
  
    outer: for (let r = 0; r < this.grid.length; r++) {
      for (let c = 0; c < this.grid[0].length; c++) {
        for (const d of dirs) {
          let match = true;
          for (let i = 0; i < term.length; i++) {
            const nr = r + d.dy * i, nc = c + d.dx * i;
            if (
              nr < 0 || nr >= this.grid.length ||
              nc < 0 || nc >= this.grid[0].length ||
              this.grid[nr][nc] !== term[i]
            ) {
              match = false;
              break;
            }
          }
          if (match) {
            for (let i = 0; i < term.length; i++)
              this.foundPaths.push({ row: r + d.dy * i, col: c + d.dx * i });
            break outer;
          }
        }
      }
    }
  
    if (this.foundTerms.size === this.terms.length && !this.isGameOver)
      setTimeout(() => this.endGame(), 1000);
  }
  
  //#endregion

  //#region 7. Kết thúc game
  get score(): number {
    const correct = this.foundTerms.size;
    const hint = this.showAnswers.filter(x => x).length;
  
    const baseScore = correct * 100;
    const timeBonus = Math.max(0, 30 * this.terms.length - this.elapsedSeconds) * 2;
    const hintPenalty = hint * 200; 
  
    return Math.max(0, baseScore + timeBonus - hintPenalty);
  }
  

  endGame(): void {
    clearInterval(this.timerInterval);
    this.isGameOver = true;
    this.totalScore = this.score;

    const session = new GameSession({
      user_id: this.userId,
      word_set_id: this.wordSetId,
      game_mode_id: this.gameModeId,
      play_date: new Date(this.playStartTime).toISOString(),
      end_date: new Date().toISOString(),
      play_duration: this.elapsedSeconds,
      score: this.totalScore
    });

    this.gameSessionService.saveGameSession(session).subscribe({
      next: res => this.rank = res.rank ?? null
    });
  }
  //#endregion

  //#region 8. Khởi động lại game
  restartGame(): void {
    this.selectedCells = [];
    this.foundTerms.clear();
    this.foundPaths = [];
    this.elapsedSeconds = 0;
    this.isGameOver = false;
    this.isPaused = false;
    this.showAnswers = Array(this.definitions.length).fill(false);
    this.showTermInstead = Array(this.definitions.length).fill(false);
    clearInterval(this.timerInterval);
    this.startTimer();
    this.initGrid();
    this.placeWordsInGrid(this.terms);
    this.fillGridWithRandomLetters();
  }
  //#endregion
}
