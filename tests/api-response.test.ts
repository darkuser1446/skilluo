import { describe, it, expect } from "vitest";
import { successResponse, errorResponse } from "../src/utils/api-response";

describe("API Response Utilities Suite", () => {
  it("should create standard success envelope with status 200", async () => {
    const data = { message: "Workshop fetched", id: "ws_123" };
    const res = successResponse(data);

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data).toEqual(data);
  });

  it("should include pagination metadata when provided in success response", async () => {
    const data = [{ id: "1" }, { id: "2" }];
    const meta = { page: 1, limit: 10, total: 2, totalPages: 1 };
    const res = successResponse(data, meta, 201);

    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data).toEqual(data);
    expect(json.meta).toEqual(meta);
  });

  it("should create standard error envelope with appropriate status and code", async () => {
    const res = errorResponse("Resource not found", "NOT_FOUND", 404, { resourceId: "ex_404" });

    expect(res.status).toBe(404);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error.code).toBe("NOT_FOUND");
    expect(json.error.message).toBe("Resource not found");
    expect(json.error.details).toEqual({ resourceId: "ex_404" });
  });

  it("should default error status to 400 and code to BAD_REQUEST", async () => {
    const res = errorResponse("Invalid input syntax");
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error.code).toBe("BAD_REQUEST");
  });
});
