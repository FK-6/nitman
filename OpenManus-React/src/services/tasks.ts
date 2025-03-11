export interface Task {
  id: string;
  prompt: string;
  createdAt: Date;
  status: 'pending' | 'running' | 'completed' | 'failed';
  steps: Array<{
    step: number;
    result: string;
    type: 'think' | 'tool' | 'act' | 'run' | 'error';
  }>;
}

export class TaskManager {
  private tasks: Map<string, Task> = new Map();
  private eventSource: EventSource | null = null;

  async createTask(prompt: string): Promise<Task> {
    const taskId = `task_${Date.now()}`;
    const task: Task = {
      id: taskId,
      prompt,
      createdAt: new Date(),
      status: 'pending',
      steps: []
    };

    this.tasks.set(taskId, task);
    await this.startTaskExecution(taskId, prompt);
    return task;
  }

  private async startTaskExecution(taskId: string, prompt: string) {
    const task = this.tasks.get(taskId);
    if (!task) return;

    task.status = 'running';
    this.connectToTaskEvents(taskId);

    try {
      const response = await fetch('/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });

      if (!response.ok) {
        throw new Error('Failed to start task');
      }
    } catch (error) {
      task.status = 'failed';
      console.error('Task execution failed:', error);
    }
  }

  private connectToTaskEvents(taskId: string) {
    this.eventSource?.close();
    this.eventSource = new EventSource(`/tasks/${taskId}/events`);

    this.eventSource.addEventListener('think', (event) => {
      this.handleTaskEvent(taskId, JSON.parse(event.data), 'think');
    });

    this.eventSource.addEventListener('tool', (event) => {
      this.handleTaskEvent(taskId, JSON.parse(event.data), 'tool');
    });

    this.eventSource.addEventListener('complete', (event) => {
      const task = this.tasks.get(taskId);
      if (task) {
        task.status = 'completed';
        this.eventSource?.close();
      }
    });
  }

  private handleTaskEvent(taskId: string, data: any, type: string) {
    const task = this.tasks.get(taskId);
    if (!task) return;

    task.steps.push({
      step: task.steps.length,
      result: data.content || data.result,
      type
    });
  }

  getAllTasks(): Task[] {
    return Array.from(this.tasks.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
}

export const taskManager = new TaskManager();
