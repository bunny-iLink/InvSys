using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ProductService.Models
{
    [Table("TbProducts")]
    public class Product
    {
        [Key]
        public int ProductId { get; set; }
        [Required]
        public string ProductName { get; set; } = string.Empty;
        [Required]
        public int CategoryId { get; set; }
        [Required]
        public int Quantity { get; set; }
        public string? Manufacturer { get; set; }
        public string? SKU { get; set; }
        [Required]
        public decimal Price { get; set; }
        [Required]
        public DateOnly MfgOn { get; set; }
        [Required]
        public DateOnly ExpiryDate { get; set; }
        public bool IsActive { get; set; } = true;
        public int CreatedBy { get; set; }
        public int LastUpdatedBy { get; set; }
        public DateTime CreatedOn { get; set; }
        public DateTime LastUpdatedOn { get; set; }
        public string CategoryName { get; set; } = string.Empty;
    }
}