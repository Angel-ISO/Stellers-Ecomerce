<script lang="ts">
    import DashboardHeader from '../components/DashboardHeader.svelte';
    import StatCard from '../components/StatCard.svelte';
    import Card from '$lib/components/ui/card.svelte';
	import Badge from '$lib/components/ui/badge.svelte';
	import Button from '$lib/components/ui/button.svelte';
    import Input from '$lib/components/ui/input.svelte';
    import { createProductsViewModel } from '$lib/viewmodels/Products/products.viewmodel.svelte';
	import { OrdersViewModel } from '$lib/viewmodels/Orders/orders.viewmodel.svelte';
	import { formatCurrency, formatDate } from '$lib/lib/utils';
	import { Plus, DollarSign, Package, TrendingUp, ShoppingCart } from 'lucide-svelte';
    import type { CreateProductInput } from '$lib/models/Products/ProductType';

    const productsVM = createProductsViewModel();
	const ordersVM = new OrdersViewModel();

	const stats = $derived([
		{
			title: 'Total Revenue',
			value: formatCurrency(ordersVM.totalRevenue()),
			change: '+12.5%',
			changeType: 'positive' as const,
			icon: DollarSign,
			iconColor: 'bg-green-500'
		},
		{
			title: 'Active Products',
			value: productsVM.activeProducts().toString(),
			change: `+${productsVM.products.length - productsVM.activeProducts()}`,
			changeType: 'neutral' as const,
			icon: Package,
			iconColor: 'bg-blue-500'
		},
		{
			title: 'Total Sales',
			value: ordersVM.deliveredOrders().toString(),
			change: '+8.2%',
			changeType: 'positive' as const,
			icon: TrendingUp,
			iconColor: 'bg-purple-500'
		},
		{
			title: 'Pending Orders',
			value: (ordersVM.pendingOrders() + ordersVM.processingOrders()).toString(),
			change: '+3',
			changeType: 'neutral' as const,
			icon: ShoppingCart,
			iconColor: 'bg-yellow-500'
		}
	]);

    let showCreateModal = $state(false);
    let form: CreateProductInput = $state({
        storeId: '',
        name: '',
        description: '',
        price: 0,
        stock: 0,
        categoryId: '',
        imageUrls: [],
        isActive: true
    });

    function openCreateProduct() {
        showCreateModal = true;
    }

    function closeCreateProduct() {
        showCreateModal = false;
    }

    async function submitCreateProduct() {
        if (!form.storeId || !form.name) return;
        await productsVM.createProduct({
            storeId: form.storeId,
            name: form.name,
            description: form.description || undefined,
            price: Number(form.price) || 0,
            stock: Number(form.stock) || 0,
            categoryId: form.categoryId || undefined,
            imageUrls: (form.imageUrls || []).filter(Boolean),
            isActive: form.isActive
        });
        showCreateModal = false;
        form = {
            storeId: '',
            name: '',
            description: '',
            price: 0,
            stock: 0,
            categoryId: '',
            imageUrls: [],
            isActive: true
        };
    }
</script>

<DashboardHeader title="Vender" subtitle="Manage your products and sales">
	{#snippet actions()}
        <Button variant="default" onclick={openCreateProduct}>
			<Plus class="w-4 h-4 mr-2" />
			Add Product
		</Button>
	{/snippet}
</DashboardHeader>

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

	<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
		<!-- Your Products -->
		<Card>
			<div class="p-6 border-b border-gray-200">
				<h2 class="text-xl font-bold text-gray-900">Your Products</h2>
				<p class="text-sm text-gray-600 mt-1">
					{productsVM.products.length} total products
				</p>
			</div>
			<div class="p-6 space-y-4">
				{#each productsVM.products.slice(0, 5) as product}
					<div class="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
						<img
							src={product.images[0]}
							alt={product.name}
							class="w-16 h-16 rounded-lg object-cover"
						/>
						<div class="flex-1 min-w-0">
							<p class="font-semibold text-gray-900 truncate">{product.name}</p>
							<p class="text-sm text-gray-600">{formatCurrency(product.price)}</p>
							<div class="flex items-center gap-2 mt-1">
								<Badge variant={productsVM.getProductStatusColor(product.status)} class="text-xs">
									{productsVM.getProductStatusLabel(product.status)}
								</Badge>
								<span class="text-xs text-gray-500">{product.stock} in stock</span>
							</div>
						</div>
						<div class="text-right">
							<p class="text-sm font-semibold text-gray-900">{product.sales}</p>
							<p class="text-xs text-gray-600">sales</p>
						</div>
					</div>
				{/each}
				<Button variant="outline" class="w-full" onclick={() => (window.location.href = '/dashboard/productos')}>
					View All Products
				</Button>
			</div>
		</Card>

		<!-- Recent Orders -->
		<Card>
			<div class="p-6 border-b border-gray-200">
				<h2 class="text-xl font-bold text-gray-900">Recent Orders</h2>
				<p class="text-sm text-gray-600 mt-1">
					{ordersVM.orders.length} total orders
				</p>
			</div>
			<div class="divide-y divide-gray-200">
				{#each ordersVM.orders.slice(0, 5) as order}
					<div class="p-4 hover:bg-gray-50 transition-colors">
						<div class="flex items-start justify-between mb-2">
							<div>
								<p class="font-semibold text-gray-900">{order.orderNumber}</p>
								<p class="text-sm text-gray-600">{order.customerName}</p>
								<p class="text-xs text-gray-500">{formatDate(order.createdAt)}</p>
							</div>
							<Badge variant={ordersVM.getOrderStatusColor(order.status)}>
								{ordersVM.getOrderStatusLabel(order.status)}
							</Badge>
						</div>
						<div class="flex items-center justify-between mt-2">
							<p class="text-sm text-gray-700">
								{order.items.length} item{order.items.length !== 1 ? 's' : ''}
							</p>
							<p class="font-bold text-gray-900">{formatCurrency(order.total)}</p>
						</div>
					</div>
				{/each}
				<div class="p-4">
					<Button variant="outline" class="w-full" onclick={() => (window.location.href = '/dashboard/historial')}>
						View All Orders
					</Button>
				</div>
			</div>
		</Card>
	</div>

	<!-- Product Status Overview -->
	<Card class="p-6">
		<h2 class="text-xl font-bold text-gray-900 mb-4">Product Status Overview</h2>
		<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
			<div class="p-4 bg-green-50 rounded-lg border border-green-200">
				<div class="flex items-center justify-between mb-2">
					<span class="text-sm font-medium text-green-900">Active</span>
					<Badge variant="success">{productsVM.activeProducts()}</Badge>
				</div>
				<p class="text-xs text-green-700">Products available for sale</p>
			</div>
			<div class="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
				<div class="flex items-center justify-between mb-2">
					<span class="text-sm font-medium text-yellow-900">Low Stock</span>
					<Badge variant="warning">{productsVM.lowStockProducts()}</Badge>
				</div>
				<p class="text-xs text-yellow-700">Products running low</p>
			</div>
			<div class="p-4 bg-red-50 rounded-lg border border-red-200">
				<div class="flex items-center justify-between mb-2">
					<span class="text-sm font-medium text-red-900">Out of Stock</span>
					<Badge variant="destructive">{productsVM.outOfStockProducts()}</Badge>
				</div>
				<p class="text-xs text-red-700">Products unavailable</p>
			</div>
		</div>
	</Card>
</div>

{#if showCreateModal}
    <div class="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center" role="dialog" aria-modal="true">
        <div class="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 overflow-hidden">
            <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h3 class="text-lg font-semibold text-gray-900">Create Product</h3>
                <button class="text-gray-500 hover:text-gray-700" aria-label="Close" onclick={closeCreateProduct}>✕</button>
            </div>
            <div class="p-6 space-y-4">
                <div>
                    <label for="storeId" class="block text-sm font-medium text-gray-700 mb-1">Store ID</label>
                    <Input id="storeId" bind:value={form.storeId} placeholder="store-123" />
                </div>
                <div>
                    <label for="name" class="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <Input id="name" bind:value={form.name} placeholder="Product name" />
                </div>
                <div>
                    <label for="description" class="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea id="description" bind:value={form.description} rows={3} placeholder="Describe the product" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"></textarea>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label for="price" class="block text-sm font-medium text-gray-700 mb-1">Price</label>
                        <Input id="price" type="number" min="0" step="0.01" bind:value={form.price} />
                    </div>
                    <div>
                        <label for="stock" class="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                        <Input id="stock" type="number" min="0" step="1" bind:value={form.stock} />
                    </div>
                </div>
                <div>
                    <label for="categoryId" class="block text-sm font-medium text-gray-700 mb-1">Category ID</label>
                    <Input id="categoryId" bind:value={form.categoryId} placeholder="category-abc" />
                </div>
                <div>
                    <label for="imageUrls" class="block text-sm font-medium text-gray-700 mb-1">Image URLs (comma separated)</label>
                    <Input
                        id="imageUrls"
                        value={(form.imageUrls || []).join(', ')}
                        on:input={(e) => {
                            const target = e.currentTarget as HTMLInputElement;
                            form.imageUrls = (target.value || '')
                                .split(',')
                                .map((s) => s.trim())
                                .filter(Boolean);
                        }}
                        placeholder="https://..., https://..."
                    />
                </div>
                <div class="flex items-center gap-2">
                    <input id="isActive" type="checkbox" bind:checked={form.isActive} class="w-4 h-4" />
                    <label for="isActive" class="text-sm text-gray-700">Active</label>
                </div>
            </div>
            <div class="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
                <Button variant="outline" onclick={closeCreateProduct}>Cancel</Button>
                <Button onclick={submitCreateProduct} disabled={!form.storeId || !form.name}>Create</Button>
            </div>
        </div>
    </div>
{/if}
