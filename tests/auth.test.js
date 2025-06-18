import request from "supertest";
import { app } from "../src/index.js";

describe("Authentication Tests", () => {
  it("Should register user successfully", async () => {
    // Arrange
    const newUser = {
      email: "test@gmail.com",
      password: "Test@1234",
    };
    // Act
    const response = await request(app)
      .post("/api/v1/users/signup")
      .set("user-agent", "jest-test")
      .send(newUser);
    // Assert
    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty(
      "message",
      "User created successfully"
    );
    expect(response.body).toHaveProperty("success", true);
  });

  test("Should return 400 for missing email", async () => {
    // Arrange
    const newUser = {
      password: "Test@1234",
    };
    // Act
    const response = await request(app)
      .post("/api/v1/users/signup")
      .set("user-agent", "jest-test")
      .send(newUser);
    // Assert
    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty(
      "message",
      "Email and password are required"
    );
  });
});
