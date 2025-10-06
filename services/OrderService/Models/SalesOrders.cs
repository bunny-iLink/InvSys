using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace OrderService.Models
{
    [Table("TbSalesOrders")]
    public class SalesOrder
    {
        [Key]
        [Column("SalesOrderId")]
        public int SalesOrdersId { get; set; }
        public string OrderName { get; set; } = string.Empty;
        [Required]
        public int CustomerId { get; set; }
        public string CustomerName { get; set; } = string.Empty;
        [Required]
        public int ProductId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime CreatedOn { get; set; }
        public int CreatedBy { get; set; }
        public DateTime LastUpdatedOn { get; set; }
        public int LastUpdatedBy { get; set; }
        public double Amount { get; set; }

    }
}