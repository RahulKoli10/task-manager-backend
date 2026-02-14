import request from "supertest";
import app from "../../app";

describe("Basic API Test", () => {
  it("should return API running message", async () => {
    const res = await request(app).get("/");

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("API Running...");
  });
});
