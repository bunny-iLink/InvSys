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

@Component({
  selector: 'app-orders',
  templateUrl: './orders.html',
  styleUrls: ['./orders.css'],
  imports: [Confirm, CommonModule, ReactiveFormsModule, FormsModule],
})
export class Orders implements OnInit {
  // Variables to store data
  user: any;
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
  totalRecords: number = 0;
  pages: number[] = [];

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
          this.updatePages();

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

  // Update pages when navigating to different page number
  updatePages() {
    const totalPages = Math.ceil(this.totalRecords / this.pageSize);
    this.pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  // Trigger refetch on changing page number
  onPageChange(newPage: number) {
    if (newPage >= 1 && newPage <= this.pages.length) {
      this.page = newPage;
      this.fetchSalesOrders();
    }
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
