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
import { finalize } from 'rxjs';

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
  userMap: { [key: string]: string } = {};
  confirmMessage = '';
  showConfirm = false;
  selectedCategoryDelete: number = 0;

  // Loading flags
  isUsersLoading = false;
  isCategoriesLoading = false;
  isSubmitting = false;
  isDeleting = false;

  constructor(
    private fb: FormBuilder,
    private categoryService: CategoryService,
    private userService: UserService,
    private toast: CustomToastService
  ) {}

  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      this.user = JSON.parse(localStorage.getItem('user') || '{}');
    }

    this.categoryForm = this.fb.group({
      categoryName: ['', Validators.required],
      isActive: [true],
    });

    this.loadUsersAndCategories();
  }

  loadUsersAndCategories() {
    this.isUsersLoading = true;
    this.userService
      .getAllUsers()
      .pipe(finalize(() => (this.isUsersLoading = false)))
      .subscribe({
        next: (data) => {
          this.users = data;
          this.userMap = this.users.reduce((acc: any, user: any) => {
            acc[user.userId.toString()] =
              `${user.firstName} ${user.lastName}`.trim();
            return acc;
          }, {});
          console.log('User Map: ', this.userMap);

          // Now that userMap is ready, load categories
          this.loadCategories();
        },
        error: () => {
          this.toast.showToast('Error', 'Failed to fetch users', 'error', 3000);
        },
      });
  }

  loadCategories() {
    this.isCategoriesLoading = true;
    this.categoryService
      .getAllCategories()
      .pipe(finalize(() => (this.isCategoriesLoading = false)))
      .subscribe({
        next: (data: Category[]) => {
          this.categories = data.map((cat) => ({
            ...cat,
            createdByName:
              cat.createdBy !== undefined
                ? this.userMap[cat.createdBy.toString()] || 'Unknown'
                : 'Unknown',
            lastUpdatedByName:
              cat.lastUpdatedBy !== undefined
                ? this.userMap[cat.lastUpdatedBy.toString()] || 'Unknown'
                : 'Unknown',
          }));
        },
        error: () => {
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
      this.categoryForm.reset({ categoryName: '', isActive: true });
    }
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  onSubmit() {
    if (this.categoryForm.invalid) return;

    this.isSubmitting = true;
    const formValues = this.categoryForm.value;

    const request$ = this.selectedCategory
      ? this.categoryService.updateCategory(this.selectedCategory.categoryId, {
          categoryId: this.selectedCategory.categoryId,
          categoryName: formValues.categoryName,
          isActive: !!formValues.isActive,
          createdBy: this.selectedCategory.createdBy,
          lastUpdatedBy: this.user?.userId,
        })
      : this.categoryService.addCategory({
          categoryName: formValues.categoryName,
          isActive: !!formValues.isActive,
          createdBy: this.user?.userId,
          lastUpdatedBy: this.user?.userId,
        });

    request$.pipe(finalize(() => (this.isSubmitting = false))).subscribe({
      next: () => {
        this.toast.showToast(
          'Success',
          this.selectedCategory
            ? 'Category updated successfully'
            : 'Category added successfully',
          'success',
          3000
        );
        this.loadCategories();
        this.closeModal();
      },
      error: () => {
        this.toast.showToast('Error', 'Failed to save category', 'error', 3000);
      },
    });
  }

  deleteCategory(categoryId: number) {
    this.selectedCategoryDelete = categoryId;
    this.confirmMessage = 'Are you sure to delete this category?';
    this.showConfirm = true;
  }

  onDeleteCategory() {
    if (!this.selectedCategoryDelete) return;

    this.isDeleting = true;
    this.categoryService
      .deleteCategory(this.selectedCategoryDelete)
      .pipe(finalize(() => (this.isDeleting = false)))
      .subscribe({
        next: () => {
          this.toast.showToast(
            'Success',
            'Category deleted successfully',
            'success',
            3000
          );
          this.loadCategories();
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

  // Optional global loading getter
  get isLoading() {
    return (
      this.isUsersLoading ||
      this.isCategoriesLoading ||
      this.isSubmitting ||
      this.isDeleting
    );
  }
}
