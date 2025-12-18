<script lang="ts">
	import { goto } from '$app/navigation';
	import Button from '$lib/components/ui/button.svelte';
	import Card from '$lib/components/ui/card.svelte';
	import { AlertCircle, Home, ArrowLeft } from 'lucide-svelte';

	function goHome() {
		goto('/dashboard');
	}

	function goBack() {
		window.history.back();
	}
</script>

<div class="min-h-screen bg-gray-50 flex items-center justify-center p-4">
	<Card class="max-w-md w-full p-8 text-center">
		<AlertCircle class="w-16 h-16 text-red-500 mx-auto mb-4" />
		<h1 class="text-2xl font-bold text-gray-900 mb-2">Acceso No Autorizado</h1>
		<p class="text-gray-600 mb-6">
			No tienes permisos para acceder a esta página. Por favor, contacta al administrador si crees que esto es un error.
		</p>
		<div class="flex gap-3 justify-center">
			<Button variant="outline" onclick={goBack}>
				<ArrowLeft class="w-4 h-4 mr-2" />
				Volver
			</Button>
			<Button variant="default" onclick={goHome}>
				<Home class="w-4 h-4 mr-2" />
				Ir al Dashboard
			</Button>
		</div>
	</Card>
</div>

