// Mock implementation of ToastStore
class ToastStore {
	toasts: any[] = [];

	show(message: string, type: string = 'info', duration: number = 3000) {
		const id = Math.random().toString(36).substring(2, 11);
		const toast = { id, message, type, duration };

		this.toasts.push(toast);

		if (duration > 0) {
			setTimeout(() => {
				this.remove(id);
			}, duration);
		}
	}

	success(message: string, duration?: number) {
		this.show(message, 'success', duration);
	}

	error(message: string, duration?: number) {
		this.show(message, 'error', duration);
	}

	warning(message: string, duration?: number) {
		this.show(message, 'warning', duration);
	}

	info(message: string, duration?: number) {
		this.show(message, 'info', duration);
	}

	remove(id: string) {
		this.toasts = this.toasts.filter((t) => t.id !== id);
	}
}

const toastStore = new ToastStore();

describe('ToastStore', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		jest.useFakeTimers();
		toastStore.toasts = [];
	});

	afterEach(() => {
		jest.useRealTimers();
	});

	describe('show', () => {
		it('should add toast to store', () => {
			toastStore.show('Test message', 'info');

			expect(toastStore.toasts).toHaveLength(1);
			expect(toastStore.toasts[0].message).toBe('Test message');
			expect(toastStore.toasts[0].type).toBe('info');
		});

		it('should generate unique id for each toast', () => {
			toastStore.show('Message 1', 'info');
			toastStore.show('Message 2', 'info');

			expect(toastStore.toasts[0].id).not.toBe(toastStore.toasts[1].id);
		});

		it('should auto-remove toast after duration', () => {
			toastStore.show('Test message', 'info', 3000);

			expect(toastStore.toasts).toHaveLength(1);

			jest.advanceTimersByTime(3000);

			expect(toastStore.toasts).toHaveLength(0);
		});

		it('should not auto-remove toast when duration is 0', () => {
			toastStore.show('Test message', 'info', 0);

			expect(toastStore.toasts).toHaveLength(1);

			jest.advanceTimersByTime(5000);

			expect(toastStore.toasts).toHaveLength(1);
		});

		it('should use default duration of 3000ms', () => {
			toastStore.show('Test message', 'info');

			expect(toastStore.toasts).toHaveLength(1);

			jest.advanceTimersByTime(2999);
			expect(toastStore.toasts).toHaveLength(1);

			jest.advanceTimersByTime(1);
			expect(toastStore.toasts).toHaveLength(0);
		});
	});

	describe('success', () => {
		it('should create success toast', () => {
			toastStore.success('Success message');

			expect(toastStore.toasts).toHaveLength(1);
			expect(toastStore.toasts[0].type).toBe('success');
			expect(toastStore.toasts[0].message).toBe('Success message');
		});

		it('should use custom duration', () => {
			toastStore.success('Success message', 5000);

			jest.advanceTimersByTime(4999);
			expect(toastStore.toasts).toHaveLength(1);

			jest.advanceTimersByTime(1);
			expect(toastStore.toasts).toHaveLength(0);
		});
	});

	describe('error', () => {
		it('should create error toast', () => {
			toastStore.error('Error message');

			expect(toastStore.toasts).toHaveLength(1);
			expect(toastStore.toasts[0].type).toBe('error');
			expect(toastStore.toasts[0].message).toBe('Error message');
		});
	});

	describe('warning', () => {
		it('should create warning toast', () => {
			toastStore.warning('Warning message');

			expect(toastStore.toasts).toHaveLength(1);
			expect(toastStore.toasts[0].type).toBe('warning');
			expect(toastStore.toasts[0].message).toBe('Warning message');
		});
	});

	describe('info', () => {
		it('should create info toast', () => {
			toastStore.info('Info message');

			expect(toastStore.toasts).toHaveLength(1);
			expect(toastStore.toasts[0].type).toBe('info');
			expect(toastStore.toasts[0].message).toBe('Info message');
		});
	});

	describe('remove', () => {
		it('should remove toast by id', () => {
			toastStore.show('Message 1', 'info');
			toastStore.show('Message 2', 'info');

			const idToRemove = toastStore.toasts[0].id;

			toastStore.remove(idToRemove);

			expect(toastStore.toasts).toHaveLength(1);
			expect(toastStore.toasts[0].id).not.toBe(idToRemove);
		});

		it('should not fail when removing non-existent id', () => {
			toastStore.show('Message', 'info');

			expect(() => {
				toastStore.remove('non-existent-id');
			}).not.toThrow();

			expect(toastStore.toasts).toHaveLength(1);
		});
	});
});
