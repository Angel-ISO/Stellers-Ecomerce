import Swal from 'sweetalert2';
import {
	showAlert,
	showConfirmationAlert,
	showErrorAlert,
	showSuccessAlert,
	showWarningAlert
} from '../alerts';

jest.mock('sweetalert2', () => {
	const mockFire = jest.fn().mockResolvedValue({ isConfirmed: true });
	return {
		default: {
			fire: mockFire
		},
		__esModule: true
	};
});

jest.mock('$lib/stores/toast', () => ({
	addToast: jest.fn()
}));

describe('Alert utilities', () => {
	const mockSwal = Swal as jest.Mocked<typeof Swal>;

	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe('showAlert', () => {
		it('should call Swal.fire with correct parameters', () => {
			const options = {
				title: 'Test Title',
				text: 'Test Text',
				icon: 'success' as const,
				confirmButtonText: 'OK',
				showCancelButton: false,
				cancelButtonText: 'Cancel'
			};

			showAlert(options);

			expect(mockSwal.fire).toHaveBeenCalledWith(
				expect.objectContaining({
					title: 'Test Title',
					text: 'Test Text',
					icon: 'success',
					confirmButtonText: 'OK',
					showCancelButton: false,
					cancelButtonText: 'Cancel'
				})
			);
		});

		it('should use default values for optional parameters', () => {
			showAlert({ title: 'Test' });

			expect(mockSwal.fire).toHaveBeenCalledWith(
				expect.objectContaining({
					title: 'Test',
					confirmButtonText: 'OK',
					showCancelButton: false,
					cancelButtonText: 'Cancelar'
				})
			);
		});
	});

	describe('showSuccessAlert', () => {
		it('should show success alert with correct message', () => {
			showSuccessAlert('Operation successful');

			expect(mockSwal.fire).toHaveBeenCalledWith(
				expect.objectContaining({
					title: '¡Éxito!',
					text: 'Operation successful',
					icon: 'success'
				})
			);
		});
	});

	describe('showErrorAlert', () => {
		it('should show error alert with correct message', () => {
			showErrorAlert('Something went wrong');

			expect(mockSwal.fire).toHaveBeenCalledWith(
				expect.objectContaining({
					title: '¡Error!',
					text: 'Something went wrong',
					icon: 'error'
				})
			);
		});
	});

	describe('showWarningAlert', () => {
		it('should show warning alert with correct message', () => {
			showWarningAlert('Be careful');

			expect(mockSwal.fire).toHaveBeenCalledWith(
				expect.objectContaining({
					title: 'Advertencia',
					text: 'Be careful',
					icon: 'warning'
				})
			);
		});
	});

	describe('showConfirmationAlert', () => {
		it('should show confirmation alert with default button text', () => {
			showConfirmationAlert('Are you sure?');

			expect(mockSwal.fire).toHaveBeenCalledWith(
				expect.objectContaining({
					title: 'Confirmación',
					text: 'Are you sure?',
					icon: 'question',
					showCancelButton: true,
					confirmButtonText: 'Confirmar',
					cancelButtonText: 'Cancelar'
				})
			);
		});

		it('should show confirmation alert with custom button text', () => {
			showConfirmationAlert('Delete this?', 'Delete');

			expect(mockSwal.fire).toHaveBeenCalledWith(
				expect.objectContaining({
					confirmButtonText: 'Delete',
					cancelButtonText: 'Cancelar'
				})
			);
		});
	});
});
