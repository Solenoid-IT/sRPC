# 🚀 sRPC (Solenoid RPC)
### *A High-Scalability API Standard for Modern Developer Experience*

**sRPC** is an advanced RPC (Remote Procedure Call) standard designed to accelerate API development. It focuses on **Developer Experience (DX)** and infinite scalability by eliminating the friction of manual route definitions.

<p align="center">
    <img src="https://solenoid.it/cdn/logo/sRPC.jpg" alt="sRPC Logo">
</p>

---

## 💡 The Core Concept
Traditional **REST** architectures rely on static binding definitions:
> `POST /api/user/123/order` → `OrderController::create`

**sRPC** moves away from static bindings in favor of a **file-system based approach**. The client directly indicates the action to be performed:
> `RUN /api/user?m=Order.create`

### Key Advantages:
* **No Manual Routing:** Developers don't need to map every single route; the action is the route itself.
* **Instant Availability:** As soon as a class method is written, it is immediately callable by the client.
* **Subtree Isolation:** A single static endpoint (e.g., `/api/user`) can host a complex subtree of actions.

---

## 🏗 Architecture Components

### 1. Endpoints
An **Endpoint** is the static entry point of the API (e.g., `/api/user`). 
* It serves as the bridge between the HTTP request and the sRPC logic.
* It acts as a security gate where **Middlewares** (Authentication, Rate Limiting) are typically attached.

### 2. Actions
An **Action** is a server-side class method (e.g., `Order.create`).
* Actions can be nested (e.g., `Store/Order.create`).
* Each action can have its own specific **Middlewares** for granular control.
* The system automatically maps the client's request to the corresponding function.

---

## ⇄ Data Handling (Input/Output/Errors)
The sRPC protocol is designed to be format-agnostic, offering maximum flexibility for data exchange.

* **Format Agnostic:** While the protocol typically utilizes **JSON** or **PLAIN** text, there are no technical limitations on the use of other serialization formats.
* **Input/Output:** Simplified handling of input parameters for **Actions** and the subsequent responses returned to the client.
* **Error Management:** A standardized system for exception handling where **error codes and structures are defined by the application itself**, ensuring full control over business logic validation and reporting.

---

## 🌐 HTTP Transport & Compatibility
The sRPC protocol introduces a custom HTTP approach to clearly distinguish remote actions from standard RESTful calls.

* **Native Method:** In supported or native environments, sRPC requests use the **`RUN`** HTTP method.
* **Fallback Support:** For environments where custom methods are not supported (e.g., certain browsers, legacy proxies, or restrictive CDNs), the system should falls back to **`POST`** for full compatibility.
* **Consistency:** Regardless of the HTTP method used, the internal logic and action mapping remain identical.

---

## 🌊 FLUID Principles
sRPC replaces the traditional CRUD model with **FLUID**, a specialized scheme for resource management (databases, storage, files):

| Initial | Operation | Purpose | REST Equivalent |
| :--- | :--- | :--- | :--- |
| **F** | **Find** | Retrieve a single element | `GET /{id}` |
| **L** | **List** | Retrieve a list of elements | `GET /` |
| **U** | **Update** | Modify an existing element | `PUT` / `PATCH` |
| **I** | **Insert** | Create a new element | `POST` |
| **D** | **Delete** | Remove a list of elements | `DELETE` |

---

## 🧩 Entity Framework
sRPC natively adopts the **Entity** pattern. This ensures that every resource (object, file, or database row) is managed as a consistent entity through the FLUID scheme, promoting clean and predictable code.

---

## 🆚 sRPC vs REST
While REST is limited by standard HTTP methods, sRPC acts as a **superset of REST capabilities**:
* **Flexibility:** Beyond standard CRUD, sRPC allows for specialized custom actions on the same endpoint (e.g., `/api/token?m=Token.refresh`).
* **IoT & Remote Control:** sRPC is ideal for command-based contexts where actions aren't always tied to a resource but to an object (e.g., `Home/Door.open`, `Camera.take_snapshot`).

---

## 🎯 Conclusion
The strength of sRPC lies in its **scalability**. By decoupling the action from the static route binding, developers can expand large sets of complex endpoints without the overhead of maintaining massive routing files. 

**Write the function, and it's ready.**

---

## ⚖️ License & Trademarks

### Software License
This project is licensed under the **Apache License 2.0**. This means you are free to use, modify, and distribute the software, provided that you retain the original copyright notice and adhere to the terms of the license.

### Trademark Policy
**Solenoid™** and **sRPC™** (Solenoid Remote Procedure Call) are trademarks of **Solenoid-IT**. 

While the sRPC protocol specification and its reference implementations are open for public use and contribution, the names and logos associated with this project are protected. 
- **Allowed:** Using the name "sRPC" to describe compatibility with the protocol (e.g., "This library supports the sRPC™ protocol").
- **Not Allowed:** Using the names in a way that implies an official endorsement by Solenoid-IT or creating derivative works that use "Solenoid" or "sRPC" as their primary brand without written permission.

For any questions regarding trademark usage, please open an issue or contact us at [support@solenoid.it].
---
<p align="center">Solenoid IT - 2026</p>