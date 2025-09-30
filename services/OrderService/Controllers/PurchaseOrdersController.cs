using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ApiExplorer;
using Microsoft.EntityFrameworkCore;
using OrderService.Data;
using OrderService.Models;
using MassTransit;
using Contracts;

namespace OrderService.Controllers
{
    [ApiController]
    [Route("order/[controller]")]

    public class PurchaseOrderController : ControllerBase
    {
        private readonly OrderDbContext _context;
        private readonly IPublishEndpoint _publishEndpoint;

        public PurchaseOrderController(OrderDbContext context, IPublishEndpoint publishEndpoint)
        {
            _context = context;
            _publishEndpoint = publishEndpoint;
        }

        /// <summary>
        /// Retrieves all purchase orders from the database.
        /// </summary>
        /// <returns>
        /// An <see cref="IActionResult"/> containing a list of all purchase orders.
        /// Returns an empty list if no purchase orders exist.
        /// </returns>
        [HttpGet("getAllOrders")]
        public async Task<IActionResult> GetAllOrders(int pageNumber = 1, int pageSize = 10)
        {
            var totalRecords = await _context.PurchaseOrders.CountAsync();

            var orders = await _context.PurchaseOrders.Skip((pageNumber - 1) * pageSize).Take(pageSize).ToListAsync();

            return Ok(new
            {
                Data = orders,
                TotalRecords = totalRecords,
                PageNumber = pageNumber,
                PageSize = pageSize
            });
        }

        /// <summary>
        /// Creates a new purchase order in the database.
        /// </summary>
        /// <param name="purchaseOrder">The <see cref="PurchaseOrder"/> object containing order details. Must not be null.</param>
        /// <returns>
        /// An <see cref="IActionResult"/> containing:
        /// <list type="bullet">
        /// <item><description>A success message and the created purchase order if creation is successful.</description></item>
        /// <item><description>A bad request message if the input <paramref name="purchaseOrder"/> is null.</description></item>
        /// </list>
        /// </returns>
        [HttpPost("neworder")]
        public async Task<IActionResult> NewOrder([FromBody] PurchaseOrder purchaseOrder)
        {
            Console.WriteLine("Received payload:");
            Console.WriteLine(System.Text.Json.JsonSerializer.Serialize(purchaseOrder));

            if (purchaseOrder == null)
            {
                return BadRequest(new { message = "Please try again" });
            }

            purchaseOrder.PurchaseOrderId = 0; // Let DB auto-generate the ID
            purchaseOrder.CreatedOn = DateTime.UtcNow;
            purchaseOrder.LastUpdatedOn = DateTime.UtcNow;

            _context.Add(purchaseOrder);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Sales order created successfully", data = purchaseOrder });
        }

        /// <summary>
        /// Deletes a purchase order from the database by its unique identifier.
        /// </summary>
        /// <param name="id">The unique identifier of the purchase order to delete.</param>
        /// <returns>
        /// An <see cref="IActionResult"/> containing:
        /// <list type="bullet">
        /// <item><description>A success message if the purchase order is found and deleted.</description></item>
        /// <item><description>A not found message if the purchase order with the specified <paramref name="id"/> does not exist.</description></item>
        /// </list>
        /// </returns>
        [HttpDelete("deleteorder/{id}")]
        public async Task<IActionResult> DeleteOrder(int id)
        {
            var purchaseOrder = await _context.PurchaseOrders.FindAsync(id);

            if (purchaseOrder == null)
            {
                return NotFound(new { message = "Purchase order not found" });
            }

            _context.PurchaseOrders.Remove(purchaseOrder);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Purchase Order deleted successfully" });
        }

        /// <summary>
        /// Updates an existing purchase order by its unique identifier.
        /// Allows modification of product details, quantity, status, and optionally the order name.
        /// If the order status is updated to "Received", an <see cref="InventoryOrderReceived"/> event is published.
        /// </summary>
        /// <param name="id">The unique identifier of the purchase order to update.</param>
        /// <param name="purchaseOrder">A <see cref="PurchaseOrder"/> object containing the updated values.</param>
        /// <returns>
        /// An <see cref="IActionResult"/> containing:
        /// <list type="bullet">
        /// <item><description>A success message and the updated purchase order if the update is successful.</description></item>
        /// <item><description>A not found message if the purchase order with the specified <paramref name="id"/> does not exist.</description></item>
        /// </list>
        /// </returns>
        [HttpPut("editorder/{id}")]
        public async Task<IActionResult> UpdateOrder(int id, [FromBody] PurchaseOrder purchaseOrder)
        {
            var order = await _context.PurchaseOrders.FindAsync(id);

            if (order == null)
            {
                return NotFound(new { message = "Purchase Order not found" });
            }

            // Update fields
            order.ProductId = purchaseOrder.ProductId;
            order.ProductName = purchaseOrder.ProductName;
            order.Quantity = purchaseOrder.Quantity;
            order.Status = purchaseOrder.Status;
            order.LastUpdatedOn = DateTime.UtcNow;  // update timestamp
            order.LastUpdatedBy = purchaseOrder.LastUpdatedBy;

            // Optional: update OrderName if allowed
            if (!string.IsNullOrEmpty(purchaseOrder.OrderName))
            {
                order.OrderName = purchaseOrder.OrderName;
            }

            // Save changes
            _context.PurchaseOrders.Update(order);
            await _context.SaveChangesAsync();

            // Publish event if order is received
            if (order.Status == "Received")
            {
                await _publishEndpoint.Publish<InventoryOrderReceived>(new
                {
                    OrderId = order.PurchaseOrderId,
                    ProductId = order.ProductId,
                    Quantity = order.Quantity
                });
            }

            return Ok(new { message = "Purchase order updated successfully", data = order });
        }
    }
}