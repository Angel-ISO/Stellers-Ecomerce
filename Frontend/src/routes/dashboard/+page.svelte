<script lang="ts">
    import DashboardHeader from './components/DashboardHeader.svelte';
    import StatCard from './components/StatCard.svelte';
	import Card from '$lib/components/ui/card.svelte';
	import Badge from '$lib/components/ui/badge.svelte';
	import Button from '$lib/components/ui/button.svelte';
	import { DashboardViewModel } from '$lib/viewmodels/Dashboard/dashboard.viewmodel.svelte.js';
	import { formatCurrency, formatDate } from '$lib/lib/utils';
	import {
		DollarSign,
		ShoppingCart,
		Package,
		Users,
		ArrowRight,
		TrendingUp
	} from 'lucide-svelte';
	import { authState } from '$lib/stores/auth.svelte';

	const viewModel = new DashboardViewModel();

	const stats = $derived([
		{
			title: 'Total Revenue',
			value: formatCurrency(viewModel.totalRevenue),
			change: '+12.5%',
			changeType: 'positive' as const,
			icon: DollarSign,
			iconColor: 'bg-green-500'
		},
		{
			title: 'Total Orders',
			value: viewModel.totalOrders.toString(),
			change: '+8.2%',
			changeType: 'positive' as const,
			icon: ShoppingCart,
			iconColor: 'bg-blue-500'
		},
		{
			title: 'Total Products',
			value: viewModel.totalProducts.toString(),
			change: '+3',
			changeType: 'positive' as const,
			icon: Package,
			iconColor: 'bg-purple-500'
		},
		{
			title: 'Total Customers',
			value: viewModel.totalCustomers.toString(),
			change: '+15.3%',
			changeType: 'positive' as const,
			icon: Users,
			iconColor: 'bg-cyan-500'
		}
	]);
</script>

<DashboardHeader title="Dashboard" subtitle="Welcome back! Here's what's happening today">
	{#snippet actions()}
		<Button
			variant="outline"
			onclick={() => viewModel.refreshStats()}
			disabled={viewModel.isLoading}
		>
			{viewModel.isLoading ? 'Loading...' : 'Refresh'}
		</Button>
	{/snippet}
</DashboardHeader>



<div class="p-6 space-y-6">
	{#if authState.isAuthenticated && !authState.isSeller()}
		<Card class="p-6 text-center bg-blue-50 border-blue-200">
			<h2 class="text-2xl font-bold text-blue-900 mb-2">Become a Seller!</h2>
			<p class="text-blue-800 mb-4">
				Start selling your products on Stellers and reach a wider audience.
			</p>
			<a href="/dashboard/convertirse-vendedor">
				<Button variant="default">
					<ShoppingCart class="w-4 h-4 mr-2" />
					Convertirse en vendedor
				</Button>
			</a>
		</Card>
	{/if}
</div>


{#if authState.isAuthenticated && authState.isSeller()}
	<div class="p-6 space-y-6">
	<!-- Stats Grid -->
	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
		{#each stats as stat}
			<StatCard
				title={stat.title}
				value={stat.value}
				change={stat.change}
				changeType={stat.changeType}
				icon={stat.icon}
				iconColor={stat.iconColor}
			/>
		{/each}
	</div>

	<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
		<!-- Recent Orders -->
		<Card class="lg:col-span-2">
			<div class="p-6 border-b border-gray-200 flex items-center justify-between">
				<h2 class="text-xl font-bold text-gray-900">Ordenes recientes</h2>
				<a href="/dashboard/historial">
					<Button variant="ghost" size="sm">
						Ver todo
						<ArrowRight class="w-4 h-4 ml-1" />
					</Button>
				</a>
			</div>
			<div class="divide-y divide-gray-200">
				{#each viewModel.recentOrders as order}
					<div class="p-6 hover:bg-gray-50 transition-colors">
						<div class="flex items-start justify-between mb-2">
							<div>
								<p class="font-semibold text-gray-900">{order.orderNumber}</p>
								<p class="text-sm text-gray-600">{order.customerName}</p>
								<p class="text-xs text-gray-500">{formatDate(order.createdAt)}</p>
							</div>
							<Badge variant={viewModel.getOrderStatusColor(order.status)}>
								{order.status}
							</Badge>
						</div>
						<div class="flex items-center justify-between mt-3">
							<p class="text-sm text-gray-700">
								{order.items.length} item{order.items.length !== 1 ? 's' : ''}
							</p>
							<p class="font-bold text-gray-900">{formatCurrency(order.total)}</p>
						</div>
					</div>
				{/each}
			</div>
		</Card>
		<!-- Quick Stats -->
		<div class="space-y-6">
			<!-- Revenue Overview -->
			<Card class="p-6 bg-gradient-to-br from-cyan-500 to-blue-600 text-white">
				<div class="flex items-center gap-3 mb-4">
					<TrendingUp class="w-8 h-8" />
					<h3 class="text-xl font-bold">Monthly Growth</h3>
				</div>
				<p class="text-3xl font-bold mb-2">+{viewModel.stats.revenueGrowth}%</p>
				<p class="text-cyan-100">Revenue increase vs last month</p>
			</Card>

			<!-- Quick Actions -->
			<Card class="p-6">
				<h3 class="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
				<div class="space-y-2">
					<a href="/dashboard/productos">
						<Button variant="outline" class="w-full justify-start">
							<Package class="w-4 h-4 mr-2" />
							Manage Products
						</Button>
					</a>
					<a href="/dashboard/comprar">
						<Button variant="outline" class="w-full justify-start">
							<ShoppingCart class="w-4 h-4 mr-2" />
							Browse Shop
						</Button>
					</a>
					<a href="/dashboard/clientes">
						<Button variant="outline" class="w-full justify-start">
							<Users class="w-4 h-4 mr-2" />
							View Customers
						</Button>
					</a>
				</div>
			</Card>
		</div>
	</div>
</div>
{/if}


