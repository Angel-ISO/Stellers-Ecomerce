<script lang="ts">
  import { user } from '$lib/lib/stores/supabase';
  
  export let productId: string;
  export let sellerId: string;
  export let onClick: () => void;

  $: isOwnProduct = $user?.id === sellerId;
  $: canChat = $user && !isOwnProduct;
</script>

{#if canChat}
  <button class="chat-button" on:click={onClick}>
    <svg 
      width="20" 
      height="20" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      stroke-width="2"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
    Chatear con el vendedor
  </button>
{:else if !$user}
  <button class="chat-button disabled" disabled>
    Inicia sesión para chatear
  </button>
{:else if isOwnProduct}
  <button class="chat-button disabled" disabled>
    Este es tu producto
  </button>
{/if}

<style>
  .chat-button {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.5rem;
    background: #3b82f6;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    box-shadow: 0 2px 4px rgba(59, 130, 246, 0.2);
  }

  .chat-button:hover:not(.disabled) {
    background: #2563eb;
    transform: translateY(-1px);
    box-shadow: 0 4px 6px rgba(59, 130, 246, 0.3);
  }

  .chat-button:active:not(.disabled) {
    transform: translateY(0);
  }

  .chat-button.disabled {
    background: #9ca3af;
    cursor: not-allowed;
    box-shadow: none;
  }

  .chat-button svg {
    flex-shrink: 0;
  }
</style>