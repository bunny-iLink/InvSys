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

        /// <summary>
        /// Retrieves paginated categories from the database.
        /// </summary>
        /// <param name="pageNumber">Current page number (default = 1)</param>
        /// <param name="pageSize">Number of items per page (default = 10)</param>
        [HttpGet("getAllCategories")]
        public async Task<IActionResult> GetAllCategories(int pageNumber = 1, int pageSize = 10)
        {
            var totalRecords = await _context.Categories.CountAsync();

            var categories = await _context.Categories
                .OrderBy(c => c.CategoryId)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return Ok(new
            {
                Data = categories,
                TotalRecords = totalRecords,
                PageNumber = pageNumber,
                PageSize = pageSize
            });
        }

        /// <summary>
        /// Retrieves a specific category by its ID.
        /// </summary>
        /// <param name="id">The ID of the category to retrieve.</param>
        /// <returns>The <see cref="Category"/> object if found; otherwise, a 404 response.</returns>
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

        /// <summary>
        /// Creates a new category.
        /// </summary>
        /// <param name="id">The category ID (optional, can be generated automatically).</param>
        /// <param name="category">The <see cref="Category"/> object to create.</param>
        /// <returns>The created category and a 201 response.</returns>
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

        /// <summary>
        /// Deletes a category by its ID.
        /// </summary>
        /// <param name="id">The ID of the category to delete.</param>
        /// <returns>A success message if deleted, or a 404 response if not found.</returns>
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

        /// <summary>
        /// Updates an existing category by its ID.
        /// </summary>
        /// <param name="id">The ID of the category to update.</param>
        /// <param name="updatedCategory">The updated <see cref="Category"/> object.</param>
        /// <returns>The updated category if successful, or an error response if invalid or not found.</returns>
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