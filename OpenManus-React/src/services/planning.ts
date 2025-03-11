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

  private getStepStatus(step: PlanStep): string {
    switch (step.status) {
      case PlanStepStatus.NOT_STARTED: return '[ ]';
      case PlanStepStatus.IN_PROGRESS: return '[→]';
      case PlanStepStatus.COMPLETED: return '[✓]';
      case PlanStepStatus.BLOCKED: return '[!]';
      default: return '[ ]';
    }
  }

  async getCurrentPlanStatus(planId: string): Promise<string> {
    const plan = this.plans.get(planId);
    if (!plan) return 'No plan found';

    const totalSteps = plan.steps.length;
    const completedSteps = plan.steps.filter(s => s.status === PlanStepStatus.COMPLETED).length;
    const progress = (completedSteps / totalSteps) * 100;

    let status = `Plan: ${plan.title}\n`;
    status += `Progress: ${completedSteps}/${totalSteps} (${progress.toFixed(1)}%)\n\n`;
    status += 'Steps:\n';
    
    plan.steps.forEach((step, idx) => {
      status += `${idx}. ${this.getStepStatus(step)} ${step.text}\n`;
      if (step.notes) status += `   Notes: ${step.notes}\n`;
    });

    return status;
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
