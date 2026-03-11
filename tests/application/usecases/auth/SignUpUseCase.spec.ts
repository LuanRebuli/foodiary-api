import { Profile } from "@application/entities/Profile";
import { EmailAlreadyInUse } from "@application/errors/application/EmailAlreadyInUse";
import { SignUpUseCase } from "@application/usecases/auth/SignUpUseCase";
import { describe, expect, it, vi } from "vitest";

const defaultInput: SignUpUseCase.Input = {
  account: {
    email: "user@example.com",
    password: "Str0ngP@ss!",
  },
  profile: {
    name: "João",
    birthDate: new Date("1995-06-15"),
    gender: Profile.Gender.MALE,
    height: 180,
    weight: 80,
    activityLevel: Profile.ActivityLevel.MODERATE,
    goal: Profile.Goal.MAINTAIN,
  },
};

function makeAuthGateway() {
  return {
    signUp: vi.fn().mockResolvedValue({ externalId: "ext-123" }),
    signIn: vi.fn().mockResolvedValue({
      accessToken: "access-token",
      refreshToken: "refresh-token",
    }),
    deleteUser: vi.fn().mockResolvedValue(undefined),
    refreshToken: vi.fn(),
    forgotPassword: vi.fn(),
    confirmForgotPassword: vi.fn(),
  };
}

function makeAccountRepository() {
  return {
    findByEmail: vi.fn().mockResolvedValue(null),
    create: vi.fn(),
    getPutCommandInput: vi.fn(),
  };
}

function makeSignUpUow() {
  return {
    run: vi.fn().mockResolvedValue(undefined),
  };
}

function makeSut() {
  const authGateway = makeAuthGateway();
  const accountRepository = makeAccountRepository();
  const signUpUow = makeSignUpUow();
  const sut = new SignUpUseCase(
    authGateway as any,
    accountRepository as any,
    signUpUow as any,
  );
  return { sut, authGateway, accountRepository, signUpUow };
}

describe("SignUpUseCase", () => {
  it("should create account and return tokens", async () => {
    const { sut } = makeSut();

    const result = await sut.execute(defaultInput);

    expect(result).toEqual({
      accessToken: "access-token",
      refreshToken: "refresh-token",
    });
  });

  it("should throw EmailAlreadyInUse if email exists", async () => {
    const { sut, accountRepository } = makeSut();
    accountRepository.findByEmail.mockResolvedValue({ id: "existing" });

    await expect(sut.execute(defaultInput)).rejects.toThrow(EmailAlreadyInUse);
  });

  it("should call authGateway.signUp with correct params", async () => {
    const { sut, authGateway } = makeSut();

    await sut.execute(defaultInput);

    expect(authGateway.signUp).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "user@example.com",
        password: "Str0ngP@ss!",
      }),
    );
  });

  it("should call signUpUow.run with account, goal, and profile", async () => {
    const { sut, signUpUow } = makeSut();

    await sut.execute(defaultInput);

    expect(signUpUow.run).toHaveBeenCalledWith(
      expect.objectContaining({
        account: expect.objectContaining({ email: "user@example.com" }),
        goal: expect.objectContaining({ calories: expect.any(Number) }),
        profile: expect.objectContaining({ name: "João" }),
      }),
    );
  });

  it("should delete user from auth provider if UoW fails", async () => {
    const { sut, authGateway, signUpUow } = makeSut();
    signUpUow.run.mockRejectedValue(new Error("DynamoDB error"));

    await expect(sut.execute(defaultInput)).rejects.toThrow("DynamoDB error");
    expect(authGateway.deleteUser).toHaveBeenCalledWith({
      externalId: "ext-123",
    });
  });

  it("should sign in after successful registration", async () => {
    const { sut, authGateway } = makeSut();

    await sut.execute(defaultInput);

    expect(authGateway.signIn).toHaveBeenCalledWith({
      email: "user@example.com",
      password: "Str0ngP@ss!",
    });
  });
});
