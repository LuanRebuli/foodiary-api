import { InvalidCredentialsError } from "@application/errors/application/InvalidCredentials";
import { SignInUseCase } from "@application/usecases/auth/SignInUseCase";
import { describe, expect, it, vi } from "vitest";

function makeAuthGateway(overrides: Partial<{ signIn: any }> = {}) {
  return {
    signIn:
      overrides.signIn ??
      vi.fn().mockResolvedValue({
        accessToken: "access-token",
        refreshToken: "refresh-token",
      }),
    signUp: vi.fn(),
    refreshToken: vi.fn(),
    forgotPassword: vi.fn(),
    confirmForgotPassword: vi.fn(),
    deleteUser: vi.fn(),
  };
}

function makeSut(overrides: Partial<{ authGateway: any }> = {}) {
  const authGateway = overrides.authGateway ?? makeAuthGateway();
  const sut = new SignInUseCase(authGateway);
  return { sut, authGateway };
}

describe("SignInUseCase", () => {
  it("should return tokens on successful sign in", async () => {
    const { sut } = makeSut();

    const result = await sut.execute({
      email: "user@example.com",
      password: "password123",
    });

    expect(result).toEqual({
      accessToken: "access-token",
      refreshToken: "refresh-token",
    });
  });

  it("should call authGateway.signIn with correct params", async () => {
    const { sut, authGateway } = makeSut();

    await sut.execute({
      email: "user@example.com",
      password: "password123",
    });

    expect(authGateway.signIn).toHaveBeenCalledWith({
      email: "user@example.com",
      password: "password123",
    });
  });

  it("should throw InvalidCredentialsError when gateway throws", async () => {
    const authGateway = makeAuthGateway({
      signIn: vi.fn().mockRejectedValue(new Error("Cognito error")),
    });
    const { sut } = makeSut({ authGateway });

    await expect(
      sut.execute({ email: "user@example.com", password: "wrong" }),
    ).rejects.toThrow(InvalidCredentialsError);
  });
});
