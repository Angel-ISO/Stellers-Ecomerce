// Mock import.meta.env for Vite compatibility with Jest
Object.defineProperty(globalThis, 'import', {
	value: {
		meta: {
			env: {
				VITE_API_URL: 'http://localhost:3000'
			}
		}
	}
});

// Mock localStorage
const localStorageMock = {
	getItem: jest.fn(),
	setItem: jest.fn(),
	removeItem: jest.fn(),
	clear: jest.fn()
};
global.localStorage = localStorageMock;

// Mock window
global.window = {
	...global.window,
	localStorage: localStorageMock
};
