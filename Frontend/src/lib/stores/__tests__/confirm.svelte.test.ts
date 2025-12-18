// Mock implementation of ConfirmStore
class ConfirmStore {
	isOpen = false;
	options: any = {
		message: '',
		variant: 'default'
	};
	resolvePromise: ((value: boolean) => void) | null = null;

	confirm(options: any): Promise<boolean> {
		this.options = {
			title: options.title || '¿Estás seguro?',
			message: options.message,
			confirmText: options.confirmText || 'Confirmar',
			cancelText: options.cancelText || 'Cancelar',
			variant: options.variant || 'default'
		};
		this.isOpen = true;

		return new Promise<boolean>((resolve) => {
			this.resolvePromise = resolve;
		});
	}

	handleConfirm() {
		this.isOpen = false;
		if (this.resolvePromise) {
			this.resolvePromise(true);
			this.resolvePromise = null;
		}
	}

	handleCancel() {
		this.isOpen = false;
		if (this.resolvePromise) {
			this.resolvePromise(false);
			this.resolvePromise = null;
		}
	}
}

const confirmStore = new ConfirmStore();

describe('ConfirmStore', () => {
	beforeEach(() => {
		confirmStore.isOpen = false;
		confirmStore.resolvePromise = null;
		confirmStore.options = {
			message: '',
			variant: 'default'
		};
	});

	describe('confirm', () => {
		it('should open dialog with provided message', () => {
			confirmStore.confirm({ message: 'Delete this item?' });

			expect(confirmStore.isOpen).toBe(true);
			expect(confirmStore.options.message).toBe('Delete this item?');
		});

		it('should use default title when not provided', () => {
			confirmStore.confirm({ message: 'Continue?' });

			expect(confirmStore.options.title).toBe('¿Estás seguro?');
		});

		it('should use custom title when provided', () => {
			confirmStore.confirm({
				message: 'Continue?',
				title: 'Custom Title'
			});

			expect(confirmStore.options.title).toBe('Custom Title');
		});

		it('should use default button texts when not provided', () => {
			confirmStore.confirm({ message: 'Continue?' });

			expect(confirmStore.options.confirmText).toBe('Confirmar');
			expect(confirmStore.options.cancelText).toBe('Cancelar');
		});

		it('should use custom button texts when provided', () => {
			confirmStore.confirm({
				message: 'Delete?',
				confirmText: 'Delete',
				cancelText: 'Keep'
			});

			expect(confirmStore.options.confirmText).toBe('Delete');
			expect(confirmStore.options.cancelText).toBe('Keep');
		});

		it('should set variant to danger', () => {
			confirmStore.confirm({
				message: 'Delete?',
				variant: 'danger'
			});

			expect(confirmStore.options.variant).toBe('danger');
		});

		it('should set variant to warning', () => {
			confirmStore.confirm({
				message: 'Warning',
				variant: 'warning'
			});

			expect(confirmStore.options.variant).toBe('warning');
		});

		it('should default variant to default', () => {
			confirmStore.confirm({ message: 'Continue?' });

			expect(confirmStore.options.variant).toBe('default');
		});

		it('should return a promise', () => {
			const result = confirmStore.confirm({ message: 'Continue?' });

			expect(result).toBeInstanceOf(Promise);
		});
	});

	describe('handleConfirm', () => {
		it('should close dialog', () => {
			confirmStore.isOpen = true;

			confirmStore.handleConfirm();

			expect(confirmStore.isOpen).toBe(false);
		});

		it('should resolve promise with true', async () => {
			const confirmPromise = confirmStore.confirm({ message: 'Continue?' });

			confirmStore.handleConfirm();

			const result = await confirmPromise;
			expect(result).toBe(true);
		});

		it('should clear resolvePromise after confirming', () => {
			confirmStore.confirm({ message: 'Continue?' });

			confirmStore.handleConfirm();

			expect(confirmStore.resolvePromise).toBeNull();
		});

		it('should not fail when no promise exists', () => {
			expect(() => {
				confirmStore.handleConfirm();
			}).not.toThrow();
		});
	});

	describe('handleCancel', () => {
		it('should close dialog', () => {
			confirmStore.isOpen = true;

			confirmStore.handleCancel();

			expect(confirmStore.isOpen).toBe(false);
		});

		it('should resolve promise with false', async () => {
			const confirmPromise = confirmStore.confirm({ message: 'Continue?' });

			confirmStore.handleCancel();

			const result = await confirmPromise;
			expect(result).toBe(false);
		});

		it('should clear resolvePromise after canceling', () => {
			confirmStore.confirm({ message: 'Continue?' });

			confirmStore.handleCancel();

			expect(confirmStore.resolvePromise).toBeNull();
		});

		it('should not fail when no promise exists', () => {
			expect(() => {
				confirmStore.handleCancel();
			}).not.toThrow();
		});
	});

	describe('integration', () => {
		it('should handle multiple sequential confirms', async () => {
			const promise1 = confirmStore.confirm({ message: 'First?' });
			confirmStore.handleConfirm();
			const result1 = await promise1;

			const promise2 = confirmStore.confirm({ message: 'Second?' });
			confirmStore.handleCancel();
			const result2 = await promise2;

			expect(result1).toBe(true);
			expect(result2).toBe(false);
		});
	});
});
