using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProductService.Data;
using ProductService.Models;

namespace ProductService.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class ProductController : ControllerBase
    {
        private readonly ProductDbContext _context;

        public ProductController(ProductDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Retrieves paginated products from the database.
        /// </summary>
        /// <param name="pageNumber">Current page number (default = 1)</param>
        /// <param name="pageSize">Number of items per page (default = 10)</param>
        /// <returns>A paginated list of products.</returns>
        [HttpGet("getAllProducts")]
        public async Task<IActionResult> GetAllProducts(
    int pageNumber = 1,
    int pageSize = 10,
    bool lowStock = false) // <-- added query parameter
        {
            var query = _context.Products.AsQueryable();

            // Apply lowStock filter if requested
            if (lowStock)
            {
                query = query.Where(p => p.Quantity < p.MinStockLevel);
            }

            var totalRecords = await query.CountAsync();

            var products = await query
                .OrderBy(p => p.ProductId)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return Ok(new
            {
                Data = products,
                TotalRecords = totalRecords,
                PageNumber = pageNumber,
                PageSize = pageSize
            });
        }

        /// <summary>
        /// Retrieves a specific product by its ID.
        /// </summary>
        /// <param name="id">The ID of the product to retrieve.</param>
        /// <returns>The <see cref="Product"/> object if found; otherwise, a 404 response.</returns>
        [HttpGet("getProductById/{id}")]
        public async Task<IActionResult> GetProductById(int id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null)
            {
                return NotFound(new { message = "Product not found" });
            }
            return Ok(product);
        }

        /// <summary>
        /// Creates a new product.
        /// </summary>
        /// <param name="product">The <see cref="Product"/> object to create.</param>
        /// <returns>The created product and a 201 response.</returns>
        [HttpPost("createProduct")]
        public async Task<IActionResult> CreateProduct([FromBody] Product product)
        {
            if (product == null)
            {
                return BadRequest(new { message = "Invalid product data" });
            }

            var istTimeZone = TimeZoneInfo.FindSystemTimeZoneById("India Standard Time");
            var istNow = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, istTimeZone);

            product.CreatedOn = istNow;
            product.LastUpdatedOn = istNow;

            _context.Products.Add(product);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetProductById), new { id = product.ProductId }, product);
        }

        /// <summary>
        /// Updates an existing product by its ID.
        /// </summary>
        /// <param name="id">The ID of the product to update.</param>
        /// <param name="updatedProduct">The updated <see cref="Product"/> object.</param>
        /// <returns>No content if successful; otherwise, an error response.</returns>
        [HttpPut("updateProduct/{id}")]
        public async Task<IActionResult> UpdateProduct(int id, [FromBody] Product updatedProduct)
        {
            if (updatedProduct == null || id != updatedProduct.ProductId)
            {
                return BadRequest(new { message = "Invalid product data" });
            }

            var existingProduct = await _context.Products.FindAsync(id);
            if (existingProduct == null)
            {
                return NotFound(new { message = "Product not found" });
            }

            var istTimeZone = TimeZoneInfo.FindSystemTimeZoneById("India Standard Time");
            var istNow = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, istTimeZone);

            existingProduct.ProductName = updatedProduct.ProductName;
            existingProduct.CategoryId = updatedProduct.CategoryId;
            existingProduct.Price = updatedProduct.Price;
            existingProduct.Quantity = updatedProduct.Quantity;
            existingProduct.MinStockLevel = updatedProduct.MinStockLevel;
            existingProduct.MfgOn = updatedProduct.MfgOn;
            existingProduct.ExpiryDate = updatedProduct.ExpiryDate;
            existingProduct.IsActive = updatedProduct.IsActive;
            existingProduct.LastUpdatedBy = updatedProduct.LastUpdatedBy;
            existingProduct.LastUpdatedOn = istNow;

            _context.Products.Update(existingProduct);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        /// <summary>
        /// Deletes a product by its ID.
        /// </summary>
        /// <param name="id">The ID of the product to delete.</param>
        /// <returns>No content if deleted successfully; otherwise, a 404 response.</returns>
        [HttpDelete("deleteProduct/{id}")]
        public async Task<IActionResult> DeleteProduct(int id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null)
            {
                return NotFound(new { message = "Product not found" });
            }

            _context.Products.Remove(product);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}