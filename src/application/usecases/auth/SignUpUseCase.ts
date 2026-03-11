import { Saga } from "@application/contracts/Saga";
import { Account } from "@application/entities/Account";
import { Profile } from "@application/entities/Profile";
import { EmailAlreadyInUse } from "@application/errors/application/EmailAlreadyInUse";
import { GoalCalculator } from "@application/services/GoalCalculator";
import { AccountRepository } from "@infra/database/dynamo/repositories/AccountRepository";
import { SignUpUnitOfWork } from "@infra/database/dynamo/uow/SignUpUnitOfWork";
import { AuthGateway } from "@infra/gateways/AuthGateway";
import { Injectable } from "@kernel/decorators/Injectable";

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

    let externalId: string;
    let accessToken: string;
    let refreshToken: string;

    const saga = new Saga();

    saga.addStep({
      execute: async () => {
        const result = await this.authGateway.signUp({
          email,
          password,
          internalId: account.id,
        });
        externalId = result.externalId;
        account.externalId = externalId;
      },
      compensate: async () => {
        await this.authGateway.deleteUser({ externalId: externalId! });
      },
    });

    saga.addStep({
      execute: async () => {
        await this.signUpUow.run({ account, goal, profile });
      },
    });

    saga.addStep({
      execute: async () => {
        const result = await this.authGateway.signIn({ email, password });
        accessToken = result.accessToken;
        refreshToken = result.refreshToken;
      },
    });

    await saga.execute();

    return {
      accessToken: accessToken!,
      refreshToken: refreshToken!,
    };
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
