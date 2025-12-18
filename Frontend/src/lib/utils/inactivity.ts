import { authState } from '$lib/stores/auth.svelte';
import { goto } from '$app/navigation';

const INACTIVITY_TIMEOUT = 15 * 60 * 1000;

let inactivityTimer: ReturnType<typeof setTimeout> | null = null;
let isActive = true;

const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];

function resetTimer() {
	if (inactivityTimer) {
		clearTimeout(inactivityTimer);
	}

	inactivityTimer = setTimeout(() => {
		if (authState.isAuthenticated) {
			authState.logout();
			goto('/auth');
		}
	}, INACTIVITY_TIMEOUT);
}

function handleActivity() {
	if (!isActive) {
		isActive = true;
	}
	resetTimer();
}

export function startInactivityTimer() {
	if (typeof window === 'undefined') return;

	isActive = true;
	resetTimer();

	events.forEach((event) => {
		window.addEventListener(event, handleActivity, { passive: true });
	});
}

export function stopInactivityTimer() {
	if (typeof window === 'undefined') return;

	if (inactivityTimer) {
		clearTimeout(inactivityTimer);
		inactivityTimer = null;
	}

	events.forEach((event) => {
		window.removeEventListener(event, handleActivity);
	});
}

