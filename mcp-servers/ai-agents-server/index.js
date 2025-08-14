#!/usr/bin/env node

/**
 * FlyOver Teaching AI Agents MCP Server
 * Provides specialized AI agent expertise as context and tools
 */

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
} = require('@modelcontextprotocol/sdk/types.js');
const fs = require('fs-extra');
const path = require('path');
const marked = require('marked');

// AI Agent definitions
const AI_AGENTS = {
  'gas-specialist': {
    name: 'Google Apps Script Specialist',
    description: 'Expert in GAS optimization, batch operations, and Google Workspace APIs',
    file: '1-gas-specialist.md',
    tools: ['optimize_gas_code', 'batch_operations', 'cache_strategy']
  },
  'vue-builder': {
    name: 'Vue.js Component Builder',
    description: 'Creates Vue 3 components via CDN with Google Apps Script integration',
    file: '2-vue-component-builder.md',
    tools: ['create_component', 'setup_reactivity', 'optimize_rendering']
  },
  'data-viz': {
    name: 'Data Visualization Expert',
    description: 'Chart.js specialist for educational data visualization and IEP tracking',
    file: '3-data-visualization.md',
    tools: ['create_chart', 'behavior_visualization', 'progress_monitoring']
  },
  'iep-expert': {
    name: 'IEP/SPED Domain Expert',
    description: 'IDEA compliance, special education best practices, and data collection',
    file: '4-iep-sped-expert.md',
    tools: ['iep_compliance_check', 'data_collection_setup', 'progress_report']
  },
  'ux-designer': {
    name: 'Educational UX Designer',
    description: 'Teacher-friendly interfaces, accessibility, and classroom-first design',
    file: '5-educational-ux-designer.md',
    tools: ['design_review', 'accessibility_audit', 'ui_optimization']
  },
  'test-automation': {
    name: 'Automated Testing Specialist',
    description: 'GAS testing, Vue component tests, and Playwright E2E automation',
    file: '6-automated-testing.md',
    tools: ['create_test_suite', 'e2e_test', 'coverage_report']
  },
  'data-integrity': {
    name: 'Data Integrity Validator',
    description: 'Ensures data consistency, referential integrity, and validation',
    file: '7-data-integrity-validator.md',
    tools: ['validate_data', 'check_integrity', 'cleanup_duplicates']
  },
  'clasp-deploy': {
    name: 'CLASP Deployment Specialist',
    description: 'Multi-environment deployment, version control, and CI/CD pipelines',
    file: '8-clasp-deployment.md',
    tools: ['deploy_script', 'manage_environments', 'rollback']
  },
  'doc-generator': {
    name: 'Documentation Generator',
    description: 'Automated API docs, user guides, and training materials',
    file: '9-documentation-generator.md',
    tools: ['generate_docs', 'create_guide', 'api_documentation']
  },
  'performance': {
    name: 'Performance Optimizer',
    description: 'GAS execution optimization, Vue rendering, and memory management',
    file: '10-performance-optimizer.md',
    tools: ['optimize_performance', 'profile_code', 'memory_analysis']
  },
  'security': {
    name: 'Security & Compliance Agent',
    description: 'FERPA compliance, data privacy, and security best practices',
    file: '11-security-compliance.md',
    tools: ['security_audit', 'ferpa_check', 'vulnerability_scan']
  },
  'integration': {
    name: 'Integration Specialist',
    description: 'Google Workspace, SIS systems, and third-party tool integration',
    file: '12-integration-specialist.md',
    tools: ['setup_integration', 'sync_data', 'webhook_handler']
  }
};

class AIAgentsMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: 'flyover-ai-agents',
        version: '1.0.0',
      },
      {
        capabilities: {
          resources: {},
          tools: {},
        },
      }
    );

    this.agentsPath = path.join(__dirname, '../../ai-agents');
    this.setupHandlers();
  }

  setupHandlers() {
    // List available resources (agent files)
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
      const resources = Object.entries(AI_AGENTS).map(([key, agent]) => ({
        uri: `agent://${key}`,
        name: agent.name,
        description: agent.description,
        mimeType: 'text/markdown',
      }));

      return { resources };
    });

    // Read agent content
    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      const uri = request.params.uri;
      const agentKey = uri.replace('agent://', '');
      const agent = AI_AGENTS[agentKey];

      if (!agent) {
        throw new Error(`Agent not found: ${agentKey}`);
      }

      const filePath = path.join(this.agentsPath, agent.file);
      
      try {
        const content = await fs.readFile(filePath, 'utf-8');
        
        return {
          contents: [
            {
              uri,
              mimeType: 'text/markdown',
              text: content,
            },
          ],
        };
      } catch (error) {
        throw new Error(`Failed to read agent file: ${error.message}`);
      }
    });

    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      const tools = [];

      // General consultation tool
      tools.push({
        name: 'consult_agent',
        description: 'Consult an AI agent for expertise in a specific domain',
        inputSchema: {
          type: 'object',
          properties: {
            agent: {
              type: 'string',
              enum: Object.keys(AI_AGENTS),
              description: 'The agent to consult',
            },
            query: {
              type: 'string',
              description: 'Your question or task for the agent',
            },
            context: {
              type: 'object',
              description: 'Additional context for the agent',
            },
          },
          required: ['agent', 'query'],
        },
      });

      // Code generation tool
      tools.push({
        name: 'generate_code',
        description: 'Generate code using agent expertise',
        inputSchema: {
          type: 'object',
          properties: {
            agent: {
              type: 'string',
              enum: Object.keys(AI_AGENTS),
              description: 'The agent to use for code generation',
            },
            task: {
              type: 'string',
              description: 'What code to generate',
            },
            requirements: {
              type: 'array',
              items: { type: 'string' },
              description: 'Specific requirements',
            },
          },
          required: ['agent', 'task'],
        },
      });

      // Review tool
      tools.push({
        name: 'review_code',
        description: 'Review code using agent expertise',
        inputSchema: {
          type: 'object',
          properties: {
            agent: {
              type: 'string',
              enum: Object.keys(AI_AGENTS),
              description: 'The agent to perform the review',
            },
            code: {
              type: 'string',
              description: 'Code to review',
            },
            focus: {
              type: 'string',
              description: 'Specific aspect to focus on',
            },
          },
          required: ['agent', 'code'],
        },
      });

      // Best practices tool
      tools.push({
        name: 'get_best_practices',
        description: 'Get best practices from an agent',
        inputSchema: {
          type: 'object',
          properties: {
            agent: {
              type: 'string',
              enum: Object.keys(AI_AGENTS),
              description: 'The agent to consult',
            },
            topic: {
              type: 'string',
              description: 'Specific topic or area',
            },
          },
          required: ['agent', 'topic'],
        },
      });

      return { tools };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      switch (name) {
        case 'consult_agent':
          return await this.consultAgent(args);
        case 'generate_code':
          return await this.generateCode(args);
        case 'review_code':
          return await this.reviewCode(args);
        case 'get_best_practices':
          return await this.getBestPractices(args);
        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    });
  }

  async consultAgent(args) {
    const { agent: agentKey, query, context } = args;
    const agent = AI_AGENTS[agentKey];

    if (!agent) {
      throw new Error(`Unknown agent: ${agentKey}`);
    }

    // Load agent knowledge
    const filePath = path.join(this.agentsPath, agent.file);
    const agentContent = await fs.readFile(filePath, 'utf-8');

    // Extract relevant sections based on query
    const relevantSections = this.extractRelevantSections(agentContent, query);

    // Format response
    const response = {
      agent: agent.name,
      query: query,
      expertise: relevantSections,
      recommendations: this.generateRecommendations(agentKey, query, context),
      codeExamples: this.extractCodeExamples(agentContent, query),
    };

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(response, null, 2),
        },
      ],
    };
  }

  async generateCode(args) {
    const { agent: agentKey, task, requirements } = args;
    const agent = AI_AGENTS[agentKey];

    if (!agent) {
      throw new Error(`Unknown agent: ${agentKey}`);
    }

    // Load agent knowledge
    const filePath = path.join(this.agentsPath, agent.file);
    const agentContent = await fs.readFile(filePath, 'utf-8');

    // Extract code patterns
    const codePatterns = this.extractCodePatterns(agentContent, task);
    
    // Generate code based on patterns and requirements
    const generatedCode = this.synthesizeCode(codePatterns, requirements);

    return {
      content: [
        {
          type: 'text',
          text: `// Generated by ${agent.name}\n// Task: ${task}\n\n${generatedCode}`,
        },
      ],
    };
  }

  async reviewCode(args) {
    const { agent: agentKey, code, focus } = args;
    const agent = AI_AGENTS[agentKey];

    if (!agent) {
      throw new Error(`Unknown agent: ${agentKey}`);
    }

    // Load agent knowledge
    const filePath = path.join(this.agentsPath, agent.file);
    const agentContent = await fs.readFile(filePath, 'utf-8');

    // Extract best practices and patterns
    const bestPractices = this.extractBestPractices(agentContent, focus);
    
    // Analyze code
    const review = {
      agent: agent.name,
      focus: focus || 'general',
      issues: this.identifyIssues(code, bestPractices),
      suggestions: this.generateSuggestions(code, bestPractices),
      improvedCode: this.suggestImprovements(code, bestPractices),
    };

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(review, null, 2),
        },
      ],
    };
  }

  async getBestPractices(args) {
    const { agent: agentKey, topic } = args;
    const agent = AI_AGENTS[agentKey];

    if (!agent) {
      throw new Error(`Unknown agent: ${agentKey}`);
    }

    // Load agent knowledge
    const filePath = path.join(this.agentsPath, agent.file);
    const agentContent = await fs.readFile(filePath, 'utf-8');

    // Extract best practices section
    const bestPractices = this.extractBestPractices(agentContent, topic);

    return {
      content: [
        {
          type: 'text',
          text: `# Best Practices from ${agent.name}\n\nTopic: ${topic}\n\n${bestPractices}`,
        },
      ],
    };
  }

  // Helper methods
  extractRelevantSections(content, query) {
    const lines = content.split('\n');
    const sections = [];
    let currentSection = null;
    let sectionContent = [];

    for (const line of lines) {
      if (line.startsWith('##')) {
        if (currentSection && this.isRelevant(currentSection, query)) {
          sections.push({
            title: currentSection,
            content: sectionContent.join('\n'),
          });
        }
        currentSection = line.replace(/^#+\s+/, '');
        sectionContent = [];
      } else {
        sectionContent.push(line);
      }
    }

    // Check last section
    if (currentSection && this.isRelevant(currentSection, query)) {
      sections.push({
        title: currentSection,
        content: sectionContent.join('\n'),
      });
    }

    return sections;
  }

  extractCodeExamples(content, query) {
    const codeBlocks = [];
    const regex = /```(?:javascript|js|typescript|ts)?\n([\s\S]*?)```/g;
    let match;

    while ((match = regex.exec(content)) !== null) {
      const code = match[1];
      if (this.isRelevant(code, query)) {
        codeBlocks.push(code.trim());
      }
    }

    return codeBlocks;
  }

  extractCodePatterns(content, task) {
    const patterns = [];
    const codeBlocks = this.extractCodeExamples(content, task);
    
    // Extract patterns from code blocks
    for (const code of codeBlocks) {
      if (this.isRelevantPattern(code, task)) {
        patterns.push(code);
      }
    }

    return patterns;
  }

  extractBestPractices(content, topic) {
    const sections = this.extractRelevantSections(content, topic || 'best practices');
    const practices = sections
      .filter(s => s.title.toLowerCase().includes('best practice') || 
                   s.title.toLowerCase().includes('recommendation'))
      .map(s => s.content)
      .join('\n\n');

    return practices || 'No specific best practices found for this topic.';
  }

  isRelevant(text, query) {
    const queryWords = query.toLowerCase().split(/\s+/);
    const textLower = text.toLowerCase();
    
    return queryWords.some(word => textLower.includes(word));
  }

  isRelevantPattern(code, task) {
    const taskKeywords = task.toLowerCase().split(/\s+/);
    const codeLower = code.toLowerCase();
    
    return taskKeywords.filter(keyword => codeLower.includes(keyword)).length >= 2;
  }

  generateRecommendations(agentKey, query, context) {
    // Generate contextual recommendations based on agent expertise
    const recommendations = [];
    
    switch (agentKey) {
      case 'gas-specialist':
        recommendations.push('Use batch operations to minimize API calls');
        recommendations.push('Implement caching with CacheService');
        break;
      case 'vue-builder':
        recommendations.push('Use computed properties for expensive calculations');
        recommendations.push('Implement virtual scrolling for large lists');
        break;
      case 'security':
        recommendations.push('Ensure FERPA compliance for student data');
        recommendations.push('Implement audit logging for all data access');
        break;
      // Add more agent-specific recommendations
    }

    return recommendations;
  }

  synthesizeCode(patterns, requirements) {
    // Simple code synthesis (in real implementation, would be more sophisticated)
    if (patterns.length === 0) {
      return '// No code patterns found for this task';
    }

    let synthesized = patterns[0];
    
    // Apply requirements as comments
    if (requirements && requirements.length > 0) {
      synthesized = `// Requirements:\n${requirements.map(r => `// - ${r}`).join('\n')}\n\n${synthesized}`;
    }

    return synthesized;
  }

  identifyIssues(code, bestPractices) {
    const issues = [];
    
    // Simple pattern matching for common issues
    if (code.includes('getValue()') && code.includes('for')) {
      issues.push('Avoid getValue() in loops - use batch operations');
    }
    
    if (!code.includes('try') && !code.includes('catch')) {
      issues.push('Missing error handling');
    }
    
    if (code.includes('var ')) {
      issues.push('Use const/let instead of var');
    }

    return issues;
  }

  generateSuggestions(code, bestPractices) {
    const suggestions = [];
    
    // Generate suggestions based on code analysis
    if (code.length > 100 && !code.includes('function')) {
      suggestions.push('Consider breaking down into smaller functions');
    }
    
    if (!code.includes('/**') && !code.includes('//')) {
      suggestions.push('Add documentation comments');
    }

    return suggestions;
  }

  suggestImprovements(code, bestPractices) {
    // Simple improvements (in real implementation, would be more sophisticated)
    let improved = code;
    
    // Replace var with const/let
    improved = improved.replace(/\bvar\s+/g, 'const ');
    
    // Add basic error handling if missing
    if (!improved.includes('try')) {
      improved = `try {\n${improved}\n} catch (error) {\n  console.error('Error:', error);\n  throw error;\n}`;
    }

    return improved;
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('FlyOver AI Agents MCP Server running');
  }
}

// Start the server
const server = new AIAgentsMCPServer();
server.run().catch(console.error);