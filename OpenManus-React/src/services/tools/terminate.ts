import { BaseTool, ToolResult } from './base';

export class Terminate implements BaseTool {
  name = 'terminate';
  description = 'Terminate the current execution';
  parameters = {
    type: 'object',
    properties: {
      reason: {
        type: 'string',
        description: 'Reason for termination'
      }
    },
    required: ['reason']
  };

  async execute({ reason }: { reason: string }): Promise<ToolResult> {
    return {
      success: true,
      output: `Task terminated: ${reason}`,
      metadata: { terminationReason: reason }
    };
  }
}
