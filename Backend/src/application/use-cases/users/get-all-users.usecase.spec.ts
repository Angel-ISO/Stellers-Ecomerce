import { createParams } from "../../../shared/utils/params.utils";
import { GetAllUsersUseCase } from "./get-all-users.usecase";

describe("GetAllUsersUseCase", () => {
  it("returns paginated users", async () => {
    const mockRepo = {
      findAll: jest.fn().mockResolvedValue({
        users: [
          {
            id: "1",
            displayName: "A",
            bio: "",
            avatarUrl: "",
            isModerator: false,
            isBanned: false,
            preferences: {},
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: "2",
            displayName: "B",
            bio: "",
            avatarUrl: "",
            isModerator: true,
            isBanned: false,
            preferences: {},
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        total: 2,
      }),
    } as any;

    const usecase = new GetAllUsersUseCase(mockRepo);
    const params = createParams({ pageSize: 10, pageIndex: 1, search: "" });
    const result = await usecase.execute(params);
    expect(result.total).toBe(2);
    expect(result.registers[0].id).toBe("1");
  });
});
