import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  searchQuery: string = '';
  logoPath: string = 'assets/header/logo1.png';

  constructor(
    private router: Router,              // ✅ Thêm dòng này
    private userService: UserService     // ✅ Đã inject đúng
  ) {}

  handleImageError(event: any) {
    console.error('Error loading image:', event);
    const imgElement = event.target as HTMLImageElement;
    imgElement.style.display = 'none';
    const parentDiv = imgElement.parentElement;
    if (parentDiv) {
      const icon = document.createElement('i');
      icon.className = 'bi bi-book-half logo-icon';
      parentDiv.insertBefore(icon, imgElement);
    }
  }

  onSearch(): void {
    console.log('🔍 Search query:', this.searchQuery);
    const trimmedQuery = this.searchQuery.trim();
    if (trimmedQuery) {
      this.router.navigate(['/wordset-search'], {
        queryParams: { q: trimmedQuery }
      });
    }
  }

  onLogout(): void {
    this.userService.logout().subscribe(() => {
      this.router.navigate(['/login']);
    });
  }
}
