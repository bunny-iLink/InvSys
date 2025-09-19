using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProductService.Data;
using ProductService.Models;

namespace ProductService.Controllers
{
    [ApiController]
    [Route("product/[controller]")]
    public class CategoryController : ControllerBase
    {
        private readonly ProductDbContext _context;

        public CategoryController(ProductDbContext context)
        {
            _context = context;
        }

        [HttpGet("getAllCategories")]
        public async Task<IActionResult> GetAllCategories()
        {
            var categories = await _context.Categories.ToListAsync();
            return Ok(categories);
        }

        [HttpGet("getCategoryById/{id}")]
        public async Task<IActionResult> GetCategoryById(int id)
        {
            var category = await _context.Categories.FindAsync(id);
            if (category == null)
            {
                return NotFound(new { message = "Category not found" });
            }
            return Ok(category);
        }

        [HttpPost("createCategory")]
        public async Task<IActionResult> CreateCategory(int id, [FromBody] Category category)
        {
            if (category == null || string.IsNullOrWhiteSpace(category.CategoryName))
            {
                return BadRequest(new { message = "Invalid category data" });
            }

            var istTimeZone = TimeZoneInfo.FindSystemTimeZoneById("India Standard Time");
            var istNow = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, istTimeZone);

            category.CreatedOn = istNow;
            category.LastUpdatedOn = istNow;

            _context.Categories.Add(category);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetCategoryById), new { id = category.CategoryId }, category);
        }

        [HttpDelete("deleteCategory/{id}")]
        public async Task<IActionResult> DeleteCategory(int id)
        {
            var category = await _context.Categories.FindAsync(id);
            if (category == null)
            {
                return NotFound(new { message = "Category not found" });
            }

            _context.Categories.Remove(category);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Category deleted successfully" });
        }

        [HttpPut("updateCategory/{id}")]
        public async Task<IActionResult> UpdateCategory(int id, [FromBody] Category updatedCategory)
        {
            if (updatedCategory == null)
            {
                return BadRequest(new { message = "Invalid category data" });
            }

            var category = await _context.Categories.FindAsync(id);
            if (category == null)
            {
                return NotFound(new { message = "Category not found" });
            }

            category.CategoryName = updatedCategory.CategoryName;
            category.IsActive = updatedCategory.IsActive;
            category.LastUpdatedBy = updatedCategory.LastUpdatedBy;
            var istTimeZone = TimeZoneInfo.FindSystemTimeZoneById("India Standard Time");
            category.LastUpdatedOn = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, istTimeZone);

            await _context.SaveChangesAsync();
            return Ok(category);
        }
    }
}