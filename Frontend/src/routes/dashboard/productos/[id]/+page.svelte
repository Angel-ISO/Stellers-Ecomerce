<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import DashboardHeader from '../../components/DashboardHeader.svelte';
	import Card from '$lib/components/ui/card.svelte';
	import Button from '$lib/components/ui/button.svelte';
	import Badge from '$lib/components/ui/badge.svelte';
	import { ArrowLeft, Edit, Trash2, Package, DollarSign, Calendar, Store } from 'lucide-svelte';
	import productService from '$lib/services/Products/Product.service';
	import storeService from '$lib/services/Store/Store.service';
	import { ChatService } from '$lib/services/Chat/Chat.service';
	import type { ProductOutput } from '$lib/models/Products/ProductType';
	import type { Chat } from '$lib/models/Chat/ChatType';
	import { formatCurrency, formatDate } from '$lib/lib/utils';
	import { authState } from '$lib/stores/auth.svelte';

	//chat
	import ChatButton from '$lib/components/ui/ChatButton.svelte';
	import ChatModal from '$lib/components/ChatModal.svelte';
	import { user } from '$lib/lib/stores/supabase';
	import ProductReview from '$lib/components/ProductReview.svelte';

	// Get product ID from URL
	const productId = $page.params.id;

	// State
	let product = $state<ProductOutput | null>(null);
	let isLoading = $state(true);
	let store = $state<any>(null);
	let error = $state<string | null>(null);
	let currentImageIndex = $state(0);
	let chatModalOpen = $state(false); // estdo chat

	let sellerId = $derived(store?.ownerId);
	let isOwner = $state(false);

	async function checkOwnership() {
		if (!productId || !authState.user) {
			isOwner = false;
			return;
		}
		isOwner = await authState.canEditProduct(productId);
	}

	// Load product data
	onMount(async () => {
		await loadProduct();
		await checkOwnership();
	});

	async function loadProduct() {
		isLoading = true;
		error = null;
		try {
			if (productId) {
				const response: any = await productService.getProduct(productId);

				// Handle different response structures
				if (response?.data?.data) {
					product = response.data.data;
				} else if (response?.data) {
					product = response.data;
				} else if (response) {
					product = response;
				} else {
					error = 'Product not found';
				}

				if (product?.storeId) {
					const storeResponse: any = await storeService.getStore(product.storeId);
					store = storeResponse.data;
				}
				// Get or create chat
				if ($user?.id && product?.id) {
					try {
						const chat = await ChatService.getOrCreateChat(product.id, $user.id);
						product = { ...product, chat };
					} catch (chatError) {
						console.error('Error getting or creating chat:', chatError);
					}
				}
			}
		} catch (err) {
			console.error('Error loading product:', err);
			error = 'Failed to load product';
		} finally {
			isLoading = false;
		}
	}

	function handleBack() {
		goto('/dashboard/productos');
	}

	function handleEdit() {
		goto(`/dashboard/productos/editar/${productId}`);
	}

	async function handleDelete() {
		if (!confirm('Are you sure you want to delete this product?')) {
			return;
		}

		try {
			if (productId) {
				await productService.deleteProduct(productId);
				goto('/dashboard/productos');
			}
		} catch (err) {
			console.error('Error deleting product:', err);
			alert('Failed to delete product');
		}
	}

	function getStatusColor(product: ProductOutput): 'success' | 'destructive' | 'warning' | 'secondary' {
		if (!product.isActive) return 'secondary';
		if (product.stock === 0) return 'destructive';
		if (product.stock <= 10) return 'warning';
		return 'success';
	}

	function getStatusLabel(product: ProductOutput): string {
		if (!product.isActive) return 'Inactive';
		if (product.stock === 0) return 'Out of Stock';
		if (product.stock <= 10) return 'Low Stock';
		return 'In Stock';
	}

	//Funciones de Abrir/Cerrar chat
	function openChat() {
		if (!$user) {
			alert('Debes iniciar sesión para chatear');
			return;
		}
    chatModalOpen = true;
	}	

	function closeChat() {
		chatModalOpen = false;
	}

</script>

<DashboardHeader title="Product Details" subtitle="View product information">
	{#snippet actions()}
		<Button variant="outline" onclick={handleBack}>
			<ArrowLeft class="w-4 h-4 mr-2" />
			Back to Products
		</Button>
	{/snippet}
</DashboardHeader>

<div class="p-6">
	{#if isLoading}
		<Card class="p-8">
			<div class="flex items-center justify-center">
				<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
				<span class="ml-4 text-gray-600">Loading product...</span>
			</div>
		</Card>
	{:else if error}
		<Card class="p-8">
			<div class="text-center">
				<p class="text-red-500 text-lg mb-4">{error}</p>
				<Button onclick={handleBack}>Go Back</Button>
			</div>
		</Card>
	{:else if product}
		<div class="max-w-6xl mx-auto space-y-6">
			<!-- Main Product Info Card -->
			<Card class="p-6">
				<div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
					<!-- Images Section -->
					<div class="space-y-4">
						<!-- Main Image -->
						<div class="aspect-square rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
							{#if product.imageUrls && product.imageUrls.length > 0}
								<img
									src={product.imageUrls[currentImageIndex]}
									alt={product.name}
									class="w-full h-full object-cover"
									onerror={(e) => {
										(e.currentTarget as HTMLImageElement).src = '/placeholder-product.jpg';
									}}
								/>
							{:else}
								<div class="w-full h-full flex items-center justify-center">
									<Package class="w-24 h-24 text-gray-400" />
								</div>
							{/if}
						</div>

						<!-- Thumbnail Images -->
						{#if product.imageUrls && product.imageUrls.length > 1}
							<div class="grid grid-cols-4 gap-2">
								{#each product.imageUrls as imageUrl, index}
									<button
										onclick={() => (currentImageIndex = index)}
										class="aspect-square rounded-lg overflow-hidden border-2 transition-all {currentImageIndex ===
										index
											? 'border-cyan-500'
											: 'border-gray-200 hover:border-gray-300'}"
									>
										<img
											src={imageUrl}
											alt={`${product.name} thumbnail ${index + 1}`}
											class="w-full h-full object-cover"
											onerror={(e) => {
												(e.currentTarget as HTMLImageElement).src = '/placeholder-product.jpg';
											}}
												/>
											</button>
										{/each}
							</div>
						{/if}
					</div>

					<!-- Product Details -->
					<div class="space-y-6">
						<div>
							<div class="flex items-start justify-between mb-2">
								<h2 class="text-3xl font-bold text-gray-900">{product.name}</h2>
								<Badge variant={getStatusColor(product)}>{getStatusLabel(product)}</Badge>
							</div>
							<p class="text-4xl font-bold text-cyan-600 mt-4">
								{formatCurrency(product.price)}
							</p>
						</div>

						{#if product.description}
							<div>
								<h3 class="text-sm font-medium text-gray-700 mb-2">Description</h3>
								<p class="text-gray-600 leading-relaxed">{product.description}</p>
							</div>
						{/if}

						<!-- Quick Stats -->
						<div class="grid grid-cols-2 gap-4">
							<div class="p-4 bg-blue-50 rounded-lg border border-blue-200">
								<div class="flex items-center gap-2 mb-1">
									<Package class="w-4 h-4 text-blue-600" />
									<span class="text-sm text-blue-900 font-medium">Stock</span>
								</div>
								<p class="text-2xl font-bold text-blue-900">{product.stock}</p>
							</div>

							<div class="p-4 bg-purple-50 rounded-lg border border-purple-200">
								<div class="flex items-center gap-2 mb-1">
									<DollarSign class="w-4 h-4 text-purple-600" />
									<span class="text-sm text-purple-900 font-medium">Price</span>
								</div>
								<p class="text-2xl font-bold text-purple-900">{formatCurrency(product.price)}</p>
							</div>
						</div>

						<!-- Action Buttons -->
						{#if isOwner}
							<div class="flex gap-3 pt-4">
								<Button variant="default" onclick={handleEdit} class="flex-1">
									<Edit class="w-4 h-4 mr-2" />
									Edit Product
								</Button>
								<Button variant="destructive" onclick={handleDelete}>
									<Trash2 class="w-4 h-4 mr-2" />
									Delete
								</Button>
							</div>
						{/if}

						<!-- BOTÓN DE CHAT -->
						{#if sellerId}
							<div class="mt-4">
								<ChatButton 
									productId={product.id}
									{sellerId}
									onClick={openChat}
								/>
							</div>
						{/if}
						<!-- Modal del chat -->
						{#if sellerId}
						 	<ChatModal
								isOpen={chatModalOpen}
								productId={product.id}
								{sellerId}
								onClose={closeChat}
							/>
						{/if}
						
					</div>
				</div>
			</Card>

			<!-- Additional Information -->
			<Card class="p-6">
				<h3 class="text-lg font-semibold text-gray-900 mb-4">Additional Information</h3>
				<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
					<div class="space-y-4">
						<div>
							<label class="text-sm font-medium text-gray-700">Product ID</label>
							<p class="mt-1 text-gray-900 font-mono text-sm">{product.id}</p>
						</div>

						<div>
							<label class="text-sm font-medium text-gray-700 flex items-center gap-2">
								<Store class="w-4 h-4" />
								Store ID
							</label>
							<p class="mt-1 text-gray-900 font-mono text-sm">{product.storeId}</p>
						</div>

						<div>
							<label class="text-sm font-medium text-gray-700">Category</label>
							<p class="mt-1 text-gray-900">{product.categoryId || 'Uncategorized'}</p>
						</div>
					</div>

					<div class="space-y-4">
						<div>
							<label class="text-sm font-medium text-gray-700 flex items-center gap-2">
								<Calendar class="w-4 h-4" />
								Created At
							</label>
							<p class="mt-1 text-gray-900">{formatDate(product.createdAt)}</p>
						</div>

						{#if product.updatedAt}
							<div>
								<label class="text-sm font-medium text-gray-700 flex items-center gap-2">
									<Calendar class="w-4 h-4" />
									Last Updated
								</label>
								<p class="mt-1 text-gray-900">{formatDate(product.updatedAt)}</p>
							</div>
						{/if}

						<div>
							<label class="text-sm font-medium text-gray-700">Active Status</label>
							<p class="mt-1">
								<Badge variant={product.isActive ? 'success' : 'secondary'}>
									{product.isActive ? 'Active' : 'Inactive'}
								</Badge>
							</p>
						</div>
					</div>
				</div>
			</Card>

			<!-- Image URLs (if any) -->
			{#if product.imageUrls && product.imageUrls.length > 0}
				<Card class="p-6">
					<h3 class="text-lg font-semibold text-gray-900 mb-4">Image URLs</h3>
					<div class="space-y-2">
						{#each product.imageUrls as url, index}
							<div class="p-3 bg-gray-50 rounded-lg border border-gray-200">
								<span class="text-sm font-medium text-gray-700 mr-2">Image {index + 1}:</span>
								<a
									href={url}
									target="_blank"
									rel="noopener noreferrer"
									class="text-sm text-cyan-600 hover:text-cyan-700 underline break-all"
								>
									{url}
								</a>
							</div>
						{/each}
					</div>
				</Card>
			{/if}

			<!-- Reviews Section -->
			<ProductReview productId={product.id} />
		</div>
	{/if}
</div>
