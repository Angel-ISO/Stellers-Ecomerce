export default {
	preset: 'ts-jest',
	testEnvironment: 'jsdom',
	moduleFileExtensions: ['js', 'ts', 'svelte'],
	transform: {
		'^.+\\.ts$': [
			'ts-jest',
			{
				tsconfig: {
					allowJs: true,
					checkJs: true,
					esModuleInterop: true,
					forceConsistentCasingInFileNames: true,
					resolveJsonModule: true,
					skipLibCheck: true,
					sourceMap: true,
					strict: false,
					moduleResolution: 'bundler'
				}
			}
		]
	},
	moduleNameMapper: {
		'^\\$lib/config/env$': '<rootDir>/__mocks__/$lib/config/env.ts',
		'^\\$lib(.*)$': '<rootDir>/src/lib$1',
		'^\\$app(.*)$': '<rootDir>/__mocks__/$app$1',
		'^\\$env(.*)$': '<rootDir>/__mocks__/$env$1',
		'^lucide-svelte$': '<rootDir>/__mocks__/lucide-svelte.ts'
	},
	setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
	collectCoverageFrom: [
		'src/lib/**/*.{ts,js}',
		'!src/lib/**/*.d.ts',
		'!src/lib/index.ts',
		'!src/lib/models/**',
		'!src/lib/assets/**',
		'!src/lib/**/*.svelte.ts',
		'!src/lib/services/Chat/**',
		'!src/lib/services/User/**',
		'!src/lib/lib/stores/supabase.ts',
		'!src/lib/stores/toast.ts',
		'!src/lib/config/env.ts'
	],
	coverageThreshold: {
		global: {
			branches: 60,
			functions: 70,
			lines: 70,
			statements: 70
		}
	},
	testMatch: ['**/__tests__/**/*.test.(ts|js)', '**/*.test.(ts|js)'],
	coverageReporters: ['text', 'lcov', 'html'],
	coverageDirectory: 'coverage',
	reporters: [
		'default',
		[
			'jest-junit',
			{
				outputDirectory: '.',
				outputName: 'junit.xml'
			}
		]
	],
	testPathIgnorePatterns: ['/node_modules/', '/.svelte-kit/'],
	transformIgnorePatterns: ['node_modules/(?!(svelte)/)']
};
