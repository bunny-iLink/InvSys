import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Product } from '../../models/Product';
import { Product as ProductService } from '../../services/product';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CustomToastService } from '../../services/toastr';
import { User } from '../../models/User';
import { Category as CategoryService } from '../../services/category';
import { Confirm } from '../confirm/confirm';

@Component({
  selector: 'app-products',
  templateUrl: './products.html',
  imports: [ReactiveFormsModule, CommonModule, Confirm],
})
export class Products implements OnInit {
  products: Product[] = [];
  productForm!: FormGroup;
  selectedProduct: Product | null = null;
  modalTitle: string = 'Add Product';
  isModalOpen: boolean = false;
  user: User | null = null;
  categories: any[] = [];
  selectedDeleteProduct: number = 0;
  confirmMessage = '';
  showConfirm = false;

  constructor(
    private fb: FormBuilder,
    private toast: CustomToastService,
    private productService: ProductService,
    private categoryService: CategoryService
  ) {}

  ngOnInit(): void {
    this.loadProducts();
    this.loadCategories();

    if (typeof window !== 'undefined') {
      this.user = JSON.parse(localStorage.getItem('user') || '{}');
    }

    this.productForm = this.fb.group({
      productId: [0], // required for edit
      productName: ['', Validators.required],
      categoryId: [0, Validators.required],
      categoryName: [''],
      price: [
        '',
        [
          Validators.required,
          Validators.min(0),
          Validators.pattern(/^\d+(\.\d{1,2})?$/), // up to 2 decimals
        ],
      ],
      quantity: [
        '',
        [
          Validators.required,
          Validators.min(0),
          Validators.pattern(/^[0-9]+$/), // only integers
        ],
      ],
      mfgOn: [''],
      expiryDate: [''],
      isActive: [true],
      createdBy: [this.user?.userId || 0],
      lastUpdatedBy: [this.user?.userId || null],
      manufacturer: [''],
      sku: [''],
    });
  }

  loadProducts() {
    this.productService.getAllProducts().subscribe({
      next: (data: Product[]) => {
        this.products = data;
        console.log(this.products);
      },
      error: (err) => {
        this.toast.showToast(
          'Error',
          'Failed to fetch products',
          'error',
          3000
        );
      },
    });
  }

  loadCategories() {
    this.categoryService.getAllCategories().subscribe({
      next: (data) => {
        this.categories = data;
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

  openModal(product?: Product) {
    if (product) {
      this.modalTitle = 'Edit Product';
      this.selectedProduct = product;
      this.productForm.patchValue(product);
    } else {
      this.modalTitle = 'Add Product';
      this.selectedProduct = null;
      this.productForm.reset({
        isActive: true,
        createdBy: this.user?.userId || 0,
        lastUpdatedBy: this.user?.userId || null,
      });
    }
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  onSubmit() {
    if (this.productForm.invalid) return;

    const payload: Product = {
      productId: this.selectedProduct ? this.selectedProduct.productId : 0,
      productName: this.productForm.value.productName,
      categoryId: this.productForm.value.categoryId,
      categoryName: this.productForm.value.categoryName,
      price: this.productForm.value.price,
      quantity: this.productForm.value.quantity,
      mfgOn: this.productForm.value.mfgOn,
      expiryDate: this.productForm.value.expiryDate,
      isActive: this.productForm.value.isActive,
      createdBy: this.user?.userId || 0,
      lastUpdatedBy: this.user?.userId || null,
      manufacturer: this.productForm.value.manufacturer,
      sku: this.productForm.value.sku,
    };

    if (this.selectedProduct) {
      this.productService.updateProduct(payload.productId, payload).subscribe({
        next: () => {
          this.toast.showToast(
            'Success',
            'Product updated successfully',
            'success',
            3000
          );
          this.loadProducts();
          this.closeModal();
        },
        error: () => {
          this.toast.showToast(
            'Error',
            'Failed to update product',
            'error',
            3000
          );
        },
      });
    } else {
      this.productService.addProduct(payload).subscribe({
        next: () => {
          this.toast.showToast(
            'Success',
            'Product added successfully',
            'success',
            3000
          );
          this.loadProducts();
          this.closeModal();
        },
        error: () => {
          this.toast.showToast('Error', 'Failed to add product', 'error', 3000);
        },
      });
    }
  }

  deleteProduct(productId: number) {
    this.selectedDeleteProduct = productId;
    this.confirmMessage = 'Are you sure to delete this product?';
    this.showConfirm = true;
  }

  onConfirmDelete() {
    this.productService.deleteProduct(this.selectedDeleteProduct).subscribe({
      next: () => {
        this.loadProducts();
        this.toast.showToast(
          'Success',
          'Product deleted successfully',
          'success',
          3000
        );
        this.resetConfirm();
      },
      error: () => {
        this.toast.showToast(
          'Error',
          'Failed to delete product',
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
    this.selectedDeleteProduct = 0;
    this.confirmMessage = '';
  }

  onCategoryChange(event: any) {
    const categoryId = +event.target.value;
    const category = this.categories.find((c) => c.categoryId === categoryId);

    if (category) {
      this.productForm.patchValue({
        categoryId: category.categoryId,
        categoryName: category.categoryName,
      });
    }
  }
}
