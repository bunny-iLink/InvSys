// Angular imports
import { finalize } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

// Model imports
import { User } from '../../models/User';
import { Product } from '../../models/Product';

// Service imports
import { CustomToastService } from '../../services/toastr';
import { Product as ProductService } from '../../services/product';
import { Category as CategoryService } from '../../services/category';
import { SalesOrderService } from '../../services/sales-order-service';
import { PurchaseOrderService } from '../../services/purchase-order-service';

// Custom component imports
import { Confirm } from '../confirm/confirm';

import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-products',
  templateUrl: './products.html',
  imports: [
    ReactiveFormsModule,
    FormsModule,
    CommonModule,
    Confirm,
    MatTableModule,
    MatPaginatorModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatButtonModule,
  ],
})
export class Products implements OnInit {
  // Variables to hold data
  categories: any[] = [];
  user: User | null = null;
  products: Product[] = [];
  selectedDeleteProduct: number = 0;
  selectedProduct: Product | null = null;
  selectedProductDisplay: Product | null | undefined = null;
  isViewProductModalOpen = false;
  Math = Math;

  // Page variables
  page: number = 1;
  pageSize: number = 5;
  pageSizeInput: number = this.pageSize;
  inputPage: number = 1; // for custom page number input
  totalRecords: number = 0;
  displayedColumns: string[] = [
    'index',
    'productName',
    'category',
    'price',
    'quantity',
    'createdOn',
    'isActive',
    'view',
    'actions',
  ];

  // Form group
  productForm!: FormGroup;
  quantityForm!: FormGroup;

  // Sorting string
  sortColumn: keyof Product = 'createdOn';
  sortDirection: 'asc' | 'desc' = 'asc';

  // Message strings
  modalTitle: string = 'Add Product';
  confirmMessage = '';

  // Flags
  isDeleting = false;
  showConfirm = false;
  isSubmitting = false;
  isOrderSubmitting = false;
  isProductsLoading = false;
  isQuantityModalOpen = false;
  isCategoriesLoading = false;
  isModalOpen: boolean = false;

  constructor(
    private fb: FormBuilder,
    private toast: CustomToastService,
    private productService: ProductService,
    private categoryService: CategoryService,
    private purchaseOrderService: PurchaseOrderService,
    private salesOrderService: SalesOrderService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      this.user = JSON.parse(localStorage.getItem('user') || '{}');
    }

    this.productForm = this.fb.group({
      productId: [0],
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
      minStockLevel: [
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

  // Load all products page by page
  loadProducts() {
    this.isProductsLoading = true;
    const query = this.route.snapshot.queryParamMap.get('lowStock');

    this.productService
      .getAllProducts(this.page, this.pageSize, query ? true : false)
      .pipe(finalize(() => (this.isProductsLoading = false)))
      .subscribe({
        next: (res) => {
          this.products = res.data;
          this.totalRecords = res.totalRecords;
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

  // Page change buttons
  onPageChange(newPage: number) {
    if (newPage < 1) return;
    const totalPages = Math.ceil(this.totalRecords / this.pageSize);
    if (newPage > totalPages) return;
    this.page = newPage;
    this.inputPage = newPage;
    this.loadProducts();
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
    this.loadProducts();
  }

  // Load categories for dropdown
  loadCategories() {
    this.isCategoriesLoading = true;
    this.categoryService
      .getAllCategoriesNoPage()
      .pipe(finalize(() => (this.isCategoriesLoading = false)))
      .subscribe({
        next: (data: any) => {
          this.categories = data.data;
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

  // Function to control modal display.
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

  // Quantity modal handler
  openQuantityModal(product: any) {
    this.selectedProduct = product;
    this.isQuantityModalOpen = true;

    this.quantityForm.reset({
      orderQuantity: 1,
    });

    // apply validators dynamically
    this.quantityForm
      .get('orderQuantity')
      ?.setValidators([
        Validators.required,
        Validators.min(1),
        Validators.max(product.quantity),
      ]);

    // re-calculate validity
    this.quantityForm.get('orderQuantity')?.updateValueAndValidity();
  }

  closeQuantityModal() {
    this.isQuantityModalOpen = false;
    this.selectedProduct = null;
  }

  // Form submission to create or edit product details
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
      minStockLevel: this.productForm.value.minStockLevel,
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

  // Primary delete product function. Asks for confirmation in the frontend
  deleteProduct(productId: number) {
    this.selectedDeleteProduct = productId;
    this.confirmMessage = 'Are you sure to delete this product?';
    this.showConfirm = true;
  }

  // Calls delete product service after frontend confirms the deletion
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

  // Creates an order placed by inventory to restock
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
      Amount:
        this.selectedProduct.price * this.quantityForm.value.orderQuantity,
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

  // Creates an order created by a customer
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
      Amount:
        this.selectedProduct.price * this.quantityForm.value.orderQuantity,
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

  toggleSort(column: keyof Product): void {
    if (this.sortColumn === column) {
      // Toggle direction
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      // New column to sort
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }

    this.sortData();
  }

  sortData() {
    this.products = [...this.products].sort((a, b) => {
      const valueA = a[this.sortColumn];
      const valueB = b[this.sortColumn];

      // Only parse dates for date columns
      if (
        this.sortColumn === 'createdOn' ||
        this.sortColumn === 'lastUpdatedOn'
      ) {
        const timeA = new Date(valueA as string).getTime();
        const timeB = new Date(valueB as string).getTime();
        return this.sortDirection === 'asc' ? timeA - timeB : timeB - timeA;
      }

      // String comparison
      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return this.sortDirection === 'asc'
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      }

      // Number comparison
      if (typeof valueA === 'number' && typeof valueB === 'number') {
        return this.sortDirection === 'asc' ? valueA - valueB : valueB - valueA;
      }

      // Boolean comparison (false < true)
      if (typeof valueA === 'boolean' && typeof valueB === 'boolean') {
        return this.sortDirection === 'asc'
          ? Number(valueA) - Number(valueB)
          : Number(valueB) - Number(valueA);
      }

      return 0; // fallback if types don't match
    });
  }

  openProductDisplayModal(passedProduct: Product) {
    console.log('Passed Product:', passedProduct);
    
    this.selectedProductDisplay = this.products.find(
      (product) => product.productId === passedProduct.productId
    );
    console.log('Selected Product for Display:', this.selectedProductDisplay);
    this.isViewProductModalOpen = true;
  }

  closeProductDisplayModal() {
    this.isViewProductModalOpen = false;
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
