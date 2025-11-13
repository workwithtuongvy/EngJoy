import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { WordsetService } from '../../../services/wordset.service';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../header/header.component';
import { SideBarComponent } from '../../side-bar/side-bar.component';
import { HeadergameComponent } from '../headergame/headergame.component';
import { RouterModule } from '@angular/router';
@Component({
  selector: 'app-wordsearchstart',
  standalone: true,
  imports: [CommonModule, HeaderComponent, SideBarComponent, 
    HeadergameComponent, RouterModule  ],
  templateUrl: './wordsearchstart.component.html',
  styleUrls: ['./wordsearchstart.component.css']
})
export class WordsearchstartComponent implements OnInit {
  wordSetId!: number;
  vocabCount = 0;
  selectedMode: { countword: number } | null = null;
  wordSetTitle: string = '';
  //#region Scroll đến phần tử #maingame và bắt đầu đếm giờ khi load
  ngAfterViewInit(): void {
    const target = document.getElementById('maingame');
    target?.scrollIntoView({ behavior: 'smooth' });
    this.startTimer();
  }
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
  constructor(private route: ActivatedRoute, private wordsetService: WordsetService, private router: Router) {}
  ngOnInit(): void {
    const word_set_id = this.route.snapshot.paramMap.get('word_set_id');
    if (!word_set_id) {
      console.error('No word set ID provided');
      return;
    }
    this.wordSetId = +word_set_id;
    this.wordsetService.getWordSetById(this.wordSetId).subscribe({
      next: (wordSet) => {
        if (wordSet && wordSet.words) {
          // Đếm số từ có độ dài ≤ 20
          this.vocabCount = wordSet.words.filter(word => word.term.length <= 20).length;
          this.wordSetTitle = wordSet.title;
          console.log('Số từ có độ dài ≤ 20:', this.vocabCount);
        } else {
          console.error('Invalid word set data received');
        }
      },
      error: (error) => {
        console.error('Error loading word set:', error);
      }
    });

  }
  isAvailable(pairCount: number): boolean {
    return this.vocabCount >= pairCount;
  }
  selectMode(countword: number) {
    this.selectedMode = { countword };
  }

}
