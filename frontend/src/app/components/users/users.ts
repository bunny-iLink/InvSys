import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { User } from '../../models/User';
import { User as UserService } from '../../services/user';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CustomToastService } from '../../services/toastr';
import { Confirm } from '../confirm/confirm';

@Component({
  selector: 'app-users',
  templateUrl: './users.html',
  imports: [ReactiveFormsModule, CommonModule, Confirm],
})
export class Users implements OnInit {
  users: User[] = [];
  userForm!: FormGroup;
  selectedUser: User | null = null;
  modalTitle: string = 'Add User';
  isModalOpen: boolean = false;
  showConfirm = false;
  confirmMessage = '';
  selectedDeleteUser = 0;

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
        this.users = data.map((user) => ({ ...user, password: '' }));
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
    this.selectedDeleteUser = userId;
    this.confirmMessage = 'Are you sure to delete the user?';
    this.showConfirm = true;
  }

  onDeleteUser() {
    this.userService.deleteUser(this.selectedDeleteUser).subscribe({
      next: () => {
        this.loadUsers();
        this.toast.showToast(
          'Success',
          'User deleted successfully',
          'success',
          3000
        );
        this.resetConfirm();
      },
      error: (err) => {
        this.toast.showToast('Error', 'Failed to delete user', 'error', 3000);
        this.resetConfirm();
      },
    });
  }

  onCancelDelete() {
    this.resetConfirm();
  }

  private resetConfirm() {
    this.showConfirm = false;
    this.selectedDeleteUser = 0;
    this.confirmMessage = '';
  }
}
