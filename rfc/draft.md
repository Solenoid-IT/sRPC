---
title: "sRPC: Solenoid Action-Oriented RPC and the HTTP RUN Method"
abbrev: sRPC & HTTP RUN
docname: draft-solenoid-srpc-00
category: std
updates: 9110

ipr: trust200902
area: Applications and Real-Time
workgroup: HTTP Working Group
keyword: [RPC, HTTP, RUN, API, FLUID, Solenoid]

stand-alone: yes
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
method path. The RUN method provides explicit protocol semantics for
function invocation, distinguishing RPC execution from resource-oriented
REST interactions.

--- middle

# Introduction

Modern HTTP APIs are often used to execute server-side logic, not only to
transfer resource representations. In these systems, overloading POST for
every action can obscure intent, policy, and observability.

sRPC defines a compact RPC profile over HTTP with two core properties:

1. The request URI identifies a logical endpoint, not an individual REST
   resource.
2. The procedure to execute is explicitly provided in a query parameter
   (`m`) as a method path.

To make invocation intent explicit at the protocol layer, this document
defines RUN as an HTTP method for procedure execution.

# Conventions and Definitions

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT",
"SHOULD", "SHOULD NOT", "RECOMMENDED", "NOT RECOMMENDED", "MAY", and
"OPTIONAL" in this document are to be interpreted as described in
BCP 14 [RFC2119] [RFC8174] when, and only when, they appear in all
capitals, as shown here.

This document uses the following terms:

- Endpoint: stable URI that identifies a logical dispatch context.
- Action (or Method Path): string provided in query parameter `m` that
  identifies the procedure to execute.
- Payload: request content containing procedure arguments.

# Protocol Overview

In sRPC, procedure selection is split between URI and query:

`Request = Endpoint + m (method path) + Payload`

The endpoint remains stable across multiple actions. The `m` parameter is
the dynamic selector and carries the method path, for example
`Order.calculate` or `Home/Door.open`.

The method-path syntax is intentionally language-neutral and can map to
classes, modules, namespaces, functions, or methods depending on server
implementation.

# The RUN HTTP Method

This document requests registration of RUN as an HTTP method for
action-oriented remote procedure execution.

## Semantics

RUN indicates that the client asks the origin server to execute an
application-defined procedure identified by `m`.

RUN semantics are intentionally non-REST: the primary target is a
procedure, not a resource state transfer operation.

* **Safe:** No.
* **Idempotent:** No (unless explicitly documented by the target action).
* **Cacheable:** Response caching is application-dependent and controlled
  through standard HTTP cache fields.

## Request Construction

A conforming sRPC request:

1. MUST use RUN, or a compatible fallback defined in
   Compatibility and Transition.
2. MUST include query parameter `m`.
3. MUST treat `m` as the full method path for dispatch.
4. MAY include a request payload containing action arguments.

Example:

```http
RUN /api/user?m=Order.calculate HTTP/1.1
Host: api.solenoid.it
Content-Type: application/json

{ "items": [101, 202] }
```

If `m` is missing or invalid, the server MUST reject the request.

## Response and Error Model

Implementations MUST use standard HTTP status codes for transport and
request-processing outcomes.

- `2xx` indicates successful execution.
- `4xx` indicates client-side faults (for example invalid `m`, malformed
  payload, unauthorized invocation).
- `5xx` indicates server-side execution faults.

For protocol-specific detection, a server MAY include `sRPC-Error` with an
integer value identifying the error category. When this header is present,
the response body SHOULD begin with the prefix `sRPC :: ` followed by a
machine-readable token.

## Protocol Errors

When `sRPC-Error` is present in the response, its value MUST be an integer
indicating the specific protocol-level error:

- **1:** Endpoint Not Found – The target endpoint does not exist (HTTP 404).
- **2:** Action Not Found – The specified action method `m` does not exist
  or is not exposed (HTTP 404).

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
HTTP/1.1 404 Not Found
Content-Type: text/plain
sRPC-Error: 2

sRPC :: Action Not Found
```

## Rationale

- **Clarity:** Distinguishes between "submitting data" (POST) and 
  "invoking logic" (RUN).
- **Observability:** Simplifies traffic analysis for WAFs and API 
  gateways by isolating RPC-style traffic.

# The FLUID Scheme

FLUID is a RECOMMENDED naming convention for action-oriented APIs and can
be adopted as an alternative to resource-oriented REST design patterns.
sRPC does not require FLUID for protocol conformance.

Implementations that adopt FLUID SHOULD expose actions following this
pattern:

1. **Find**: Retrieve a single object.
2. **List**: Retrieve a collection.
3. **Update**: Modify existing data.
4. **Insert**: Create new data.
5. **Delete**: Remove data.

# Compatibility & Transition

In environments where RUN is blocked by intermediaries or client
limitations, clients MAY tunnel sRPC over POST using
`X-HTTP-Method-Override: RUN`.

Servers that support this fallback SHOULD process these requests with the
same authorization and dispatch rules as native RUN.

Servers MUST NOT accept method override from untrusted transformation
layers unless explicitly configured to do so.

# IANA Considerations

IANA is requested to register the RUN method in the "Hypertext Transfer
Protocol (HTTP) Method Registry" according to [RFC9110].

* **Method Name:** RUN
* **Safe:** No
* **Idempotent:** No
* **Reference:** RFC-to-be

# Security Considerations

The `m` method path is an execution selector and therefore security
critical.

Implementations:

1. MUST validate `m` against a strict allowlist of exposed actions.
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

--- back