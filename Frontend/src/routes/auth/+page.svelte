<script lang="ts">
	import { ShoppingCart, Mail, Lock, User, Loader2, AlertCircle } from 'lucide-svelte';
	import { goto } from '$app/navigation';
	import AuthService from '$lib/services/Auth/Auth.service';
	import { authState } from '$lib/stores/auth.svelte';
	import type { Login, Register, ValidationErrors } from '$lib/models/Auth/AuthType';

	let isLogin = $state(true);
	let email = $state('');
	let password = $state('');
	let displayName = $state('');
	let bio = $state('');
	let confirmPassword = $state('');

	let isLoading = $state(false);
	let error = $state<string | null>(null);
	let validationErrors = $state<ValidationErrors>({});


	function validateEmail(email: string): string | null {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!email) return 'Email is required';
		if (!emailRegex.test(email)) return 'Invalid email format';
		return null;
	}

	function validatePassword(password: string): string | null {
		if (!password) return 'Password is required';
		if (password.length < 6) return 'Password must be at least 6 characters';
		return null;
	}

	function validateDisplayName(name: string): string | null {
		if (!name) return 'Name is required';
		if (name.length < 2) return 'Name must be at least 2 characters';
		return null;
	}

	function validateConfirmPassword(password: string, confirm: string): string | null {
		if (password !== confirm) return 'Passwords do not match';
		return null;
	}


	function validate(): boolean {
		const errors: ValidationErrors = {};


		const emailError = validateEmail(email);
		if (emailError) errors.email = emailError;


		const passwordError = validatePassword(password);
		if (passwordError) errors.password = passwordError;


		if (!isLogin) {
			const nameError = validateDisplayName(displayName);
			if (nameError) errors.displayName = nameError;

			const confirmError = validateConfirmPassword(password, confirmPassword);
			if (confirmError) errors.confirmPassword = confirmError;
		}

		validationErrors = errors;
		return Object.keys(errors).length === 0;
	}


	function clearError(field: keyof ValidationErrors) {
		validationErrors = {
			...validationErrors,
			[field]: undefined
		};
		error = null;
	}


	function toggleForm() {
		isLogin = !isLogin;
		email = '';
		password = '';
		displayName = '';
		bio = '';
		confirmPassword = '';
		error = null;
		validationErrors = {};
	}

	async function handleSubmit(e: Event) {
		e.preventDefault();

		if (!validate()) {
			return;
		}

		isLoading = true;
		error = null;

		try {
			if (isLogin) {
				const loginData: Login = { email, password };
				const response = await AuthService.login(loginData);

				authState.setUser(response.user);


				goto('/dashboard/productos');
			} else {
				const registerData: Register = {
					email,
					password,
					displayName,
					bio: bio || undefined
				};
				const response = await AuthService.register(registerData);
				authState.setUser(response.user);
				goto('/dashboard/productos');
			}
		} catch (err: any) {
			console.error('Authentication error:', err);
			const errorMessage = err.message || 'An error occurred';

			if (errorMessage.includes('Invalid credentials')) {
				error = 'Invalid email or password';
			} else if (errorMessage.includes('User already exists') || errorMessage.includes('409')) {
				error = 'An account with this email already exists';
			} else if (errorMessage.includes('Invalid input') || errorMessage.includes('400')) {
				error = 'Please check your input and try again';
			} else {
				error = errorMessage;
			}
		} finally {
			isLoading = false;
		}
	}

	async function handleGoogleSignIn() {
		isLoading = true;
		error = null;

		try {
			await AuthService.signInWithGoogle();
			console.log('Google sign in initiated');
		} catch (err: any) {
			console.error('Google sign in error:', err);
			error = err.message || 'Failed to sign in with Google';
			isLoading = false;
		}
	}
</script>

<div
	class="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center p-4"
>
	<div class="w-full max-w-md">
		<div class="text-center mb-8">
			<a href="/" class="inline-flex items-center gap-2 mb-2">
				<ShoppingCart class="w-10 h-10 text-blue-600" />
				<span class="text-3xl font-bold text-blue-600">Stellers</span>
			</a>
			<p class="text-gray-600">Your one-stop marketplace</p>
		</div>

		<div class="bg-white rounded-2xl shadow-xl p-8">
			<div class="mb-6">
				<h2 class="text-2xl font-bold text-gray-900 mb-2">
					{isLogin ? 'Welcome Back' : 'Create Account'}
				</h2>
				<p class="text-gray-600">
					{isLogin ? 'Sign in to continue shopping' : 'Join us and start shopping'}
				</p>
			</div>

			{#if error}
				<div class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
					<AlertCircle class="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
					<p class="text-sm text-red-700">{error}</p>
				</div>
			{/if}

			<form onsubmit={handleSubmit}>
				{#if !isLogin}
					<div class="mb-4">
						<label for="displayName" class="block text-sm font-medium text-gray-700 mb-2">
							Full Name <span class="text-red-500">*</span>
						</label>
						<div class="relative">
							<div class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
								<User class="w-5 h-5" />
							</div>
							<input
								type="text"
								id="displayName"
								bind:value={displayName}
								oninput={() => clearError('displayName')}
								required
								class="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent {validationErrors.displayName
									? 'border-red-500'
									: 'border-gray-300'}"
								placeholder="John Doe"
							/>
						</div>
						{#if validationErrors.displayName}
							<p class="text-sm text-red-500 mt-1">{validationErrors.displayName}</p>
						{/if}
					</div>
				{/if}

				<div class="mb-4">
					<label for="email" class="block text-sm font-medium text-gray-700 mb-2">
						Email Address <span class="text-red-500">*</span>
					</label>
					<div class="relative">
						<div class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
							<Mail class="w-5 h-5" />
						</div>
						<input
							type="email"
							id="email"
							bind:value={email}
							oninput={() => clearError('email')}
							required
							class="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent {validationErrors.email
								? 'border-red-500'
								: 'border-gray-300'}"
							placeholder="you@example.com"
						/>
					</div>
					{#if validationErrors.email}
						<p class="text-sm text-red-500 mt-1">{validationErrors.email}</p>
					{/if}
				</div>
				{#if !isLogin}
					<div class="mb-4">
						<label for="bio" class="block text-sm font-medium text-gray-700 mb-2">
							Bio (optional)
						</label>
						<!-- svelte-ignore element_invalid_self_closing_tag -->
						<textarea
							id="bio"
							bind:value={bio}
							rows="2"
							class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
							placeholder="Tell us about yourself..."
						/>
					</div>
				{/if}

				<div class="mb-4">
					<label for="password" class="block text-sm font-medium text-gray-700 mb-2">
						Password <span class="text-red-500">*</span>
					</label>
					<div class="relative">
						<div class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
							<Lock class="w-5 h-5" />
						</div>
						<input
							type="password"
							id="password"
							bind:value={password}
							oninput={() => clearError('password')}
							required
							class="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent {validationErrors.password
								? 'border-red-500'
								: 'border-gray-300'}"
							placeholder="••••••••"
						/>
					</div>
					{#if validationErrors.password}
						<p class="text-sm text-red-500 mt-1">{validationErrors.password}</p>
					{/if}
					{#if !isLogin}
						<p class="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
					{/if}
				</div>
				{#if !isLogin}
					<div class="mb-4">
						<label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-2">
							Confirm Password <span class="text-red-500">*</span>
						</label>
						<div class="relative">
							<div class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
								<Lock class="w-5 h-5" />
							</div>
							<input
								type="password"
								id="confirmPassword"
								bind:value={confirmPassword}
								oninput={() => clearError('confirmPassword')}
								required
								class="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent {validationErrors.confirmPassword
									? 'border-red-500'
									: 'border-gray-300'}"
								placeholder="••••••••"
							/>
						</div>
						{#if validationErrors.confirmPassword}
							<p class="text-sm text-red-500 mt-1">{validationErrors.confirmPassword}</p>
						{/if}
					</div>
				{/if}
				{#if isLogin}
					<div class="flex items-center justify-between mb-6">
						<label class="flex items-center">
							<input
								type="checkbox"
								class="w-4 h-4 text-cyan-500 border-gray-300 rounded focus:ring-cyan-500"
							/>
							<span class="ml-2 text-sm text-gray-700">Remember me</span>
						</label>
						<a href="/forgot-password" class="text-sm text-cyan-500 hover:text-cyan-600">
							Forgot password?
						</a>
					</div>
				{/if}
				<button
					type="submit"
					disabled={isLoading}
					class="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold py-3 rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
				>
					{#if isLoading}
						<Loader2 class="w-5 h-5 animate-spin" />
						{isLogin ? 'Signing In...' : 'Creating Account...'}
					{:else}
						{isLogin ? 'Sign In' : 'Create Account'}
					{/if}
				</button>
			</form>

			<div class="mt-6 mb-6 flex items-center">
				<div class="flex-1 border-t border-gray-300"></div>
				<span class="px-4 text-sm text-gray-500">OR</span>
				<div class="flex-1 border-t border-gray-300"></div>
			</div>


			<button
				type="button"
				onclick={handleGoogleSignIn}
				disabled={isLoading}
				class="w-full bg-white border-2 border-gray-300 text-gray-700 font-semibold py-3 rounded-lg hover:bg-gray-50 transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
			>
				<svg class="w-5 h-5" viewBox="0 0 24 24">
					<path
						fill="#4285F4"
						d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
					/>
					<path
						fill="#34A853"
						d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
					/>
					<path
						fill="#FBBC05"
						d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
					/>
					<path
						fill="#EA4335"
						d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
					/>
				</svg>
				Continue with Google
			</button>
			<div class="mt-6 text-center">
				<p class="text-gray-600">
					{isLogin ? "Don't have an account?" : 'Already have an account?'}
					<button
						onclick={toggleForm}
						disabled={isLoading}
						class="text-cyan-500 hover:text-cyan-600 font-semibold ml-1 disabled:opacity-50"
					>
						{isLogin ? 'Sign Up' : 'Sign In'}
					</button>
				</p>
			</div>
		</div>

		<div class="mt-8 text-center text-sm text-gray-600">
			<p>By continuing, you agree to our Terms of Service and Privacy Policy</p>
		</div>
	</div>
</div>
