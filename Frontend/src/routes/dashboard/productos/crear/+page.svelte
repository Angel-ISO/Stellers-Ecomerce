<script lang="ts">
	import DashboardHeader from '../../components/DashboardHeader.svelte';
	import Card from '$lib/components/ui/card.svelte';
	import Button from '$lib/components/ui/button.svelte';
	import Input from '$lib/components/ui/input.svelte';
	import { ArrowLeft, Save, X } from 'lucide-svelte';
	import { goto } from '$app/navigation';
	import type { CreateProductInput } from '$lib/models/Products/ProductType';
	import { createProductsViewModel } from '$lib/viewmodels/Products/products.viewmodel.svelte';

	const viewModel = createProductsViewModel();

	// Form state using Svelte 5 runes
	let formData = $state<CreateProductInput>({
		storeId: '',
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

	// Validation
	function validate(): boolean {
		const newErrors: Record<string, string> = {};

		if (!formData.name.trim()) {
			newErrors.name = 'Product name is required';
		}

		if (!formData.storeId.trim()) {
			newErrors.storeId = 'Store ID is required';
		}

		if (formData.price <= 0) {
			newErrors.price = 'Price must be greater than 0';
		}

		if (formData.stock < 0) {
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
			await viewModel.createProduct(formData);
			goto('/dashboard/productos');
		} catch (error) {
			console.error('Error creating product:', error);
		} finally {
			isSubmitting = false;
		}
	}

	// Handle cancel
	function handleCancel() {
		goto('/dashboard/productos');
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
</script>

<DashboardHeader title="Create Product" subtitle="Add a new product to your catalog">
	{#snippet actions()}
		<Button variant="outline" onclick={handleCancel}>
			<ArrowLeft class="w-4 h-4 mr-2" />
			Back to Products
		</Button>
	{/snippet}
</DashboardHeader>

<div class="p-6">
	<Card class="max-w-4xl mx-auto">
		<div class="p-6">
			<form onsubmit={handleSubmit} class="space-y-6">
				<!-- Store ID -->
				<div>
					<label for="storeId" class="block text-sm font-medium text-gray-700 mb-2">
						Store ID <span class="text-red-500">*</span>
					</label>
					<Input
						id="storeId"
						bind:value={formData.storeId}
						placeholder="Enter store ID"
						class={errors.storeId ? 'border-red-500' : ''}
					/>
					{#if errors.storeId}
						<p class="text-sm text-red-500 mt-1">{errors.storeId}</p>
					{/if}
				</div>

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
							value={String(formData.price)}
							oninput={(e) => {
								const target = e.currentTarget as HTMLInputElement;
								formData.price = target.value === '' ? 0 : Number(target.value);
							}}
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
							value={String(formData.stock)}
							oninput={(e) => {
								const target = e.currentTarget as HTMLInputElement;
								formData.stock = target.value === '' ? 0 : Number(target.value);
							}}
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
					<Input id="categoryId" bind:value={formData.categoryId} placeholder="Enter category" />
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

				<!-- Form Actions -->
				<div class="flex justify-end gap-3 pt-6 border-t">
					<Button type="button" variant="outline" onclick={handleCancel} disabled={isSubmitting}>
						Cancel
					</Button>
					<Button type="submit" disabled={isSubmitting}>
						<Save class="w-4 h-4 mr-2" />
						{isSubmitting ? 'Creating...' : 'Create Product'}
					</Button>
				</div>
			</form>
		</div>
	</Card>
</div>
