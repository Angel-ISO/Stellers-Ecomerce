<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import DashboardHeader from '../../../components/DashboardHeader.svelte';
	import Card from '$lib/components/ui/card.svelte';
	import Button from '$lib/components/ui/button.svelte';
	import Input from '$lib/components/ui/input.svelte';
	import { ArrowLeft, Save, X, Loader2 } from 'lucide-svelte';
	import productService from '$lib/services/Products/Product.service';
	import type { ProductOutput, UpdateProductInput } from '$lib/models/Products/ProductType';

	// Get product ID from URL
	const productId = $page.params.id;

	// State
	let originalProduct = $state<ProductOutput | null>(null);
	let isLoadingProduct = $state(true);
	let loadError = $state<string | null>(null);

	// Form state using Svelte 5 runes
	let formData = $state<UpdateProductInput>({
		name: '',
		description: '',
		price: 0,
		stock: 0,
		categoryId: '',
		imageUrls: [],
		isActive: true
	});

	let isSubmitting = $state(false);
	let errors = $state<Record<string, string>>({});
	let imageUrlInput = $state('');

	// Load product data
	onMount(async () => {
		await loadProduct();
	});

	async function loadProduct() {
		isLoadingProduct = true;
		loadError = null;
		try {
			const response: any = await productService.getProduct(productId);

			// Handle different response structures
			let product: ProductOutput | null = null;
			if (response?.data?.data) {
				product = response.data.data;
			} else if (response?.data) {
				product = response.data;
			} else if (response) {
				product = response;
			}

			if (product) {
				originalProduct = product;
				// Populate form with existing data
				formData = {
					name: product.name,
					description: product.description || '',
					price: product.price,
					stock: product.stock,
					categoryId: product.categoryId || '',
					imageUrls: [...(product.imageUrls || [])],
					isActive: product.isActive
				};
			} else {
				loadError = 'Product not found';
			}
		} catch (err) {
			console.error('Error loading product:', err);
			loadError = 'Failed to load product';
		} finally {
			isLoadingProduct = false;
		}
	}

	// Validation
	function validate(): boolean {
		const newErrors: Record<string, string> = {};

		if (!formData.name?.trim()) {
			newErrors.name = 'Product name is required';
		}

		if (!formData.price || formData.price <= 0) {
			newErrors.price = 'Price must be greater than 0';
		}

		if (formData.stock === undefined || formData.stock < 0) {
			newErrors.stock = 'Stock cannot be negative';
		}

		errors = newErrors;
		return Object.keys(newErrors).length === 0;
	}

	// Handle form submission
	async function handleSubmit(e: Event) {
		e.preventDefault();

		if (!validate()) {
			return;
		}

		isSubmitting = true;

		try {
			// Only send changed fields
			const updates: UpdateProductInput = {};

			if (formData.name !== originalProduct?.name) {
				updates.name = formData.name;
			}
			if (formData.description !== originalProduct?.description) {
				updates.description = formData.description;
			}
			if (formData.price !== originalProduct?.price) {
				updates.price = formData.price;
			}
			if (formData.stock !== originalProduct?.stock) {
				updates.stock = formData.stock;
			}
			if (formData.categoryId !== originalProduct?.categoryId) {
				updates.categoryId = formData.categoryId;
			}
			if (JSON.stringify(formData.imageUrls) !== JSON.stringify(originalProduct?.imageUrls)) {
				updates.imageUrls = formData.imageUrls;
			}
			if (formData.isActive !== originalProduct?.isActive) {
				updates.isActive = formData.isActive;
			}

			await productService.updateProduct(productId, updates);
			goto(`/dashboard/productos/${productId}`);
		} catch (error) {
			console.error('Error updating product:', error);
			alert('Failed to update product. Please try again.');
		} finally {
			isSubmitting = false;
		}
	}

	// Handle cancel
	function handleCancel() {
		goto(`/dashboard/productos/${productId}`);
	}

	// Handle image URL input
	function addImageUrl() {
		if (imageUrlInput.trim()) {
			formData.imageUrls = [...(formData.imageUrls || []), imageUrlInput.trim()];
			imageUrlInput = '';
		}
	}

	function removeImageUrl(index: number) {
		formData.imageUrls = formData.imageUrls?.filter((_, i) => i !== index) || [];
	}

	// Check if form has changes
	const hasChanges = $derived(() => {
		if (!originalProduct) return false;

		return (
			formData.name !== originalProduct.name ||
			formData.description !== originalProduct.description ||
			formData.price !== originalProduct.price ||
			formData.stock !== originalProduct.stock ||
			formData.categoryId !== originalProduct.categoryId ||
			formData.isActive !== originalProduct.isActive ||
			JSON.stringify(formData.imageUrls) !== JSON.stringify(originalProduct.imageUrls)
		);
	});
</script>

<DashboardHeader title="Edit Product" subtitle="Update product information">
	{#snippet actions()}
		<Button variant="outline" onclick={handleCancel}>
			<ArrowLeft class="w-4 h-4 mr-2" />
			Cancel
		</Button>
	{/snippet}
</DashboardHeader>

<div class="p-6">
	{#if isLoadingProduct}
		<Card class="p-8">
			<div class="flex items-center justify-center">
				<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
				<span class="ml-4 text-gray-600">Loading product...</span>
			</div>
		</Card>
	{:else if loadError}
		<Card class="p-8">
			<div class="text-center">
				<p class="text-red-500 text-lg mb-4">{loadError}</p>
				<Button onclick={() => goto('/dashboard/productos')}>Back to Products</Button>
			</div>
		</Card>
	{:else if originalProduct}
		<Card class="max-w-4xl mx-auto">
			<div class="p-6">
				<!-- Product ID Info -->
				<div class="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
					<p class="text-sm text-blue-900">
						<span class="font-medium">Editing Product:</span>
						<span class="ml-2 font-mono">{originalProduct.id}</span>
					</p>
					<p class="text-xs text-blue-700 mt-1">
						Store: <span class="font-mono">{originalProduct.storeId}</span>
					</p>
				</div>

				<form onsubmit={handleSubmit} class="space-y-6">
					<!-- Product Name -->
					<div>
						<label for="name" class="block text-sm font-medium text-gray-700 mb-2">
							Product Name <span class="text-red-500">*</span>
						</label>
						<Input
							id="name"
							bind:value={formData.name}
							placeholder="Enter product name"
							class={errors.name ? 'border-red-500' : ''}
						/>
						{#if errors.name}
							<p class="text-sm text-red-500 mt-1">{errors.name}</p>
						{/if}
					</div>

					<!-- Description -->
					<div>
						<label for="description" class="block text-sm font-medium text-gray-700 mb-2">
							Description
						</label>
						<textarea
							id="description"
							bind:value={formData.description}
							placeholder="Enter product description"
							rows="4"
							class="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
						/>
					</div>

					<!-- Price and Stock -->
					<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div>
							<label for="price" class="block text-sm font-medium text-gray-700 mb-2">
								Price <span class="text-red-500">*</span>
							</label>
							<div class="relative">
								<span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
								<Input
									id="price"
									type="number"
									step="0.01"
									min="0"
									bind:value={formData.price}
									placeholder="0.00"
									class={`pl-7 ${errors.price ? 'border-red-500' : ''}`}
								/>
							</div>
							{#if errors.price}
								<p class="text-sm text-red-500 mt-1">{errors.price}</p>
							{/if}
						</div>

						<div>
							<label for="stock" class="block text-sm font-medium text-gray-700 mb-2">
								Stock <span class="text-red-500">*</span>
							</label>
							<Input
								id="stock"
								type="number"
								min="0"
								bind:value={formData.stock}
								placeholder="0"
								class={errors.stock ? 'border-red-500' : ''}
							/>
							{#if errors.stock}
								<p class="text-sm text-red-500 mt-1">{errors.stock}</p>
							{/if}
						</div>
					</div>

					<!-- Category -->
					<div>
						<label for="categoryId" class="block text-sm font-medium text-gray-700 mb-2">
							Category
						</label>
						<Input
							id="categoryId"
							bind:value={formData.categoryId}
							placeholder="Enter category"
						/>
						<p class="text-sm text-gray-500 mt-1">Optional: Assign this product to a category</p>
					</div>

					<!-- Image URLs -->
					<div>
						<label class="block text-sm font-medium text-gray-700 mb-2">Product Images</label>
						<div class="flex gap-2">
							<Input
								bind:value={imageUrlInput}
								placeholder="Enter image URL and press Enter or click Add"
								onkeydown={(e) => {
									if (e.key === 'Enter') {
										e.preventDefault();
										addImageUrl();
									}
								}}
							/>
							<Button type="button" variant="outline" onclick={addImageUrl}>Add</Button>
						</div>

						{#if formData.imageUrls && formData.imageUrls.length > 0}
							<div class="mt-3 space-y-2">
								{#each formData.imageUrls as url, index}
									<div
										class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
									>
										<img
											src={url}
											alt="Product preview"
											class="w-16 h-16 rounded object-cover"
											onerror={(e) => {
												e.currentTarget.src = '/placeholder-product.jpg';
											}}
										/>
										<span class="text-sm text-gray-700 flex-1 truncate">{url}</span>
										<button
											type="button"
											onclick={() => removeImageUrl(index)}
											class="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
											title="Remove image"
										>
											<X class="w-4 h-4" />
										</button>
									</div>
								{/each}
							</div>
						{:else}
							<p class="text-sm text-gray-500 mt-2">No images added yet</p>
						{/if}
					</div>

					<!-- Active Status -->
					<div class="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
						<input
							type="checkbox"
							id="isActive"
							bind:checked={formData.isActive}
							class="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
						/>
						<div>
							<label for="isActive" class="text-sm font-medium text-gray-700 cursor-pointer">
								Active Product
							</label>
							<p class="text-xs text-gray-500">
								Active products will be visible in the store and available for purchase
							</p>
						</div>
					</div>

					<!-- Change Indicator -->
					{#if hasChanges()}
						<div class="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
							<p class="text-sm text-yellow-900">
								<span class="font-medium">Unsaved changes</span> - Click "Save Changes" to
								update the product
							</p>
						</div>
					{/if}

					<!-- Form Actions -->
					<div class="flex justify-end gap-3 pt-6 border-t">
						<Button
							type="button"
							variant="outline"
							onclick={handleCancel}
							disabled={isSubmitting}
						>
							Cancel
						</Button>
						<Button type="submit" disabled={isSubmitting || !hasChanges()}>
							{#if isSubmitting}
								<Loader2 class="w-4 h-4 mr-2 animate-spin" />
								Saving...
							{:else}
								<Save class="w-4 h-4 mr-2" />
								Save Changes
							{/if}
						</Button>
					</div>
				</form>
			</div>
		</Card>
	{/if}
</div>
