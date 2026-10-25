# When to mock

Mock at **system boundaries** only:

- External APIs (payment, email, etc.)
- Databases (sometimes; prefer a test DB)
- Time/randomness
- File system (sometimes)

Don't mock:

- Your own classes/modules
- Internal collaborators
- Anything you control

## Choosing doubles

Before replacing a real method, learn its side effects. Mock the slow or external operation and keep the side effects the test depends on real; when unsure, run the test against the real implementation first.

Make doubles specific and mirror the complete real response structure, not only the fields the current test reads. When arguments, call counts, or ordering are part of the boundary contract, assert them; do not assert a double's mere presence. When mock setup outgrows the test logic or the double keeps drifting from the real component, switch to an integration test with real components.

## Designing for mockability

At system boundaries, design interfaces that are easy to mock:

**1. Use dependency injection**

Pass external dependencies in rather than creating them internally:

```typescript
// Easy to mock
function processPayment(order, paymentClient) {
  return paymentClient.charge(order.total);
}

// Hard to mock
function processPayment(order) {
  const client = new StripeClient(process.env.STRIPE_KEY);
  return client.charge(order.total);
}
```

**2. Prefer SDK-style interfaces over generic fetchers**

Create specific functions for each external operation instead of one generic function with conditional logic:

```typescript
// GOOD: Each function is independently mockable
const api = {
  getUser: (id) => fetch(`/users/${id}`),
  getOrders: (userId) => fetch(`/users/${userId}/orders`),
  createOrder: (data) => fetch('/orders', { method: 'POST', body: data }),
};

// BAD: Mocking requires conditional logic inside the mock
const api = {
  fetch: (endpoint, options) => fetch(endpoint, options),
};
```

The SDK approach means:
- Each mock returns one specific shape
- No conditional logic in test setup
- Easier to see which endpoints a test exercises
- Type safety per endpoint
