import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Auth } from '../../services/auth';
import { finalize } from 'rxjs';
import { CustomToastService } from '../../services/toastr';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.html',
  styleUrls: ['./register.css']
})
export class Register {
  registerForm: FormGroup;
  isLoading: boolean = false;

  constructor(private fb: FormBuilder, private authService: Auth, private toast: CustomToastService) {
    this.registerForm = this.fb.group({
      firstname: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit() {
    if (this.registerForm.valid) {
      const { firstname, email, password } = this.registerForm.value;
      this.isLoading = true;

      this.authService.register(firstname, email, password).pipe(
        finalize(() => this.isLoading = false)
      ).subscribe({
        next: (response: any) => {
          this.toast.showToast('Success', 'Registration Successful. Please check your email to verify your account.', "success", 3000);
        },
        error: (err) => {
          this.toast.showToast('Error', 'Register Failed. Please try again', "error", 3000);
        }
      });
    }
  }
}