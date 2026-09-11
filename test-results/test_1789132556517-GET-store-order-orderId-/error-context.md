# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: test_1789132556517.spec.ts >> GET /store/order/{orderId}
- Location: test_1789132556517.spec.ts:53:1

# Error details

```
Error: expect(received).toBeTruthy()

Received: false
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | // Configuration de l'URL de base
  4  | const baseURL = 'https://petstore.swagger.io/v2';
  5  | 
  6  | test.use({
  7  |   baseURL,
  8  |   extraHTTPHeaders: {
  9  |     'Authorization': 'Basic dGVzdDptZHA=',
  10 |   },
  11 | });
  12 | 
  13 | /**
  14 |  * Finds Pets by status
  15 |  * Multiple status values can be provided with comma separated strings
  16 |  */
  17 | test('GET /pet/findByStatus', async ({ request }) => {
  18 |   const response = await request.get(`${baseURL}/pet/findByStatus`);
  19 |   expect(response.ok()).toBeTruthy();
  20 | });
  21 | 
  22 | /**
  23 |  * Finds Pets by tags
  24 |  * Multiple tags can be provided with comma separated strings. Use tag1, tag2, tag3 for testing.
  25 |  */
  26 | test('GET /pet/findByTags', async ({ request }) => {
  27 |   const response = await request.get(`${baseURL}/pet/findByTags`);
  28 |   expect(response.ok()).toBeTruthy();
  29 | });
  30 | 
  31 | /**
  32 |  * Find pet by ID
  33 |  * Returns a single pet
  34 |  */
  35 | test('GET /pet/{petId}', async ({ request }) => {
  36 |   const response = await request.get(`${baseURL}/pet/1`);
  37 |   expect(response.ok()).toBeTruthy();
  38 | });
  39 | 
  40 | /**
  41 |  * Returns pet inventories by status
  42 |  * Returns a map of status codes to quantities
  43 |  */
  44 | test('GET /store/inventory', async ({ request }) => {
  45 |   const response = await request.get(`${baseURL}/store/inventory`);
  46 |   expect(response.ok()).toBeTruthy();
  47 | });
  48 | 
  49 | /**
  50 |  * Find purchase order by ID
  51 |  * For valid response try integer IDs with value >= 1 and <= 10. Other values will generated exceptions
  52 |  */
  53 | test('GET /store/order/{orderId}', async ({ request }) => {
  54 |   const response = await request.get(`${baseURL}/store/order/1`);
> 55 |   expect(response.ok()).toBeTruthy();
     |                         ^ Error: expect(received).toBeTruthy()
  56 | });
  57 | 
  58 | /**
  59 |  * Get user by user name
  60 |  */
  61 | test('GET /user/{username}', async ({ request }) => {
  62 |   const response = await request.get(`${baseURL}/user/1`);
  63 |   expect(response.ok()).toBeTruthy();
  64 | });
  65 | 
  66 | /**
  67 |  * Logs user into the system
  68 |  */
  69 | test('GET /user/login', async ({ request }) => {
  70 |   const response = await request.get(`${baseURL}/user/login`);
  71 |   expect(response.ok()).toBeTruthy();
  72 | });
  73 | 
  74 | /**
  75 |  * Logs out current logged in user session
  76 |  */
  77 | test('GET /user/logout', async ({ request }) => {
  78 |   const response = await request.get(`${baseURL}/user/logout`);
  79 |   expect(response.ok()).toBeTruthy();
  80 | });
  81 | 
  82 | 
```