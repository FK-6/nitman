import { useState, useEffect } from 'react';
import { Box, Input, Button, VStack, Text, useToast } from '@chakra-ui/react';
import { sendMessage } from '../../services/api';
import { executePythonCode, saveFile, openBrowser, googleSearch } from '../../services/tools';
import { PlanningFlow } from '../Planning/PlanningFlow';
import { taskManager } from '../../services/tasks';
import { logger } from '../../services/logger';
import { Agent } from '../../services/agent';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTask, setActiveTask] = useState<string | null>(null);
  const [activePlan, setActivePlan] = useState<string | null>(null);
  const [agent] = useState(() => new Agent('Manus', 'A versatile AI assistant'));
  const toast = useToast();

  useEffect(() => {
    const unsubscribe = logger.addHandler((message, level) => {
      if (level === 'error') {
        toast({
          title: 'Error',
          description: message,
          status: 'error',
        });
      }
    });

    return () => unsubscribe();
  }, []);

  const handleToolExecution = async (toolId: string, params: any) => {
    setIsLoading(true);
    logger.info(`🛠️ Executing tool: ${toolId}`);

    try {
      const result = await handleToolAction(toolId, params);
      logger.info(`🎯 Tool execution completed: ${result}`);
      return result;
    } catch (error) {
      logger.error(`Tool execution failed: ${error}`);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    try {
      const task = await taskManager.createTask(input.trim());
      setActiveTask(task.id);
      setInput('');

      if (await agent.think(input)) {
        const { response } = await sendMessage(input.trim(), agent);
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: response
        }]);
      }
    } catch (error) {
      logger.error('Failed to process task: ' + error);
    }
  };

  const handleToolAction = async (toolId: string, params: any) => {
    setIsLoading(true);
    logger.info(`🛠️ Executing tool: ${toolId}`);

    try {
      const result = await handleToolAction(toolId, params);
      // Add result to messages immediately
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Tool ${toolId} result: ${result}`
      }]);
      return result;
    } catch (error) {
      // Show errors in chat
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Error executing ${toolId}: ${error}`
      }]);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <VStack spacing={4} align="stretch">
      {activePlan ? (
        <PlanningFlow
          taskId={activePlan}
          prompt={input}
          onComplete={(result) => {
            setActivePlan(null);
            setMessages(prev => [...prev, {
              role: 'assistant',
              content: result
            }]);
          }}
        />
      ) : (
        <>
          <Box flex={1} overflowY="auto" p={4}>
            {messages.map((msg, idx) => (
              <Box 
                key={idx}
                bg={msg.role === 'user' ? 'blue.50' : 'gray.50'}
                p={3}
                borderRadius="md"
                mb={2}
              >
                <Text>{msg.content}</Text>
              </Box>
            ))}
          </Box>
          <Box p={4}>
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              isDisabled={isLoading}
            />
            <Button 
              onClick={handleSend} 
              ml={2} 
              isLoading={isLoading}
              loadingText="Sending..."
            >
              Send
            </Button>
          </Box>
        </>
      )}
    </VStack>
  );
};

export default ChatInterface;
