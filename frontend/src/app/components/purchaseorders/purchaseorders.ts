import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PurchaseOrderService } from '../../services/purchase-order-service';
import { Product as ProductService } from '../../services/product';
import { Product } from '../../models/Product';
import { PurchaseOrder } from '../../models/PurchaseOrder';
import { Confirm } from '../confirm/confirm';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CustomToastService } from '../../services/toastr';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-purchaseorders',
  templateUrl: './purchaseorders.html',
  styleUrls: ['./purchaseorders.css'],
  imports: [Confirm, CommonModule, ReactiveFormsModule, FormsModule],
})
export class Purchaseorders implements OnInit {
  products: Product[] = [];
  purchaseOrders: PurchaseOrder[] = [];
  productForm!: FormGroup;

  isModalOpen = false;
  modalTitle = 'Create Purchase Order';
  selectedOrder: PurchaseOrder | null = null;

  showConfirm = false;
  confirmMessage = '';
  deleteOrderId: number | null = null;

  // Loading flags
  isProductsLoading = false;
  isOrdersLoading = false;
  isSubmitting = false;
  isUpdatingStatus = false;
  isDeleting = false;

  user: any;

  constructor(
    private fb: FormBuilder,
    private purchaseOrderService: PurchaseOrderService,
    private productService: ProductService,
    private toastService: CustomToastService
  ) {}

  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      this.user = JSON.parse(localStorage.getItem('user') || '{}');
    }

    this.initForm();
    this.fetchProducts();
    this.fetchPurchaseOrders();
  }

  initForm() {
    this.productForm = this.fb.group({
      productName: ['', Validators.required],
      quantity: ['', [Validators.required, Validators.min(1)]],
    });
  }

  // Fetch products
  fetchProducts() {
    this.isProductsLoading = true;
    this.productService
      .getAllProducts()
      .pipe(finalize(() => (this.isProductsLoading = false)))
      .subscribe({
        next: (res: Product[]) => {
          this.products = res;
        },
        error: () => {
          this.toastService.showToast(
            'Error',
            'Failed to fetch products',
            'error',
            3000
          );
        },
      });
  }

  // Fetch purchase orders
  fetchPurchaseOrders() {
    this.isOrdersLoading = true;
    this.purchaseOrderService
      .getAllOrders()
      .pipe(finalize(() => (this.isOrdersLoading = false)))
      .subscribe({
        next: (res: any) => {
          this.purchaseOrders = res as PurchaseOrder[];
        },
        error: () => {
          this.toastService.showToast(
            'Error',
            'Failed to fetch purchase orders',
            'error',
            3000
          );
        },
      });
  }

  openModal(order: PurchaseOrder | null = null) {
    this.isModalOpen = true;
    this.selectedOrder = order;
    this.modalTitle = order ? 'Edit Purchase Order' : 'Create Purchase Order';

    if (order) {
      this.productForm.patchValue({
        productName: order.productId,
        quantity: order.quantity,
      });
    } else {
      this.productForm.reset();
    }
  }

  closeModal() {
    this.isModalOpen = false;
    this.selectedOrder = null;
    this.productForm.reset();
  }

  // Create or update purchase order
  onSubmit() {
    if (this.productForm.invalid) return;

    this.isSubmitting = true;

    const now = new Date().toISOString();
    const product = this.products.find(
      (p) => p.productId === +this.productForm.value.productName
    );

    const payload = {
      OrderName: `PO-${Date.now()}`,
      ProductId: this.productForm.value.productName,
      ProductName: product?.productName || '',
      Quantity: this.productForm.value.quantity,
      Status: 'Ordered',
      CreatedBy: this.user?.userId || null,
      CreatedOn: now,
      LastUpdatedBy: this.user?.userId || null,
      LastUpdatedOn: now,
    };

    const request$ = this.selectedOrder
      ? this.purchaseOrderService.updatePurchaseOrder(
          this.selectedOrder.purchaseOrderId,
          payload
        )
      : this.purchaseOrderService.createPurchaseOrder(payload);

    request$.pipe(finalize(() => (this.isSubmitting = false))).subscribe({
      next: () => {
        this.fetchPurchaseOrders();
        this.closeModal();
        this.toastService.showToast(
          'Success',
          this.selectedOrder ? 'Order updated' : 'Order created',
          'success',
          3000
        );
      },
      error: () => {
        this.toastService.showToast(
          'Error',
          'Something went wrong. Please try again',
          'error',
          3000
        );
      },
    });
  }

  // Update order status
  updateStatus(order: PurchaseOrder, newStatus: string) {
    this.isUpdatingStatus = true;

    const payload = {
      purchaseOrderId: order.purchaseOrderId,
      orderName: order.orderName,
      productId: order.productId,
      productName: order.productName,
      quantity: order.quantity,
      status: newStatus,
      createdBy: order.createdBy,
      createdOn: order.createdOn,
      lastUpdatedBy: this.user?.userId || null,
      lastUpdatedOn: new Date().toISOString(),
    };

    this.purchaseOrderService
      .updatePurchaseOrder(order.purchaseOrderId, payload)
      .pipe(finalize(() => (this.isUpdatingStatus = false)))
      .subscribe({
        next: () => {
          order.status = newStatus;
          this.toastService.showToast(
            'Success',
            'Status updated successfully',
            'success',
            3000
          );
        },
        error: () => {
          this.toastService.showToast(
            'Error',
            'Something went wrong. Please try again',
            'error',
            3000
          );
        },
      });
  }

  // Delete purchase order
  deletePurchaseOrder(orderId: number) {
    this.deleteOrderId = orderId;
    this.confirmMessage = 'Are you sure you want to delete this order?';
    this.showConfirm = true;
  }

  onConfirmDelete() {
    if (this.deleteOrderId === null) return;

    this.isDeleting = true;

    this.purchaseOrderService
      .deletePurchaseOrder(this.deleteOrderId)
      .pipe(finalize(() => (this.isDeleting = false)))
      .subscribe({
        next: () => {
          this.fetchPurchaseOrders();
          this.showConfirm = false;
          this.deleteOrderId = null;
          this.toastService.showToast(
            'Success',
            'Order deleted successfully',
            'success',
            3000
          );
        },
        error: () => {
          this.toastService.showToast(
            'Error',
            'Failed to delete order',
            'error',
            3000
          );
        },
      });
  }

  onCancelDelete() {
    this.showConfirm = false;
    this.deleteOrderId = null;
  }

  // Global loading getter (optional)
  get isLoading() {
    return (
      this.isProductsLoading ||
      this.isOrdersLoading ||
      this.isSubmitting ||
      this.isUpdatingStatus ||
      this.isDeleting
    );
  }
}
