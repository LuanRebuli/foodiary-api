import { ErrorCode } from "../ErrorCode";
import { ApplicationError } from "./ApplicationError";

export class InvalidForgetPasswordCodeError extends ApplicationError {
  public override statusCode = 401;

  public override code: ErrorCode;

  constructor() {
    super();

    this.name = "InvalidForgetPasswordCode";
    this.message = "Invalid forget password code.";
    this.code = ErrorCode.INVALID_FORGET_PASSWORD_CODE;
  }
}
