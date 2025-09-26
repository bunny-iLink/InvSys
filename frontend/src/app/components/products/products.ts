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
import { PurchaseOrderService } from '../../services/purchase-order-service';
import { SalesOrderService } from '../../services/sales-order-service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-products',
  templateUrl: './products.html',
  imports: [ReactiveFormsModule, CommonModule, Confirm],
})
export class Products implements OnInit {
  products: Product[] = [];
  productForm!: FormGroup;
  quantityForm!: FormGroup;
  selectedProduct: Product | null = null;
  modalTitle: string = 'Add Product';
  isModalOpen: boolean = false;
  user: User | null = null;
  categories: any[] = [];
  selectedDeleteProduct: number = 0;
  confirmMessage = '';
  showConfirm = false;
  isQuantityModalOpen = false;

  // Loading flags
  isProductsLoading = false;
  isCategoriesLoading = false;
  isSubmitting = false;
  isDeleting = false;
  isOrderSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private toast: CustomToastService,
    private productService: ProductService,
    private categoryService: CategoryService,
    private purchaseOrderService: PurchaseOrderService,
    private salesOrderService: SalesOrderService
  ) {}

  ngOnInit(): void {
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
          Validators.pattern(/^\d+(\.\d{1,2})?$/),
        ],
      ],
      quantity: [
        '',
        [
          Validators.required,
          Validators.min(0),
          Validators.pattern(/^[0-9]+$/),
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

    this.quantityForm = this.fb.group({
      orderQuantity: [1, [Validators.required, Validators.min(1)]],
    });

    this.loadProducts();
    this.loadCategories();
  }

  loadProducts() {
    this.isProductsLoading = true;
    this.productService
      .getAllProducts()
      .pipe(finalize(() => (this.isProductsLoading = false)))
      .subscribe({
        next: (data: Product[]) => {
          this.products = data;
          console.log(this.products);
        },
        error: () => {
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
    this.isCategoriesLoading = true;
    this.categoryService
      .getAllCategories()
      .pipe(finalize(() => (this.isCategoriesLoading = false)))
      .subscribe({
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

  openQuantityModal(product: any) {
    this.selectedProduct = product;
    this.isQuantityModalOpen = true;
    this.quantityForm.reset({ orderQuantity: 1 });
  }

  closeQuantityModal() {
    this.isQuantityModalOpen = false;
    this.selectedProduct = null;
  }

  onSubmit() {
    if (this.productForm.invalid) return;

    this.isSubmitting = true;
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

    const request$ = this.selectedProduct
      ? this.productService.updateProduct(payload.productId, payload)
      : this.productService.addProduct(payload);

    request$.pipe(finalize(() => (this.isSubmitting = false))).subscribe({
      next: () => {
        this.toast.showToast(
          'Success',
          this.selectedProduct
            ? 'Product updated successfully'
            : 'Product added successfully',
          'success',
          3000
        );
        this.loadProducts();
        this.closeModal();
      },
      error: () => {
        this.toast.showToast('Error', 'Failed to save product', 'error', 3000);
      },
    });
  }

  deleteProduct(productId: number) {
    this.selectedDeleteProduct = productId;
    this.confirmMessage = 'Are you sure to delete this product?';
    this.showConfirm = true;
  }

  onConfirmDelete() {
    this.isDeleting = true;
    this.productService
      .deleteProduct(this.selectedDeleteProduct)
      .pipe(finalize(() => (this.isDeleting = false)))
      .subscribe({
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

  confirmPurchaseOrder() {
    if (!this.selectedProduct || this.quantityForm.invalid) return;

    this.isOrderSubmitting = true;
    const payload = {
      PurchaseOrderId: 0,
      OrderName: `PO-${Date.now()}`,
      ProductId: this.selectedProduct.productId,
      ProductName: this.selectedProduct.productName,
      Quantity: this.quantityForm.value.orderQuantity,
      Status: 'Ordered',
      CreatedOn: new Date().toISOString(),
      CreatedBy: this.user?.userId || 0,
      LastUpdatedOn: new Date().toISOString(),
      LastUpdatedBy: this.user?.userId || 0,
    };

    this.purchaseOrderService
      .createPurchaseOrder(payload)
      .pipe(finalize(() => (this.isOrderSubmitting = false)))
      .subscribe({
        next: () => {
          this.toast.showToast(
            'Success',
            'Order placed successfully',
            'success',
            3000
          );
          this.closeQuantityModal();
        },
        error: () => {
          this.toast.showToast('Error', 'Failed to place order', 'error', 3000);
        },
      });
  }

  confirmSalesOrder() {
    if (!this.selectedProduct || this.quantityForm.invalid) return;

    this.isOrderSubmitting = true;
    const payload = {
      SalesOrderId: 0,
      OrderName: `SO-${Date.now()}`,
      CustomerId: this.user?.userId || 0,
      CustomerName:
        `${this.user?.firstName} ${this.user?.lastName}` || 'Unknown',
      ProductId: this.selectedProduct.productId,
      ProductName: this.selectedProduct.productName,
      Quantity: this.quantityForm.value.orderQuantity,
      Status: 'Ordered',
      CreatedOn: new Date().toISOString(),
      CreatedBy: this.user?.userId || 0,
      LastUpdatedOn: new Date().toISOString(),
      LastUpdatedBy: this.user?.userId || 0,
    };

    this.salesOrderService
      .createSalesOrder(payload)
      .pipe(finalize(() => (this.isOrderSubmitting = false)))
      .subscribe({
        next: () => {
          this.toast.showToast(
            'Success',
            'Sales order placed successfully',
            'success',
            3000
          );
          this.closeQuantityModal();
        },
        error: () => {
          this.toast.showToast(
            'Error',
            'Failed to place sales order',
            'error',
            3000
          );
        },
      });
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

  // Optional global isLoading getter
  get isLoading() {
    return (
      this.isProductsLoading ||
      this.isCategoriesLoading ||
      this.isSubmitting ||
      this.isDeleting ||
      this.isOrderSubmitting
    );
  }
}
