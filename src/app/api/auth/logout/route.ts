import { NextResponse } from "next/server";
import { successResponse } from "@/utils/api-response";

export async function POST() {
  const response = successResponse({ message: "Logged out successfully" });
  response.cookies.set("token", "", {
    httpOnly: true,
    expires: new Date(0),
    path: "/",
  });
  return response;
}
