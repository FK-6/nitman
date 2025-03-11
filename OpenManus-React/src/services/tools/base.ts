export interface ToolResult {
  success: boolean;
  output: string;
  error?: string;
  metadata?: Record<string, any>;
}

export interface BaseTool {
  name: string;
  description: string;
  parameters: {
    type: string;
    properties: Record<string, any>;
    required: string[];
  };
  execute(args: any): Promise<ToolResult>;
}

export class ToolError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ToolError';
  }
}
