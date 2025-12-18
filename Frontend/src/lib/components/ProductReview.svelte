<script lang="ts">
	import { onMount } from 'svelte';
	import Card from '$lib/components/ui/card.svelte';
	import Button from '$lib/components/ui/button.svelte';
	import Input from '$lib/components/ui/input.svelte';
	import { Star, Send, Edit, Trash2 } from 'lucide-svelte';
	import reviewService, { type ReviewOutput, type CreateReviewInput } from '$lib/services/Reviews/Review.service';
	import { authState } from '$lib/stores/auth.svelte';
	import { goto } from '$app/navigation';
	import UserService from '$lib/services/User/User.service';
	import type { User } from '$lib/models/Users/UserType';

	interface Props {
		productId: string;
	}


	interface commentWithUser extends ReviewOutput {
		reviewer?: User | null;
	}
	authState.initialize();
	const user = authState.user;

	let { productId }: Props = $props();

	let reviews = $state<commentWithUser[]>([]);
	let averageRating = $state(0);
	let totalReviews = $state(0);
	let isLoading = $state(true);
	let showReviewForm = $state(false);
	let rating = $state(0);
	let comment = $state('');
	let hoveredRating = $state(0);
	let userReview = $state<ReviewOutput | null>(null);

	onMount(async () => {
		await loadReviews();
	});

	const onChangeUserComment = async (userId : string): Promise<User | null> => {
		const user = await UserService.getUserById(userId);
		return user;
	} 

	async function loadReviews() {
		isLoading = true;

		try {
			const response: any = await reviewService.getProductReviews(productId);
			const data = response?.data || response;
			reviews = await Promise.all(data.reviews.map(async (r : ReviewOutput) => {
				return {
					...r,
					reviewer: await onChangeUserComment(r.reviewerId)
				}
			}))

			console.log(reviews);

			averageRating = data.averageRating || 0;
			totalReviews = data.totalReviews || 0;

			if (user) {
				userReview = reviews.find((r) => r.reviewerId === user?.id) || null;
			}
			
			
		} catch (error) {
			console.error('Error loading reviews:', error);
		} finally {
			isLoading = false;
		}
	}

	function handleSubmitReview() {
		if (!authState.isAuthenticated) {
			goto('/auth');
			return;
		}

		if (rating === 0) {
			alert('Por favor selecciona una calificación');
			return;
		}

		submitReview();
	}

	async function submitReview() {
		try {
			const reviewData: CreateReviewInput = {
				rating,
				comment: comment.trim() || undefined
			};

			if (userReview) {
				await reviewService.updateProductReview(productId, reviewData);
			} else {
				await reviewService.createProductReview(productId, reviewData);
			}

			rating = 0;
			comment = '';
			showReviewForm = false;
			await loadReviews();
		} catch (error: any) {
			console.error('Error submitting review:', error);
			alert(error.message || 'Error al enviar la valoración');
		}
	}

	async function handleDeleteReview(reviewId: string) {
		if (!confirm('¿Estás seguro de que quieres eliminar tu valoración?')) {
			return;
		}

		try {
			await reviewService.deleteReview(reviewId);
			await loadReviews();
		} catch (error) {
			console.error('Error deleting review:', error);
			alert('Error al eliminar la valoración');
		}
	}

	function editReview() {
		if (userReview) {
			rating = userReview.rating;
			comment = userReview.comment || '';
			showReviewForm = true;
		}
	}
</script>

<Card class="p-6">
	<div class="space-y-6">
		<div class="flex items-center justify-between">
			<div>
				<h3 class="text-lg font-semibold text-gray-900">Valoraciones</h3>
				<div class="flex items-center gap-2 mt-1">
					<div class="flex items-center">
						{#each Array(5) as _, i}
							<Star
								class="w-5 h-5 {i < Math.floor(averageRating)
									? 'fill-yellow-400 text-yellow-400'
									: 'text-gray-300'}"
							/>
						{/each}
					</div>
					<span class="text-sm text-gray-600">
						{averageRating.toFixed(1)} ({totalReviews} {totalReviews === 1 ? 'valoración' : 'valoraciones'})
					</span>
				</div>
			</div>
		</div>

		{#if authState.isAuthenticated && !userReview && !showReviewForm}
			<Button variant="default" onclick={() => (showReviewForm = true)}>
				<Star class="w-4 h-4 mr-2" />
				Escribir una valoración
			</Button>
		{/if}

		{#if showReviewForm}
			<div class="border-t pt-4 space-y-4">
				<div>
					<label class="block text-sm font-medium text-gray-700 mb-2">
						Calificación <span class="text-red-500">*</span>
					</label>
					<div class="flex items-center gap-1">
						{#each Array(5) as _, i}
							<button
								type="button"
								onclick={() => (rating = i + 1)}
								onmouseenter={() => (hoveredRating = i + 1)}
								onmouseleave={() => (hoveredRating = 0)}
								class="focus:outline-none"
							>
								<Star
									class="w-8 h-8 transition-colors {(hoveredRating > 0 ? i < hoveredRating : i < rating)
										? 'fill-yellow-400 text-yellow-400'
										: 'text-gray-300 hover:text-yellow-300'}"
								/>
							</button>
						{/each}
					</div>
				</div>

				<div>
					<label for="comment" class="block text-sm font-medium text-gray-700 mb-2">
						Comentario (opcional)
					</label>
					<textarea
						id="comment"
						bind:value={comment}
						rows="4"
						class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
						placeholder="Escribe tu comentario aquí..."
					/>
				</div>

				<div class="flex gap-2">
					<Button variant="default" onclick={handleSubmitReview}>
						<Send class="w-4 h-4 mr-2" />
						{userReview ? 'Actualizar' : 'Enviar'} Valoración
					</Button>
					<Button variant="outline" onclick={() => {
						showReviewForm = false;
						rating = 0;
						comment = '';
					}}>
						Cancelar
					</Button>
				</div>
			</div>
		{/if}

		{#if isLoading}
			<div class="text-center py-8 text-gray-500">Cargando valoraciones...</div>
		{:else if reviews.length === 0}
			<div class="text-center py-8 text-gray-500">
				No hay valoraciones aún. Sé el primero en valorar este producto.
			</div>
		{:else}
			<div class="border-t pt-4 space-y-4">
				{#each reviews as review}
					<div class="border-b border-gray-200 pb-4 last:border-b-0">
						<div class="flex items-start justify-between mb-2">
							<div class="flex items-center gap-3">
								{#if review.reviewer?.avatarUrl}
									<img
										src={review.reviewer.avatarUrl}
										alt={'Usuario'}
										class="w-10 h-10 rounded-full"
									/>
								{:else}
									<div class="w-10 h-10 rounded-full bg-cyan-500 flex items-center justify-center text-white font-semibold">
										{review.reviewer?.displayName?.[0] || 'U'}
									</div>
								{/if}
								<div>
									<p class="font-medium text-gray-900">
										{review.reviewer?.displayName || 'Usuario anónimo'}
									</p>
									<p class="text-xs text-gray-500">
										{new Date(review.createdAt).toLocaleDateString('es-ES')}
									</p>
								</div>
							</div>
							<div class="flex items-center gap-2">
								<div class="flex items-center">
									{#each Array(5) as _, i}
										<Star
											class="w-4 h-4 {i < review.rating
												? 'fill-yellow-400 text-yellow-400'
												: 'text-gray-300'}"
										/>
									{/each}
								</div>
								{#if authState.user?.id === review.reviewerId}
									<div class="flex gap-1">
										<button
											onclick={editReview}
											class="p-1 text-gray-600 hover:text-cyan-600"
											title="Editar"
										>
											<Edit class="w-4 h-4" />
										</button>
										<button
											onclick={() => handleDeleteReview(review.id)}
											class="p-1 text-gray-600 hover:text-red-600"
											title="Eliminar"
										>
											<Trash2 class="w-4 h-4" />
										</button>
									</div>
								{/if}
							</div>
						</div>
						{#if review.comment}
							<p class="text-gray-700 mt-2">{review.comment}</p>
						{/if}
					</div>
				{/each}
			</div>
		{/if}
	</div>
</Card>

