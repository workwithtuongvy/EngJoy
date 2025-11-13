import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-side-bar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './side-bar.component.html',
  styleUrls: ['./side-bar.component.css']
})
export class SideBarComponent {
  menuItems = [
    {
      label: 'Home',
      icon: 'assets/home/ic_home.png',
      route: '/home'
    },
    {
      label: 'My VocabSpace',
      icon: 'assets/myvocal/ic_myvocal.png',
      route: '/myvocabspace'
    },
    {
      label: 'Lederboard',
      icon: 'assets/leaderboard/ic_leaderboard.png',
      route: '/leaderboard'
    },
    {
      label: 'Discover',
      icon: 'assets/discover/ic_discover.png',
      route: '/discover'
    }
  ];
}
