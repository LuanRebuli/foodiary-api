import { Account } from "@application/entities/Account";
import { Profile } from "@application/entities/Profile";
import { EmailAlreadyInUse } from "@application/errors/application/EmailAlreadyInUse";
import { GoalCalculator } from "@application/services/GoalCalculator";
import { AccountRepository } from "@infra/database/dynamo/repositories/AccountRepository";
import { SignUpUnitOfWork } from "@infra/database/dynamo/uow/SignUpUnitOfWork";
import { Injectable } from "@kernel/decorators/Injectable";
import { AuthGateway } from "src/infra/gateways/AuthGateway";

@Injectable()
export class SignUpUseCase {
  constructor(
    private readonly authGateway: AuthGateway,
    private readonly accountRepository: AccountRepository,
    private readonly signUpUow: SignUpUnitOfWork,
  ) {}

  async execute({
    account: { email, password },
    profile: profileInfo,
  }: SignUpUseCase.Input): Promise<SignUpUseCase.Output> {
    const emailALreadyExists = await this.accountRepository.findByEmail(email);

    if (emailALreadyExists) {
      throw new EmailAlreadyInUse();
    }

    const account = new Account({ email });
    const profile = new Profile({
      ...profileInfo,
      accountId: account.id,
    });

    const goal = GoalCalculator.calculate(profile, profile.goal);

    const { externalId } = await this.authGateway.signUp({
      email,
      password,
      internalId: account.id,
    });

    try {
      account.externalId = externalId;

      await this.signUpUow.run({ account, goal, profile });

      const { accessToken, refreshToken } = await this.authGateway.signIn({
        email,
        password,
      });

      return {
        accessToken,
        refreshToken,
      };
    } catch (error) {
      await this.authGateway.deleteUser({ externalId });

      throw error;
    }
  }
}

export namespace SignUpUseCase {
  export type Input = {
    account: {
      email: string;
      password: string;
    };
    profile: {
      name: string;
      birthDate: Date;
      gender: Profile.Gender;
      height: number;
      weight: number;
      activityLevel: Profile.ActivityLevel;
      goal: Profile.Goal;
    };
  };

  export type Output = {
    accessToken: string;
    refreshToken: string;
  };
}
