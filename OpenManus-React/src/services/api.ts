import OpenAI from 'openai';
import { AppConfig } from '../config/types';

const openai = new OpenAI({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Note: In production, you should handle API keys more securely
});

const SYSTEM_PROMPT = `You are OpenManus, an all-capable AI assistant, aimed at solving any task presented by the user. You have various tools at your disposal that you can call upon to efficiently complete complex requests. Whether it's programming, information retrieval, file processing, or web browsing, you can handle it all.

You can interact with the computer using:
- PythonExecute: Execute Python code with a 5-second timeout
- FileSaver: Save files locally
- BrowserUseTool: Open and browse web browsers
- GoogleSearch: Perform web information retrieval`;

const FUNCTION_DEFINITIONS = [
  {
    name: 'python_execute',
    description: 'Execute Python code to interact with the computer system',
    parameters: {
      type: 'object',
      properties: {
        code: { type: 'string', description: 'Python code to execute' }
      },
      required: ['code']
    }
  },
  {
    name: 'file_saver',
    description: 'Save files locally',
    parameters: {
      type: 'object',
      properties: {
        content: { type: 'string', description: 'File content' },
        filename: { type: 'string', description: 'File name with extension' }
      },
      required: ['content', 'filename']
    }
  }
];

export const sendMessage = async (message: string, agent?: Agent) => {
  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: message }
    ],
    functions: FUNCTION_DEFINITIONS,
    temperature: 0.7,
  });

  if (agent && response.choices[0]?.message?.function_call) {
    const result = await agent.act([response.choices[0].message.function_call as any]);
    return { response: result };
  }

  return {
    response: response.choices[0]?.message?.content || "No response"
  };
};
