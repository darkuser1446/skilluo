import { NextResponse } from "next/server";
import { successResponse } from "@/utils/api-response";

export async function POST() {
  const response = successResponse({ message: "Logged out successfully" });
  response.cookies.set("token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
    expires: new Date(0),
  });
  return response;
}
