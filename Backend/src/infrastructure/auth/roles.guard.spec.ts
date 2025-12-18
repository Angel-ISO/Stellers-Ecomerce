import { ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { RolesGuard } from "./roles.guard";

describe("RolesGuard", () => {
  const reflector = new Reflector();
  const guard = new RolesGuard(reflector);

  const ctx = {
    getHandler: () => ({}),
    getClass: () => class {},
    switchToHttp: () => ({
      getRequest: () => ({ user: { roles: ["ADMIN"], isModerator: false } }),
    }),
  } as unknown as ExecutionContext;

  it("allows when user has required role", () => {
    jest.spyOn(reflector, "getAllAndOverride").mockReturnValue(["ADMIN"]);
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it("throws when moderator required and user not moderator", () => {
    jest.spyOn(reflector, "getAllAndOverride").mockReturnValue(["MODERATOR"]);
    expect(() => guard.canActivate(ctx)).toThrow("User is not a moderator");
  });

  it("passes when no roles required", () => {
    jest
      .spyOn(reflector, "getAllAndOverride")
      .mockReturnValue(undefined as any);
    expect(guard.canActivate(ctx)).toBe(true);
  });
});
