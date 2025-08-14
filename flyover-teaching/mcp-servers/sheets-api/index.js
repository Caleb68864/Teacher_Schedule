import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { google } from 'googleapis';
import { authenticate } from '@google-cloud/local-auth';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class GoogleSheetsAPIServer {
  constructor() {
    this.server = new Server({
      name: 'sheets-api',
      version: '1.0.0',
    }, {
      capabilities: {
        tools: {},
      },
    });

    this.auth = null;
    this.sheets = null;
    this.spreadsheetId = null;
    this.setupTools();
  }

  setupTools() {
    this.server.setRequestHandler('tools/list', async () => ({
      tools: [
        {
          name: 'authenticate',
          description: 'Authenticate with Google Sheets API',
          inputSchema: {
            type: 'object',
            properties: {
              credentialsPath: {
                type: 'string',
                description: 'Path to credentials.json file'
              }
            }
          }
        },
        {
          name: 'create_spreadsheet',
          description: 'Create a new Google Spreadsheet',
          inputSchema: {
            type: 'object',
            properties: {
              title: {
                type: 'string',
                default: 'FlyOver Teaching'
              }
            }
          }
        },
        {
          name: 'open_spreadsheet',
          description: 'Open an existing spreadsheet',
          inputSchema: {
            type: 'object',
            properties: {
              spreadsheetId: { type: 'string' }
            },
            required: ['spreadsheetId']
          }
        },
        {
          name: 'create_sheet',
          description: 'Create a new sheet/tab in the spreadsheet',
          inputSchema: {
            type: 'object',
            properties: {
              sheetName: { type: 'string' },
              headers: {
                type: 'array',
                items: { type: 'string' }
              }
            },
            required: ['sheetName']
          }
        },
        {
          name: 'read_sheet',
          description: 'Read data from a sheet',
          inputSchema: {
            type: 'object',
            properties: {
              sheetName: { type: 'string' },
              range: {
                type: 'string',
                description: 'A1 notation range (e.g., A1:E10)'
              }
            },
            required: ['sheetName']
          }
        },
        {
          name: 'write_data',
          description: 'Write data to a sheet',
          inputSchema: {
            type: 'object',
            properties: {
              sheetName: { type: 'string' },
              range: { type: 'string' },
              values: {
                type: 'array',
                items: {
                  type: 'array',
                  items: { type: 'string' }
                }
              }
            },
            required: ['sheetName', 'values']
          }
        },
        {
          name: 'append_row',
          description: 'Append a row to a sheet',
          inputSchema: {
            type: 'object',
            properties: {
              sheetName: { type: 'string' },
              values: {
                type: 'array',
                items: { type: 'string' }
              }
            },
            required: ['sheetName', 'values']
          }
        },
        {
          name: 'delete_row',
          description: 'Delete a row from a sheet',
          inputSchema: {
            type: 'object',
            properties: {
              sheetName: { type: 'string' },
              rowIndex: { type: 'number' }
            },
            required: ['sheetName', 'rowIndex']
          }
        },
        {
          name: 'batch_update',
          description: 'Perform batch updates on the spreadsheet',
          inputSchema: {
            type: 'object',
            properties: {
              requests: {
                type: 'array',
                description: 'Array of update requests'
              }
            },
            required: ['requests']
          }
        },
        {
          name: 'export_as_json',
          description: 'Export sheet data as JSON',
          inputSchema: {
            type: 'object',
            properties: {
              sheetName: { type: 'string' }
            },
            required: ['sheetName']
          }
        },
        {
          name: 'import_from_json',
          description: 'Import JSON data to a sheet',
          inputSchema: {
            type: 'object',
            properties: {
              sheetName: { type: 'string' },
              jsonData: {
                type: 'array',
                items: { type: 'object' }
              }
            },
            required: ['sheetName', 'jsonData']
          }
        },
        {
          name: 'test_data_seed',
          description: 'Seed test data for development',
          inputSchema: {
            type: 'object',
            properties: {
              dataType: {
                type: 'string',
                enum: ['schedule', 'students', 'all']
              }
            },
            required: ['dataType']
          }
        }
      ],
    }));

    this.server.setRequestHandler('tools/call', async (request) => {
      const { name, arguments: args } = request.params;

      switch (name) {
        case 'authenticate':
          return await this.authenticate(args);
        
        case 'create_spreadsheet':
          return await this.createSpreadsheet(args);
        
        case 'open_spreadsheet':
          return await this.openSpreadsheet(args);
        
        case 'create_sheet':
          return await this.createSheet(args);
        
        case 'read_sheet':
          return await this.readSheet(args);
        
        case 'write_data':
          return await this.writeData(args);
        
        case 'append_row':
          return await this.appendRow(args);
        
        case 'delete_row':
          return await this.deleteRow(args);
        
        case 'batch_update':
          return await this.batchUpdate(args);
        
        case 'export_as_json':
          return await this.exportAsJSON(args);
        
        case 'import_from_json':
          return await this.importFromJSON(args);
        
        case 'test_data_seed':
          return await this.seedTestData(args);
        
        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    });
  }

  async authenticate(args) {
    const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
    const TOKEN_PATH = path.join(__dirname, 'token.json');
    const CREDENTIALS_PATH = args.credentialsPath || path.join(__dirname, 'credentials.json');

    try {
      // Try to load saved token
      const tokenContent = await fs.readFile(TOKEN_PATH, 'utf-8');
      const token = JSON.parse(tokenContent);
      this.auth = google.auth.fromJSON(token);
    } catch {
      // Authenticate and save token
      this.auth = await authenticate({
        scopes: SCOPES,
        keyfilePath: CREDENTIALS_PATH,
      });
      
      // Save the token for future use
      const token = this.auth.credentials;
      await fs.writeFile(TOKEN_PATH, JSON.stringify(token));
    }

    this.sheets = google.sheets({ version: 'v4', auth: this.auth });
    
    return {
      content: [{
        type: 'text',
        text: 'Successfully authenticated with Google Sheets API'
      }]
    };
  }

  async createSpreadsheet(args) {
    if (!this.sheets) throw new Error('Not authenticated');
    
    const resource = {
      properties: {
        title: args.title || 'FlyOver Teaching',
      },
      sheets: [
        { properties: { title: 'Schedule' } },
        { properties: { title: 'Students' } },
        { properties: { title: 'Grades' } },
        { properties: { title: 'Assignments' } },
        { properties: { title: 'Settings' } },
      ],
    };

    const response = await this.sheets.spreadsheets.create({
      resource,
      fields: 'spreadsheetId,spreadsheetUrl',
    });

    this.spreadsheetId = response.data.spreadsheetId;
    
    // Initialize headers for each sheet
    await this.initializeSheetHeaders();
    
    return {
      content: [{
        type: 'text',
        text: `Created spreadsheet: ${response.data.spreadsheetUrl}\nID: ${this.spreadsheetId}`
      }]
    };
  }

  async initializeSheetHeaders() {
    const headers = {
      Schedule: ['id', 'day', 'time', 'subject', 'students', 'grade', 'type', 'icon', 'color', 'note'],
      Students: ['id', 'firstName', 'lastName', 'grade', 'email', 'parentEmail', 'notes'],
      Grades: ['id', 'studentId', 'subject', 'assignment', 'score', 'maxScore', 'date', 'notes'],
      Assignments: ['id', 'subject', 'title', 'description', 'dueDate', 'points', 'category'],
      Settings: ['key', 'value', 'description']
    };

    for (const [sheetName, sheetHeaders] of Object.entries(headers)) {
      await this.writeData({
        sheetName,
        range: 'A1',
        values: [sheetHeaders]
      });
    }
  }

  async openSpreadsheet(args) {
    if (!this.sheets) throw new Error('Not authenticated');
    
    this.spreadsheetId = args.spreadsheetId;
    
    const response = await this.sheets.spreadsheets.get({
      spreadsheetId: this.spreadsheetId,
    });
    
    return {
      content: [{
        type: 'text',
        text: `Opened spreadsheet: ${response.data.properties.title}`
      }]
    };
  }

  async createSheet(args) {
    if (!this.sheets || !this.spreadsheetId) {
      throw new Error('No spreadsheet open');
    }
    
    const request = {
      spreadsheetId: this.spreadsheetId,
      resource: {
        requests: [{
          addSheet: {
            properties: {
              title: args.sheetName,
            },
          },
        }],
      },
    };
    
    await this.sheets.spreadsheets.batchUpdate(request);
    
    // Add headers if provided
    if (args.headers) {
      await this.writeData({
        sheetName: args.sheetName,
        range: 'A1',
        values: [args.headers]
      });
    }
    
    return {
      content: [{
        type: 'text',
        text: `Created sheet: ${args.sheetName}`
      }]
    };
  }

  async readSheet(args) {
    if (!this.sheets || !this.spreadsheetId) {
      throw new Error('No spreadsheet open');
    }
    
    const range = args.range ? `${args.sheetName}!${args.range}` : args.sheetName;
    
    const response = await this.sheets.spreadsheets.values.get({
      spreadsheetId: this.spreadsheetId,
      range,
    });
    
    return {
      content: [{
        type: 'text',
        text: JSON.stringify(response.data.values, null, 2)
      }]
    };
  }

  async writeData(args) {
    if (!this.sheets || !this.spreadsheetId) {
      throw new Error('No spreadsheet open');
    }
    
    const range = args.range ? `${args.sheetName}!${args.range}` : args.sheetName;
    
    const response = await this.sheets.spreadsheets.values.update({
      spreadsheetId: this.spreadsheetId,
      range,
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: args.values,
      },
    });
    
    return {
      content: [{
        type: 'text',
        text: `Updated ${response.data.updatedCells} cells`
      }]
    };
  }

  async appendRow(args) {
    if (!this.sheets || !this.spreadsheetId) {
      throw new Error('No spreadsheet open');
    }
    
    const response = await this.sheets.spreadsheets.values.append({
      spreadsheetId: this.spreadsheetId,
      range: args.sheetName,
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [args.values],
      },
    });
    
    return {
      content: [{
        type: 'text',
        text: `Appended row to ${args.sheetName}`
      }]
    };
  }

  async deleteRow(args) {
    if (!this.sheets || !this.spreadsheetId) {
      throw new Error('No spreadsheet open');
    }
    
    // Get sheet ID
    const spreadsheet = await this.sheets.spreadsheets.get({
      spreadsheetId: this.spreadsheetId,
    });
    
    const sheet = spreadsheet.data.sheets.find(
      s => s.properties.title === args.sheetName
    );
    
    if (!sheet) throw new Error(`Sheet ${args.sheetName} not found`);
    
    const request = {
      spreadsheetId: this.spreadsheetId,
      resource: {
        requests: [{
          deleteDimension: {
            range: {
              sheetId: sheet.properties.sheetId,
              dimension: 'ROWS',
              startIndex: args.rowIndex,
              endIndex: args.rowIndex + 1,
            },
          },
        }],
      },
    };
    
    await this.sheets.spreadsheets.batchUpdate(request);
    
    return {
      content: [{
        type: 'text',
        text: `Deleted row ${args.rowIndex} from ${args.sheetName}`
      }]
    };
  }

  async batchUpdate(args) {
    if (!this.sheets || !this.spreadsheetId) {
      throw new Error('No spreadsheet open');
    }
    
    const response = await this.sheets.spreadsheets.batchUpdate({
      spreadsheetId: this.spreadsheetId,
      resource: {
        requests: args.requests,
      },
    });
    
    return {
      content: [{
        type: 'text',
        text: `Completed ${response.data.replies.length} updates`
      }]
    };
  }

  async exportAsJSON(args) {
    const data = await this.readSheet({ sheetName: args.sheetName });
    const values = JSON.parse(data.content[0].text);
    
    if (!values || values.length < 2) {
      return {
        content: [{
          type: 'text',
          text: '[]'
        }]
      };
    }
    
    const headers = values[0];
    const rows = values.slice(1);
    
    const jsonData = rows.map(row => {
      const obj = {};
      headers.forEach((header, index) => {
        obj[header] = row[index] || '';
      });
      return obj;
    });
    
    return {
      content: [{
        type: 'text',
        text: JSON.stringify(jsonData, null, 2)
      }]
    };
  }

  async importFromJSON(args) {
    if (!args.jsonData || args.jsonData.length === 0) {
      return {
        content: [{
          type: 'text',
          text: 'No data to import'
        }]
      };
    }
    
    const headers = Object.keys(args.jsonData[0]);
    const values = [headers];
    
    args.jsonData.forEach(row => {
      values.push(headers.map(header => row[header] || ''));
    });
    
    await this.writeData({
      sheetName: args.sheetName,
      values
    });
    
    return {
      content: [{
        type: 'text',
        text: `Imported ${args.jsonData.length} rows to ${args.sheetName}`
      }]
    };
  }

  async seedTestData(args) {
    const testData = {
      schedule: [
        {
          id: '1',
          day: 'monday',
          time: '9:00 AM - 10:00 AM',
          subject: 'Mathematics',
          students: 'John Smith, Sarah Johnson, Mike Brown',
          grade: '4th',
          type: 'normal',
          icon: 'fa-calculator',
          color: '#2196F3',
          note: 'Chapter 5: Fractions'
        },
        {
          id: '2',
          day: 'monday',
          time: '10:15 AM - 11:15 AM',
          subject: 'Reading',
          students: 'Emily Davis, Chris Wilson, Lisa Anderson',
          grade: '3rd',
          type: 'normal',
          icon: 'fa-book',
          color: '#4CAF50',
          note: 'Reading comprehension exercises'
        },
        {
          id: '3',
          day: 'tuesday',
          time: '9:00 AM - 10:00 AM',
          subject: 'Science',
          students: 'John Smith, Emily Davis',
          grade: '4th',
          type: 'normal',
          icon: 'fa-flask',
          color: '#FF9800',
          note: 'Solar system project'
        }
      ],
      students: [
        { id: '1', firstName: 'John', lastName: 'Smith', grade: '4th', email: 'john.smith@school.edu' },
        { id: '2', firstName: 'Sarah', lastName: 'Johnson', grade: '4th', email: 'sarah.j@school.edu' },
        { id: '3', firstName: 'Mike', lastName: 'Brown', grade: '4th', email: 'mike.b@school.edu' },
        { id: '4', firstName: 'Emily', lastName: 'Davis', grade: '3rd', email: 'emily.d@school.edu' },
        { id: '5', firstName: 'Chris', lastName: 'Wilson', grade: '3rd', email: 'chris.w@school.edu' },
        { id: '6', firstName: 'Lisa', lastName: 'Anderson', grade: '3rd', email: 'lisa.a@school.edu' }
      ]
    };
    
    if (args.dataType === 'schedule' || args.dataType === 'all') {
      await this.importFromJSON({
        sheetName: 'Schedule',
        jsonData: testData.schedule
      });
    }
    
    if (args.dataType === 'students' || args.dataType === 'all') {
      await this.importFromJSON({
        sheetName: 'Students',
        jsonData: testData.students
      });
    }
    
    return {
      content: [{
        type: 'text',
        text: `Seeded test data for: ${args.dataType}`
      }]
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Google Sheets API MCP server running');
  }
}

const server = new GoogleSheetsAPIServer();
server.run().catch(console.error);