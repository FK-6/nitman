import React from 'react';
import {
  VStack,
  Card,
  CardBody,
  Heading,
  Text,
  Badge,
  Box
} from '@chakra-ui/react';
import { Task } from '../types';

interface Props {
  tasks: Task[];
}

export function TaskList({ tasks }: Props) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'green';
      case 'running': return 'blue';
      case 'failed': return 'red';
      default: return 'gray';
    }
  };

  return (
    <Card>
      <CardBody>
        <VStack spacing={4} align="stretch">
          <Heading size="md">Task History</Heading>
          {tasks.map((task) => (
            <Box
              key={task.id}
              p={4}
              border="1px"
              borderColor="gray.100"
              borderRadius="md"
            >
              <Text noOfLines={2} fontSize="sm">
                {task.prompt}
              </Text>
              <Badge 
                mt={2}
                colorScheme={getStatusColor(task.status)}
              >
                {task.status}
              </Badge>
            </Box>
          ))}
        </VStack>
      </CardBody>
    </Card>
  );
}
