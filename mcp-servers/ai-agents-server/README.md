# FlyOver Teaching AI Agents MCP Server

This MCP (Model Context Protocol) server provides specialized AI agent expertise for developing the FlyOver Teaching application. It makes 12 domain-specific agents available as resources and tools that Claude Code can access.

## Available AI Agents

1. **Google Apps Script Specialist** - GAS optimization, batch operations, Google Workspace APIs
2. **Vue.js Component Builder** - Vue 3 components via CDN with GAS integration
3. **Data Visualization Expert** - Chart.js for educational data and IEP tracking
4. **IEP/SPED Domain Expert** - IDEA compliance and special education best practices
5. **Educational UX Designer** - Teacher-friendly interfaces and accessibility
6. **Automated Testing Specialist** - GAS testing, Vue tests, Playwright E2E
7. **Data Integrity Validator** - Data consistency and referential integrity
8. **CLASP Deployment Specialist** - Multi-environment deployment and CI/CD
9. **Documentation Generator** - Automated API docs and user guides
10. **Performance Optimizer** - GAS execution and Vue rendering optimization
11. **Security & Compliance Agent** - FERPA compliance and data privacy
12. **Integration Specialist** - Google Workspace and third-party integrations

## Installation

```bash
cd mcp-servers/ai-agents-server
npm install
```

## Configuration

Add to your Claude Desktop configuration (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

```json
{
  "mcpServers": {
    "flyover-ai-agents": {
      "command": "node",
      "args": ["/path/to/Teacher_Schedule/mcp-servers/ai-agents-server/index.js"],
      "env": {}
    }
  }
}
```

## Usage in Claude Code

Once configured, Claude Code will have access to:

### Resources
- `agent://gas-specialist` - Google Apps Script expertise
- `agent://vue-builder` - Vue.js component patterns
- `agent://data-viz` - Data visualization guidance
- `agent://iep-expert` - IEP/SPED compliance
- And 8 more specialized agents...

### Tools

#### `consult_agent`
Consult an AI agent for expertise in a specific domain.

```javascript
// Example usage
consult_agent({
  agent: "gas-specialist",
  query: "How do I optimize batch operations for reading 1000 cells?",
  context: { sheetSize: 1000, operation: "read" }
})
```

#### `generate_code`
Generate code using agent expertise.

```javascript
generate_code({
  agent: "vue-builder",
  task: "Create a behavior tracking component",
  requirements: ["Use Vue 3 composition API", "Include Chart.js visualization"]
})
```

#### `review_code`
Review code using agent expertise.

```javascript
review_code({
  agent: "security",
  code: "function saveStudentData() { ... }",
  focus: "FERPA compliance"
})
```

#### `get_best_practices`
Get best practices from an agent.

```javascript
get_best_practices({
  agent: "performance",
  topic: "Google Apps Script optimization"
})
```

## How It Works

1. **Agent Knowledge Base**: Each agent has a comprehensive markdown file containing:
   - Domain expertise
   - Code patterns and examples
   - Best practices
   - Common pitfalls
   - Implementation strategies

2. **Context Extraction**: When consulted, the server:
   - Loads the relevant agent's knowledge
   - Extracts sections relevant to your query
   - Provides code examples and patterns
   - Generates recommendations

3. **Code Generation**: The server can:
   - Synthesize code from agent patterns
   - Apply your specific requirements
   - Follow domain best practices

4. **Code Review**: Agents can:
   - Identify issues in your code
   - Suggest improvements
   - Check compliance (FERPA, accessibility, etc.)

## Benefits

- **Consistent Expertise**: Always have access to specialized knowledge
- **Code Quality**: Follow best practices automatically
- **Faster Development**: Get instant answers and code generation
- **Compliance**: Ensure FERPA and accessibility requirements
- **Learning**: Learn from expert patterns and examples

## Example Workflow

1. **Planning Phase**
   ```
   Claude: "I'll consult the IEP expert for data collection requirements..."
   [Uses consult_agent tool]
   ```

2. **Implementation Phase**
   ```
   Claude: "Let me generate the component using the Vue builder agent..."
   [Uses generate_code tool]
   ```

3. **Optimization Phase**
   ```
   Claude: "I'll have the performance optimizer review this code..."
   [Uses review_code tool]
   ```

4. **Security Check**
   ```
   Claude: "Let me verify FERPA compliance with the security agent..."
   [Uses get_best_practices tool]
   ```

## Development

To add new agents or modify existing ones:

1. Add/edit markdown files in `../../ai-agents/`
2. Update `AI_AGENTS` object in `index.js`
3. Restart the MCP server

## Troubleshooting

- **Server not starting**: Check Node.js version (requires v16+)
- **Agents not available**: Verify file paths in index.js
- **Tools not working**: Check Claude Desktop configuration
- **No responses**: Enable debug logging in server

## License

MIT