// Angular imports
import { finalize } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';

// Model imports
import { User } from '../../models/User';
import { Category } from '../../models/Category';

// Service imports
import { User as UserService } from '../../services/user';
import { CustomToastService } from '../../services/toastr';
import { Category as CategoryService } from '../../services/category';

// Custom component imports
import { Confirm } from '../confirm/confirm';

import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.html',
  imports: [
    ReactiveFormsModule,
    CommonModule,
    Confirm,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatButtonModule,
  ],
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
  pageSize: number = 5;
  pageSizeInput: number = this.pageSize;
  inputPage: number = 1; // for custom page number input
  totalRecords: number = 0;
  displayedColumns: string[] = [
    'index',
    'categoryName',
    'createdByName',
    'lastUpdatedByName',
    'isActive',
    'actions',
  ];

  // Display messages
  modalTitle: string = 'Add Category';
  confirmMessage = '';

  // Category form
  categoryForm!: FormGroup;

  Math = Math;
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
          console.log('Categories: ', this.categories);
          
          this.totalRecords = res.totalRecords;
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

  // Page change buttons
  onPageChange(newPage: number) {
    if (newPage < 1) return;
    const totalPages = Math.ceil(this.totalRecords / this.pageSize);
    if (newPage > totalPages) return;
    this.page = newPage;
    this.inputPage = newPage;
    this.loadCategories();
  }

  // Custom page number input
  goToPage() {
    const page = Math.floor(this.inputPage);
    this.onPageChange(page);
  }

  // Custom page size input
  onPageSizeChange() {
    if (this.pageSizeInput < 1) this.pageSizeInput = 1;
    this.pageSize = this.pageSizeInput;
    this.page = 1;
    this.inputPage = 1;
    this.loadCategories();
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
