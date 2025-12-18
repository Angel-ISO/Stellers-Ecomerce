export interface ConfirmOptions {
    title?: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'default';
}

class ConfirmStore {
    isOpen = $state(false);
    options = $state<ConfirmOptions>({
        message: '',
        variant: 'default'
    });
    resolvePromise: ((value: boolean) => void) | null = null;

    confirm(options: ConfirmOptions): Promise<boolean> {
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

export const confirmStore = new ConfirmStore();
