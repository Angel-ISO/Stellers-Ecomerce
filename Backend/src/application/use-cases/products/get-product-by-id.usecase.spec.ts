import { GetProductByIdUseCase } from "./get-product-by-id.usecase";

describe("GetProductByIdUseCase", () => {
  it("throws when not found", async () => {
    const mockRepo = { findById: jest.fn().mockResolvedValue(null) } as any;
    const usecase = new GetProductByIdUseCase(mockRepo as any);
    await expect(usecase.execute("missing")).rejects.toThrow("not found");
  });
});
