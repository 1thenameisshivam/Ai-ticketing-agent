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
        .send(newUser);
      const response2 = await request(app)
        .post("/api/v1/users/signup")
        .send(newUser);
      //assert
      expect(response1.statusCode).toBe(201);
      expect(response2.statusCode).toBe(400);
      expect(response2.body).toHaveProperty("message", "User already exists");
    });
    test("should add cookie on successful registration", async () => {
      // Arrange
      const newUser = {
        email: "test@gmail.com",
        password: "Test@1234",
      };
      // Act
      const response = await request(app)
        .post("/api/v1/users/signup")
        .send(newUser);
      // Assert
      expect(response.statusCode).toBe(201);
      expect(response.headers).toHaveProperty("set-cookie");
    });
    it("should add token in cookie on successful registration", async () => {
      // Arrange
      const newUser = {
        email: "test@gmai.com",
        password: "Test@1234",
      };
      // Act
      const response = await request(app)
        .post("/api/v1/users/signup")
        .send(newUser);
      // Assert
      expect(response.statusCode).toBe(201);
      expect(response.headers).toHaveProperty("set-cookie");
      const cookies = response.headers["set-cookie"];
      expect(cookies[0]).toMatch(/token=/);
    });
  });
  describe("Login tests", () => {
    it("should login user successfully", async () => {
      // Arrange
      const userCredentials = {
        email: "test@gmail.com",
        password: "Test@1234",
      };
      // Act
      const registerUser = await request(app)
        .post("/api/v1/users/signup")
        .send(userCredentials);
      const response = await request(app)
        .post("/api/v1/users/login")
        .send(userCredentials);
      // Assert
      expect(registerUser.statusCode).toBe(201);
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty("success", true);
    });
    it("should return 400 for missing email", async () => {
      // Arrange
      const userCredentials = {
        password: "Test@1234",
      };
      // Act
      const registerUser = await request(app)
        .post("/api/v1/users/signup")
        .send(userCredentials);
      const response = await request(app)
        .post("/api/v1/users/login")
        .send(userCredentials);
      // Assert
      expect(response.statusCode).toBe(400);
    });
    it("should return 400 for missing password", async () => {
      // Arrange
      const userCredentials = {
        email: "test@gmail.com",
      };
      // Act
      const registerUser = await request(app)
        .post("/api/v1/users/signup")
        .send(userCredentials);
      const response = await request(app)
        .post("/api/v1/users/login")
        .send(userCredentials);
      // Assert
      expect(response.statusCode).toBe(400);
    });
    it("should return 400 for invalid email", async () => {
      // Arrange
      const userCredentials = {
        email: "test@gmail.com",
        password: "WrongPassword",
      };
      // Act
      const registerUser = await request(app)
        .post("/api/v1/users/signup")
        .send(userCredentials);
      const response = await request(app)
        .post("/api/v1/users/login")
        .send({ email: "teswt@gmail.com", password: "WrongPassword" });
      // Assert
      expect(registerUser.statusCode).toBe(201);
      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty(
        "message",
        "Invalid email or password"
      );
    });
    it("should return 400 for invalid password", async () => {
      // Arrange
      const userCredentials = {
        email: "teat@gmail.com",
        password: "Test@1234",
      };
      // Act
      const registerUser = await request(app)
        .post("/api/v1/users/signup")
        .send(userCredentials);
      const response = await request(app)
        .post("/api/v1/users/login")
        .send({ email: "teat@gmail.com", password: "WrongPassword" });
      // Assert
      expect(registerUser.statusCode).toBe(201);
      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty(
        "message",
        "Invalid email or password"
      );
    });
    it("should add token in cookie with token on successful login", async () => {
      // Arrange
      const userCredentials = {
        email: "test@gamil.com",
        password: "Test@1234",
      };
      // Act
      const registerUser = await request(app)
        .post("/api/v1/users/signup")
        .send(userCredentials);
      const response = await request(app)
        .post("/api/v1/users/login")
        .send(userCredentials);
      // Assert
      expect(registerUser.statusCode).toBe(201);
      expect(response.statusCode).toBe(200);
      expect(response.headers).toHaveProperty("set-cookie");
      const cookies = response.headers["set-cookie"];
      expect(cookies[0]).toMatch(/token=/);
    });
  });
});
