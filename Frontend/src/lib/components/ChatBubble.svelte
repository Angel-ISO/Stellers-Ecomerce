<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { user, supabase } from '$lib/lib/stores/supabase';
  import { ChatService } from '$lib/services/Chat/Chat.service';
  import { goto } from '$app/navigation';
  import type { Chat, ChatMessage } from '$lib/models/Chat/ChatType';
  import type { RealtimeChannel } from '@supabase/supabase-js';
  import ChatModal from './ChatModal.svelte';
  import AuthService from '$lib/services/Auth/Auth.service';

  let isOpen = $state(false);
  let chats = $state<Chat[]>([]);
  let loading = $state(false);
  let totalUnreadCount = $derived(
    chats.reduce((sum, chat) => sum + (chat.unreadCount || 0), 0)
  );
  let selectedChat: Chat | null = $state(null);
  let chatModalOpen = $state(false);
  let channels: RealtimeChannel[] = [];
  let unsubscribeUser: (() => void) | null = null;
  let hostEl: HTMLElement;

  // Chatbot state
  let chatbotMessages = $state<Array<{type: 'user' | 'bot', content: string, timestamp: Date}>>([]);
  let chatbotInput = $state('');
  let chatbotLoading = $state(false);
  let messagesContainer: HTMLElement;

  // Cargar chats del usuario
  async function loadChats() {
    if (!$user?.id) return;
    
    loading = true;
    try {
      const nextChats = await ChatService.getUserChats();
      console.log('Loaded chats count:', nextChats?.length ?? 0);
      chats = nextChats;
    } catch (err: any) {
      console.error('Error loading chats:', err);
    } finally {
      loading = false;
    }
  }

  // Suscribirse a actualizaciones de mensajes para todos los chats
  function subscribeToAllChats() {
    // Evitar crear múltiples canales idénticos
    const existing = channels.find((c) => c.topic === 'all-chat-messages');
    if (existing) {
      console.log('Realtime channel already exists, skipping subscribe');
      return;
    }

    if (!$user?.id || chats.length === 0) {
      console.log('Cannot subscribe: no user or no chats');
      return;
    }

    console.log('Setting up ChatBubble Realtime subscription for', chats.length, 'chats');

    // Crear un único canal para todos los chats para optimizar
    const channelName = 'all-chat-messages';
    const channel = supabase
      .channel(channelName, {
        config: {
          broadcast: { self: false }
        }
      })
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
        },
        async (payload) => {
          console.log('New message received in ChatBubble:', payload);
          
          try {
            const dbMessage = payload.new;
            const chatId = dbMessage.chat_id || dbMessage.chatId;
            
            if (!chatId) {
              console.error('Message has no chat_id:', dbMessage);
              return;
            }
            
            // Verificar si el mensaje pertenece a uno de nuestros chats
            const chat = chats.find(c => c.id === chatId);
            if (!chat) {
              console.log('Message is for a chat not in our list:', chatId);
              return;
            }

            console.log('Message belongs to chat:', chatId);
            
            // Actualizar el chat específico
            const senderId = dbMessage.sender_id || dbMessage.senderId;
            const isFromCurrentUser = senderId === $user?.id;
            
            console.log('Message from:', senderId, 'Current user:', $user?.id, 'Is from current user:', isFromCurrentUser);
            
            // Solo incrementar contador si el mensaje no es del usuario actual
            // y el chat no está abierto actualmente
            const shouldIncrementUnread = !isFromCurrentUser && selectedChat?.id !== chatId;
            
            console.log('Should increment unread:', shouldIncrementUnread, 'Selected chat:', selectedChat?.id);
            
            chats = chats.map(c => {
              if (c.id === chatId) {
                const newUnreadCount = shouldIncrementUnread
                  ? (c.unreadCount || 0) + 1
                  : (c.unreadCount || 0);
                
                const updatedChat = {
                  ...c,
                  unreadCount: newUnreadCount,
                  lastMessage: {
                    id: dbMessage.id,
                    chatId: chatId,
                    senderId: senderId,
                    content: dbMessage.content,
                    isRead: dbMessage.is_read !== undefined ? dbMessage.is_read : (dbMessage.isRead !== undefined ? dbMessage.isRead : false),
                    createdAt: dbMessage.created_at || dbMessage.createdAt || new Date().toISOString(),
                    sender: {
                      id: senderId,
                      displayName: null,
                      avatarUrl: null
                    }
                  }
                };
                
                console.log('Updated chat:', chatId, 'Unread count:', newUnreadCount);
                return updatedChat;
              }
              return c;
            });
          } catch (error) {
            console.error('Error processing message in ChatBubble:', error);
          }
        }
      )
      .subscribe((status, err) => {
        if (err) {
          console.error('ChatBubble subscription error:', err);
        } else {
          console.log('ChatBubble subscription status:', status);
          if (status === 'SUBSCRIBED') {
            console.log('ChatBubble successfully subscribed to all chat messages');
          } else if (status === 'CHANNEL_ERROR') {
            console.error('ChatBubble channel error');
          } else if (status === 'TIMED_OUT') {
            console.error('ChatBubble subscription timed out');
          } else if (status === 'CLOSED') {
            console.warn('ChatBubble channel closed');
          }
        }
      });

    channels.push(channel);
    console.log('ChatBubble subscription setup complete');
  }

  function toggleBubble() {
    isOpen = !isOpen;
  }

  function openChat(chat: Chat) {
    selectedChat = chat;
    chatModalOpen = true;
    isOpen = false;
    // Marcar mensajes como leídos cuando se abre el chat
    if (chat.unreadCount && chat.unreadCount > 0) {
      // Actualizar el contador localmente inmediatamente
      chats = chats.map(c => {
        if (c.id === chat.id) {
          return { ...c, unreadCount: 0 };
        }
        return c;
      });
      
      // Marcar como leído en el backend
      ChatService.markMessagesAsRead(chat.id).catch(err => {
        console.error('Error marking messages as read:', err);
        // Si falla, recargar para obtener el estado correcto
        loadChats();
      });
    }
  }

  function closeChatModal() {
    chatModalOpen = false;
    selectedChat = null;
    // Recargar chats para actualizar contadores después de cerrar
    // Esto asegura que tengamos los últimos mensajes y contadores actualizados
    loadChats();
  }

  // Chatbot functions
  async function sendChatbotMessage() {
    if (!chatbotInput.trim() || !$user?.id) {
      return;
    }

    // Try different ways to get the display name
    const displayName = $user?.name || $user?.user_metadata?.name || $user?.user_metadata?.full_name || $user?.email || 'Usuario';

    const message = chatbotInput.trim();
    console.log('Sending message:', message);
    chatbotInput = '';

    // Add user message
    chatbotMessages = [...chatbotMessages, {
      type: 'user',
      content: message,
      timestamp: new Date()
    }];
    // Scroll to bottom after adding user message
    setTimeout(scrollToBottom, 100);

    chatbotLoading = true;
    // Scroll to bottom when showing typing indicator
    setTimeout(scrollToBottom, 100);

    try {
      const response = await fetch('https://n8n.stellarco.online/webhook/Stellbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${AuthService.getToken()}`
        },
        body: JSON.stringify({
          userId: $user.id,
          displayName: displayName,
          message: message
        })
      });

      if (!response.ok) {
        throw new Error('Error al comunicarse con StellBot');
      }

      const data = await response.json();

      // Add bot response
      chatbotMessages = [...chatbotMessages, {
        type: 'bot',
        content: data.response || 'Lo siento, no pude procesar tu mensaje.',
        timestamp: new Date()
      }];
      // Scroll to bottom after adding bot response
      setTimeout(scrollToBottom, 100);
    } catch (error) {
      console.error('Chatbot error:', error);
      chatbotMessages = [...chatbotMessages, {
        type: 'bot',
        content: 'Lo siento, hubo un error al procesar tu mensaje. Por favor, intenta de nuevo.',
        timestamp: new Date()
      }];
      // Scroll to bottom after adding error message
      setTimeout(scrollToBottom, 100);
    } finally {
      chatbotLoading = false;
    }
  }

  function handleChatbotKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendChatbotMessage();
    }
  }

  function scrollToBottom() {
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }


  function formatTime(dateString: string) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Ahora';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    return date.toLocaleDateString('es', { day: 'numeric', month: 'short' });
  }

  function getOtherUser(chat: Chat) {
    if (!$user?.id) return null;
    return chat.buyerId === $user.id ? chat.seller : chat.buyer;
  }

  function getChatTitle(chat: Chat) {
    const otherUser = getOtherUser(chat);
    return chat.product?.name || otherUser?.displayName || 'Chat sin nombre';
  }

  function formatBotMessage(content: string): string {
    // Convert markdown-like formatting to HTML
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
      .replace(/\*(.*?)\*/g, '<em>$1</em>') // Italic
      .replace(/\n/g, '<br>') // Line breaks
      .replace(/### (.*?)\n/g, '<h4>$1</h4>') // Headers
      .replace(/## (.*?)\n/g, '<h3>$1</h3>') // Headers
      .replace(/# (.*?)\n/g, '<h2>$1</h2>') // Headers
      .replace(/\*   (.*?)\n/g, '<li>$1</li>') // List items
      .replace(/(\n<li>.*<\/li>\n)/g, '<ul>$1</ul>'); // Wrap lists
  }

  onMount(() => {
    if (typeof document !== 'undefined' && hostEl && hostEl.parentElement !== document.body) {
      document.body.appendChild(hostEl);
    }
    if ($user?.id) {
      loadChats();
      // Establecer suscripción en tiempo real una sola vez al iniciar sesión
      subscribeToAllChats();
    }

    // Suscribirse a cambios de sesión de usuario sin usar $effect reactivo
    unsubscribeUser = user.subscribe((u) => {
      if (u?.id) {
        loadChats();
        subscribeToAllChats();
      } else {
        // limpiar estado y canales al cerrar sesión
        chats = [];
        channels.forEach((channel) => {
          try {
            channel.unsubscribe();
          } catch (e) {
            console.warn('Error unsubscribing channel on logout:', e);
          }
        });
        channels = [];
      }
    });
  });

  onDestroy(() => {
    channels.forEach(channel => {
      try {
        channel.unsubscribe();
      } catch (e) {
        console.warn('Error unsubscribing channel on destroy:', e);
      }
    });
    if (unsubscribeUser) unsubscribeUser();
  });
</script>

<div class="chat-bubble-host" bind:this={hostEl}>
{#if $user}
  <!-- Chat Bubble Button -->
  <button
    class="chat-bubble-button"
    onclick={toggleBubble}
    aria-label="Chat con StellBot"
    title="Pregúntale a StellBot acerca de los productos"
  >
    <svg 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      stroke-width="2"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
    {#if totalUnreadCount > 0}
      <span class="unread-badge">{totalUnreadCount > 99 ? '99+' : totalUnreadCount}</span>
    {/if}
  </button>

  <!-- Chat List Panel -->
  {#if isOpen}
    <div class="chat-panel">
      <div class="chat-panel-header">
        <h3>StellBot</h3>
        <button class="close-button" onclick={() => isOpen = false} aria-label="Cerrar">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      <!-- Chatbot Interface -->
      <div class="chatbot-container">
        <div class="chatbot-messages" bind:this={messagesContainer}>
          {#if chatbotMessages.length === 0}
            <div class="chatbot-welcome">
              <div class="bot-avatar">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                </svg>
              </div>
              <h4>¡Hola! Soy StellBot</h4>
              <p>Pregúntame acerca de los productos disponibles. Puedo ayudarte a encontrar lo que buscas.</p>
            </div>
          {:else}
            {#each chatbotMessages as message (message.timestamp.getTime())}
              <div class="message {message.type}">
                <div class="message-avatar">
                  {#if message.type === 'bot'}
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                    </svg>
                  {:else}
                    <div class="user-avatar-placeholder">
                      {($user?.name || $user?.user_metadata?.name || $user?.user_metadata?.full_name || $user?.email || 'U')[0]?.toUpperCase() || 'U'}
                    </div>
                  {/if}
                </div>
                <div class="message-content">
                  <div class="message-text">{@html formatBotMessage(message.content)}</div>
                  <div class="message-time">{formatTime(message.timestamp.toISOString())}</div>
                </div>
              </div>
            {/each}
          {/if}
          {#if chatbotLoading}
            <div class="message bot loading">
              <div class="message-avatar">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                </svg>
              </div>
              <div class="message-content">
                <div class="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          {/if}
        </div>

        <div class="chatbot-input-container">
          <textarea
            class="chatbot-input"
            placeholder="Escribe tu mensaje..."
            bind:value={chatbotInput}
            onkeydown={handleChatbotKeyPress}
            disabled={chatbotLoading}
          ></textarea>
          <button
            class="chatbot-send-button"
            onclick={sendChatbotMessage}
            disabled={!chatbotInput.trim() || chatbotLoading}
            aria-label="Enviar mensaje"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="22" y1="2" x2="11" y2="13"/>
              <polygon points="22,2 15,22 11,13 2,9"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  {/if}

  <!-- Chat Modal -->
  {#if selectedChat && chatModalOpen}
    <ChatModal
      isOpen={chatModalOpen}
      initialChat={selectedChat}
      onClose={closeChatModal}
    />
  {/if}
{/if}
</div>

<style>
  .chat-bubble-button {
    position: fixed !important;
    bottom: 32px !important;
    right: 32px !important;
    left: auto !important;
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: #3b82f6;
    color: white;
    border: none;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2147483647 !important;
    transition: all 0.3s ease;
    position: relative;
  }

  .chat-bubble-button:hover {
    background: #2563eb;
    transform: scale(1.05);
    box-shadow: 0 6px 16px rgba(59, 130, 246, 0.5);
  }

  .chat-bubble-button:active {
    transform: scale(0.95);
  }

  .unread-badge {
    position: absolute;
    top: -4px;
    right: -4px;
    background: #ef4444;
    color: white;
    border-radius: 12px;
    min-width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
    font-weight: 600;
    padding: 0 6px;
    border: 2px solid white;
  }

  .chat-panel {
    position: fixed !important;
    bottom: 98px !important;
    right: 32px !important;
    left: auto !important;
    width: 380px;
    height: 550px;
    max-height: 550px;
    background: white;
    border-radius: 16px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
    z-index: 2147483646 !important;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    animation: slideUp 0.3s ease;
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .chat-panel-header {
    padding: 1rem 1.5rem;
    border-bottom: 1px solid #e5e7eb;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #f9fafb;
    flex-shrink: 0;
    height: 60px;
  }

  .chat-panel-header h3 {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
    color: #111827;
  }

  .close-button {
    background: none;
    border: none;
    cursor: pointer;
    color: #6b7280;
    padding: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 6px;
    transition: all 0.2s;
  }

  .close-button:hover {
    background: #e5e7eb;
    color: #111827;
  }


  /* Chatbot Styles */
  .chatbot-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    max-height: 500px;
  }

  .chatbot-messages {
    flex: 1;
    overflow-y: auto;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    height: calc(100% - 140px); /* 550px total - 60px header - 80px input = 410px */
    min-height: 200px;
  }

  .chatbot-welcome {
    text-align: center;
    padding: 2rem 1rem;
    color: #6b7280;
  }

  .bot-avatar {
    width: 48px;
    height: 48px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    margin: 0 auto 1rem;
  }

  .chatbot-welcome h4 {
    font-size: 1.125rem;
    font-weight: 600;
    color: #111827;
    margin-bottom: 0.5rem;
  }

  .message {
    display: flex;
    gap: 0.75rem;
    max-width: 100%;
  }

  .message.user {
    flex-direction: row-reverse;
  }

  .message-avatar {
    flex-shrink: 0;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.875rem;
    font-weight: 600;
  }

  .message.user .message-avatar {
    background: #3b82f6;
    color: white;
  }

  .message.bot .message-avatar {
    background: #f3f4f6;
    color: #6b7280;
  }

  .user-avatar-placeholder {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: #3b82f6;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 0.75rem;
    font-weight: 600;
  }

  .message-content {
    flex: 1;
    max-width: calc(100% - 48px);
  }

  .message.user .message-content {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
  }

  .message-text {
    padding: 0.75rem 1rem;
    border-radius: 1rem;
    font-size: 0.875rem;
    line-height: 1.4;
    word-wrap: break-word;
  }

  .message.user .message-text {
    background: #3b82f6;
    color: white;
    border-bottom-right-radius: 0.25rem;
  }

  .message.bot .message-text {
    background: #f3f4f6;
    color: #111827;
    border-bottom-left-radius: 0.25rem;
  }


  .message-time {
    font-size: 0.75rem;
    color: #9ca3af;
    margin-top: 0.25rem;
  }

  .message.loading .message-text {
    padding: 0.5rem 1rem;
  }

  .typing-indicator {
    display: flex;
    gap: 0.25rem;
    padding: 0.5rem 0;
  }

  .typing-indicator span {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #9ca3af;
    animation: typing 1.4s infinite;
  }

  .typing-indicator span:nth-child(2) {
    animation-delay: 0.2s;
  }

  .typing-indicator span:nth-child(3) {
    animation-delay: 0.4s;
  }

  @keyframes typing {
    0%, 60%, 100% {
      transform: translateY(0);
      opacity: 0.4;
    }
    30% {
      transform: translateY(-10px);
      opacity: 1;
    }
  }

  .chatbot-input-container {
    border-top: 1px solid #e5e7eb;
    padding: 1rem;
    display: flex;
    gap: 0.5rem;
    align-items: flex-end;
    flex-shrink: 0;
    min-height: 80px;
  }

  .chatbot-input {
    flex: 1;
    padding: 0.75rem;
    border: 1px solid #d1d5db;
    border-radius: 0.5rem;
    resize: none;
    font-size: 0.875rem;
    line-height: 1.4;
    max-height: 100px;
    min-height: 40px;
  }

  .chatbot-input:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  .chatbot-input:disabled {
    background: #f9fafb;
    cursor: not-allowed;
  }

  .chatbot-send-button {
    padding: 0.75rem;
    background: #3b82f6;
    color: white;
    border: none;
    border-radius: 0.5rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.2s;
  }

  .chatbot-send-button:hover:not(:disabled) {
    background: #2563eb;
  }

  .chatbot-send-button:disabled {
    background: #d1d5db;
    cursor: not-allowed;
  }

  .mode-switch-button {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.5rem 0.75rem;
    background: #f3f4f6;
    color: #374151;
    border: none;
    border-radius: 0.375rem;
    font-size: 0.75rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }

  .mode-switch-button:hover {
    background: #e5e7eb;
  }

  @media (max-width: 640px) {
    .chat-panel {
      width: calc(100vw - 48px);
      max-width: 380px;
      height: 500px;
      max-height: 500px;
      bottom: 90px !important;
      right: 24px !important;
      left: auto !important;
      z-index: 1000 !important;
    }

    .chat-bubble-button {
      bottom: 24px !important;
      right: 24px !important;
      left: auto !important;
      z-index: 1000 !important;
    }

    .chatbot-messages {
      padding: 0.75rem;
      height: calc(100% - 120px); /* Ajustado para mobile */
    }

    .chatbot-input-container {
      padding: 0.75rem;
      min-height: 70px;
    }

    .chat-panel-header {
      padding: 0.75rem 1rem;
      height: 50px;
    }
  }

  .chat-bubble-host {
    all: initial;
  }
</style>
