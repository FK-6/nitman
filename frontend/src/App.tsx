import { useEffect, useState } from 'react';
import { 
  ChakraProvider, 
  Container, 
  Box,
  VStack,
  Heading,
  useToast
} from '@chakra-ui/react';
import { ChatPanel } from './components/ChatPanel';
import { TaskList } from './components/TaskList';
import { Header } from './components/Header';
import { theme } from './theme';
import { Task } from './types';

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const toast = useToast();

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/tasks');
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      toast({
        title: 'Error fetching tasks',
        status: 'error',
        duration: 3000,
      });
    }
  };

  return (
    <ChakraProvider theme={theme}>
      <Box minH="100vh" bg="gray.50">
        <Header />
        <Container maxW="container.xl" py={8}>
          <VStack spacing={8} align="stretch">
            <Heading size="lg">OpenManus Agent</Heading>
            <Box display="flex" gap={8}>
              <Box flex={1}>
                <ChatPanel onNewTask={fetchTasks} />
              </Box>
              <Box w="400px">
                <TaskList tasks={tasks} />
              </Box>
            </Box>
          </VStack>
        </Container>
      </Box>
    </ChakraProvider>
  );
}

export default App;
