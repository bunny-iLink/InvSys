// Angular imports
import { finalize } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

// Model imports
import { User } from '../../models/User';
import { Category } from '../../models/Category';

// Service imports
import { User as UserService } from '../../services/user';
import { CustomToastService } from '../../services/toastr';
import { Category as CategoryService } from '../../services/category';

// Custom component imports
import { Confirm } from '../confirm/confirm';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.html',
  imports: [ReactiveFormsModule, CommonModule, Confirm],
})
export class Categories implements OnInit {
  // Variables to store data
  users: any[] = [];
  user: User | null = null;
  categories: Category[] = [];
  selectedCategory: Category | null = null;
  userMap: { [key: string]: string } = {};
  selectedCategoryDelete: number = 0;

  // Page variables
  page: number = 1;
  pages: number[] = [];
  pageSize: number = 5;
  totalRecords: number = 0;

  // Display messages
  modalTitle: string = 'Add Category';
  confirmMessage = '';

  // Category form
  categoryForm!: FormGroup;

  // Flags
  isDeleting = false;
  showConfirm = false;
  isSubmitting = false;
  isUsersLoading = false;
  isCategoriesLoading = false;
  isModalOpen: boolean = false;

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

  // Function loads users and categories
  loadUsersAndCategories() {
    this.isUsersLoading = true;

    this.userService
      .getAllUsersNoPage()
      .pipe(finalize(() => (this.isUsersLoading = false)))
      .subscribe({
        next: (data: any) => {
          this.users = data.data;
          this.userMap = this.users.reduce((acc: any, user: any) => {
            acc[user.userId.toString()] =
              `${user.firstName} ${user.lastName}`.trim();
            return acc;
          }, {});
          console.log('User Map: ', this.userMap);

          this.loadCategories();
        },
        error: () => {
          this.toast.showToast('Error', 'Failed to fetch users', 'error', 3000);
        },
      });
  }

  // Load categories
  loadCategories() {
    this.isCategoriesLoading = true;
    this.categoryService
      .getAllCategories(this.page, this.pageSize)
      .pipe(finalize(() => (this.isCategoriesLoading = false)))
      .subscribe({
        next: (res) => {
          this.categories = res.data.map((cat: any) => ({
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
          this.totalRecords = res.totalRecords;
          this.updatePages();
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

  updatePages() {
    const totalPages = Math.ceil(this.totalRecords / this.pageSize);
    this.pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  onPageChange(newPage: number) {
    if (newPage >= 1 && newPage <= this.pages.length) {
      this.page = newPage;
      this.loadCategories();
    }
  }

  // Open Modal function: Handles the opening and closing of modal and display title based on Add/Edit call. Patch form for Add/Edit operations
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

  // Function closes the modal. Called after clicking "Close" button
  closeModal() {
    this.isModalOpen = false;
  }

  // Function handles form submission. Calls the Add Category service if new category is to be added, calls the Update Category service if updates are being done
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

  // Primary Delete Category function, asks for confirmation from the user for deletion
  deleteCategory(categoryId: number) {
    this.selectedCategoryDelete = categoryId;
    this.confirmMessage = 'Are you sure to delete this category?';
    this.showConfirm = true;
  }

  // Main logic for Delete Category. Calls the Delete Category service after user confirms the deletion from dialogue box
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

  // Closes the Delete Category confirmation box if clicked "No"
  onCancelDelete() {
    this.resetConfirm();
  }

  // Resets the variables for confirmation box
  private resetConfirm() {
    this.showConfirm = false;
    this.selectedCategoryDelete = 0;
    this.confirmMessage = '';
  }

  // Returns "True" if data is being retrieved. "False" when retrieval operation completes
  get isLoading() {
    return (
      this.isUsersLoading ||
      this.isCategoriesLoading ||
      this.isSubmitting ||
      this.isDeleting
    );
  }
}
