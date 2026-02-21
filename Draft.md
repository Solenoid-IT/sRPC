Bozza Iniziale della RFC: sRPC Protocol Specification



# Abstract
This document defines the Solenoid Remote Procedure Call (sRPC) protocol, an action-oriented communication standard for distributed systems. sRPC introduces a file-system-based routing paradigm to eliminate the overhead of static binding definitions in traditional RESTful architectures. By implementing the FLUID (Find, List, Update, Insert, Delete) formal scheme, sRPC provides a standardized method for resource interaction while maintaining the flexibility for custom remote commands, optimizing both developer experience (DX) and system scalability.
<br>
<br>
<br>



# 1. Introduction
Modern API development often suffers from "routing exhaustion," where the maintenance of static URI bindings becomes a bottleneck in large-scale applications. Current standards like REST rely heavily on HTTP verbs and complex URL nesting, which often leads to inconsistent implementations.

sRPC addresses these challenges by decoupling the transport layer from the routing logic. Instead of mapping HTTP methods to specific URIs, sRPC treats the server-side logic as a navigable directory of actions.
<br>
<br>
<br>



## 1.1 Goals
The primary goals of this specification are:

    Automatic Discovery: To allow clients to invoke server-side functions based on class/method hierarchy without manual route registration.

    Uniform Resource Interaction: To standardize data operations through the FLUID pattern.

    Protocol Agnostic: While primarily implemented over HTTP, the action-based nature of sRPC allows it to be used in IoT and specialized hardware environments.



# Protocol Errors
sRPC :: ENDPOINT NOT FOUND -> 404 Not Found (ex. /api/wrong_path)
sRPC :: ACTION NOT SET     -> 400 Bad Request (ex. /api/user or /api/user?m=)
sRPC :: ACTION NOT VALID   -> 400 Bad Request (ex. /api/user?m=InvalidName)
sRPC :: CLASS NOT FOUND    -> 404 Not Found (ex. /api/user?m=Snake.fly)
sRPC :: METHOD NOT FOUND   -> 404 Not Found (ex. /api/user?m=User.fly)