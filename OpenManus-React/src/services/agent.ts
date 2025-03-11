import { logger } from './logger';
import { openManusSocket } from './websocket';

export enum AgentState {
  IDLE = 'idle',
  THINKING = 'thinking',
  ACTING = 'acting',
  FINISHED = 'finished'
}

interface ToolCall {
  id: string;
  function: {
    name: string;
    arguments: string;
  };
}

interface Message {
  role: string;
  content: string;
}

export class Agent {
  private state: AgentState = AgentState.IDLE;
  private tools: Map<string, Function> = new Map();
  private messages: Message[] = [];
  private maxSteps: number = 30;
  private currentStep: number = 0;

  constructor(name: string, description: string) {
    this.registerDefaultTools();
  }

  registerTool(name: string, handler: Function) {
    this.tools.set(name, handler);
  }

  private registerDefaultTools() {
    this.tools.set('python_execute', this.executePython);
    this.tools.set('browser_use', this.useBrowser);
    this.tools.set('file_saver', this.saveFile);
    this.tools.set('google_search', this.searchGoogle);
  }

  async think(input: string): Promise<boolean> {
    if (this.state === AgentState.FINISHED) {
      return false;
    }
    
    this.state = AgentState.THINKING;
    this.messages.push({ role: 'user', content: input });
    logger.info(`✨ Agent's thoughts: ${input}`);
    return true;
  }

  private handleTermination(result: string): boolean {
    if (result.includes('terminated') || this.currentStep >= this.maxSteps) {
      this.state = AgentState.FINISHED;
      return true;
    }
    return false;
  }

  async act(toolCalls: ToolCall[]): Promise<string> {
    this.state = AgentState.ACTING;
    if (!toolCalls?.length) return '';

    const results = await Promise.all(
      toolCalls.map(call => this.executeToolCall(call))
    );
    
    const result = results.join('\n\n');
    if (this.handleTermination(result)) {
      return result;
    }
    
    return result;
  }

  private async executeToolCall(call: ToolCall): Promise<string> {
    if (this.currentStep >= this.maxSteps) {
      this.state = AgentState.FINISHED;
      return 'Max steps reached';
    }
    
    this.currentStep++;
    
    const tool = this.tools.get(call.function.name);
    if (!tool) {
      logger.error(`Unknown tool: ${call.function.name}`);
      return `Error: Unknown tool ${call.function.name}`;
    }

    try {
      const args = JSON.parse(call.function.arguments);
      logger.info(`🛠️ Executing tool: ${call.function.name}`);
      
      const result = await tool(args);
      logger.info(`🎯 Tool ${call.function.name} completed with result: ${result}`);
      
      if (result.includes('error') || result.includes('failed')) {
        this.state = AgentState.FINISHED;
      }
      
      // Send result through WebSocket
      openManusSocket.sendToolResult({
        tool: call.function.name,
        result,
        status: 'success'
      });

      return result;
    } catch (error) {
      logger.error(`Tool execution failed: ${error}`);
      
      // Send error through WebSocket
      openManusSocket.sendToolResult({
        tool: call.function.name,
        error: String(error),
        status: 'error'
      });
      return `Error executing ${call.function.name}: ${error}`;
    }
  }

  // Tool implementations...
  private async executePython(args: any) {
    // Implementation moved to tools service
    return 'Python execution handled by tools service';
  }

  private async useBrowser(args: any) {
    // Implementation moved to tools service
    return 'Browser action handled by tools service';
  }

  private async saveFile(args: any) {
    // Implementation moved to tools service
    return 'File saving handled by tools service';
  }

  private async searchGoogle(args: any) {
    // Implementation moved to tools service
    return 'Search handled by tools service';
  }
}
