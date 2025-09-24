import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PurchaseOrderService } from '../../services/purchase-order-service'; // adjust path
import { Product as ProductService } from '../../services/product';
import { Product } from '../../models/Product';
import { PurchaseOrder } from '../../models/PurchaseOrder';
import { Confirm } from '../confirm/confirm';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { CustomToastService } from '../../services/toastr';

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

  fetchProducts() {
    this.productService.getAllProducts().subscribe((res: Product[]) => {
      this.products = res;
    });
  }

  fetchPurchaseOrders() {
    this.purchaseOrderService.getAllOrders().subscribe((res: any) => {
      this.purchaseOrders = res;
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

  onSubmit() {
    if (this.productForm.invalid) return;

    const now = new Date().toISOString();
    const product = this.products.find(
      (p) => p.productId === +this.productForm.value.productName
    );

    const payload = {
      OrderName: `PO-${Date.now()}`, // auto-generated order name
      ProductId: this.productForm.value.productName,
      ProductName: product?.productName || '',
      Quantity: this.productForm.value.quantity,
      Status: 'Ordered',
      CreatedBy: this.user?.userId || null,
      CreatedOn: now,
      LastUpdatedBy: this.user?.userId || null,
      LastUpdatedOn: now,
    };

    if (this.selectedOrder) {
      // Update existing order
      this.purchaseOrderService
        .updatePurchaseOrder(this.selectedOrder.purchaseOrderId, payload)
        .subscribe(() => {
          this.fetchPurchaseOrders();
          this.closeModal();
        });
    } else {
      // Create new order
      this.purchaseOrderService.createPurchaseOrder(payload).subscribe(() => {
        this.fetchPurchaseOrders();
        this.closeModal();
      });
    }
  }

  updateStatus(order: any, newStatus: string) {
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

  deletePurchaseOrder(orderId: number) {
    this.deleteOrderId = orderId;
    this.confirmMessage = 'Are you sure you want to delete this order?';
    this.showConfirm = true;
  }

  onConfirmDelete() {
    if (this.deleteOrderId !== null) {
      this.purchaseOrderService
        .deletePurchaseOrder(this.deleteOrderId)
        .subscribe(() => {
          this.fetchPurchaseOrders();
          this.showConfirm = false;
          this.deleteOrderId = null;
        });
    }
  }

  onCancelDelete() {
    this.showConfirm = false;
    this.deleteOrderId = null;
  }
}
