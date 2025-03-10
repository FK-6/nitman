import { useState, useRef, useEffect } from 'react';
import {
  Box,
  VStack,
  Input,
  Button,
  Text,
  Card,
  CardBody,
  useToast
} from '@chakra-ui/react';
import { ChatMessage } from './ChatMessage';
import { ExecutionStatus } from './ExecutionStatus';

interface Props {
  onNewTask: () => void;
}

export function ChatPanel({ onNewTask }: Props) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const toast = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async () => {
    if (!input.trim()) return;

    try {
      setIsExecuting(true);
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: input }),
      });

      const { task_id } = await response.json();
      setupEventSource(task_id);
      setInput('');
      onNewTask();
    } catch (error) {
      toast({
        title: 'Error creating task',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const setupEventSource = (taskId: string) => {
    const events = new EventSource(`/api/tasks/${taskId}/events`);
    
    events.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setMessages(prev => [...prev, data]);
    };

    events.addEventListener('complete', () => {
      setIsExecuting(false);
      events.close();
    });

    events.addEventListener('error', () => {
      setIsExecuting(false);
      events.close();
    });
  };

  return (
    <Card>
      <CardBody>
        <VStack spacing={4} h="600px">
          <Box flex={1} w="100%" overflowY="auto" p={4}>
            {messages.map((msg, i) => (
              <ChatMessage key={i} message={msg} />
            ))}
            <div ref={messagesEndRef} />
          </Box>
          <Box 
            w="100%" 
            p={4} 
            borderTop="1px" 
            borderColor="gray.100"
          >
            <ExecutionStatus isExecuting={isExecuting} />
            <Box display="flex" gap={2}>
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter your request..."
                onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
              />
              <Button 
                colorScheme="blue"
                onClick={handleSubmit}
                isLoading={isExecuting}
              >
                Send
              </Button>
            </Box>
          </Box>
        </VStack>
      </CardBody>
    </Card>
  );
}
