import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SalesOrderService } from '../../services/sales-order-service';
import { Product as ProductService } from '../../services/product';
import { Product } from '../../models/Product';
import { SalesOrder } from '../../models/SalesOrder';
import { Confirm } from '../confirm/confirm';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CustomToastService } from '../../services/toastr';
import { User as UserService } from '../../services/user';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.html',
  styleUrls: ['./orders.css'],
  imports: [Confirm, CommonModule, ReactiveFormsModule, FormsModule],
})
export class Orders implements OnInit {
  products: Product[] = [];
  salesOrders: SalesOrder[] = [];
  customers: any[] = [];
  productForm!: FormGroup;

  isModalOpen = false;
  modalTitle = 'Create Sales Order';
  selectedOrder: SalesOrder | null = null;

  showConfirm = false;
  confirmMessage = '';
  deleteOrderId: number | null = null;

  user: any;

  // Loading flags
  isProductsLoading = false;
  isCustomersLoading = false;
  isOrdersLoading = false;
  isSubmitting = false;
  isUpdatingStatus = false;
  isDeleting = false;

  constructor(
    private fb: FormBuilder,
    private salesOrderService: SalesOrderService,
    private productService: ProductService,
    private userService: UserService,
    private toastService: CustomToastService
  ) {}

  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      this.user = JSON.parse(localStorage.getItem('user') || '{}');
    }

    this.initForm();
    this.fetchProducts();
    this.fetchCustomers();
    this.fetchSalesOrders();
  }

  initForm() {
    this.productForm = this.fb.group({
      productName: ['', Validators.required],
      customerId: [this.user?.userId || '', Validators.required],
      quantity: ['', [Validators.required, Validators.min(1)]],
    });
  }

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

  fetchCustomers() {
    this.isCustomersLoading = true;
    this.userService
      .getAllUsers()
      .pipe(finalize(() => (this.isCustomersLoading = false)))
      .subscribe({
        next: (res: any[]) => {
          this.customers = res.filter((u) => u.role === 'customer');
        },
        error: () => {
          this.toastService.showToast(
            'Error',
            'Failed to fetch customers',
            'error',
            3000
          );
        },
      });
  }

  fetchSalesOrders() {
    this.isOrdersLoading = true;
    this.salesOrderService
      .getAllOrders()
      .pipe(finalize(() => (this.isOrdersLoading = false)))
      .subscribe({
        next: (res: any) => {
          const mappedOrders = res.map((order: any) => ({
            salesOrderId: order.salesOrdersId,
            orderName: order.orderName,
            customerId: order.customerId,
            customerName: order.customerName,
            productId: order.productId,
            productName: order.productName,
            quantity: order.quantity,
            status: order.status,
            createdBy: order.createdBy,
            createdOn: order.createdOn,
            lastUpdatedBy: order.lastUpdatedBy,
            lastUpdatedOn: order.lastUpdatedOn,
          }));

          if (this.user?.role === 'customer') {
            this.salesOrders = mappedOrders.filter(
              (order: any) => order.customerId === this.user?.userId
            );
          } else {
            this.salesOrders = mappedOrders;
          }
        },
        error: () => {
          this.toastService.showToast(
            'Error',
            'Failed to fetch sales orders',
            'error',
            3000
          );
        },
      });
  }

  openModal(order: SalesOrder | null = null) {
    this.isModalOpen = true;
    this.selectedOrder = order;
    this.modalTitle = order ? 'Edit Sales Order' : 'Create Sales Order';

    if (order) {
      this.productForm.patchValue({
        productName: order.productId,
        customerId: order.customerId,
        quantity: order.quantity,
      });
    } else {
      this.productForm.reset({ customerId: this.user?.userId || '' });
    }
  }

  closeModal() {
    this.isModalOpen = false;
    this.selectedOrder = null;
    this.productForm.reset({ customerId: this.user?.userId || '' });
  }

  onSubmit() {
    if (this.productForm.invalid) return;

    this.isSubmitting = true;

    const now = new Date().toISOString();
    const product = this.products.find(
      (p) => p.productId === +this.productForm.value.productName
    );
    const selectedCustomer = this.customers.find(
      (c) => c.userId === +this.productForm.value.customerId
    );

    const payload: SalesOrder = {
      salesOrderId: this.selectedOrder?.salesOrderId || 0,
      orderName: this.selectedOrder
        ? this.selectedOrder.orderName
        : `SO-${Date.now()}`,
      customerId: selectedCustomer?.userId || this.user?.userId || 0,
      customerName: `${selectedCustomer?.firstName || ''} ${
        selectedCustomer?.lastName || ''
      }`.trim(),
      productId: this.productForm.value.productName,
      productName: product?.productName || '',
      quantity: this.productForm.value.quantity,
      status: this.selectedOrder ? this.selectedOrder.status : 'Ordered',
      createdBy: this.selectedOrder
        ? this.selectedOrder.createdBy
        : this.user?.userId || 0,
      createdOn: this.selectedOrder ? this.selectedOrder.createdOn : now,
      lastUpdatedBy: this.user?.userId || 0,
      lastUpdatedOn: now,
    };

    const request$ = this.selectedOrder
      ? this.salesOrderService.updateSalesOrder(
          this.selectedOrder.salesOrderId,
          payload
        )
      : this.salesOrderService.createSalesOrder(payload);

    request$.pipe(finalize(() => (this.isSubmitting = false))).subscribe({
      next: () => {
        this.fetchSalesOrders();
        this.closeModal();
        this.toastService.showToast(
          'Success',
          this.selectedOrder
            ? 'Order updated successfully'
            : 'Order created successfully',
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

  updateStatus(order: SalesOrder, newStatus: string) {
    this.isUpdatingStatus = true;

    const payload: SalesOrder = {
      ...order,
      status: newStatus,
      lastUpdatedBy: this.user?.userId || 0,
      lastUpdatedOn: new Date().toISOString(),
    };

    this.salesOrderService
      .updateSalesOrder(order.salesOrderId, payload)
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

  deleteSalesOrder(orderId: number) {
    this.deleteOrderId = orderId;
    this.confirmMessage = 'Are you sure you want to delete this order?';
    this.showConfirm = true;
  }

  onConfirmDelete() {
    if (this.deleteOrderId === null) return;

    this.isDeleting = true;

    this.salesOrderService
      .deleteSalesOrder(this.deleteOrderId)
      .pipe(finalize(() => (this.isDeleting = false)))
      .subscribe({
        next: () => {
          this.fetchSalesOrders();
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

  // Optional global loading getter
  get isLoading() {
    return (
      this.isProductsLoading ||
      this.isCustomersLoading ||
      this.isOrdersLoading ||
      this.isSubmitting ||
      this.isUpdatingStatus ||
      this.isDeleting
    );
  }
}
