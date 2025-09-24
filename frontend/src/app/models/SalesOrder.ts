export interface SalesOrder {
  salesOrderId: number;
  orderName: string;
  customerId: number;
  customerName: string;
  productId: number;
  productName: string;
  quantity: number;
  status: string;
  createdOn: string;
  createdBy: number;
  lastUpdatedOn: string;
  lastUpdatedBy: number;
}
