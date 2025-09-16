import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.html',
  imports: [CommonModule, ReactiveFormsModule],
})
export class Profile {
  isEditing = false;
  profileError: string | null = null;
  profileSuccess: string | null = null;
  profileForm;

  constructor(private fb: FormBuilder) {
    this.profileForm = this.fb.group({
      firstname: ['', Validators.required],
      lastname: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  onEdit() {
    this.isEditing = true;
  }

  onUpdate() {
    if (this.profileForm.valid) {
      this.profileSuccess = 'Profile updated successfully!';
      this.profileError = null;
      this.isEditing = false;
    } else {
      this.profileError = 'Please fill in all required fields correctly.';
      this.profileSuccess = null;
    }
  }

  onDelete() {
    if (confirm('Are you sure you want to delete your profile?')) {
      this.profileSuccess = 'Profile deleted successfully!';
      this.profileError = null;
      this.profileForm.reset();
      this.isEditing = false;
    }
  }
}
