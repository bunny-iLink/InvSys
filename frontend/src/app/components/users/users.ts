import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { User } from '../../models/User';
import { User as UserService } from '../../services/user';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CustomToastService } from '../../services/toastr';
import { Confirm } from '../confirm/confirm';
import { finalize } from 'rxjs';

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
  isLoading = false;

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
    this.isLoading = true;
    this.userService
      .getAllUsers()
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (data: User[]) => {
          this.users = data.map((user) => ({ ...user, password: '' }));
          console.log('Users: ', this.users);

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
      this.userForm.patchValue({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        password: '', // lowercase
        role: user.role,
        isActive: user.isActive,
        isVerified: user.isVerified,
      });
    } else {
      // Add mode
      this.modalTitle = 'Add User';
      this.selectedUser = null;
      this.userForm.reset({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        role: '',
        isActive: true,
        isVerified: false,
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
