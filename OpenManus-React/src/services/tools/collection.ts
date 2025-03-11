import { BaseTool, ToolResult } from './base';

export class ToolCollection {
  private tools: BaseTool[] = [];
  private toolMap: Map<string, BaseTool> = new Map();

  constructor(...tools: BaseTool[]) {
    tools.forEach(tool => this.addTool(tool));
  }

  addTool(tool: BaseTool): void {
    this.tools.push(tool);
    this.toolMap.set(tool.name, tool);
  }

  getTool(name: string): BaseTool | undefined {
    return this.toolMap.get(name);
  }

  getTools(): BaseTool[] {
    return [...this.tools];
  }

  async execute(name: string, args: any): Promise<ToolResult> {
    const tool = this.getTool(name);
    if (!tool) {
      return {
        success: false,
        output: '',
        error: `Tool ${name} not found`
      };
    }

    try {
      return await tool.execute(args);
    } catch (error) {
      return {
        success: false,
        output: '',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  toParams(): any[] {
    return this.tools.map(tool => ({
      name: tool.name,
      description: tool.description,
      parameters: tool.parameters
    }));
  }
}
