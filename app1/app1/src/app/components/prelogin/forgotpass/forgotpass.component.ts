import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule],
  templateUrl: './forgotpass.component.html',
  styleUrls: ['./forgotpass.component.css']
})
export class ForgotpassComponent implements OnInit {
  emailForm!: FormGroup;
  errorMessage: string = '';
  successMessage: string = '';
  loading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.emailForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSendTemporaryPassword(): void {
    if (this.emailForm.valid) {
      this.loading = true;
      this.errorMessage = '';
      this.successMessage = '';

      const email = this.emailForm.get('email')?.value;

      this.http.post<any>(`${environment.apiUrl}/reset_pass/send_otp.php`, { email }).subscribe({
        next: () => {
          this.loading = false;
          this.successMessage = 'Your temporary password has been sent to your email.';
        },
        error: (err) => {
          this.loading = false;
          this.errorMessage = err.error?.message || 'Failed to send email. Please try again.';
        }
      });
    } else {
      this.emailForm.markAllAsTouched();
    }
  }

  getErrorMessage(controlName: string): string {
    const control = this.emailForm.get(controlName);
    if (control?.errors && control.touched) {
      if (control.errors['required']) return 'This field is required';
      if (control.errors['email']) return 'Invalid email';
    }
    return '';
  }
}
