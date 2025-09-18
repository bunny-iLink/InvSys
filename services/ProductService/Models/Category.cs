using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ProductService.Models
{
    [Table("TbCategories")]
    public class Category
    {
        [Key]
        public int CategoryId { get; set; }
        [Required]
        public string CategoryName { get; set; } = string.Empty;
        public bool IsActive { get; set; } = true;
    }
}