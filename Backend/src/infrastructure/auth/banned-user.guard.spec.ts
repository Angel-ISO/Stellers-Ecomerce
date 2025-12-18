import { ExecutionContext } from "@nestjs/common";
import { BannedUserGuard } from "./banned-user.guard";

describe("BannedUserGuard", () => {
  const guard = new BannedUserGuard();

  const ctx = {
    switchToHttp: () => ({
      getRequest: () => ({ user: { isBanned: false } }),
    }),
  } as unknown as ExecutionContext;

  it("allows not banned users", () => {
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it("throws for banned users on non-allowed endpoints", () => {
    const bannedCtx = {
      switchToHttp: () => ({
        getRequest: () => ({ user: { isBanned: true }, url: "/private" }),
      }),
    } as unknown as ExecutionContext;
    expect(() => guard.canActivate(bannedCtx)).toThrow("banned");
  });
});
