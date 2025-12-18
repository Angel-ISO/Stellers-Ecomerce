<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import { checkSystemHealth } from '$lib/services/Health/Health.service';

    let isOnline = $state(true); 
    let intervalId: any;

    const check = async () => {
        isOnline = await checkSystemHealth();
    };

    onMount(() => {
        check();  
        intervalId = setInterval(check, 30000);
    });

    onDestroy(() => {
        if (intervalId) clearInterval(intervalId);
    });
</script>

<div class="flex items-center gap-2 px-3 py-1 bg-white/50 backdrop-blur-sm rounded-full border border-gray-100 shadow-sm" title={isOnline ? "System Online" : "System Offline"}>
    <span class="relative flex h-3 w-3">
        {#if isOnline}
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
        {:else}
            <span class="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
        {/if}
    </span>
    <span class="text-xs font-medium text-gray-600">
        {isOnline ? 'System Online' : 'System Offline'}
    </span>
</div>
