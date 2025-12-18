// Mock authState
const mockAuthState = {
	isAuthenticated: false,
	logout: jest.fn()
};

jest.mock('$lib/stores/auth.svelte', () => ({
	authState: mockAuthState
}));

jest.mock('$app/navigation');

import { goto } from '$app/navigation';
import { startInactivityTimer, stopInactivityTimer } from '../inactivity';

describe('Inactivity Timer', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		jest.useFakeTimers();
		stopInactivityTimer();
		mockAuthState.isAuthenticated = false;
	});

	afterEach(() => {
		stopInactivityTimer();
		jest.useRealTimers();
	});

	describe('startInactivityTimer', () => {
		it('should add event listeners', () => {
			const addEventListenerSpy = jest.spyOn(window, 'addEventListener');

			startInactivityTimer();

			expect(addEventListenerSpy).toHaveBeenCalledWith('mousedown', expect.any(Function), {
				passive: true
			});
			expect(addEventListenerSpy).toHaveBeenCalledWith('mousemove', expect.any(Function), {
				passive: true
			});
			expect(addEventListenerSpy).toHaveBeenCalledWith('keypress', expect.any(Function), {
				passive: true
			});
			expect(addEventListenerSpy).toHaveBeenCalledWith('scroll', expect.any(Function), {
				passive: true
			});
			expect(addEventListenerSpy).toHaveBeenCalledWith('touchstart', expect.any(Function), {
				passive: true
			});
			expect(addEventListenerSpy).toHaveBeenCalledWith('click', expect.any(Function), {
				passive: true
			});
		});

		it('should logout user after 15 minutes of inactivity', () => {
			mockAuthState.isAuthenticated = true;

			startInactivityTimer();

			jest.advanceTimersByTime(15 * 60 * 1000);

			expect(mockAuthState.logout).toHaveBeenCalled();
			expect(goto).toHaveBeenCalledWith('/auth');
		});

		it('should not logout if user is not authenticated', () => {
			mockAuthState.isAuthenticated = false;

			startInactivityTimer();

			jest.advanceTimersByTime(15 * 60 * 1000);

			expect(mockAuthState.logout).not.toHaveBeenCalled();
		});

		it('should reset timer on user activity', () => {
			mockAuthState.isAuthenticated = true;

			startInactivityTimer();

			jest.advanceTimersByTime(10 * 60 * 1000); // 10 minutes

			// Simulate user activity
			window.dispatchEvent(new Event('mousedown'));

			jest.advanceTimersByTime(10 * 60 * 1000); // Another 10 minutes

			// Should not logout because timer was reset
			expect(mockAuthState.logout).not.toHaveBeenCalled();

			jest.advanceTimersByTime(5 * 60 * 1000 + 1); // 5 more minutes

			// Now should logout
			expect(mockAuthState.logout).toHaveBeenCalled();
		});
	});

	describe('stopInactivityTimer', () => {
		it('should remove event listeners', () => {
			const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');

			startInactivityTimer();
			stopInactivityTimer();

			expect(removeEventListenerSpy).toHaveBeenCalledWith('mousedown', expect.any(Function));
			expect(removeEventListenerSpy).toHaveBeenCalledWith('mousemove', expect.any(Function));
			expect(removeEventListenerSpy).toHaveBeenCalledWith('keypress', expect.any(Function));
			expect(removeEventListenerSpy).toHaveBeenCalledWith('scroll', expect.any(Function));
			expect(removeEventListenerSpy).toHaveBeenCalledWith('touchstart', expect.any(Function));
			expect(removeEventListenerSpy).toHaveBeenCalledWith('click', expect.any(Function));
		});

		it('should clear timeout', () => {
			mockAuthState.isAuthenticated = true;

			startInactivityTimer();
			stopInactivityTimer();

			jest.advanceTimersByTime(15 * 60 * 1000);

			expect(mockAuthState.logout).not.toHaveBeenCalled();
		});

		it('should not throw when called multiple times', () => {
			expect(() => {
				stopInactivityTimer();
				stopInactivityTimer();
			}).not.toThrow();
		});
	});
});
