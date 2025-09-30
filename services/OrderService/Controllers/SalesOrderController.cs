using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OrderService.Data;
using OrderService.Models;
using Contracts;
using MassTransit;

namespace OrderService.Controllers
{
    [ApiController]
    [Route("order/[controller]")]

    public class SalesOrderController : ControllerBase
    {
        private readonly OrderDbContext _context;
        public readonly IPublishEndpoint _publishEndpoint;

        public SalesOrderController(OrderDbContext context, IPublishEndpoint publishEndpoint)
        {
            _context = context;
            _publishEndpoint = publishEndpoint;
        }

        /// <summary>
        /// Retrieves all sales orders from the database.
        /// </summary>
        /// <returns>
        /// An <see cref="IActionResult"/> containing a list of all sales orders.
        /// Returns an empty list if no sales orders exist.
        /// </returns>
        [HttpGet("getAllOrders")]
        public async Task<IActionResult> GetAllOrders(int pageNumber = 1, int pageSize = 10)
        {
            var totalRecords = await _context.SalesOrders.CountAsync();

            var orders = await _context.SalesOrders.Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

            return Ok(new
            {
                Data = orders,
                TotalRecords = totalRecords,
                PageNumber = pageNumber,
                PageSize = pageSize
            });
        }

        /// <summary>
        /// Creates a new sales order in the database.
        /// Sets creation and last updated timestamps based on India Standard Time (IST).
        /// </summary>
        /// <param name="salesOrder">The <see cref="SalesOrder"/> object containing order details. Must not be null.</param>
        /// <returns>
        /// An <see cref="IActionResult"/> containing:
        /// <list type="bullet">
        /// <item><description>A success message and the created sales order if creation is successful.</description></item>
        /// <item><description>A bad request message if the <paramref name="salesOrder"/> is null.</description></item>
        /// </list>
        /// </returns>
        [HttpPost("neworder")]
        public async Task<IActionResult> NewOrder([FromBody] SalesOrder salesOrder)
        {
            if (salesOrder == null)
            {
                return BadRequest(new { message = "Please try again" });
            }

            salesOrder.SalesOrdersId = 0; // Let DB auto-generate the ID
            var istTimeZone = TimeZoneInfo.FindSystemTimeZoneById("India Standard Time");
            var istNow = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, istTimeZone);

            salesOrder.CreatedOn = istNow;
            salesOrder.LastUpdatedOn = istNow;

            _context.Add(salesOrder);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Sales order created successfully", data = salesOrder });
        }

        /// <summary>
        /// Deletes a sales order from the database by its unique identifier.
        /// </summary>
        /// <param name="id">The unique identifier of the sales order to delete.</param>
        /// <returns>
        /// An <see cref="IActionResult"/> containing:
        /// <list type="bullet">
        /// <item><description>A success message if the sales order is found and deleted.</description></item>
        /// <item><description>A not found message if a sales order with the specified <paramref name="id"/> does not exist.</description></item>
        /// </list>
        /// </returns>
        [HttpDelete("deleteorder/{id}")]
        public async Task<IActionResult> deleteOrder(int id)
        {
            var order = await _context.SalesOrders.FindAsync(id);

            if (order == null)
            {
                return NotFound(new { message = "Order not found" });
            }

            _context.SalesOrders.Remove(order);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Order deleted successfully" });
        }

        /// <summary>
        /// Updates an existing sales order identified by its unique ID.
        /// Allows modification of order details such as customer, product, quantity, status, and optionally the order name.
        /// If the order status is updated to "Confirmed", a <see cref="CustomerOrderConfirmed"/> event is published.
        /// </summary>
        /// <param name="id">The unique identifier of the sales order to update.</param>
        /// <param name="salesOrder">A <see cref="SalesOrder"/> object containing the updated values.</param>
        /// <returns>
        /// An <see cref="IActionResult"/> containing:
        /// <list type="bullet">
        /// <item><description>A success message and the updated sales order if the update is successful.</description></item>
        /// <item><description>A not found message if a sales order with the specified <paramref name="id"/> does not exist.</description></item>
        /// </list>
        /// </returns>
        [HttpPut("editorder/{id}")]
        public async Task<IActionResult> UpdateSalesOrder(int id, [FromBody] SalesOrder salesOrder)
        {
            // Find sales order by ID
            var order = await _context.SalesOrders.FindAsync(id);

            if (order == null)
            {
                return NotFound(new { message = "Sales Order not found" });
            }

            // Update fields
            order.OrderName = string.IsNullOrEmpty(salesOrder.OrderName) ? order.OrderName : salesOrder.OrderName;
            order.CustomerId = salesOrder.CustomerId;
            order.CustomerName = salesOrder.CustomerName;
            order.ProductId = salesOrder.ProductId;
            order.ProductName = salesOrder.ProductName;
            order.Quantity = salesOrder.Quantity;
            order.Status = salesOrder.Status;

            // Audit fields
            order.LastUpdatedOn = DateTime.UtcNow;
            order.LastUpdatedBy = salesOrder.LastUpdatedBy;

            // Save changes
            _context.SalesOrders.Update(order);
            await _context.SaveChangesAsync();

            // Publish event if order is confirmed
            if (order.Status == "Confirmed")
            {
                await _publishEndpoint.Publish<CustomerOrderConfirmed>(new
                {
                    OrderId = order.SalesOrdersId,
                    ProductId = order.ProductId,
                    Quantity = order.Quantity
                });
            }

            return Ok(new
            {
                message = "Sales order updated successfully",
                data = order
            });
        }
    }
}