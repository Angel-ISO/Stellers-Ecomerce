import Swal from 'sweetalert2';
import { addToast } from '$lib/stores/toast';

interface AlertOptions {
    title: string;
    text?: string;
    icon?: 'success' | 'error' | 'warning' | 'info' | 'question';
    confirmButtonText?: string;
    showCancelButton?: boolean;
    cancelButtonText?: string;
}

export const showAlert = ({
    title,
    text,
    icon,
    confirmButtonText = 'OK',
    showCancelButton = false,
    cancelButtonText = 'Cancelar'
}: AlertOptions) => {
    return Swal.fire({
        title: title,
        text: text,
        icon: icon,
        confirmButtonText: confirmButtonText,
        showCancelButton: showCancelButton,
        cancelButtonText: cancelButtonText,
        customClass: {
            confirmButton: 'btn btn-primary',
            cancelButton: 'btn btn-secondary'
        },
        buttonsStyling: false
    });
}

export const showSuccessAlert = (text: string) => {
    return showAlert({
        title: '¡Éxito!',
        text: text,
        icon: 'success'
    });
}

export const showErrorAlert = (text: string) => {
    return showAlert({
        title: '¡Error!',
        text: text,
        icon: 'error'
    });
}

export const showWarningAlert = (text: string) => {
    return showAlert({
        title: 'Advertencia',
        text: text,
        icon: 'warning'
    });
}

export const showConfirmationAlert = (text: string, confirmButtonText: string = 'Confirmar') => {
  return Swal.fire({
    title: 'Confirmación',
    text: text,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: confirmButtonText,
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    customClass: {
      confirmButton: 'swal2-confirm',
      cancelButton: 'swal2-cancel'
    },
    buttonsStyling: true,
    reverseButtons: true
  });
};

interface InputAlertOptions {
  title: string;
  inputLabel: string;
  inputPlaceholder: string;
  confirmButtonText?: string;
}

export const showInputAlert = async ({
  title,
  inputLabel,
  inputPlaceholder,
  confirmButtonText = 'Confirmar'
}: InputAlertOptions) => {
  const { value: inputValue, isConfirmed } = await Swal.fire({
    title,
    input: 'text',
    inputLabel,
    inputPlaceholder,
    showCancelButton: true,
    confirmButtonColor: '#e53935',
    confirmButtonText,
    cancelButtonText: 'Cancelar',
    inputValidator: (value) => {
      if (!value) return 'Este campo no puede estar vacío';
    }
  });

  return { inputValue, isConfirmed };
};

/**
 * Muestra un toast notification
 * @param message - Mensaje del toast
 * @param type - Tipo de toast ('success', 'error', 'info', 'warning')
 * @param timeout - Tiempo en ms antes de que se oculte automáticamente (0 = no se oculta)
 */
export const toast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info', timeout: number = 5000) => {
  addToast({
    message,
    type,
    timeout
  });
};
