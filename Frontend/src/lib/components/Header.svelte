<script lang="ts">
	import { MapPin, Clipboard, Tag, ShoppingCart, Search, Menu, User } from 'lucide-svelte';
	import CartIcon from './CartIcon.svelte';
	import { authState } from '$lib/stores/auth.svelte';
	let searchQuery = $state('');


	authState.initialize();
	const user = authState.user;

</script>

<header class="bg-white border-b border-gray-200">
	<div class="bg-gray-50 border-b border-gray-200">
		<div class="container mx-auto px-4 py-2">
			<div class="flex items-center justify-between text-sm text-gray-600">
				<span>Welcome to worldwide Stellers!</span>
				<div class="flex items-center gap-6">
					<button class="flex items-center gap-2 hover:text-blue-600">
						<MapPin class="w-4 h-4" />
						Deliver to 423651
					</button>
					<button class="flex items-center gap-2 hover:text-blue-600">
						<Clipboard class="w-4 h-4" />
						Track your order
					</button>
					<button class="flex items-center gap-2 hover:text-blue-600">
						<Tag class="w-4 h-4" />
						All Offers
					</button>
				</div>
			</div>
		</div>
	</div>

	

	<div class="container mx-auto px-4 py-4">
		<div class="flex items-center justify-between gap-8">
			<a href="/" class="flex items-center gap-2">
				<ShoppingCart class="w-8 h-8 text-blue-600" />
				<span class="text-2xl font-bold text-blue-600">Stellers</span>
			</a>

			<div class="flex-1 max-w-2xl">
				<div class="relative">
					<input
						type="text"
						bind:value={searchQuery}
						placeholder="Search essentials, groceries and more..."
						class="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
					/>
					<button
						class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600"
					>
						<Search class="w-5 h-5" />
					</button>
				</div>
			</div>

			<div class="flex items-center gap-4">
				<button class="flex items-center gap-2 text-gray-700 hover:text-blue-600">
					<Menu class="w-6 h-6" />
				</button>
				{#if user}
					<a href="/dashboard" class="flex items-center gap-2 text-gray-700 hover:text-blue-600">
						<img src={user.avatarUrl} alt={user.name} class="w-6 h-6 rounded-full" />
						<span class="font-medium">{user.name}</span>
					</a>
				{:else}
					<a href="/auth" class="flex items-center gap-2 text-gray-700 hover:text-blue-600">
						<User class="w-6 h-6" />
						<span class="font-medium">Sign Up/Sign In</span>
					</a>
				{/if}
				<CartIcon />
			</div>
		</div>
	</div>
</header>
