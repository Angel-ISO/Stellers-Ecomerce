<script lang="ts">
	import { onMount } from 'svelte';
	import DashboardHeader from '../../components/DashboardHeader.svelte';
	import Card from '$lib/components/ui/card.svelte';
	import Button from '$lib/components/ui/button.svelte';
	import Input from '$lib/components/ui/input.svelte';
	import { ArrowLeft, Plus, Edit, Trash2, Save, X } from 'lucide-svelte';
	import { goto } from '$app/navigation';
	import categoryService, { type CategoryOutput, type CreateCategoryInput } from '$lib/services/Categories/Category.service';

	let categories = $state<CategoryOutput[]>([]);
	let isLoading = $state(true);
	let showCreateForm = $state(false);
	let editingCategory = $state<CategoryOutput | null>(null);
	let formData = $state<CreateCategoryInput>({
		name: '',
		parentId: undefined
	});

	onMount(async () => {
		await loadCategories();
	});

	function flattenCategories(categories: CategoryOutput[], level = 0): CategoryOutput[] {
		const flattened: CategoryOutput[] = [];
		for (const category of categories) {
			flattened.push({ ...category, level }); // Add level for indentation if needed
			if (category.children && category.children.length > 0) {
				flattened.push(...flattenCategories(category.children, level + 1));
			}
		}
		return flattened;
	}

	async function loadCategories() {
		isLoading = true;
		try {
			const response: any = await categoryService.getAllCategories();
			const hierarchicalCategories = response?.data || response || [];
			categories = flattenCategories(hierarchicalCategories);
		} catch (error) {
			console.error('Error loading categories:', error);
		} finally {
			isLoading = false;
		}
	}

	function startCreate() {
		formData = { name: '', parentId: undefined };
		editingCategory = null;
		showCreateForm = true;
	}

	function startEdit(category: CategoryOutput) {
		editingCategory = category;
		formData = { name: category.name, parentId: category.parentId };
		showCreateForm = true;
	}

	function cancelForm() {
		showCreateForm = false;
		editingCategory = null;
		formData = { name: '', parentId: undefined };
	}

	async function handleSubmit() {
		if (!formData.name.trim()) {
			alert('El nombre de la categoría es requerido');
			return;
		}

		try {
			if (editingCategory) {
				await categoryService.updateCategory(editingCategory.id, formData);
			} else {
				await categoryService.createCategory(formData);
			}
			cancelForm();
			await loadCategories();
		} catch (error: any) {
			console.error('Error saving category:', error);
			alert(error.message || 'Error al guardar la categoría');
		}
	}

	async function handleDelete(categoryId: string) {
		if (!confirm('¿Estás seguro de que quieres eliminar esta categoría?')) {
			return;
		}

		try {
			await categoryService.deleteCategory(categoryId);
			await loadCategories();
		} catch (error: any) {
			console.error('Error deleting category:', error);
			alert(error.message || 'Error al eliminar la categoría');
		}
	}
</script>

<DashboardHeader title="Gestión de Categorías" subtitle="Administrar categorías del sistema">
	{#snippet actions()}
		<Button variant="outline" onclick={() => goto('/dashboard/admin')}>
			<ArrowLeft class="w-4 h-4 mr-2" />
			Volver
		</Button>
		<Button variant="default" onclick={startCreate}>
			<Plus class="w-4 h-4 mr-2" />
			Nueva Categoría
		</Button>
	{/snippet}
</DashboardHeader>

<div class="p-6 space-y-6">
	{#if showCreateForm}
		<Card class="p-6">
			<h3 class="text-lg font-semibold text-gray-900 mb-4">
				{editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
			</h3>
			<div class="space-y-4">
				<div>
					<label for="name" class="block text-sm font-medium text-gray-700 mb-2">
						Nombre <span class="text-red-500">*</span>
					</label>
					<Input id="name" bind:value={formData.name} placeholder="Nombre de la categoría" />
				</div>
				<div>
					<label for="parentId" class="block text-sm font-medium text-gray-700 mb-2">
						Categoría Padre (opcional)
					</label>
					<select
						id="parentId"
						bind:value={formData.parentId}
						class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
					>
						<option value={undefined}>Sin categoría padre</option>
						{#each categories.filter((c) => c.id !== editingCategory?.id) as cat}
							<option value={cat.id}>{cat.name}</option>
						{/each}
					</select>
				</div>
				<div class="flex gap-2">
					<Button variant="default" onclick={handleSubmit}>
						<Save class="w-4 h-4 mr-2" />
						Guardar
					</Button>
					<Button variant="outline" onclick={cancelForm}>
						<X class="w-4 h-4 mr-2" />
						Cancelar
					</Button>
				</div>
			</div>
		</Card>
	{/if}

	<Card>
		<div class="overflow-x-auto">
			{#if isLoading}
				<div class="p-8 text-center text-gray-500">Cargando categorías...</div>
			{:else if categories.length === 0}
				<div class="p-8 text-center text-gray-500">No hay categorías. Crea una nueva categoría para comenzar.</div>
			{:else}
				<table class="w-full">
					<thead class="bg-gray-50 border-b border-gray-200">
						<tr>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Categoría Padre</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
						</tr>
					</thead>
					<tbody class="bg-white divide-y divide-gray-200">
						{#each categories as category}
							<tr class="hover:bg-gray-50">
								<td class="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
									<span style="margin-left: {category.level * 20}px">{category.name}</span>
								</td>
								<td class="px-6 py-4 whitespace-nowrap text-gray-600">
									{category.parentId
										? categories.find((c) => c.id === category.parentId)?.name || category.parentId
										: '-'}
								</td>
								<td class="px-6 py-4 whitespace-nowrap">
									<div class="flex items-center gap-2">
										<button
											onclick={() => startEdit(category)}
											class="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
											title="Editar"
										>
											<Edit class="w-4 h-4" />
										</button>
										<button
											onclick={() => handleDelete(category.id)}
											class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
											title="Eliminar"
										>
											<Trash2 class="w-4 h-4" />
										</button>
									</div>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			{/if}
		</div>
	</Card>
</div>

