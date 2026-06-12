# 🚀 sRPC (Solenoid RPC)
### *A High-Scalability API Standard for Modern Developer Experience*

**sRPC** is an action-oriented RPC (Remote Procedure Call) protocol designed to accelerate API development over HTTP (also known as **RPC over HTTP**).
It focuses on **Developer Experience (DX)** and infinite scalability by eliminating the friction of manual route definitions.

<p align="center">
    <img src="https://solenoid.it/cdn/logo/sRPC.jpg" alt="sRPC Logo">
</p>

---

## 💡 The Core Concept
Traditional **REST** architectures rely on static binding definitions:
> `POST /api/users/123/orders` → `OrderController::create`

**sRPC** uses a stable endpoint URI and lets the client explicitly select the procedure to execute through the query parameter `p`:
> `RUN /api/user?p=Order.insert`

### Core Properties:
* **Stable Endpoint:** The URI identifies a logical dispatch context.
* **Explicit Procedure Selector:** The `p` parameter identifies the procedure path (e.g., `Order.insert`, `Home/Door.open`).
* **Action-Oriented Semantics:** `RUN` clearly expresses remote procedure execution over HTTP.

---

## 🏗 Architecture Components

### 1. Endpoints
An **Endpoint** is the static entry point of the API (e.g., `/api/user`). 
* It serves as the bridge between the HTTP request and the sRPC logic.
* It acts as a security gate where **Middlewares** (Authentication, Rate Limiting) are typically attached.

### 2. Procedures
A **Procedure** is the callable target identified by `p` (e.g., `Order.insert`).
* Procedures can be hierarchical (e.g., `Store/Order.insert`, `Home/Door.open`).
* The mapping from `p` to classes/modules/functions is server-defined.
* Implementations should expose only allowlisted procedures.

---

## ⇄ Data Handling (Input/Output/Errors)
The sRPC protocol is designed to be format-agnostic, offering maximum flexibility for data exchange.

* **Format Agnostic:** While the protocol typically utilizes **JSON** or **PLAIN** text, there are no technical limitations on the use of other serialization formats.
* **Input/Output:** Simplified handling of input parameters for **Procedures** and the subsequent responses returned to the client.
* **Error Management:** Transport and processing outcomes use standard HTTP status codes (`2xx`, `4xx`, `5xx`). For protocol-level detection, servers include the `sRPC-Error` response header (e.g., `1` Endpoint Not Found, `2` Procedure Not Found).

---

## 🌐 HTTP Transport & Compatibility
The sRPC protocol introduces a custom HTTP approach to clearly distinguish remote actions from standard RESTful calls.

* **Native Method:** In supported environments, sRPC requests use the **`RUN`** HTTP method.
* **Fallback Support:** Where `RUN` is blocked, clients can tunnel over **`POST`** with `X-HTTP-Method-Override: RUN`.
* **Consistency:** Fallback requests should be processed with the same auth, policy, and dispatch rules as native `RUN`.

---

## 🌊 FLUID Principles
sRPC recommends **FLUID** as a naming convention for action-oriented APIs. FLUID is optional and not required for protocol conformance:

| Initial | Operation | Purpose | sRPC | REST Equivalent |
| :--- | :--- | :--- | :--- | :--- |
| **F** | **Find** | Retrieve a single element | `Nested/Resource.find` | `GET /{id}` |
| **L** | **List** | Retrieve a list of elements | `Nested/Resource.list` | `GET /` |
| **U** | **Update** | Modify an existing element | `Nested/Resource.update` | `PUT` / `PATCH` |
| **I** | **Insert** | Create a new element | `Nested/Resource.insert` | `POST` |
| **D** | **Delete** | Remove a list of elements | `Nested/Resource.delete` | `DELETE` |

---

## 🧩 Entity Framework
sRPC natively adopts the **Entity** pattern. This ensures that every resource (object, file, or database row) is managed as a consistent entity through the FLUID scheme, promoting clean and predictable code.

---

## 🆚 sRPC vs REST
While REST is limited by standard HTTP methods, sRPC acts as a **superset of REST capabilities**:
* **Flexibility:** Beyond standard CRUD, sRPC allows specialized actions on the same endpoint (e.g., `/api/token?p=Token.refresh`).
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