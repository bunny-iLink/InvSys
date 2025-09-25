namespace Contracts;

public interface InventoryOrderReceived
{
    int PurchaseOrderId { get; }
    int ProductId { get; }
    int Quantity { get; }
}

public interface CustomerOrderConfirmed
{
    int SalesOrderId { get; }
    int ProductId { get; }
    int Quantity { get; }
}
