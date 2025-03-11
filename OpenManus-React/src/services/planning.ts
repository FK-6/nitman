export enum PlanStepStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  BLOCKED = 'blocked'
}

interface PlanStep {
  text: string;
  type?: string;
  status: PlanStepStatus;
  notes?: string;
}

export class PlanningService {
  private plans: Map<string, {
    title: string;
    steps: PlanStep[];
    currentStepIndex: number;
  }> = new Map();

  async createPlan(planId: string, request: string): Promise<void> {
    const response = await sendMessage(`Create a plan for: ${request}`);
    const steps = this.parsePlanSteps(response.response);
    
    this.plans.set(planId, {
      title: `Plan for: ${request}`,
      steps: steps.map(step => ({
        text: step,
        status: PlanStepStatus.NOT_STARTED
      })),
      currentStepIndex: 0
    });
  }

  private parsePlanSteps(content: string): string[] {
    // Extract numbered or bullet-pointed steps from the content
    const stepRegex = /(?:\d+\.|[-*])?\s*([^\n]+)/g;
    const matches = [...content.matchAll(stepRegex)];
    return matches.map(match => match[1].trim());
  }

  async executeStep(planId: string): Promise<string> {
    const plan = this.plans.get(planId);
    if (!plan) throw new Error('Plan not found');

    const step = plan.steps[plan.currentStepIndex];
    if (!step) return 'Plan completed';

    step.status = PlanStepStatus.IN_PROGRESS;
    // Execute step using appropriate tool
    // ...implementation based on step type
    step.status = PlanStepStatus.COMPLETED;
    plan.currentStepIndex++;

    return `Completed step: ${step.text}`;
  }
}
