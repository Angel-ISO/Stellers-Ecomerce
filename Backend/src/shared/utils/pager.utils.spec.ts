import { createPager } from './pager.utils';

describe('pager.utils', () => {
  it('creates pager and maps/filters', () => {
    const items = Array.from({ length: 25 }, (_, i) => i + 1);
    const pager = createPager({ registers: items, total: 25, pageIndex: 1, pageSize: 10 });
    expect(pager.registers.slice(0, 10)).toEqual(items.slice(0, 10));
    expect(pager.total).toBe(25);
    expect(pager.pageIndex).toBe(1);
    expect(pager.pageSize).toBe(10);
    expect(pager.totalPages).toBe(Math.ceil(25/10));

    const mapped = pager.mapRegisters((n) => n * 2);
    expect(mapped.registers[0]).toBe(2);

    const filtered = pager.filterRegisters((n) => n % 2 === 0);
    expect(filtered.total).toBe(filtered.registers.length);
  });

  it('handles empty and invalid input', () => {
    const pager = createPager({ registers: [], total: 0, pageIndex: 1, pageSize: 10 });
    expect(pager.registers).toEqual([]);
    expect(pager.total).toBe(0);
  });
});
