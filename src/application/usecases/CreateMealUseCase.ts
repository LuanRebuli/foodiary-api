import { Injectable } from "@kernel/decorators/Injectable";

@Injectable()
export class CreateMealUseCase {
  async execute() {
    return {
      createMealUseCase: "CREATED MEALL!!",
    };
  }
}
