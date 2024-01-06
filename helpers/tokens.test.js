const jwt = require("jsonwebtoken");
const { createToken } = require("./tokens");
const { SECRET_KEY } = require("../config");

describe("createToken", function () {
  test("works: not admin", function () {
    const token = createToken({ username: "test", is_admin: false });
    const payload = jwt.verify(token, SECRET_KEY);
    expect(payload).toEqual({
      iat: expect.any(Number),
      username: "test",
      isAdmin: false,
    });
  });

  test("works: admin", function () {
    const token = createToken({ username: "test", isAdmin: true });
    const payload = jwt.verify(token, SECRET_KEY);
    expect(payload).toEqual({
      iat: expect.any(Number),
      username: "test",
      isAdmin: true,
    });
  });

  test("works: default no admin", function () {
    // given the security risk if this didn't work, checking this specifically
    const token = createToken({ username: "test" });
    const payload = jwt.verify(token, SECRET_KEY);
    expect(payload).toEqual({
      iat: expect.any(Number),
      username: "test",
      isAdmin: false,
    });
  });

  describe("JWT Token Creation", () => {
    test("Token for Regular User", () => {
      const token = createToken({ username: "user", isAdmin: false });
      const payload = jwt.verify(token, SECRET_KEY);
      expect(payload.isAdmin).toBe(false);
    });
  
    test("Token for Admin User", () => {
      const token = createToken({ username: "admin", isAdmin: true });
      const payload = jwt.verify(token, SECRET_KEY);
      expect(payload.isAdmin).toBe(true);
    });
  });
});
