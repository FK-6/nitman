import { Box, VStack, Text, Heading } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { taskManager, Task } from '../../services/tasks';

interface Task {
  id: string;
  prompt: string;
  timestamp: Date;
  status: 'completed' | 'failed' | 'running';
}

interface TaskHistoryProps {
  tasks: Task[];
  onTaskSelect: (taskId: string) => void;
}

const TaskHistory = () => {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    const updateTasks = () => {
      setTasks(taskManager.getAllTasks());
    };

    // Update initially and every 2 seconds
    updateTasks();
    const interval = setInterval(updateTasks, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Box p={4} borderLeft="1px" borderColor="gray.200">
      <Heading size="md" mb={4}>History Tasks</Heading>
      <VStack spacing={3} align="stretch">
        {tasks.map(task => (
          <Box
            key={task.id}
            p={3}
            borderRadius="md"
            bg={task.status === 'completed' ? 'green.50' : 'gray.50'}
            cursor="pointer"
            onClick={() => onTaskSelect(task.id)}
          >
            <Text fontSize="sm" fontWeight="bold">
              {task.prompt.substring(0, 50)}...
            </Text>
            <Text fontSize="xs" color="gray.500">
              {task.timestamp.toLocaleString()}
            </Text>
          </Box>
        ))}
      </VStack>
    </Box>
  );
};

export default TaskHistory;
