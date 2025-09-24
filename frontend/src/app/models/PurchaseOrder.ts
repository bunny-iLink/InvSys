export interface PurchaseOrder {
  purchaseOrderId: number;
  orderName: string;
  productId: number;
  productName: string;
  quantity: number;
  status: string;
  createdOn: string;
  createdBy: number;
  lastUpdatedOn: string;
  lastUpdatedBy: number;
}
