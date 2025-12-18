<script lang="ts" generics="T">
	import { cn } from '$lib/lib/utils';

	interface Column<T> {
		key: string;
		header: string;
		cell?: (item: T) => any;
		class?: string;
	}

	interface Props {
		data: T[];
		columns: Column<T>[];
		class?: string;
	}

	let { data, columns, class: className }: Props = $props();

	function getCellValue(item: T, column: Column<T>) {
		if (column.cell) {
			return column.cell(item);
		}
		return (item as any)[column.key];
	}
</script>

<div class={cn('rounded-lg border border-gray-200 overflow-hidden', className)}>
	<div class="overflow-x-auto">
		<table class="w-full">
			<thead class="bg-gray-50 border-b border-gray-200">
				<tr>
					{#each columns as column}
						<th
							class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
						>
							{column.header}
						</th>
					{/each}
				</tr>
			</thead>
			<tbody class="bg-white divide-y divide-gray-200">
				{#if data.length === 0}
					<tr>
						<td colspan={columns.length} class="px-6 py-8 text-center text-gray-500">
							No data available
						</td>
					</tr>
				{:else}
					{#each data as item}
						<tr class="hover:bg-gray-50 transition-colors">
							{#each columns as column}
								<td class={cn('px-6 py-4', column.class)}>
									{@html getCellValue(item, column)}
								</td>
							{/each}
						</tr>
					{/each}
				{/if}
			</tbody>
		</table>
	</div>
</div>
