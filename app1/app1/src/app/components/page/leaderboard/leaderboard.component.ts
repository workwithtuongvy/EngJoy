import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { HeaderComponent } from '../../header/header.component';
import { SideBarComponent } from '../../side-bar/side-bar.component';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { UserService } from '../../../services/user.service';

interface LeaderboardEntry {
  user_id: number;
  rank: number;
  fullname: string;
  wordsets_count: number;
}
@Component({
  selector: 'app-leaderboard',
  imports: [  CommonModule, HeaderComponent, SideBarComponent],
  templateUrl: './leaderboard.component.html',
  styleUrl: './leaderboard.component.css'
})
export class LeaderboardComponent implements OnInit{
  leaderboardEntries: LeaderboardEntry[] = [];

  // TODO: need to use id of current login user
  my_user_id = 1;

  constructor (private http: HttpClient, private userService: UserService) {
  }

  ngOnInit(): void {
    this.userService.getCurrentUser().subscribe(sessionData => {
      if (sessionData?.isLoggedIn && sessionData.user_id) {
        this.my_user_id = sessionData.user_id;
      }
    });
    this.getLeaderboard();
  }

  getLeaderboard() {
    this.http.get<any[]>(`${environment.apiUrl}/get_leaderboard.php`)
      .subscribe((data: any[]) => {
        this.leaderboardEntries = data;
      });
  }
  

}
