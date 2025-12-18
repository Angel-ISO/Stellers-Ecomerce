import { JwtModule } from "@nestjs/jwt";
import { Test } from "@nestjs/testing";
import { JwtUtils } from "./jwt.utils";

describe("JwtUtils (with Nest JwtService)", () => {
  let jwtUtils: JwtUtils;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [JwtModule.register({ secret: "test-secret" })],
      providers: [JwtUtils],
    }).compile();

    jwtUtils = moduleRef.get(JwtUtils);
  });

  it("generates and verifies tokens", () => {
    const token = jwtUtils.generateToken({ sub: "user-1", isModerator: true });
    const decoded = jwtUtils.verifyToken(token);
    expect(decoded.sub).toBe("user-1");
    expect(decoded.isModerator).toBe(true);
  });

  it("returns null for invalid tokens", () => {
    const decoded = jwtUtils.verifyToken("invalid.token");
    expect(decoded).toBeNull();
  });
});
