<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { user } from '$lib/lib/stores/supabase';
  import { ChatService } from '$lib/services/Chat/Chat.service';
  import ChatModal from '$lib/components/ChatModal.svelte';
  import type { Chat } from '$lib/models/Chat/ChatType';

  let chats: Chat[] = [];
  let loading = true;
  let error = '';
  let selectedChat: Chat | null = null;
  let chatModalOpen = false;

  onMount(async () => {
    if (!$user) {
      goto('/login');
      return;
    }

    try {
      chats = await ChatService.getUserChats();
      loading = false;
    } catch (err: any) {
      console.error('Error loading chats:', err);
      error = err.message || 'Error al cargar los chats';
      loading = false;
    }
  });

  function openChat(chat: Chat) {
    selectedChat = chat;
    chatModalOpen = true;
  }

  function closeChat() {
    chatModalOpen = false;
    selectedChat = null;
    // Recargar chats para actualizar contadores
    ChatService.getUserChats().then(updatedChats => {
      chats = updatedChats;
    });
  }

  function formatTime(dateString: string) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `Hace ${diffMins}m`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    if (diffDays < 7) return `Hace ${diffDays}d`;
    return date.toLocaleDateString('es');
  }

  function getOtherUser(chat: Chat) {
    return chat.buyerId === $user?.id ? chat.seller : chat.buyer;
  }
</script>

<svelte:head>
  <title>Mis Chats - Stellers</title>
</svelte:head>

<div class="chats-page">
  <div class="container">
    <h1>Mis Chats</h1>

    {#if loading}
      <div class="loading-state">
        <div class="spinner"></div>
        <p>Cargando chats...</p>
      </div>
    {:else if error}
      <div class="error-state">
        <p>{error}</p>
      </div>
    {:else if chats.length === 0}
      <div class="empty-state">
        <svg 
          width="64" 
          height="64" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          stroke-width="1.5"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
        <h2>No tienes chats aún</h2>
        <p>Cuando contactes a un vendedor, tus conversaciones aparecerán aquí</p>
        <a href="/products" class="browse-button">Explorar productos</a>
      </div>
    {:else}
      <div class="chats-list">
        {#each chats as chat (chat.id)}
          {@const otherUser = getOtherUser(chat)}
          <button class="chat-item" on:click={() => openChat(chat)}>
            <div class="chat-avatar">
              {#if otherUser.avatarUrl}
                <img src={otherUser.avatarUrl} alt={otherUser.displayName || 'Usuario'} />
              {:else}
                <div class="avatar-placeholder">
                  {(otherUser.displayName?.[0] || 'U').toUpperCase()}
                </div>
              {/if}
            </div>

            <div class="chat-content">
              <div class="chat-header-row">
                <h3>{otherUser.displayName || 'Usuario'}</h3>
                {#if chat.lastMessage}
                  <span class="chat-time">{formatTime(chat.lastMessage.createdAt)}</span>
                {/if}
              </div>

              <p class="product-name">{chat.product.name}</p>

              {#if chat.lastMessage}
                <p class="last-message" class:unread={chat.unreadCount && chat.unreadCount > 0}>
                  {chat.lastMessage.content}
                </p>
              {:else}
                <p class="last-message empty">No hay mensajes aún</p>
              {/if}
            </div>

            {#if chat.unreadCount && chat.unreadCount > 0}
              <div class="unread-badge">
                {chat.unreadCount}
              </div>
            {/if}
          </button>
        {/each}
      </div>
    {/if}
  </div>

  {#if selectedChat}
    <ChatModal
      isOpen={chatModalOpen}
      chat={selectedChat}
      onClose={closeChat}
    />
  {/if}
</div>

<style>
  .chats-page {
    min-height: calc(100vh - 64px);
    background: #f9fafb;
    padding: 2rem 1rem;
  }

  .container {
    max-width: 800px;
    margin: 0 auto;
  }

  h1 {
    font-size: 2rem;
    font-weight: 700;
    margin-bottom: 2rem;
    color: #111827;
  }

  .loading-state,
  .error-state,
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4rem 2rem;
    text-align: center;
    color: #6b7280;
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

  .empty-state svg {
    color: #d1d5db;
    margin-bottom: 1rem;
  }

  .empty-state h2 {
    font-size: 1.5rem;
    font-weight: 600;
    color: #374151;
    margin-bottom: 0.5rem;
  }

  .empty-state p {
    margin-bottom: 1.5rem;
  }

  .browse-button {
    display: inline-block;
    padding: 0.75rem 1.5rem;
    background: #3b82f6;
    color: white;
    text-decoration: none;
    border-radius: 8px;
    font-weight: 500;
    transition: background 0.2s;
  }

  .browse-button:hover {
    background: #2563eb;
  }

  .chats-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .chat-item {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    padding: 1rem;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s;
    text-align: left;
    width: 100%;
  }

  .chat-item:hover {
    border-color: #3b82f6;
    box-shadow: 0 4px 6px rgba(59, 130, 246, 0.1);
    transform: translateY(-2px);
  }

  .chat-avatar {
    flex-shrink: 0;
  }

  .chat-avatar img,
  .avatar-placeholder {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    object-fit: cover;
  }

  .avatar-placeholder {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: 600;
    font-size: 1.25rem;
  }

  .chat-content {
    flex: 1;
    min-width: 0;
  }

  .chat-header-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.25rem;
  }

  .chat-content h3 {
    font-size: 1rem;
    font-weight: 600;
    color: #111827;
    margin: 0;
  }

  .chat-time {
    font-size: 0.75rem;
    color: #9ca3af;
    flex-shrink: 0;
    margin-left: 0.5rem;
  }

  .product-name {
    font-size: 0.875rem;
    color: #6b7280;
    margin: 0.25rem 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .last-message {
    font-size: 0.875rem;
    color: #9ca3af;
    margin: 0.25rem 0 0 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .last-message.unread {
    color: #111827;
    font-weight: 500;
  }

  .last-message.empty {
    font-style: italic;
  }

  .unread-badge {
    flex-shrink: 0;
    background: #3b82f6;
    color: white;
    font-size: 0.75rem;
    font-weight: 600;
    padding: 0.25rem 0.5rem;
    border-radius: 12px;
    min-width: 24px;
    text-align: center;
  }

  @media (max-width: 640px) {
    .chats-page {
      padding: 1rem 0.5rem;
    }

    h1 {
      font-size: 1.5rem;
      padding: 0 0.5rem;
    }

    .chat-item {
      padding: 0.75rem;
    }

    .chat-avatar img,
    .avatar-placeholder {
      width: 40px;
      height: 40px;
    }
  }
</style>