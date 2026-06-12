---
title: "sRPC: Solenoid Action-Oriented RPC and the HTTP RUN Method"
abbrev: sRPC & HTTP RUN
docname: draft-giannelli-srpc-00
category: std
submissiontype: IETF

ipr: trust200902
area: Applications and Real-Time
keyword: [RPC, HTTP, RUN, API, FLUID, Solenoid]
pi: [toc, sortrefs, symrefs]

author:
 -
    ins: P.N.Giannelli
    name: Pier Niccolò Giannelli
    organization: Solenoid-IT
    email: support@solenoid.it
    uri: https://github.com/Solenoid-IT/sRPC

normative:
  RFC2119:
  RFC8174:
  RFC9110:

--- abstract

This document defines the Solenoid Remote Procedure Call (sRPC) protocol
and requests registration of a new HTTP method, RUN.

sRPC is action-oriented. A client targets a stable endpoint URI and
identifies the procedure to execute through a query parameter containing a
procedure path. The RUN method provides explicit protocol semantics for
function invocation, distinguishing RPC execution from resource-oriented
REST interactions.

--- middle

# Introduction

Modern HTTP APIs are often used to execute server-side logic, not only to
transfer resource representations. In these systems, overloading POST for
every action can obscure intent, policy, and observability.

sRPC defines an RPC profile over HTTP with two core properties:

1. The request URI identifies a logical endpoint, not an individual REST
   resource.
2. The procedure to execute is explicitly provided in a query parameter
   (`p`) as a procedure path.

To make invocation intent explicit at the protocol layer, this document
defines RUN as an HTTP method for procedure execution.

# Conventions and Definitions

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT",
"SHOULD", "SHOULD NOT", "RECOMMENDED", "NOT RECOMMENDED", "MAY", and
"OPTIONAL" in this document are to be interpreted as described in
BCP 14 [RFC2119], [RFC8174] when, and only when, they appear in all
capitals, as shown here.

This document uses the following terms:

- Endpoint: stable URI that identifies a logical dispatch context.
- Procedure: string provided in query parameter `p` that
  identifies the procedure to execute.
- Payload: request body (i.e., request content) containing procedure
  arguments.

# Protocol Overview

In sRPC, procedure selection is split between URI and query:

`Request = Endpoint + p (procedure path) + Payload`

The endpoint remains stable across multiple actions. The `p` parameter is
the dynamic selector and carries the procedure path, for example
`Order.insert` or `Home/Door.open`.

The procedure-path syntax is intentionally language-neutral and can map to
classes, modules, namespaces, functions, or methods depending on server
implementation.

The official protocol project is available at https://github.com/Solenoid-IT/sRPC.

A reference implementation is available at https://github.com/Solenoid-IT/simba-app.
It demonstrates how `p` is interpreted server-side as a procedure identifier
and how RUN requests are dispatched in practice.

# The RUN HTTP Method

This document requests registration of RUN as an HTTP method for
action-oriented remote procedure execution.

## Semantics

RUN indicates that the client asks the origin server to execute an
application-defined procedure identified by `p`.

RUN semantics are intentionally non-REST: the primary target is a
procedure, not a resource state transfer operation.

* **Safe:** No.
* **Idempotent:** No (unless explicitly documented by the target procedure).
* **Cacheable:** Response caching is application-dependent and controlled
  through standard HTTP cache fields.

## Query Parameter `p`

The query parameter `p` is the unique identifier for the procedure to execute.

- `p` MUST be present in every sRPC request.
- `p` value uniquely identifies which procedure the client wishes to invoke.
- `p` uses dot or slash notation for hierarchical naming (e.g., `Order.insert`,
  `Home/Door.open`).
- On the server implementation, `p` typically maps to a method of a class, a
  function in a module, or an equivalent callable construct. The exact mapping
  is server-defined and SHOULD be documented by the endpoint implementer.

Example interpretation (pseudo-code):

```
p = "Job.start"    →  server interprets as: Job class, start method
p = "Auth/User.login"  →  server interprets as: User class, login method
```

## Request Construction

A conforming sRPC request:

1. MUST use RUN, or a compatible fallback defined in
   Compatibility and Transition.
2. MUST include query parameter `p`.
3. MUST treat `p` as the full procedure identifier for dispatch.
4. MAY include a request payload in the request body containing action
  arguments.

Example:

```http
RUN /api/user?p=Order.insert HTTP/1.1
Host: api.example.com
Content-Type: application/json

[
  {
    "product": 101,
    "qty": 1
  },

  {
    "product": 202,
    "qty": 2
  }
]
```

If `p` is missing or syntactically invalid, the server SHOULD reject the
request with HTTP 400 and MUST include `sRPC-Error: 2` (Missing Procedure
Selector) in the response headers.

If `p` is syntactically valid but not exposed, the server MUST reject the
request with HTTP 404 and MUST include `sRPC-Error: 3` (Procedure Not Found)
in the response headers.

When request syntax is valid but `p` does not identify an exposed
procedure, 404 is used to avoid disclosing implementation internals.

## Response and Error Model

Implementations MUST use standard HTTP status codes for transport and
request-processing outcomes.

- `2xx` indicates successful execution.
- `4xx` indicates client-side faults (for example invalid `p`, malformed
  payload, unauthorized invocation).
- `5xx` indicates server-side execution faults.

For protocol-specific detection, a server MUST include `sRPC-Error` with an
integer value identifying the error category. When this header is present,
the response body SHOULD begin with the prefix `sRPC :: ` followed by a
machine-readable token.

`sRPC-Error` is a response header field generated by the server and sent to
the client.

## Protocol Errors

When `sRPC-Error` is present in the response, its value MUST be an integer
indicating the specific protocol-level error:

- **1:** Endpoint Not Found – The target endpoint does not exist (HTTP 404).
- **2:** Missing Procedure Selector – The query parameter `p` is missing or
  syntactically invalid (HTTP 400).
- **3:** Procedure Not Found – The specified procedure `p` does not exist
  or is not exposed (HTTP 404).

When the server rejects a request with Missing Procedure Selector, it MUST send
`sRPC-Error: 2` in the response headers.

When the server rejects a request with Procedure Not Found, it MUST send
`sRPC-Error: 3` in the response headers.

Additional codes MAY be defined in future versions. Clients SHOULD treat
unknown codes as generic protocol errors.

Examples:

```http
HTTP/1.1 404 Not Found
Content-Type: text/plain
sRPC-Error: 1

sRPC :: Endpoint Not Found
```

```http
HTTP/1.1 400 Bad Request
Content-Type: text/plain
sRPC-Error: 2

sRPC :: Missing Procedure Selector
```

```http
HTTP/1.1 404 Not Found
Content-Type: text/plain
sRPC-Error: 3

sRPC :: Procedure Not Found
```

## Rationale

- **Protocol Intent:** Distinguishes between representation submission
  (commonly POST) and explicit remote procedure invocation (RUN).
- **Policy and Routing:** Enables intermediaries and gateways to attach
  method-based policies to procedure execution traffic.
- **Operational Observability:** Supports log segmentation, analytics,
  and alerting for RPC-style traffic patterns.
- **Interoperability Path:** Preserves deployability through POST tunneling
  in constrained environments while keeping explicit invocation semantics.

# The FLUID Scheme

FLUID is a RECOMMENDED naming convention for action-oriented APIs.
sRPC does not require FLUID for protocol conformance.

Implementations that adopt FLUID SHOULD expose actions following this
pattern:

1. **Find**: Retrieve a single object.
2. **List**: Retrieve a collection.
3. **Update**: Modify existing data.
4. **Insert**: Create new data.
5. **Delete**: Remove data.

Example FLUID procedure paths (p):

- `Order.find`
- `Order.list`
- `Order.update`
- `Order.insert`
- `Order.delete`

# Compatibility & Transition

In environments where RUN is blocked by intermediaries or client
limitations, clients MAY tunnel sRPC over POST using
`X-HTTP-Method-Override: RUN`.

Servers that support this fallback SHOULD process these requests with the
same authorization and dispatch rules as native RUN.

Servers MUST NOT accept method override from untrusted transformation
layers unless explicitly configured to do so.

# Interoperability Considerations

Deployments can incrementally adopt RUN while preserving compatibility with
existing HTTP infrastructure:

1. Endpoints SHOULD continue to accept POST tunneling in environments where
  custom methods are blocked.
2. Gateways and security controls SHOULD evaluate both the received method
  and the effective method after override processing.
3. Clients and servers SHOULD document fallback behavior and precedence
  rules to prevent inconsistent interpretation across intermediaries.
4. Implementations SHOULD expose explicit conformance tests for native RUN
  and POST-tunneled RUN dispatch equivalence.

# IANA Considerations

IANA is requested to register the RUN method in the "Hypertext Transfer
Protocol (HTTP) Method Registry" according to [RFC9110].

* **Method Name:** RUN
* **Safe:** No
* **Idempotent:** No
* **Reference:** This document

IANA is also requested to register the `sRPC-Error` field name in the
"Hypertext Transfer Protocol (HTTP) Field Name Registry".

* **Field name:** sRPC-Error
* **Status:** permanent
* **Specification document(s):** This document
* **Comments:** Response header field generated by the server and sent to the client; carries a protocol-specific sRPC error code.

# Security Considerations

The `p` procedure path is an execution selector and therefore security
critical.

Implementations:

1. MUST validate `p` against a strict allowlist of exposed actions.
2. MUST prevent path traversal and equivalent namespace-escape attacks.
3. MUST apply authentication and authorization before dispatch.
4. SHOULD implement replay protections for non-idempotent actions when
  relevant to deployment requirements.
5. SHOULD apply rate limiting and execution time controls to reduce abuse
  and denial-of-service impact.
6. MUST avoid exposing internal class/module names unless intentionally
  part of the public contract.

When POST tunneling is enabled, servers MUST ensure that method override
cannot bypass routing, policy, or audit controls.

Implementations that accept `X-HTTP-Method-Override: RUN` SHOULD:

1. Ensure the override decision is made at a single trusted hop.
2. Log both the received method and the effective method used for dispatch.
3. Apply the same authentication, authorization, and rate-limit policies
   as native RUN requests.
4. Reject conflicting or duplicated override signals.

--- back