import { ToolCollection } from './tools/collection';
import { PythonExecute } from './tools/python-execute';
import { FileSaver } from './tools/file-saver';
import { BrowserUseTool } from './tools/browser-use';

interface PythonExecuteResponse {
  output: string;
  success: boolean;
  error?: string;
  metadata?: {
    memoryUsage?: number;
    errorLine?: number;
  };
}

interface ToolResponse {
  success: boolean;
  output: string;
  error?: string;
  metadata?: {
    memoryUsage?: number;
    executionTime?: number;
  };
}

// Create tool collection with all tools
export const toolCollection = new ToolCollection(
  new PythonExecute(),
  new FileSaver(),
  new BrowserUseTool()
);

// Export execution functions
export const executePythonCode = async (code: string, timeout: number = 5000) => {
  return toolCollection.execute('python_execute', { code });
};

export const saveFile = async (
  content: string, 
  filename: string
): Promise<ToolResponse> => {
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
      error: String(error)
    };
  }
};

export const openBrowser = async (url: string): Promise<void> => {
  window.open(url, '_blank');
};

export const googleSearch = async (query: string): Promise<string[]> => {
  // In a real implementation, this would connect to a search API
  return [`Search results for: ${query}`];
};
