export interface LLMSettings {
  model: string;
  baseUrl: string;
  apiKey: string;
  maxTokens: number;
  temperature: number;
  apiType: string;
  apiVersion: string;
}

export interface AppConfig {
  llm: {
    [key: string]: LLMSettings;
  };
}
