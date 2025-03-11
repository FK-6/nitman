import { useState, useEffect } from 'react';
import { Box, VStack, Text, Button, Progress } from '@chakra-ui/react';
import { PlanningService, PlanStepStatus } from '../../services/planning';

interface PlanningFlowProps {
  taskId: string;
  prompt: string;
  onComplete: (result: string) => void;
}

const PlanningFlow = ({ taskId, prompt, onComplete }: PlanningFlowProps) => {
  const [planningService] = useState(() => new PlanningService());
  const [isExecuting, setIsExecuting] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [result, setResult] = useState('');

  useEffect(() => {
    const initializePlan = async () => {
      await planningService.createPlan(taskId, prompt);
      executeNextStep();
    };

    initializePlan();
  }, [taskId, prompt]);

  const executeNextStep = async () => {
    setIsExecuting(true);
    try {
      const stepResult = await planningService.executeStep(taskId);
      setResult(prev => `${prev}\n${stepResult}`);
      setCurrentStep(prev => prev + 1);
      
      if (stepResult === 'Plan completed') {
        onComplete(result);
      } else {
        executeNextStep();
      }
    } catch (error) {
      console.error('Step execution failed:', error);
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <VStack spacing={4} align="stretch">
      <Box>
        <Text fontWeight="bold">Executing Plan: {prompt}</Text>
        <Progress value={(currentStep / 5) * 100} />
      </Box>
      <Box
        p={4}
        bg="gray.50"
        borderRadius="md"
        whiteSpace="pre-wrap"
      >
        {result}
      </Box>
    </VStack>
  );
};

export default PlanningFlow;
