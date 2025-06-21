import request from "supertest";
import { app } from "../src/index.js";

describe("Authentication Tests", () => {
  describe("Register tests", () => {
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
    test("should return 400 if user already exists", async () => {
      //arrange
      const newUser = {
        email: "test1@gmai.com",
        password: "Test@1234",
      };
      //act
      const response1 = await request(app)
        .post("/api/v1/users/signup")
        .set("user-agent", "jest-test")
        .send(newUser);
      const response2 = await request(app)
        .post("/api/v1/users/signup")
        .set("user-agent", "jest-test")
        .send(newUser);
      //assert
      expect(response1.statusCode).toBe(201);
      expect(response2.statusCode).toBe(400);
      expect(response2.body).toHaveProperty("message", "User already exists");
    });
  });
});
