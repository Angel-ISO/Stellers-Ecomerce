import { FilterProductsInput } from "../../dto/products/filter-products.input";
import { GetAllProductsUseCase } from "./get-all-products.usecase";

describe("GetAllProductsUseCase", () => {
  it("returns paginated products via filters", async () => {
    const mockRepo = {
      findAllWithFilters: jest
        .fn()
        .mockResolvedValue({
          data: [
            {
              id: "p1",
              name: "X",
              description: "",
              price: 10,
              images: [],
              storeId: "s1",
              categoryId: "c1",
              createdAt: new Date(),
              updatedAt: new Date(),
              isDeleted: false,
            },
          ],
          total: 1,
          page: 1,
          limit: 20,
        }),
    } as any;
    const usecase = new GetAllProductsUseCase(mockRepo);
    const input: FilterProductsInput = { page: 1, limit: 20 } as any;
    const res = await usecase.execute(input);
    expect(res.total).toBe(1);
    expect(res.data[0].id).toBe("p1");
  });
});
