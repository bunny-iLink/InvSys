import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SalesOrderService } from '../../services/sales-order-service'; // adjust path
import { Product as ProductService } from '../../services/product';
import { Product } from '../../models/Product';
import { SalesOrder } from '../../models/SalesOrder';
import { Confirm } from '../confirm/confirm';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CustomToastService } from '../../services/toastr';
import { User as UserService } from '../../services/user';

@Component({
  selector: 'app-purchaseorders',
  templateUrl: './orders.html',
  styleUrls: ['./orders.css'],
  imports: [Confirm, CommonModule, ReactiveFormsModule, FormsModule],
})
export class Orders implements OnInit {
  products: Product[] = [];
  salesOrders: SalesOrder[] = [];
  productForm!: FormGroup;

  isModalOpen = false;
  modalTitle = 'Create Sales Order';
  selectedOrder: SalesOrder | null = null;

  showConfirm = false;
  confirmMessage = '';
  deleteOrderId: number | null = null;

  user: any;
  customers: any = [];

  constructor(
    private fb: FormBuilder,
    private salesOrderService: SalesOrderService,
    private productService: ProductService,
    private toastService: CustomToastService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      this.user = JSON.parse(localStorage.getItem('user') || '{}');
    }

    this.initForm();
    this.fetchProducts();
    this.fetchSalesOrders();
    this.fetchCustomers();
  }

  initForm() {
    this.productForm = this.fb.group({
      productName: ['', Validators.required],
      customerId: [this.user?.userId || '', Validators.required],
      quantity: ['', [Validators.required, Validators.min(1)]],
    });
  }

  fetchProducts() {
    this.productService.getAllProducts().subscribe((res: Product[]) => {
      this.products = res;
    });
  }

  fetchCustomers() {
    this.userService.getAllUsers().subscribe((res: any) => {
      // Keep only users with role 'customer'
      this.customers = res.filter((u: any) => u.role === 'customer');
      console.log(this.customers);
      
    });
  }

  fetchSalesOrders() {
    this.salesOrderService.getAllOrders().subscribe((res: any) => {
      // Map backend properties to frontend model
      const mappedOrders = res.map((order: any) => ({
        salesOrderId: order.salesOrdersId, // map to frontend property
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

      // Filter based on role
      if (this.user?.role === 'customer') {
        this.salesOrders = mappedOrders.filter(
          (order: any) => order.customerId === this.user?.userId
        );
      } else {
        this.salesOrders = mappedOrders;
        console.log(this.salesOrders);
        
      }
    });
  }

  openModal(order: SalesOrder | null = null) {
    this.isModalOpen = true;
    this.selectedOrder = order;
    this.modalTitle = order ? 'Edit Sales Order' : 'Create Sales Order';

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

    // Find selected customer object
    const selectedCustomer = this.customers.find(
      (c: any) => c.userId === +this.productForm.value.customerId
    );

    const payload: SalesOrder = {
      salesOrderId: this.selectedOrder?.salesOrderId || 0,
      orderName: this.selectedOrder
        ? this.selectedOrder.orderName
        : `SO-${Date.now()}`,
      customerId: selectedCustomer?.userId || this.user?.userId || 0,
      customerName: `${selectedCustomer.firstName} ${selectedCustomer.lastName}` || '',
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

    if (this.selectedOrder) {
      // Update existing order
      this.salesOrderService
        .updateSalesOrder(this.selectedOrder.salesOrderId, payload)
        .subscribe(() => {
          this.fetchSalesOrders();
          this.closeModal();
        });
    } else {
      // Create new order
      this.salesOrderService.createSalesOrder(payload).subscribe(() => {
        this.fetchSalesOrders();
        this.closeModal();
      });
    }
  }

  updateStatus(order: SalesOrder, newStatus: string) {
    const payload: SalesOrder = {
      ...order,
      status: newStatus,
      lastUpdatedBy: this.user?.userId || 0,
      lastUpdatedOn: new Date().toISOString(),
    };

    this.salesOrderService
      .updateSalesOrder(order.salesOrderId, payload)
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
    if (this.deleteOrderId !== null) {
      this.salesOrderService
        .deleteSalesOrder(this.deleteOrderId)
        .subscribe(() => {
          this.fetchSalesOrders();
          this.showConfirm = false;
          this.deleteOrderId = null;
          this.toastService.showToast(
            'Success',
            'Order deleted successfully',
            'success',
            3000
          );
        });
    }
  }

  onCancelDelete() {
    this.showConfirm = false;
    this.deleteOrderId = null;
  }
}
