import { UpdateUserUseCase } from "./update-user.usecase";

describe("UpdateUserUseCase", () => {
  it("maps updated user to output", async () => {
    const now = new Date();
    const mockRepo = {
      update: jest.fn().mockResolvedValue({
        id: "1",
        displayName: "New",
        bio: "Bio",
        avatarUrl: "url",
        isModerator: true,
        isBanned: false,
        preferences: { theme: "dark" },
        createdAt: now,
        updatedAt: now,
      }),
    } as any;

    const usecase = new UpdateUserUseCase(mockRepo);
    const out = await usecase.execute("1", { displayName: "New" } as any);
    expect(out.displayName).toBe("New");
    expect(out.isModerator).toBe(true);
  });
});
