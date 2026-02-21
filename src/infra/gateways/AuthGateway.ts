import {
  InitiateAuthCommand,
  SignUpCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { cognitoClient } from "@infra/clients/cognitoClient";
import { Injectable } from "@kernel/decorators/Injectable";
import { AppConfig } from "@shared/config/AppConfig";
import { createHmac } from "node:crypto";

@Injectable()
export class AuthGateway {
  constructor(private readonly appConfig: AppConfig) {}

  async signIn({
    email,
    password,
  }: AuthGateway.SignInParams): Promise<AuthGateway.SignInResult> {
    const command = new InitiateAuthCommand({
      AuthFlow: "USER_PASSWORD_AUTH",
      ClientId: this.appConfig.auth.cognito.clientId,
      AuthParameters: {
        USERNAME: email,
        PASSWORD: password,
        SECRET_HASH: this.getSecretHash(email),
      },
    });

    const { AuthenticationResult } = await cognitoClient.send(command);

    if (
      !AuthenticationResult?.AccessToken ||
      !AuthenticationResult?.RefreshToken
    ) {
      throw new Error(`Failed to sign in user: ${email}`);
    }

    return {
      accessToken: AuthenticationResult.AccessToken,
      refreshToken: AuthenticationResult.RefreshToken,
    };
  }

  async signUp({
    email,
    password,
    internalId,
  }: AuthGateway.SignUpParams): Promise<AuthGateway.SignUpResult> {
    const commnad = new SignUpCommand({
      ClientId: this.appConfig.auth.cognito.clientId,
      Username: email,
      Password: password,
      UserAttributes: [{ Name: "custom:internalId", Value: internalId }],
      SecretHash: this.getSecretHash(email),
    });

    const { UserSub: externalId } = await cognitoClient.send(commnad);

    if (!externalId) {
      throw new Error(`Failed to sign up user: ${email}`);
    }

    return {
      externalId,
    };
  }

  private getSecretHash(email: string): string {
    const { clientSecret, clientId } = this.appConfig.auth.cognito;

    return createHmac("SHA256", clientSecret)
      .update(`${email}${clientId}`)
      .digest("base64");
  }
}

export namespace AuthGateway {
  export type SignUpParams = {
    email: string;
    password: string;
    internalId: string;
  };
  export type SignUpResult = {
    externalId: string;
  };

  export type SignInParams = {
    email: string;
    password: string;
  };
  export type SignInResult = {
    accessToken: string;
    refreshToken: string;
  };
}
