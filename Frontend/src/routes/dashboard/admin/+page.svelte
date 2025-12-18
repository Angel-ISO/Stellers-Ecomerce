<script lang="ts">
	import DashboardHeader from '../components/DashboardHeader.svelte';
	import Card from '$lib/components/ui/card.svelte';
	import Button from '$lib/components/ui/button.svelte';
	import { Settings, FolderTree, Users, Shield } from 'lucide-svelte';
	import { goto } from '$app/navigation';
</script>

<DashboardHeader title="Administración" subtitle="Panel de control del administrador">
</DashboardHeader>

<div class="p-6 space-y-6">
	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
		<Card class="p-6 hover:shadow-lg transition-shadow cursor-pointer" onclick={() => goto('/dashboard/admin/categorias')}>
			<div class="flex items-center gap-4">
				<div class="p-3 bg-blue-100 rounded-lg">
					<FolderTree class="w-6 h-6 text-blue-600" />
				</div>
				<div>
					<h3 class="font-semibold text-gray-900">Gestión de Categorías</h3>
					<p class="text-sm text-gray-600">Crear, editar y eliminar categorías</p>
				</div>
			</div>
		</Card>

		<Card class="p-6 hover:shadow-lg transition-shadow cursor-pointer" onclick={() => goto('/dashboard/admin/users')}>
			<div class="flex items-center gap-4">
				<div class="p-3 bg-green-100 rounded-lg">
					<Users class="w-6 h-6 text-green-600" />
				</div>
				<div>
					<h3 class="font-semibold text-gray-900">Gestión de Usuarios</h3>
					<p class="text-sm text-gray-600">Banear, desbanear y gestionar usuarios</p>
				</div>
			</div>
		</Card>

		<Card class="p-6 hover:shadow-lg transition-shadow cursor-pointer opacity-50">
			<div class="flex items-center gap-4">
				<div class="p-3 bg-purple-100 rounded-lg">
					<Shield class="w-6 h-6 text-purple-600" />
				</div>
				<div>
					<h3 class="font-semibold text-gray-900">Configuración</h3>
					<p class="text-sm text-gray-600">Próximamente</p>
				</div>
			</div>
		</Card>
	</div>
</div>

