import { BaseTool, ToolResult } from './base';

export class FileSaver implements BaseTool {
  name = 'file_saver';
  description = 'Save files locally, such as txt, py, html, etc.';
  parameters = {
    type: 'object',
    properties: {
      content: {
        type: 'string',
        description: 'File content to save'
      },
      filename: {
        type: 'string',
        description: 'Name of the file with extension'
      }
    },
    required: ['content', 'filename']
  };

  async execute({ content, filename }: { content: string; filename: string }): Promise<ToolResult> {
    try {
      const blob = new Blob([content], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      window.URL.revokeObjectURL(url);
      
      return {
        success: true,
        output: `File ${filename} saved successfully`
      };
    } catch (error) {
      return {
        success: false,
        output: '',
        error: `Failed to save file: ${error}`
      };
    }
  }
}
