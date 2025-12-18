import { writable } from 'svelte/store';

export interface Toast {
	id: string;
	message: string;
	type: 'success' | 'error' | 'info' | 'warning';
	dismissible?: boolean;
	timeout?: number;
}

function createToastStore() {
	const { subscribe, update } = writable<Toast[]>([]);

	function addToast(toast: Omit<Toast, 'id'>) {
		const id = Math.random().toString(36).substr(2, 9);
		const newToast: Toast = {
			id,
			message: toast.message,
			type: toast.type,
			dismissible: toast.dismissible ?? true,
			timeout: toast.timeout ?? 5000
		};

		update(toasts => [...toasts, newToast]);

		// Auto remove after timeout
		if (newToast.timeout && newToast.timeout > 0) {
			setTimeout(() => {
				removeToast(id);
			}, newToast.timeout);
		}

		return id;
	}

	function removeToast(id: string) {
		update(toasts => toasts.filter(toast => toast.id !== id));
	}

	function clearAll() {
		update(() => []);
	}

	return {
		subscribe,
		addToast,
		removeToast,
		clearAll
	};
}

export const toastStore = createToastStore();
export const addToast = toastStore.addToast;