// Angular imports
import { finalize } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

// Service imports
import { User as UserService } from '../../services/user';
import { CustomToastService } from '../../services/toastr';
import { Product as ProductService } from '../../services/product';
import { SalesOrderService } from '../../services/sales-order-service';

// Model imports
import { Product } from '../../models/Product';
import { SalesOrder } from '../../models/SalesOrder';

// Custom component imports
import { Confirm } from '../confirm/confirm';

import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.html',
  styleUrls: ['./orders.css'],
  imports: [
    Confirm,
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatButtonModule,
  ],
})
export class Orders implements OnInit {
  // Variables to store data
  user: any;
  Math = Math;
  customers: any[] = [];
  products: Product[] = [];
  salesOrders: SalesOrder[] = [];
  deleteOrderId: number | null = null;
  selectedOrder: SalesOrder | null = null;

  // Form group
  productForm!: FormGroup;

  // Message variables
  modalTitle = 'Create Sales Order';
  confirmMessage = '';

  // Loading flags
  isDeleting = false;
  showConfirm = false;
  isModalOpen = false;
  isSubmitting = false;
  isOrdersLoading = false;
  isUpdatingStatus = false;
  isProductsLoading = false;
  isCustomersLoading = false;

  // Page variables
  page: number = 1;
  pageSize: number = 5;
  pageSizeInput: number = this.pageSize;
  inputPage: number = 1; // for custom page number input
  totalRecords: number = 0;
  displayedColumns: string[] = [
    'index',
    'orderName',
    'customerName',
    'productName',
    'quantity',
    'status',
    'actions',
  ];

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

  // Initialize form
  initForm() {
    this.productForm = this.fb.group({
      productName: ['', Validators.required],
      customerId: [this.user?.userId || '', Validators.required],
      quantity: ['', [Validators.required, Validators.min(1)]],
    });
  }

  // Function to fetch products
  fetchProducts() {
    this.isProductsLoading = true;
    this.productService
      .getAllProductsNoPages()
      .pipe(finalize(() => (this.isProductsLoading = false)))
      .subscribe({
        next: (res: any) => {
          this.products = res.data;
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

  // Fetch customers data
  fetchCustomers() {
    this.isCustomersLoading = true;
    this.userService
      .getAllUsersNoPage()
      .pipe(finalize(() => (this.isCustomersLoading = false)))
      .subscribe({
        next: (res: any) => {
          this.customers = res.data.filter((u: any) => u.role === 'customer');
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

  // Fetch sales data
  fetchSalesOrders() {
    this.isOrdersLoading = true;
    this.salesOrderService
      .getAllOrders(this.page, this.pageSize)
      .pipe(finalize(() => (this.isOrdersLoading = false)))
      .subscribe({
        next: (res: any) => {
          const mappedOrders = res.data.map((order: any) => ({
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
          this.totalRecords = res.totalRecords;

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

  // Page change buttons
  onPageChange(newPage: number) {
    if (newPage < 1) return;
    const totalPages = Math.ceil(this.totalRecords / this.pageSize);
    if (newPage > totalPages) return;
    this.page = newPage;
    this.inputPage = newPage;
    this.fetchSalesOrders();
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
    this.fetchSalesOrders();
  }

  // Modal control function. Used to open modal and show modal header based on the Create or Edit button
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

  // Close modal
  closeModal() {
    this.isModalOpen = false;
    this.selectedOrder = null;
    this.productForm.reset({ customerId: this.user?.userId || '' });
  }

  // Form submission. Creates or Edits an order as per user actions
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

  // Updates the status of an order like Ordered, Confirmed, etc
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

  // Primary delete sales order function. Asks for confirmation from the user
  deleteSalesOrder(orderId: number) {
    this.deleteOrderId = orderId;
    this.confirmMessage = 'Are you sure you want to delete this order?';
    this.showConfirm = true;
  }

  // Main logic to delete an order. Calls delete service if confirmed from the frontend
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
