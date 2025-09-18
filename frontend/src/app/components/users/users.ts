import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { User } from '../../models/User';
import { User as UserService } from '../../services/user';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CustomToastService } from '../../services/toastr';

@Component({
  selector: 'app-users',
  templateUrl: './users.html',
  imports: [ReactiveFormsModule, CommonModule],
})
export class Users implements OnInit {
  users: User[] = [];
  userForm!: FormGroup;
  selectedUser: User | null = null;
  modalTitle: string = 'Add User';
  isModalOpen: boolean = false;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private toast: CustomToastService
  ) {}

  ngOnInit(): void {
    this.loadUsers();

    this.userForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: [''],
      email: ['', [Validators.required, Validators.email]],
      password: [''],
      role: ['', Validators.required],
      isActive: [true],
      isVerified: [false],
    });
  }

  loadUsers() {
    this.userService.getAllUsers().subscribe({
      next: (data: User[]) => {
        this.users = data;
        // this.toast.showToast(
        //   'Success',
        //   'Users fetched successfully',
        //   'success',
        //   3000
        // );
      },
      error: (err) => {
        this.toast.showToast('Error', 'Failed to fetch users', 'error', 3000);
      },
    });
  }

  openModal(user?: User) {
    if (user) {
      this.modalTitle = 'Edit User';
      this.selectedUser = user;
      this.userForm.patchValue({ ...user, Password: '' });
    } else {
      this.modalTitle = 'Add User';
      this.selectedUser = null;
      this.userForm.reset({
        Role: '',
        IsActive: true,
        IsVerified: false,
      });
    }
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  onSubmit() {
    if (this.userForm.invalid) return;

    const payload = {
      FirstName: this.userForm.value.firstName,
      LastName: this.userForm.value.lastName,
      Email: this.userForm.value.email,
      Password: this.userForm.value.password,
      Role: this.userForm.value.role,
      IsActive: !!this.userForm.value.isActive,
      IsVerified: false,
    };

    console.log('Payload to backend:', payload);

    if (this.selectedUser) {
      this.userService.updateUser(this.selectedUser.userId, payload).subscribe({
        next: () => {
          this.toast.showToast(
            'Success',
            'User updated successfully',
            'success',
            3000
          );
          this.loadUsers();
          this.closeModal();
        },
        error: (err) => {
          this.toast.showToast('Error', 'Failed to update user', 'error', 3000);
        },
      });
    } else {
      this.userService.addUser(payload).subscribe({
        next: () => {
          this.toast.showToast(
            'Success',
            'User added successfully',
            'success',
            3000
          );
          this.loadUsers();
          this.closeModal();
        },
        error: (err) => {
          this.toast.showToast('Error', 'Failed to add user', 'error', 3000);
        },
      });
    }
  }

  deleteUser(userId: number) {
    if (confirm('Are you sure you want to delete this user?')) {
      this.userService.deleteUser(userId).subscribe({
        next: () => {
          this.loadUsers();
          this.toast.showToast(
            'Success',
            'User deleted successfully',
            'success',
            3000
          );
        },
        error: (err) => {
          console.error(`Error deleting user with ID ${userId}:`, err);
          this.toast.showToast('Error', 'Failed to delete user', 'error', 3000);
        },
      });
    }
  }
}
