import { Agent } from '../agent';
import { logger } from '../logger';
import { PlanningService } from '../planning';
import { ToolCollection } from '../tools/collection';
import { Terminate } from '../tools/terminate';

export class PlanningAgent extends Agent {
  private planningService: PlanningService;
  private activePlanId: string | null = null;
  private currentStepIndex: number | null = null;

  constructor(name: string = 'planning', description: string = 'An agent that creates and manages plans') {
    super(name, description);
    this.planningService = new PlanningService();
    
    // Register planning-specific tools
    const toolCollection = new ToolCollection(new Terminate());
    this.registerTools(toolCollection);
  }

  async think(input: string): Promise<boolean> {
    if (!this.activePlanId) {
      this.activePlanId = `plan_${Date.now()}`;
      await this.planningService.createPlan(this.activePlanId, input);
    }

    const planStatus = await this.planningService.getCurrentPlanStatus(this.activePlanId);
    logger.info(`Current plan status:\n${planStatus}`);
    
    return super.think(input);
  }

  async act(toolCalls: any[]): Promise<string> {
    if (this.currentStep >= this.maxSteps) {
      return 'Max steps reached';
    }

    const result = await super.act(toolCalls);
    await this.updatePlanProgress();
    
    return result;
  }

  private async updatePlanProgress(): Promise<void> {
    if (!this.activePlanId) return;
    await this.planningService.executeStep(this.activePlanId);
  }
}
