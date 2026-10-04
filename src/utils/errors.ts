import { NextResponse } from "next/server";
import { ZodError } from "zod";

export class ApiError extends Error {
  statusCode: number;
  code: string;
  details?: any;

  constructor(message: string, statusCode = 400, code = "BAD_REQUEST", details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

export function handleApiError(err: unknown) {
  console.error("API Error encountered:", err);

  if (err instanceof ApiError) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: err.code,
          message: err.message,
          ...(err.details ? { details: err.details } : {}),
        },
      },
      { status: err.statusCode }
    );
  }

  if (err instanceof ZodError) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Request validation failed",
          details: err.flatten(),
        },
      },
      { status: 422 }
    );
  }

  const message =
    process.env.NODE_ENV === "production"
      ? "An unexpected error occurred. Please try again later."
      : err instanceof Error
        ? err.message
        : "Internal Server Error";
  return NextResponse.json(
    {
      success: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message,
      },
    },
    { status: 500 }
  );
}
