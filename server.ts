import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';
import cors from 'cors';
import { request } from '@playwright/test';

const execAsync = promisify(exec);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // API Route for Playwright Spec Execution
  app.post('/api/run-spec', async (req, res) => {
    const { specCode } = req.body;
    const tempDir = path.join(process.cwd(), 'temp_tests');
    
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir);
    }

    const specPath = path.join(tempDir, `test_${Date.now()}.spec.ts`);
    const configPath = path.join(tempDir, `playwright.config.ts`);

    // Basic Playwright config
    const playwrightConfig = `
import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: '.',
  reporter: 'json',
  use: {
    baseURL: 'https://jsonplaceholder.typicode.com',
  },
});
`;

    try {
      fs.writeFileSync(specPath, specCode);
      if (!fs.existsSync(configPath)) {
        fs.writeFileSync(configPath, playwrightConfig);
      }

      // Run playwright test
      // We use --reporter=json to get structured output
      const { stdout, stderr } = await execAsync(`npx playwright test ${specPath} --config=${configPath} --reporter=json`, {
        timeout: 30000 // 30s timeout
      }).catch(err => {
        // Playwright exits with non-zero if tests fail, but we still want the JSON
        if (err.stdout) return { stdout: err.stdout, stderr: err.stderr };
        throw err;
      });

      let results;
      try {
        results = JSON.parse(stdout);
      } catch (e) {
        throw new Error(`Failed to parse Playwright output: ${stdout || stderr}`);
      }

      // Extract test results and durations
      const testRuns = results.suites?.[0]?.specs?.flatMap((spec: any) => 
        spec.tests.map((test: any) => ({
          name: spec.title,
          duration: test.results?.[0]?.duration || 0,
          status: test.results?.[0]?.status || 'unknown',
          error: test.results?.[0]?.error?.message || null,
          steps: test.results?.[0]?.steps?.map((step: any) => ({
            title: step.title,
            duration: step.duration,
            category: step.category
          })) || []
        }))
      ) || [];

      res.json({
        success: true,
        testRuns,
        raw: results
      });

      // Cleanup
      fs.unlinkSync(specPath);
    } catch (error: any) {
      console.error('Playwright Spec Error:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message,
        details: error.stderr || ''
      });
      if (fs.existsSync(specPath)) fs.unlinkSync(specPath);
    }
  });

  // API Route for Single Request (Legacy support or quick tests)
  app.post('/api/test', async (req, res) => {
    const { url, method, headers, body, assertions } = req.body;
    try {
      const requestContext = await request.newContext();
      const options: any = { headers: headers || {} };
      if (body && ['POST', 'PUT', 'PATCH'].includes(method)) {
        try { options.data = typeof body === 'string' ? JSON.parse(body) : body; } catch (e) { options.data = body; }
      }
      const startTime = Date.now();
      let response;
      switch (method.toUpperCase()) {
        case 'GET': response = await requestContext.get(url, options); break;
        case 'POST': response = await requestContext.post(url, options); break;
        case 'PUT': response = await requestContext.put(url, options); break;
        case 'DELETE': response = await requestContext.delete(url, options); break;
        case 'PATCH': response = await requestContext.patch(url, options); break;
        case 'HEAD': response = await requestContext.head(url, options); break;
        default: response = await requestContext.get(url, options);
      }
      const duration = Date.now() - startTime;
      const status = response.status();
      const responseHeaders = response.headers();
      let responseBody;
      try { responseBody = await response.json(); } catch (e) { responseBody = await response.text(); }
      const results = [];
      if (assertions) {
        if (assertions.expectedStatus) {
          results.push({ name: `Status is ${assertions.expectedStatus}`, passed: status === parseInt(assertions.expectedStatus), actual: status, expected: assertions.expectedStatus });
        }
        if (assertions.containsText) {
          const bodyStr = typeof responseBody === 'string' ? responseBody : JSON.stringify(responseBody);
          results.push({ name: `Body contains "${assertions.containsText}"`, passed: bodyStr.includes(assertions.containsText), actual: bodyStr.substring(0, 100) + '...', expected: assertions.containsText });
        }
      }
      res.json({ status, headers: responseHeaders, body: responseBody, duration, results });
      await requestContext.dispose();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
