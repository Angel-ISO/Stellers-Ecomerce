<script lang="ts">
  import { fade, scale } from 'svelte/transition';
  import Chat from './Chat.svelte';
  import { ChatService } from '$lib/services/Chat/Chat.service';
  import { user } from '$lib/lib/stores/supabase';
  import type { Chat as ChatType } from '$lib/models/Chat/ChatType';

  export let isOpen = false;
  export let productId: string | undefined = undefined;
  export let sellerId: string | undefined = undefined;
  export let chatId: string | undefined = undefined;
  export let initialChat: ChatType | undefined = undefined;
  export let onClose: () => void;

  let chat: ChatType | null = null;
  let loading = false;
  let error = '';
  let previousIsOpen = false;

  // Load chat when modal opens
  $: {
    if (isOpen && !previousIsOpen && $user?.id) {
      // Modal just opened, load chat
      loadChat();
    }
    previousIsOpen = isOpen;
  }

  async function loadChat() {
    if (!$user?.id) {
      error = 'Debes iniciar sesión para chatear.';
      return;
    }

    loading = true;
    error = '';
    chat = null;
    
    try {
      let loadedChat: ChatType | null = null;

      // Si se proporciona un chat inicial, cargar el chat completo por ID
      // para asegurarnos de tener toda la información actualizada
      if (initialChat && initialChat.id) {
        console.log('Loading chat by ID from initialChat:', initialChat.id);
        loadedChat = await ChatService.getChatById(initialChat.id);
      }
      // Si se proporciona un chatId, obtener el chat por ID
      else if (chatId) {
        console.log('Loading chat by ID:', chatId);
        loadedChat = await ChatService.getChatById(chatId);
      }
      // Si se proporciona productId, crear/obtener chat
      else if (productId) {
        console.log('Loading chat for productId:', productId, 'buyerId:', $user.id);
        loadedChat = await ChatService.getOrCreateChat(productId, $user.id);
      }
      else {
        throw new Error('No se proporcionó información suficiente para cargar el chat');
      }
      
      console.log('Chat loaded from service:', loadedChat);
      console.log('Chat ID:', loadedChat?.id);
      console.log('Chat product:', loadedChat?.product);
      
      // Validate that chat has all required properties
      if (!loadedChat) {
        console.error('Chat is null or undefined');
        throw new Error('No se recibió información del chat');
      }
      
      if (!loadedChat.id) {
        console.error('Chat missing ID:', loadedChat);
        throw new Error('El chat no tiene un ID válido');
      }
      
      if (!loadedChat.product) {
        console.error('Chat missing product:', loadedChat);
        throw new Error('El chat no tiene información del producto');
      }
      
      chat = loadedChat;
      console.log('Chat set successfully with ID:', chat.id);
    } catch (err: any) {
      console.error('Error loading chat:', err);
      error = err.message || 'No se pudo cargar la información del chat.';
      chat = null;
    } finally {
      loading = false;
    }
  }

  function handleBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      onClose();
    }
  }

  function handleEscape(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      onClose();
    }
  }

  // Reset when modal closes
  $: if (!isOpen && previousIsOpen) {
    // Modal just closed, reset state
    chat = null;
    error = '';
    loading = false;
  }
</script>

{#if isOpen}
  <div 
    class="modal-backdrop" 
    transition:fade={{ duration: 200 }}
    on:click={handleBackdropClick}
    on:keydown={handleEscape}
    role="dialog"
    aria-modal="true"
  >
    <div class="modal-content" transition:scale={{ duration: 200, start: 0.95 }}>
      <button class="close-button" on:click={onClose} aria-label="Cerrar chat">
        <svg 
          width="24" 
          height="24" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          stroke-width="2"
        >
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
      
      {#if loading || (!chat && !error)}
        <div class="loading-container">
          <div class="spinner"></div>
          <p>Cargando chat...</p>
        </div>
      {:else if error}
        <div class="error-container">
          <p>{error}</p>
          <button class="retry-button" on:click={loadChat}>Reintentar</button>
        </div>
      {:else if chat}
        <Chat initialChat={chat} />
      {/if}
    </div>
  </div>
{/if}

<style>
  .modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 1rem;
  }

  .modal-content {
    position: relative;
    width: 100%;
    max-width: 600px;
  }

  .close-button {
    position: absolute;
    top: -40px;
    right: 0;
    background: white;
    border: none;
    border-radius: 50%;
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
    z-index: 1001;
  }

  .close-button:hover {
    background: #f3f4f6;
    transform: rotate(90deg);
  }

  .loading-container,
  .error-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 600px;
    padding: 2rem;
    text-align: center;
    color: #666;
  }

  .spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #3b82f6;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 1rem;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .error-container {
    color: #dc2626;
  }

  .retry-button {
    margin-top: 1rem;
    padding: 0.5rem 1rem;
    background: #3b82f6;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.875rem;
  }

  .retry-button:hover {
    background: #2563eb;
  }

  @media (max-width: 640px) {
    .modal-backdrop {
      padding: 0;
    }

    .modal-content {
      max-width: none;
      height: 100%;
    }

    .close-button {
      top: 1rem;
      right: 1rem;
      background: rgba(255, 255, 255, 0.9);
    }
  }
</style>