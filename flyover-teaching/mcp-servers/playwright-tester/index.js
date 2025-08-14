import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { chromium, firefox, webkit } from 'playwright';
import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class PlaywrightTesterServer {
  constructor() {
    this.server = new Server({
      name: 'playwright-tester',
      version: '1.0.0',
    }, {
      capabilities: {
        tools: {},
      },
    });

    this.browser = null;
    this.context = null;
    this.page = null;
    this.localServer = null;
    this.setupTools();
  }

  setupTools() {
    // Launch browser for testing
    this.server.setRequestHandler('tools/list', async () => ({
      tools: [
        {
          name: 'launch_browser',
          description: 'Launch a browser instance for testing',
          inputSchema: {
            type: 'object',
            properties: {
              browser: {
                type: 'string',
                enum: ['chromium', 'firefox', 'webkit'],
                default: 'chromium'
              },
              headless: {
                type: 'boolean',
                default: false
              }
            }
          }
        },
        {
          name: 'serve_local_app',
          description: 'Serve the app locally for testing',
          inputSchema: {
            type: 'object',
            properties: {
              port: {
                type: 'number',
                default: 3000
              }
            }
          }
        },
        {
          name: 'navigate_to',
          description: 'Navigate to a URL',
          inputSchema: {
            type: 'object',
            properties: {
              url: { type: 'string' }
            },
            required: ['url']
          }
        },
        {
          name: 'click_element',
          description: 'Click an element on the page',
          inputSchema: {
            type: 'object',
            properties: {
              selector: { type: 'string' }
            },
            required: ['selector']
          }
        },
        {
          name: 'fill_input',
          description: 'Fill an input field',
          inputSchema: {
            type: 'object',
            properties: {
              selector: { type: 'string' },
              value: { type: 'string' }
            },
            required: ['selector', 'value']
          }
        },
        {
          name: 'get_text',
          description: 'Get text content of an element',
          inputSchema: {
            type: 'object',
            properties: {
              selector: { type: 'string' }
            },
            required: ['selector']
          }
        },
        {
          name: 'wait_for_element',
          description: 'Wait for an element to appear',
          inputSchema: {
            type: 'object',
            properties: {
              selector: { type: 'string' },
              timeout: {
                type: 'number',
                default: 5000
              }
            },
            required: ['selector']
          }
        },
        {
          name: 'screenshot',
          description: 'Take a screenshot',
          inputSchema: {
            type: 'object',
            properties: {
              path: { type: 'string' },
              fullPage: {
                type: 'boolean',
                default: false
              }
            }
          }
        },
        {
          name: 'run_test_suite',
          description: 'Run automated test suite',
          inputSchema: {
            type: 'object',
            properties: {
              suite: {
                type: 'string',
                enum: ['schedule', 'students', 'export', 'full']
              }
            },
            required: ['suite']
          }
        },
        {
          name: 'close_browser',
          description: 'Close the browser instance',
          inputSchema: {
            type: 'object',
            properties: {}
          }
        }
      ],
    }));

    this.server.setRequestHandler('tools/call', async (request) => {
      const { name, arguments: args } = request.params;

      switch (name) {
        case 'launch_browser':
          return await this.launchBrowser(args);
        
        case 'serve_local_app':
          return await this.serveLocalApp(args);
        
        case 'navigate_to':
          return await this.navigateTo(args);
        
        case 'click_element':
          return await this.clickElement(args);
        
        case 'fill_input':
          return await this.fillInput(args);
        
        case 'get_text':
          return await this.getText(args);
        
        case 'wait_for_element':
          return await this.waitForElement(args);
        
        case 'screenshot':
          return await this.takeScreenshot(args);
        
        case 'run_test_suite':
          return await this.runTestSuite(args);
        
        case 'close_browser':
          return await this.closeBrowser();
        
        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    });
  }

  async launchBrowser(args) {
    const { browser = 'chromium', headless = false } = args;
    
    const browsers = { chromium, firefox, webkit };
    this.browser = await browsers[browser].launch({ headless });
    this.context = await this.browser.newContext();
    this.page = await this.context.newPage();
    
    return {
      content: [{
        type: 'text',
        text: `Launched ${browser} browser (headless: ${headless})`
      }]
    };
  }

  async serveLocalApp(args) {
    const { port = 3000 } = args;
    
    if (this.localServer) {
      this.localServer.close();
    }
    
    const app = express();
    const staticPath = join(__dirname, '../../src/frontend');
    
    app.use(express.static(staticPath));
    
    // Mock Google Apps Script API
    app.get('/mock-gas-api', (req, res) => {
      res.json({
        google: {
          script: {
            run: {
              getTableData: () => [
                { id: '1', day: 'monday', time: '9:00 AM', subject: 'Math', students: 'John, Sarah' }
              ],
              addScheduleEntry: () => true,
              deleteScheduleEntry: () => true
            }
          }
        }
      });
    });
    
    this.localServer = app.listen(port);
    
    return {
      content: [{
        type: 'text',
        text: `Local server started on http://localhost:${port}`
      }]
    };
  }

  async navigateTo(args) {
    if (!this.page) throw new Error('Browser not launched');
    
    await this.page.goto(args.url);
    
    return {
      content: [{
        type: 'text',
        text: `Navigated to ${args.url}`
      }]
    };
  }

  async clickElement(args) {
    if (!this.page) throw new Error('Browser not launched');
    
    await this.page.click(args.selector);
    
    return {
      content: [{
        type: 'text',
        text: `Clicked element: ${args.selector}`
      }]
    };
  }

  async fillInput(args) {
    if (!this.page) throw new Error('Browser not launched');
    
    await this.page.fill(args.selector, args.value);
    
    return {
      content: [{
        type: 'text',
        text: `Filled "${args.selector}" with "${args.value}"`
      }]
    };
  }

  async getText(args) {
    if (!this.page) throw new Error('Browser not launched');
    
    const text = await this.page.textContent(args.selector);
    
    return {
      content: [{
        type: 'text',
        text: text || '(empty)'
      }]
    };
  }

  async waitForElement(args) {
    if (!this.page) throw new Error('Browser not launched');
    
    await this.page.waitForSelector(args.selector, {
      timeout: args.timeout || 5000
    });
    
    return {
      content: [{
        type: 'text',
        text: `Element appeared: ${args.selector}`
      }]
    };
  }

  async takeScreenshot(args) {
    if (!this.page) throw new Error('Browser not launched');
    
    const path = args.path || `screenshot-${Date.now()}.png`;
    await this.page.screenshot({
      path,
      fullPage: args.fullPage || false
    });
    
    return {
      content: [{
        type: 'text',
        text: `Screenshot saved to ${path}`
      }]
    };
  }

  async runTestSuite(args) {
    if (!this.page) throw new Error('Browser not launched');
    
    const results = [];
    
    switch (args.suite) {
      case 'schedule':
        results.push(await this.testScheduleFeatures());
        break;
      
      case 'students':
        results.push(await this.testStudentFeatures());
        break;
      
      case 'export':
        results.push(await this.testExportFeatures());
        break;
      
      case 'full':
        results.push(await this.testScheduleFeatures());
        results.push(await this.testStudentFeatures());
        results.push(await this.testExportFeatures());
        break;
    }
    
    return {
      content: [{
        type: 'text',
        text: JSON.stringify(results, null, 2)
      }]
    };
  }

  async testScheduleFeatures() {
    const tests = [];
    
    try {
      // Test adding schedule entry
      await this.page.click('[data-test="add-schedule"]');
      await this.page.fill('[data-test="time-input"]', '10:00 AM');
      await this.page.fill('[data-test="subject-input"]', 'Test Subject');
      await this.page.click('[data-test="save-schedule"]');
      tests.push({ test: 'Add schedule entry', status: 'passed' });
    } catch (e) {
      tests.push({ test: 'Add schedule entry', status: 'failed', error: e.message });
    }
    
    return { suite: 'schedule', tests };
  }

  async testStudentFeatures() {
    const tests = [];
    
    try {
      // Test adding student
      await this.page.click('[data-test="students-tab"]');
      await this.page.click('[data-test="add-student"]');
      await this.page.fill('[data-test="firstname-input"]', 'Test');
      await this.page.fill('[data-test="lastname-input"]', 'Student');
      await this.page.click('[data-test="save-student"]');
      tests.push({ test: 'Add student', status: 'passed' });
    } catch (e) {
      tests.push({ test: 'Add student', status: 'failed', error: e.message });
    }
    
    return { suite: 'students', tests };
  }

  async testExportFeatures() {
    const tests = [];
    
    try {
      // Test PDF export
      await this.page.click('[data-test="export-tab"]');
      await this.page.click('[data-test="export-pdf"]');
      tests.push({ test: 'Export PDF', status: 'passed' });
    } catch (e) {
      tests.push({ test: 'Export PDF', status: 'failed', error: e.message });
    }
    
    return { suite: 'export', tests };
  }

  async closeBrowser() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.context = null;
      this.page = null;
    }
    
    if (this.localServer) {
      this.localServer.close();
      this.localServer = null;
    }
    
    return {
      content: [{
        type: 'text',
        text: 'Browser and server closed'
      }]
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Playwright Tester MCP server running');
  }
}

const server = new PlaywrightTesterServer();
server.run().catch(console.error);