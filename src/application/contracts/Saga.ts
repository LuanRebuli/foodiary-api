export class Saga {
  private readonly steps: Saga.Step[] = [];

  addStep(step: Saga.Step): this {
    this.steps.push(step);
    return this;
  }

  async execute(): Promise<void> {
    const completedSteps: Saga.Step[] = [];

    for (const step of this.steps) {
      try {
        await step.execute();
        completedSteps.push(step);
      } catch (error) {
        await this.compensate(completedSteps);
        throw error;
      }
    }
  }

  private async compensate(completedSteps: Saga.Step[]): Promise<void> {
    for (const step of completedSteps.reverse()) {
      if (step.compensate) {
        await step.compensate();
      }
    }
  }
}

export namespace Saga {
  export type Step = {
    execute: () => Promise<void>;
    compensate?: () => Promise<void>;
  };
}
