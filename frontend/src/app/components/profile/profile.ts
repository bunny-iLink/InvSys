import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { CustomToastService } from '../../services/toastr';
import { User } from '../../models/User';
import { User as UserService } from '../../services/user';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.html',
  imports: [ReactiveFormsModule, CommonModule],
})
export class Profile implements OnInit {
  profileForm!: FormGroup;
  user: User | null = null;
  isEditing: boolean = false;
  profileError: string = '';
  profileSuccess: string = '';

  constructor(
    private fb: FormBuilder,
    private toast: CustomToastService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      this.user = JSON.parse(localStorage.getItem('user') || '{}');
    }

    this.profileForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });

    if (this.user) {
      this.loadUserProfile();
    }
  }

  loadUserProfile() {
    this.userService.getUserById(this.user!.userId).subscribe({
      next: (data: User) => {
        this.profileForm.patchValue({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          password: '', 
        });
      },
      error: () => {
        this.toast.showToast('Error', 'Failed to fetch profile', 'error', 3000);
      },
    });
  }

  onEdit() {
    this.isEditing = true;
  }

  onUpdate() {
    if (this.profileForm.invalid) return;

    const payload = {
      UserId: this.user?.userId || 0,
      FirstName: this.profileForm.value.firstName,
      LastName: this.profileForm.value.lastName,
      Email: this.profileForm.value.email,
      Password: this.profileForm.value.password,
    };

    this.userService.updateUser(payload.UserId, payload).subscribe({
      next: () => {
        this.toast.showToast(
          'Success',
          'Profile updated successfully',
          'success',
          3000
        );
        this.isEditing = false;
        this.profileSuccess = 'Profile updated successfully';
      },
      error: () => {
        this.toast.showToast(
          'Error',
          'Failed to update profile',
          'error',
          3000
        );
        this.profileError = 'Failed to update profile';
      },
    });
  }

  onDelete() {
    if (confirm('Are you sure you want to delete your profile?')) {
      this.userService.deleteUser(this.user?.userId || 0).subscribe({
        next: () => {
          this.toast.showToast(
            'Success',
            'Profile deleted successfully',
            'success',
            3000
          );
          localStorage.removeItem('user');
          this.profileSuccess = 'Profile deleted successfully';
        },
        error: () => {
          this.toast.showToast(
            'Error',
            'Failed to delete profile',
            'error',
            3000
          );
          this.profileError = 'Failed to delete profile';
        },
      });
    }
  }
}
