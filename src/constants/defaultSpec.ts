export const DEFAULT_SPEC = `import { test, expect } from '@playwright/test';

test('Get single post', async ({ request }) => {
  const response = await request.get('/posts/1');
  expect(response.status()).toBe(200);
});

test('Create a post', async ({ request }) => {
  const response = await request.post('/posts', {
    data: {
      title: 'Playwright Test',
      body: 'Testing API with Playwright',
      userId: 1,
    },
  });
  expect(response.status()).toBe(201);
});

test('Get all posts', async ({ request }) => {
  const response = await request.get('/posts');
  expect(response.status()).toBe(200);
  const body = await response.json();
  expect(body.length).toBeGreaterThan(0);
});

test('Update post', async ({ request }) => {
  const response = await request.put('/posts/1', {
    data: {
      id: 1,
      title: 'Updated Title',
      body: 'Updated Body',
      userId: 1,
    },
  });
  expect(response.status()).toBe(200);
});`;
