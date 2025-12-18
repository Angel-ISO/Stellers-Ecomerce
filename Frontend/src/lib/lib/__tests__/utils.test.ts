import { cn, formatCurrency, formatDate, formatNumber } from '../utils';

describe('Utils', () => {
	describe('cn', () => {
		it('should merge class names', () => {
			const result = cn('text-red-500', 'bg-blue-500');
			expect(result).toContain('text-red-500');
			expect(result).toContain('bg-blue-500');
		});

		it('should handle conflicting classes', () => {
			const result = cn('p-4', 'p-8');
			expect(result).toBe('p-8');
		});

		it('should handle conditional classes', () => {
			const result = cn('base-class', true && 'conditional-class', false && 'hidden-class');
			expect(result).toContain('base-class');
			expect(result).toContain('conditional-class');
			expect(result).not.toContain('hidden-class');
		});

		it('should handle arrays', () => {
			const result = cn(['class-1', 'class-2'], 'class-3');
			expect(result).toContain('class-1');
			expect(result).toContain('class-2');
			expect(result).toContain('class-3');
		});

		it('should handle empty input', () => {
			const result = cn();
			expect(result).toBe('');
		});
	});

	describe('formatCurrency', () => {
		it('should format integer as currency', () => {
			const result = formatCurrency(100);
			expect(result).toBe('$100.00');
		});

		it('should format decimal as currency', () => {
			const result = formatCurrency(123.45);
			expect(result).toBe('$123.45');
		});

		it('should format zero as currency', () => {
			const result = formatCurrency(0);
			expect(result).toBe('$0.00');
		});

		it('should format negative number as currency', () => {
			const result = formatCurrency(-50.25);
			expect(result).toBe('-$50.25');
		});

		it('should format large numbers as currency', () => {
			const result = formatCurrency(1234567.89);
			expect(result).toBe('$1,234,567.89');
		});
	});

	describe('formatDate', () => {
		it('should format date string', () => {
			const result = formatDate('2024-01-15T00:00:00.000Z');
			expect(result).toMatch(/Jan 1[45], 2024/); // Allow for timezone differences
		});

		it('should format Date object', () => {
			const date = new Date('2024-06-20T00:00:00.000Z');
			const result = formatDate(date);
			expect(result).toMatch(/Jun (19|20), 2024/); // Allow for timezone differences
		});

		it('should format ISO string', () => {
			const result = formatDate('2024-12-25T00:00:00.000Z');
			expect(result).toMatch(/Dec 2[45], 2024/);
		});
	});

	describe('formatNumber', () => {
		it('should format integer', () => {
			const result = formatNumber(1000);
			expect(result).toBe('1,000');
		});

		it('should format large number', () => {
			const result = formatNumber(1234567);
			expect(result).toBe('1,234,567');
		});

		it('should format decimal number', () => {
			const result = formatNumber(1234.56);
			expect(result).toBe('1,234.56');
		});

		it('should format zero', () => {
			const result = formatNumber(0);
			expect(result).toBe('0');
		});

		it('should format negative number', () => {
			const result = formatNumber(-5000);
			expect(result).toBe('-5,000');
		});
	});
});
