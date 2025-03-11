import { useState, useRef } from 'react';
import { Box, Button, HStack, Text, useToast, VStack } from '@chakra-ui/react';
import { Editor } from '@monaco-editor/react';
import Convert from 'ansi-to-html';
import { executePythonCode } from '../../services/tools';
import { pythonSocket } from '../../services/websocket';

const convert = new Convert();

interface ExecutionStatus {
  status: 'idle' | 'running' | 'error' | 'success';
  errorLine?: number;
  memoryUsage?: number;
  executionTime?: number;
}

const PythonEditor = () => {
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');
  const [status, setStatus] = useState<ExecutionStatus>({ status: 'idle' });
  const editorRef = useRef(null);

  const toast = useToast();

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
  };

  const handleExecute = async () => {
    if (!code.trim()) return;

    setStatus({ status: 'running' });
    setOutput('');
    const startTime = performance.now();

    try {
      await executePythonCode(code, 5000, (newOutput, meta) => {
        setOutput(prev => prev + newOutput);
        if (meta?.memoryUsage) {
          setStatus(prev => ({ ...prev, memoryUsage: meta.memoryUsage }));
        }
      });

      const executionTime = performance.now() - startTime;
      setStatus({
        status: 'success',
        executionTime: Math.round(executionTime),
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      let errorLine = -1;

      // Extract line number from error message if possible
      const lineMatch = errorMessage.match(/line (\d+)/);
      if (lineMatch) {
        errorLine = parseInt(lineMatch[1], 10) - 1;
      }

      setStatus({
        status: 'error',
        errorLine,
      });

      toast({
        title: 'Execution Error',
        description: errorMessage,
        status: 'error',
      });
    }
  };

  const getStatusColor = () => {
    switch (status.status) {
      case 'running': return 'blue';
      case 'error': return 'red';
      case 'success': return 'green';
      default: return 'gray';
    }
  };

  return (
    <VStack spacing={4} align="stretch">
      <Box height="500px" border="1px" borderColor="gray.200" borderRadius="md">
        <Editor
          height="100%"
          defaultLanguage="python"
          value={code}
          onChange={(value) => setCode(value || '')}
          onMount={handleEditorDidMount}
          options={{
            minimap: { enabled: false },
            lineNumbers: 'on',
            folding: true,
            lineDecorationsWidth: 5,
            fontSize: 14,
            tabSize: 4,
            automaticLayout: true,
          }}
          theme="vs-dark"
        />
      </Box>

      <HStack>
        <Button
          onClick={handleExecute}
          isLoading={status.status === 'running'}
          loadingText="Executing..."
          colorScheme={getStatusColor()}
        >
          Execute Code
        </Button>
        {status.executionTime && (
          <Text fontSize="sm" color="gray.500">
            Execution time: {status.executionTime}ms
          </Text>
        )}
        {status.memoryUsage && (
          <Text fontSize="sm" color="gray.500">
            Memory usage: {Math.round(status.memoryUsage / 1024)}KB
          </Text>
        )}
      </HStack>

      {output && (
        <Box
          p={4}
          bg="gray.900"
          color="white"
          borderRadius="md"
          fontFamily="monospace"
          whiteSpace="pre-wrap"
          maxHeight="300px"
          overflowY="auto"
        >
          <div
            dangerouslySetInnerHTML={{
              __html: convert.toHtml(output)
            }}
          />
        </Box>
      )}
    </VStack>
  );
};

export default PythonEditor;
