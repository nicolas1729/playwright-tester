
import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: '.',
  reporter: 'json',
  use: {
    baseURL: 'https://jsonplaceholder.typicode.com',
  },
});
