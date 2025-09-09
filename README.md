# InvSys - Inventory Management System

A modern, scalable, and responsive web application designed to efficiently manage product catalogs, track inventory levels in real-time, and process orders. This system is built using a microservice architecture to ensure high performance, fault tolerance, and maintainability.

---

## ✨ Features

* **Centralized Product Catalog:** Manage all product information, including categories, SKUs, and manufacturer details, from a single interface.
* **Inventory Tracking System:** Automatically update stock levels based on sales, purchases, and returns.
* **Order Management:** A seamless process for managing incoming purchase orders (stock-in) and outgoing sales orders (stock-out).
* **Low-Stock Alerts:** Receive automatic notifications when inventory levels for an item fall below a predefined threshold.
* **Movement History & Auditing:** Track every stock movement with detailed logs, including timestamps and user details.
* **Role-Based Access Control (RBAC):** Secure, role-based access ensures that users can only perform actions they are authorized for.
* **Responsive User Interface:** A clean, modern, and intuitive UI built with Angular that works seamlessly across desktops, tablets, and mobile devices.

---

## 🏛️ Architecture

This system is built using a **Microservice Architecture** to promote separation of concerns, enable independent deployments, and enhance scalability.

* **API Gateway (Node.js):** A single entry point for all client requests. It is responsible for routing requests to the appropriate microservice, as well as handling cross-cutting concerns like authentication (JWT validation) and request logging.

* **Backend Microservices (.NET 8):** The core business logic is split into several independent services:
    * **UserService:** Manages user identity, authentication, roles, profiles and sessions.
    * **ProductService:** Handles the product catalog, categories, and stock levels.
    * **OrderService:** Manages the lifecycle of purchase and sales orders.
    
* **Event-Driven Communication (RabbitMQ):** Services communicate asynchronously using an event bus (implemented with MassTransit and RabbitMQ). This decouples the services, ensuring that an action in one service (e.g., placing a sales order) can reliably trigger updates in another (e.g., decrementing stock in the ProductService) without creating hard dependencies.

* **Database (MySQL):** A relational database used to persist data. While a single database may be used for development simplicity, each service is the designated "owner" of its tables and is the only service permitted to write to them, maintaining logical data separation.

![Architecture Diagram](https://placehold.co/800x400/F0F0F0/333333?text=Architecture+Diagram+Placeholder)
*(Placeholder for your architecture diagram from the design document)*

---

## 🛠️ Technology Stack

* **Frontend:** [Angular](https://angular.io/), [Bootstrap UI](https://getbootstrap.com/)
* **API Gateway:** [Node.js](https://nodejs.org/), [Express.js](https://expressjs.com/)
* **Backend Microservices:** [.NET 8](https://dotnet.microsoft.com/en-us/download/dotnet/8.0), [ASP.NET Core](https://dotnet.microsoft.com/apps/aspnet)
* **Database:** [MySQL](https://www.mysql.com/)
* **Message Bus:** [RabbitMQ](https://www.rabbitmq.com/)
* **Messaging Library:** [MassTransit](https://masstransit.io/)

---

## 🚀 Getting Started

Follow these instructions to get the project up and running on your local machine for development and testing purposes.

### Prerequisites

* [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
* [Node.js and npm](https://nodejs.org/)
* [Angular CLI](https://angular.io/cli)
* [Docker and Docker Compose](https://www.docker.com/products/docker-desktop/)

### Installation & Setup

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/bunny-iLink/InvSys.git
    cd InvSys
    ```

2.  **Configure Environment Variables:**
    Each service (frontend, gateway, microservices) contains a `.env.example` or `appsettings.Development.json` file. Copy these to `.env` or a similar configuration file and update the values (database connection strings, service URLs, JWT secrets, etc.) as needed.

3.  **Build and Run with Docker Compose:**
    The easiest way to run the entire system is with Docker Compose. This will build and start containers for the frontend, gateway, all .NET microservices, the MySQL database, and RabbitMQ.

    ```sh
    docker-compose up --build
    ```

4.  **Access the Application:**
    * **Frontend Application:** `http://localhost:4200`
    * **API Gateway:** `http://localhost:3000`
    * **RabbitMQ Management:** `http://localhost:15672`

---