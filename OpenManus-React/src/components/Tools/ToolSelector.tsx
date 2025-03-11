import { Box, Button, SimpleGrid, useToast } from '@chakra-ui/react';

interface Tool {
  id: string;
  name: string;
  description: string;
  action: () => Promise<void>;
}

const ToolSelector = () => {
  const toast = useToast();

  const tools: Tool[] = [
    {
      id: 'python',
      name: 'Python Execute',
      description: 'Run Python code',
      action: async () => {
        // Implement Python execution
        toast({ title: 'Python code executed', status: 'success' });
      }
    },
    {
      id: 'files',
      name: 'File Saver',
      description: 'Save files locally',
      action: async () => {
        // Implement file saving
        toast({ title: 'File saved', status: 'success' });
      }
    },
    {
      id: 'browser',
      name: 'Browser Tool',
      description: 'Open and control browser',
      action: async () => {
        // Implement browser control
        toast({ title: 'Browser action completed', status: 'success' });
      }
    },
    {
      id: 'search',
      name: 'Google Search',
      description: 'Search the web',
      action: async () => {
        // Implement search
        toast({ title: 'Search completed', status: 'success' });
      }
    }
  ];

  return (
    <Box p={4}>
      <SimpleGrid columns={[1, 2, 4]} spacing={4}>
        {tools.map(tool => (
          <Button
            key={tool.id}
            onClick={() => tool.action()}
            height="100px"
            flexDirection="column"
            whiteSpace="normal"
          >
            <Box fontWeight="bold">{tool.name}</Box>
            <Box fontSize="sm">{tool.description}</Box>
          </Button>
        ))}
      </SimpleGrid>
    </Box>
  );
};

export default ToolSelector;
