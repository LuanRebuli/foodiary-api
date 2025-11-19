import { ErrorCode } from "../ErrorCode";
import { HttpError } from "./HttpError";

export class BadRequest extends HttpError {
  override statusCode: number;
  override code: ErrorCode;

  constructor(message?: any, code?: ErrorCode) {
    super();

    this.name = "BadRequest";
    this.message = message ?? "Bad Request";
    this.statusCode = 400;
    this.code = code ?? ErrorCode.BAD_REQUEST;
  }
}
