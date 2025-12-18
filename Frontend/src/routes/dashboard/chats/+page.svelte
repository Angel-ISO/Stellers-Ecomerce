<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { user } from '$lib/lib/stores/supabase';
  import { ChatService } from '$lib/services/Chat/Chat.service';
  import ChatModal from '$lib/components/ChatModal.svelte';
  import type { Chat } from '$lib/models/Chat/ChatType';
  import DashboardHeader from '../components/DashboardHeader.svelte';

  let chats: Chat[] = [];
  let loading = true;
  let error = '';
  let selectedChat: Chat | null = null;
  let chatModalOpen = false;

  onMount(async () => {
    if (!$user) {
      goto('/auth');
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

<DashboardHeader title="Mis Chats" subtitle="Gestiona tus conversaciones">
</DashboardHeader>

<div class="p-6">
  {#if loading}
    <div class="flex flex-col items-center justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mb-4"></div>
      <p class="text-gray-600">Cargando chats...</p>
    </div>
  {:else if error}
    <div class="text-center py-12">
      <p class="text-red-600">{error}</p>
    </div>
  {:else if chats.length === 0}
    <div class="text-center py-12">
      <svg
        class="mx-auto h-16 w-16 text-gray-400 mb-4"
        width="64"
        height="64"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
      >
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
      <h2 class="text-xl font-semibold text-gray-900 mb-2">No tienes chats aún</h2>
      <p class="text-gray-600 mb-4">Cuando contactes a un vendedor, tus conversaciones aparecerán aquí</p>
      <a href="/productos" class="inline-flex items-center px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors">
        Explorar productos
      </a>
    </div>
  {:else}
    <div class="grid gap-4">
      {#each chats as chat (chat.id)}
        {@const otherUser = getOtherUser(chat)}
        <button
          class="flex items-start gap-4 p-4 bg-white border border-gray-200 rounded-lg hover:border-cyan-300 hover:shadow-md transition-all text-left w-full"
          on:click={() => openChat(chat)}
        >
          <div class="flex-shrink-0">
            {#if otherUser.avatarUrl}
              <img src={otherUser.avatarUrl} alt={otherUser.displayName || 'Usuario'} class="w-12 h-12 rounded-full object-cover" />
            {:else}
              <div class="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-semibold">
                {(otherUser.displayName?.[0] || 'U').toUpperCase()}
              </div>
            {/if}
          </div>

          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between mb-1">
              <h3 class="font-semibold text-gray-900 truncate">{otherUser.displayName || 'Usuario'}</h3>
              {#if chat.lastMessage}
                <span class="text-xs text-gray-500 flex-shrink-0 ml-2">{formatTime(chat.lastMessage.createdAt)}</span>
              {/if}
            </div>

            <p class="text-sm text-gray-600 mb-1 truncate">{chat.product.name}</p>

            {#if chat.lastMessage}
              <p class="text-sm text-gray-500 truncate" class:font-medium={chat.unreadCount && chat.unreadCount > 0}>
                {chat.lastMessage.content}
              </p>
            {:else}
              <p class="text-sm text-gray-400 italic">No hay mensajes aún</p>
            {/if}
          </div>

          {#if chat.unreadCount && chat.unreadCount > 0}
            <div class="flex-shrink-0">
              <div class="bg-cyan-500 text-white text-xs font-semibold px-2 py-1 rounded-full min-w-[20px] text-center">
                {chat.unreadCount}
              </div>
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
    initialChat={selectedChat}
    onClose={closeChat}
  />
{/if}