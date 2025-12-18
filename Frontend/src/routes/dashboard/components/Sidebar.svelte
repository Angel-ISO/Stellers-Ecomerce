<script lang="ts">
	import { page } from '$app/stores';
	import Avatar from '$lib/components/ui/avatar.svelte';
	import Separator from '$lib/components/ui/separator.svelte';
	import { cn } from '$lib/lib/utils';
	import { authState } from '$lib/stores/auth.svelte';

	import {
		ChevronLeft,
		History,
		LayoutDashboard,
		LogOut,
		Package,
		ShoppingBag,
		Store,
		Home,
		Shield,
		FileText,
		ClipboardList,
		Users,
		ShoppingCart,
		UserCircle,
		MessageCircle
	} from 'lucide-svelte';
	import { goto } from '$app/navigation';
	import AuthService from '$lib/services/Auth/Auth.service';

	interface Props {
		collapsed?: boolean;
		onToggle?: () => void;
	}

	let { collapsed = $bindable(false), onToggle }: Props = $props();

	const user = authState.user;

	const allNavItems = [
		{ href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, requiresAuth: false },
		{ href: '/productos', label: 'Ir al catalogo', icon: ShoppingBag, requiresAuth: false },
		{ href: '/', label: 'inicio', icon: Home, requiresAuth: false },
		//{ href: '/dashboard/comprar', label: 'Comprar', icon: ShoppingBag, requiresAuth: false },
		{ href: '/dashboard/vender', label: 'Vender', icon: Store, requiresAuth: true, requiresRole: 'SELLER' },
		{ href: '/dashboard/productos', label: 'Productos', icon: Package, requiresAuth: true, requiresRole: 'SELLER' },
		{ href: '/dashboard/clientes', label: 'Clientes', icon: Users, requiresAuth: false },
		{ href: '/dashboard/historial', label: 'Historial', icon: History, requiresAuth: true },
		{ href: '/dashboard/chats', label: 'Chats', icon: MessageCircle, requiresAuth: true },
		{ href: '/dashboard/solicitar-vendedor', label: 'Solicitar ser Vendedor', icon: FileText, requiresAuth: true, hideIfSeller: true },
		{ href: '/dashboard/admin', label: 'Administración', icon: Shield, requiresAuth: true, requiresRole: 'MODERATOR' },
		{ href: '/dashboard/admin/solicitudes-vendedor', label: 'Solicitudes de Vendedor', icon: ClipboardList, requiresAuth: true, requiresRole: 'MODERATOR' }
	];

	const navItems = $derived(
		allNavItems.filter((item) => {
			if (item.requiresAuth && !authState.isAuthenticated) return false;
			if (item.requiresRole === 'SELLER' && !authState.isSeller()) return false;
			if (item.requiresRole === 'MODERATOR' && !authState.isModerator()) return false;
			if (item.hideIfSeller && authState.isSeller()) return false;
			return true;
		})
	);

	function handleLogout() {
		authState.logout();
		goto('/auth');
	}

	function isActive(href: string): boolean {
		return $page.url.pathname === href;
	}

	function handleToggle() {
		collapsed = !collapsed;
		onToggle?.();
	}
	
</script>

<aside
	class={cn(
		'fixed left-0 top-0 z-40 h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300',
		collapsed ? 'w-16' : 'w-64'
	)}
>
	<div class="flex h-full flex-col">
		<!-- Header -->
		<div class="flex h-16 items-center justify-between px-4 border-b border-sidebar-border">
			{#if !collapsed}
				<a href="/" class="flex items-center gap-2">
					<ShoppingCart class="w-8 h-8 text-cyan-500" />
					<span class="text-xl font-bold bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent">
						Stellers
					</span>
				</a>
			{:else}
				<a href="/" class="flex items-center justify-center w-full">
					<ShoppingCart class="w-8 h-8 text-cyan-500" />
				</a>
			{/if}
			<button
				onclick={handleToggle}
				class={cn(
					'p-1.5 rounded-lg hover:bg-sidebar-accent transition-colors',
					collapsed && 'hidden'
				)}
			>
				<ChevronLeft class="w-5 h-5 text-sidebar-foreground" />
			</button>
		</div>

		<!-- Navigation -->
		<nav class="flex-1 overflow-y-auto p-4">
			<ul class="space-y-1">
				{#each navItems as item}
					<li>
						<a
							href={item.href}
							class={cn(
								'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
								isActive(item.href)
									? 'bg-sidebar-accent text-sidebar-accent-foreground'
									: 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
								collapsed && 'justify-center'
							)}
							title={collapsed ? item.label : undefined}
						>
							<item.icon class="w-5 h-5 shrink-0" />
							{#if !collapsed}
								<span>{item.label}</span>
							{/if}
						</a>
					</li>
				{/each}
			</ul>
		</nav>

		<!-- User Section -->
		<div class="border-t border-sidebar-border p-4">
			{#if !collapsed}
				<a href="/dashboard/perfil" class="block mb-3 group">
					<div class="flex items-center gap-3 p-2 rounded-lg hover:bg-sidebar-accent transition-colors">
						{#if user?.avatarUrl}
							<img src={user?.avatarUrl} alt={user?.name} class="w-10 h-10 rounded-full ring-2 ring-transparent group-hover:ring-cyan-500 transition-all" />
						{:else}
							<Avatar
								fallback="JD"
								class="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 text-white ring-2 ring-transparent group-hover:ring-cyan-500 transition-all"
							/>
						{/if}
						<div class="flex-1 min-w-0">
							<p class="text-sm font-medium text-sidebar-foreground truncate group-hover:text-cyan-600 transition-colors">{user?.name}</p>
							<p class="text-xs text-sidebar-foreground/60 truncate">Ver perfil</p>
						</div>
						<UserCircle class="w-4 h-4 text-sidebar-foreground/40 group-hover:text-cyan-500 transition-colors" />
					</div>
				</a>
				<Separator class="my-3" />
				<button
					onclick={handleLogout}
					class="flex items-center gap-3 px-3 py-2 text-sm text-sidebar-foreground hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors w-full"
				>
					<LogOut class="w-5 h-5" />
					<span>Cerrar sesión</span>
				</button>
			{:else}
				<div class="flex flex-col items-center gap-3">
					<Avatar
						fallback="JD"
						class="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 text-white"
					/>
					<button
						onclick={handleLogout}
						class="p-2 text-sidebar-foreground hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
						title="Cerrar sesión"
					>
						<LogOut class="w-5 h-5" />
					</button>
				</div>
			{/if}
		</div>
	</div>
</aside>

{#if !collapsed}
	<button
		onclick={handleToggle}
		class="fixed left-64 top-20 z-50 p-1.5 bg-white border border-gray-200 rounded-r-lg shadow-md hover:bg-gray-50 transition-colors lg:hidden"
	>
		<ChevronLeft class="w-4 h-4" />
	</button>
{:else}
	<button
		onclick={handleToggle}
		class="fixed left-16 top-20 z-50 p-1.5 bg-white border border-gray-200 rounded-r-lg shadow-md hover:bg-gray-50 transition-colors"
	>
		<ChevronLeft class="w-4 h-4 rotate-180" />
	</button>
{/if}
