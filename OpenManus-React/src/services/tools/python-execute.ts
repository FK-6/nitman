import { BaseTool, ToolResult } from './base';
import { openManusSocket } from '../websocket';

export class PythonExecute implements BaseTool {
  name = 'python_execute';
  description = 'Executes Python code string. Note: Only print outputs are visible, function return values are not captured.';
  parameters = {
    type: 'object',
    properties: {
      code: {
        type: 'string',
        description: 'The Python code to execute.'
      }
    },
    required: ['code']
  };

  async execute({ code }: { code: string }): Promise<ToolResult> {
    return new Promise((resolve, reject) => {
      let output = '';
      const timeoutDuration = 5000;
      let timeoutId: NodeJS.Timeout;

      const cleanup = openManusSocket.subscribe((data) => {
        if (data.type === 'output') {
          output += data.content;
        } else if (data.type === 'error') {
          cleanup();
          clearTimeout(timeoutId);
          resolve({
            success: false,
            output: '',
            error: data.content
          });
        } else if (data.type === 'done') {
          cleanup();
          clearTimeout(timeoutId);
          resolve({
            success: true,
            output,
            metadata: data.metadata
          });
        }
      });

      timeoutId = setTimeout(() => {
        cleanup();
        resolve({
          success: false,
          output,
          error: `Execution timeout after ${timeoutDuration}ms`
        });
      }, timeoutDuration);

      openManusSocket.execute(code);
    });
  }
}
