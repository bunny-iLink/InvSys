import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Category } from '../../models/Category';
import { Category as CategoryService } from '../../services/category';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CustomToastService } from '../../services/toastr';
import { User } from '../../models/User';
import { User as UserService } from '../../services/user';
import { Confirm } from '../confirm/confirm';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.html',
  imports: [ReactiveFormsModule, CommonModule, Confirm],
})
export class Categories implements OnInit {
  categories: Category[] = [];
  categoryForm!: FormGroup;
  selectedCategory: Category | null = null;
  modalTitle: string = 'Add Category';
  isModalOpen: boolean = false;
  user: User | null = null;
  users: any[] = [];
  userMap: { [key: number]: string } = {};
  confirmMessage = '';
  showConfirm = false;
  selectedCategoryDelete: number = 0;

  constructor(
    private fb: FormBuilder,
    private categoryService: CategoryService,
    private userService: UserService,
    private toast: CustomToastService
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    this.loadUsers();

    if (typeof window !== 'undefined') {
      this.user = JSON.parse(localStorage.getItem('user') || '{}');
    }

    this.categoryForm = this.fb.group({
      categoryName: ['', Validators.required],
      isActive: [true],
    });
  }

  loadUsers() {
    this.userService.getAllUsers().subscribe({
      next: (data) => {
        this.users = data;
        // build lookup map for fast access
        this.userMap = this.users.reduce((acc: any, user: any) => {
          acc[user.userId] = `${user.firstName} ${user.lastName}`;
          return acc;
        }, {});
      },
      error: () => {
        this.toast.showToast('Error', 'Failed to fetch users', 'error', 3000);
      },
    });
  }

  loadCategories() {
    this.categoryService.getAllCategories().subscribe({
      next: (data: Category[]) => {
        this.categories = data;
        // this.toast.showToast(
        //   'Success',
        //   'Users fetched successfully',
        //   'success',
        //   3000
        // );
      },
      error: (err) => {
        this.toast.showToast(
          'Error',
          'Failed to fetch categories',
          'error',
          3000
        );
      },
    });
  }

  openModal(category?: Category) {
    if (category) {
      this.modalTitle = 'Edit Category';
      this.selectedCategory = category;
      this.categoryForm.patchValue({
        categoryName: category.categoryName,
        isActive: category.isActive,
      });
    } else {
      this.modalTitle = 'Add Category';
      this.selectedCategory = null;
      this.categoryForm.reset({
        categoryName: '',
        IsActive: true,
      });
    }
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  onSubmit() {
    if (this.categoryForm.invalid) return;

    const formValues = this.categoryForm.value;

    if (this.selectedCategory) {
      const payload = {
        categoryId: this.selectedCategory.categoryId,
        categoryName: formValues.categoryName,
        isActive: !!formValues.isActive,
        createdBy: this.selectedCategory.createdBy, // keep original
        lastUpdatedBy: this.user?.userId,
      };
      console.log('Payload to backend (Update):', payload);

      this.categoryService
        .updateCategory(this.selectedCategory.categoryId, payload)
        .subscribe({
          next: () => {
            this.toast.showToast(
              'Success',
              'Category updated successfully',
              'success',
              3000
            );
            this.loadCategories();
            this.closeModal();
          },
          error: () => {
            this.toast.showToast(
              'Error',
              'Failed to update category',
              'error',
              3000
            );
          },
        });
    } else {
      const payload = {
        categoryName: formValues.categoryName,
        isActive: !!formValues.isActive,
        createdBy: this.user?.userId,
        lastUpdatedBy: this.user?.userId,
      };
      console.log('Payload to backend (Add):', payload);

      this.categoryService.addCategory(payload).subscribe({
        next: () => {
          this.toast.showToast(
            'Success',
            'Category added successfully',
            'success',
            3000
          );
          this.loadCategories();
          this.closeModal();
        },
        error: () => {
          this.toast.showToast(
            'Error',
            'Failed to add category',
            'error',
            3000
          );
        },
      });
    }
  }

  deleteCategory(categoryId: number) {
    this.selectedCategoryDelete = categoryId;
    this.confirmMessage = 'Are you sure to delete this category?';
    this.showConfirm = true;
  }

  onDeleteCategory() {
    if (!this.selectedCategoryDelete) return;

    this.categoryService.deleteCategory(this.selectedCategoryDelete).subscribe({
      next: () => {
        this.loadCategories();
        this.toast.showToast(
          'Success',
          'Category deleted successfully',
          'success',
          3000
        );
        this.resetConfirm();
      },
      error: () => {
        this.toast.showToast(
          'Error',
          'Failed to delete category',
          'error',
          3000
        );
        this.resetConfirm();
      },
    });
  }

  onCancelDelete() {
    this.resetConfirm();
  }

  private resetConfirm() {
    this.showConfirm = false;
    this.selectedCategoryDelete = 0;
    this.confirmMessage = '';
  }
}
