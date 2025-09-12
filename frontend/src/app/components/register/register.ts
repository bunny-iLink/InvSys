import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.html',
  styleUrls: ['./register.css']
})
export class Register {
  registerForm: FormGroup;
  registerError: string | null = null;
  registerSuccess: string | null = null;

  constructor(private fb: FormBuilder, private authService: Auth) {
    this.registerForm = this.fb.group({
      firstname: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit() {
    if (this.registerForm.valid) {
      this.registerError = null;
      this.registerSuccess = null;
      const { firstname, email, password } = this.registerForm.value;
      console.log("Email:", email, "Password:", password, "First Name:", firstname);
      

      this.authService.register(firstname, email, password).subscribe({
        next: (response: any) => {
          console.log('register successful', response);
          this.registerSuccess = `register successful!`;
        },
        error: (err) => {
          console.error('register failed', err);
          this.registerError = 'register failed. Please check your credentials and try again.';
        }
      });
    }
  }
}