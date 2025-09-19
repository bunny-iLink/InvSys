import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Product } from '../../models/Product';
import { Product as ProductService } from '../../services/product';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CustomToastService } from '../../services/toastr';
import { User } from '../../models/User';

@Component({
  selector: 'app-products',
  templateUrl: './products.html',
  imports: [ReactiveFormsModule, CommonModule],
})
export class Products implements OnInit {
  products: Product[] = [];
  productForm!: FormGroup;
  selectedProduct: Product | null = null;
  modalTitle: string = 'Add Product';
  isModalOpen: boolean = false;
  user: User | null = null;


  constructor(
    private fb: FormBuilder,
    private toast: CustomToastService,
    private productService: ProductService
  ) {}

  ngOnInit(): void {
    this.loadProducts();
    
    if (typeof window !== 'undefined') {
      this.user = JSON.parse(localStorage.getItem('user') || '{}');
    }

    this.productForm = this.fb.group({
      productName: ['', Validators.required],
      categoryId: [4],
      price: [
        '',
        [
          Validators.required,
          Validators.min(0),
          Validators.pattern(/^\d+(\.\d{1,2})?$/), // allows up to 2 decimal places
        ],
      ],
      quantity: [
        '',
        [
          Validators.required,
          Validators.min(0),
          Validators.pattern(/^[0-9]+$/), // only non-negative integers
        ],
      ],
      mfgOn: [''],
      expiryDate: [''],
      isActive: [true],
      categoryName: [''],
      createdBy: [''],
      lastUpdatedBy: [''],
      manufacturer: [''],
    });
  }

  loadProducts() {
    this.productService.getAllProducts().subscribe({
      next: (data: Product[]) => {
        this.products = data;
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

  openModal(product?: Product) {
    if (product) {
      this.modalTitle = 'Edit Product';
      this.selectedProduct = product;
    } else {
      this.modalTitle = 'Add User';
      this.selectedProduct = null;
      this.productForm.reset({
        IsActive: true,
      });
    }
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  onSubmit() {
    if (this.productForm.invalid) return;

    const payload = {
      ProductName: this.productForm.value.productName,
      CategoryId: this.productForm.value.categoryId || 4,
      Price: this.productForm.value.price,
      Quantity: this.productForm.value.quantity,
      MfgOn: this.productForm.value.mfgOn,
      ExpiryDate: this.productForm.value.expiryDate,
      IsActive: !!this.productForm.value.isActive,
      CategoryName: this.productForm.value.categoryName,
      CreatedBy: this.user?.userId,
      LastUpdatedBy: this.user?.userId,
      Manufacturer: this.productForm.value.manufacturer,
    };

    console.log('Payload to backend:', payload);

    if (this.selectedProduct) {
      this.productService
        .updateProduct(this.selectedProduct.productId, payload)
        .subscribe({
          next: () => {
            this.toast.showToast(
              'Success',
              'User updated successfully',
              'success',
              3000
            );
            this.loadProducts();
            this.closeModal();
          },
          error: (err: any) => {
            this.toast.showToast(
              'Error',
              'Failed to update user',
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
            'User added successfully',
            'success',
            3000
          );
          this.loadProducts();
          this.closeModal();
        },
        error: (err) => {
          this.toast.showToast('Error', 'Failed to add user', 'error', 3000);
        },
      });
    }
  }

  deleteProduct(productId: number) {
    if (confirm('Are you sure you want to delete this user?')) {
      this.productService.deleteProduct(productId).subscribe({
        next: () => {
          this.loadProducts();
          this.toast.showToast(
            'Success',
            'Product deleted successfully',
            'success',
            3000
          );
        },
        error: (err) => {
          this.toast.showToast('Error', 'Failed to delete user', 'error', 3000);
        },
      });
    }
  }
}
