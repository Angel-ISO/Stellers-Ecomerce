import { createParams } from "./params.utils";

describe("params.utils", () => {
  it("creates params and caps pageSize", () => {
    const params = createParams({
      pageSize: 100,
      pageIndex: 0,
      search: "Hello",
      maxPageSize: 50,
    });
    expect(params.pageSize).toBe(50);
    expect(params.pageIndex).toBe(1);
    expect(params.search).toBe("hello");
  });

  it("immutably updates fields", () => {
    const params = createParams({ pageSize: 10, pageIndex: 2, search: "q" });
    const p2 = params.withPageSize(5);
    expect(p2.pageSize).toBe(5);
    const p3 = params.withPageIndex(3);
    expect(p3.pageIndex).toBe(3);
    const p4 = params.withSearch("WORLD");
    expect(p4.search).toBe("world");
  });
});
