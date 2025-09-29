// Purchase Order Model: Represents an order placed by the inventory. Structure as per the TbPurchaseOrder table
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
