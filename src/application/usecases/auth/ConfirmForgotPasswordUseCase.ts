import { InvalidForgetPasswordCodeError } from "@application/errors/application/InvalidForgetPasswordCode";
import { AuthGateway } from "@infra/gateways/AuthGateway";
import { Injectable } from "@kernel/decorators/Injectable";

@Injectable()
export class ConfirmForgotPasswordUseCase {
  constructor(private readonly authGateway: AuthGateway) {}

  async execute({
    email,
    confirmationCode,
    password,
  }: ConfirmForgotPasswordUseCase.Input) {
    try {
      await this.authGateway.confirmForgotPassword({
        email,
        confirmationCode,
        password,
      });

      return {
        statusCode: 204,
      };
    } catch {
      throw new InvalidForgetPasswordCodeError();
    }
  }
}

export namespace ConfirmForgotPasswordUseCase {
  export type Input = {
    email: string;
    confirmationCode: string;
    password: string;
  };

  export type Output = null;
}
