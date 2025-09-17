import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { User } from '../../models/User';
import { User as UserService } from '../../services/user';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

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

  constructor(private fb: FormBuilder, private userService: UserService) {}

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
    this.userService.getAllUsers().subscribe((data: User[]) => {
      this.users = data;
      console.log(data);
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
      this.userService
        .updateUser(this.selectedUser.userId, payload)
        .subscribe(() => {
          this.loadUsers();
          this.closeModal();
        });
    } else {
      this.userService.addUser(payload).subscribe(() => {
        this.loadUsers();
        this.closeModal();
      });
    }
  }

  deleteUser(userId: number) {
    if (confirm('Are you sure you want to delete this user?')) {
      this.userService.deleteUser(userId).subscribe(() => {
        this.loadUsers();
      });
    }
  }
}
