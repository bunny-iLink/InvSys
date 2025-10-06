// Sales Order Model: Represents an order placed by a customer. Structure as per the TbSalesOrder table
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
  amount: number;
}
