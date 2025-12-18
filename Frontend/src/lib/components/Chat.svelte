<script lang="ts">
  import { onMount, onDestroy, tick } from 'svelte';
  import { supabase, user } from '$lib/lib/stores/supabase';
  import { ChatService } from '$lib/services/Chat/Chat.service';
  import type { Chat, ChatMessage } from '$lib/models/Chat/ChatType';
  import type { RealtimeChannel } from '@supabase/supabase-js';

  export let initialChat: Chat;

  let chat: Chat | null = initialChat;
  let messages: ChatMessage[] = [];
  let newMessage = '';
  let loading = true;
  let sending = false;
  let error = '';
  let messagesContainer: HTMLElement;
  let channel: RealtimeChannel | null = null;
  let pollTimer: any = null;

  $: currentUserId = $user?.id;
  $: otherUser = chat
    ? chat.buyerId === currentUserId
      ? chat.seller
      : chat.buyer
    : null;

  onMount(async () => {
    console.log('Chat component mounted');
    console.log('Current user ID:', currentUserId);
    console.log('Initial chat:', chat);
    
    if (!currentUserId || !chat) {
      console.error('Cannot initialize chat: missing user or chat');
      console.log('Current user ID:', currentUserId);
      console.log('Chat:', chat);
      error = 'No se pudo cargar la información del chat.';
      loading = false;
      return;
    }

  function startPolling() {
    if (pollTimer) return;
    if (!chat || !chat.id) return;
    pollTimer = setInterval(async () => {
      try {
        const latest = await ChatService.getChatMessages(chat.id);
        if (!Array.isArray(latest)) return;
        const map = new Map(messages.map(m => [m.id, m]));
        let changed = false;
        for (const m of latest) {
          if (!map.has(m.id)) {
            map.set(m.id, m);
            changed = true;
          }
        }
        if (changed) {
          messages = Array.from(map.values()).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
          await tick();
          scrollToBottom();
        }
      } catch (e) {
      }
    }, 3000);
  }

    if (!chat.id) {
      console.error('Chat does not have an ID:', chat);
      error = 'El chat no tiene un ID válido.';
      loading = false;
      return;
    }

    try {
      console.log('📥 Loading messages for chat ID:', chat.id);
      
      // Cargar mensajes
      messages = await ChatService.getChatMessages(chat.id);
      // Marcar mensajes como leídos
      try {
        await ChatService.markMessagesAsRead(chat.id);
      } catch (err) {
        console.error('Error marking messages as read:', err);
      }

      // Scroll al final
      await tick();
      scrollToBottom();

      // Suscribirse al canal de Realtime
      console.log('Setting up Realtime subscription...');
      
      // Verificar que Supabase Realtime esté disponible
      const realtimeStatus = await checkRealtimeConnection();
      console.log('Realtime connection status:', realtimeStatus);
      
      subscribeToMessages();
      startPolling();
      
      // Esperar un poco para que la suscripción se establezca
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Verificar estado de la suscripción después de un momento
      if (channel) {
        console.log('Channel state after setup:', {
          topic: channel.topic,
          state: channel.state
        });
      }

      loading = false;
      console.log('Chat initialization complete');
    } catch (err: any) {
      console.error('Error loading chat:', err);
      error = err.message || 'Error al cargar el chat';
      loading = false;
    }
  });

  onDestroy(() => {
    if (channel) {
      // Use channel.unsubscribe() to avoid internal recursive off/on
      try {
        channel.unsubscribe();
      } catch (e) {
        console.error('Error unsubscribing channel on destroy:', e);
      }
    }
    if (pollTimer) {
      clearInterval(pollTimer);
      pollTimer = null;
    }
  });

  async function checkRealtimeConnection() {
    try {
      // Crear un canal de prueba y desuscribir sin usar removeChannel en el callback
      const testChannel = supabase.channel('test-connection');
      const status = await new Promise((resolve) => {
        testChannel.subscribe((s) => {
          if (s === 'SUBSCRIBED' || s === 'TIMED_OUT' || s === 'CHANNEL_ERROR') {
            resolve(s);
          }
        });
      });
      // Limpieza fuera del stack del callback
      try {
        await testChannel.unsubscribe();
      } catch (e) {
        console.warn('Error unsubscribing test channel:', e);
      }
      return status as string;
    } catch (error) {
      console.error('Error checking Realtime connection:', error);
      return 'ERROR';
    }
  }

  function subscribeToMessages() {
    if (!chat || !chat.id) {
      console.error('Cannot subscribe: chat or chat.id is missing', chat);
      return;
    }

    console.log('Setting up Realtime subscription for chat:', chat.id);

    // Remover canal anterior si existe
    if (channel) {
      console.log('Removing previous channel:', channel.topic);
      try {
        channel.unsubscribe().then(() => {
          console.log('Previous channel unsubscribed');
        });
      } catch (e) {
        console.warn('Error unsubscribing previous channel:', e);
      }
      channel = null;
    }

    // Crear canal con filtro por chatId
    const channelName = `chat-messages-${chat.id}-${Date.now()}`;
    console.log('Creating channel:', channelName);
    
    channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `chat_id=eq.${chat.id}`,
        },
        async (payload) => {
          console.log('New message received via Realtime:', payload);
          console.log('Payload type:', typeof payload);
          console.log('Payload keys:', Object.keys(payload));
          
          try {
            // Mapear los campos de la base de datos al formato esperado
            const dbMessage = payload.new;
            console.log('Raw DB message:', dbMessage);
            console.log('DB message keys:', Object.keys(dbMessage || {}));
            
            if (!dbMessage) {
              console.error('payload.new is null or undefined');
              return;
            }
            
            const newMsg: ChatMessage = {
              id: dbMessage.id,
              chatId: dbMessage.chat_id || dbMessage.chatId || chat.id,
              senderId: dbMessage.sender_id || dbMessage.senderId,
              content: dbMessage.content,
              isRead: dbMessage.is_read !== undefined ? dbMessage.is_read : (dbMessage.isRead !== undefined ? dbMessage.isRead : false),
              createdAt: dbMessage.created_at || dbMessage.createdAt || new Date().toISOString(),
              sender: {
                id: dbMessage.sender_id || dbMessage.senderId || '',
                displayName: null,
                avatarUrl: null
              }
            };

            console.log('Mapped message:', newMsg);

            // Evitar duplicados - verificar antes de agregar
            const existingMessage = messages.find(m => m.id === newMsg.id);
            if (existingMessage) {
              console.log('Message already in list, skipping:', newMsg.id);
              return;
            }

            console.log('Message is new, processing...');

            // Obtener información del sender desde la base de datos
            try {
              const { data: sender, error: senderError } = await supabase
                .from('user_profiles')
                .select('id, display_name, avatar_url')
                .eq('id', newMsg.senderId)
                .single();

              if (senderError) {
                console.error('Error fetching sender:', senderError);
              }

              if (sender) {
                newMsg.sender = {
                  id: sender.id,
                  displayName: sender.display_name,
                  avatarUrl: sender.avatar_url
                };
                console.log('Sender info loaded:', newMsg.sender);
              }
            } catch (err) {
              console.error('Error fetching sender info:', err);
            }

            // Agregar el mensaje al estado
            console.log('➕ Adding message to state. Current messages count:', messages.length);
            messages = [...messages, newMsg];
            console.log('Message added. New messages count:', messages.length);
            
            await tick();
            scrollToBottom();
            console.log('UI updated and scrolled to bottom');

            // Si el mensaje no es nuestro, marcarlo como leído
            if (newMsg.senderId !== currentUserId) {
              try {
                await ChatService.markMessagesAsRead(chat!.id);
                console.log('Messages marked as read');
              } catch (err) {
                console.error('Error marking messages as read:', err);
              }
            }
          } catch (error) {
            console.error('Error processing realtime message:', error);
            console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
          }
        }
      )
      .subscribe((status, err) => {
        console.log('Subscription callback called');
        console.log('Status:', status);
        console.log('Error:', err);
        
        if (err) {
          console.error('Realtime subscription error:', err);
          console.error('Error details:', JSON.stringify(err, null, 2));
        } else {
          console.log('Realtime subscription status:', status);
          if (status === 'SUBSCRIBED') {
            console.log('Successfully subscribed to chat messages for chat:', chat?.id);
            console.log('Channel topic:', channel?.topic);
          } else if (status === 'CHANNEL_ERROR') {
            console.error('Channel error for chat:', chat?.id);
          } else if (status === 'TIMED_OUT') {
            console.error('Subscription timed out for chat:', chat?.id);
          } else if (status === 'CLOSED') {
            console.warn('Channel closed for chat:', chat?.id);
          } else {
            console.log('Unknown status:', status);
          }
        }
      });

    console.log('Subscription setup complete for channel:', channelName);
    console.log('Channel object:', channel);
    console.log('Channel topic:', channel?.topic);
  }

  async function handleSendMessage() {
    if (!newMessage.trim() || !chat || sending || !currentUserId) return;

    const messageContent = newMessage.trim();
    sending = true;
    error = '';
    
    // Limpiar el input inmediatamente para mejor UX
    newMessage = '';

    try {
      console.log('Sending message:', messageContent);
      
      // Enviar mensaje y obtener la respuesta
      const sentMessage = await ChatService.sendMessage(chat.id, messageContent);
      
      console.log('Message sent successfully:', sentMessage);
      
      // Verificar si el mensaje ya está en la lista (para evitar duplicados)
      // Esto puede pasar si Realtime ya lo agregó
      if (!messages.find(m => m.id === sentMessage.id)) {
        console.log('Adding sent message to state');
        
        // Agregar información del sender si no viene en la respuesta
        if (!sentMessage.sender && currentUserId) {
          try {
            // Obtener información del usuario actual
            const { data: currentUser, error: userError } = await supabase
              .from('user_profiles')
              .select('id, display_name, avatar_url')
              .eq('id', currentUserId)
              .single();
            
            if (userError) {
              console.error('Error fetching current user:', userError);
            }
            
            if (currentUser) {
              sentMessage.sender = {
                id: currentUser.id,
                displayName: currentUser.display_name,
                avatarUrl: currentUser.avatar_url
              };
            }
          } catch (err) {
            console.error('Error getting current user info:', err);
          }
        }
        
        // Agregar el mensaje al estado
        messages = [...messages, sentMessage];
        await tick();
        scrollToBottom();
        console.log('Message added to UI');
      } else {
        console.log('Message already in list (probably added by Realtime)');
      }
    } catch (err: any) {
      console.error('Error sending message:', err);
      error = err.message || 'Error al enviar el mensaje';
      // Restaurar el mensaje si hubo error
      newMessage = messageContent;
    } finally {
      sending = false;
    }
  }

  function scrollToBottom() {
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  }

  function formatTime(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Hoy';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Ayer';
    } else {
      return date.toLocaleDateString('es', { 
        day: 'numeric', 
        month: 'short' 
      });
    }
  }

  function getMessageDate(dateString: string) {
    return new Date(dateString).toDateString();
  }

  $: groupedMessages = messages.reduce((groups, message) => {
    const date = getMessageDate(message.createdAt);
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {} as Record<string, ChatMessage[]>);
</script>

<div class="chat-container">
  {#if loading}
    <div class="loading-state">
      <div class="spinner"></div>
      <p>Cargando chat...</p>
    </div>
  {:else if error && !chat}
    <div class="error-state">
      <p>{error}</p>
    </div>
  {:else if chat}
    <!-- Header del chat -->
    <div class="chat-header">
      <div class="user-info">
        {#if otherUser?.avatarUrl}
          <img 
            src={otherUser.avatarUrl} 
            alt={otherUser.displayName || 'Usuario'} 
            class="avatar"
          />
        {:else}
          <div class="avatar-placeholder">
            {(otherUser?.displayName?.[0] || 'U').toUpperCase()}
          </div>
        {/if}
        <div>
          <h3>{otherUser?.displayName || 'Usuario'}</h3>
          {#if chat.product}
            <p class="product-name">{chat.product.name}</p>
          {/if}
        </div>
      </div>
    </div>

    <!-- Mensajes -->
    <div class="messages-container" bind:this={messagesContainer}>
      {#if messages.length === 0}
        <div class="empty-state">
          <p>No hay mensajes aún</p>
          <p class="empty-subtitle">Envía un mensaje para iniciar la conversación</p>
        </div>
      {:else}
        {#each Object.entries(groupedMessages) as [date, dayMessages]}
          <div class="date-separator">
            <span>{formatDate(dayMessages[0].createdAt)}</span>
          </div>
          {#each dayMessages as message (message.id)}
            <div 
              class="message"
              class:own-message={message.senderId === currentUserId}
              class:other-message={message.senderId !== currentUserId}
            >
              {#if message.senderId !== currentUserId && message.sender?.avatarUrl}
                <img 
                  src={message.sender.avatarUrl} 
                  alt={message.sender.displayName || 'Usuario'} 
                  class="message-avatar"
                />
              {:else if message.senderId !== currentUserId}
                <div class="message-avatar-placeholder">
                  {(message.sender?.displayName?.[0] || 'U').toUpperCase()}
                </div>
              {/if}
              
              <div class="message-content">
                <p>{message.content}</p>
                <span class="message-time">{formatTime(message.createdAt)}</span>
              </div>
            </div>
          {/each}
        {/each}
      {/if}
    </div>

    <!-- Input de mensaje -->
    <div class="message-input-container">
      {#if error}
        <div class="input-error">{error}</div>
      {/if}
      <div class="input-wrapper">
        <textarea
          bind:value={newMessage}
          on:keydown={handleKeyDown}
          placeholder="Escribe un mensaje..."
          rows="1"
          disabled={sending}
        ></textarea>
        <button 
          on:click={handleSendMessage} 
          disabled={!newMessage.trim() || sending}
          class="send-button"
        >
          {#if sending}
            <div class="button-spinner"></div>
          {:else}
            <svg 
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              stroke-width="2"
            >
              <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
            </svg>
          {/if}
        </button>
      </div>
    </div>
  {/if}
</div>

<style>
  .chat-container {
    display: flex;
    flex-direction: column;
    height: 600px;
    max-height: 80vh;
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    overflow: hidden;
  }

  .loading-state,
  .error-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
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

  .chat-header {
    padding: 1rem 1.5rem;
    border-bottom: 1px solid #e5e7eb;
    background: #f9fafb;
  }

  .user-info {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .avatar,
  .avatar-placeholder {
    width: 40px;
    height: 40px;
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
    font-size: 1.1rem;
  }

  .user-info h3 {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
    color: #111827;
  }

  .product-name {
    margin: 0.25rem 0 0 0;
    font-size: 0.875rem;
    color: #6b7280;
  }

  .messages-container {
    flex: 1;
    overflow-y: auto;
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    background: #f9fafb;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: #9ca3af;
  }

  .empty-state p {
    margin: 0.5rem 0;
  }

  .empty-subtitle {
    font-size: 0.875rem;
  }

  .date-separator {
    display: flex;
    justify-content: center;
    margin: 1rem 0;
  }

  .date-separator span {
    background: #e5e7eb;
    color: #6b7280;
    padding: 0.25rem 0.75rem;
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: 500;
  }

  .message {
    display: flex;
    gap: 0.5rem;
    max-width: 70%;
  }

  .own-message {
    align-self: flex-end;
    flex-direction: row-reverse;
  }

  .other-message {
    align-self: flex-start;
  }

  .message-avatar,
  .message-avatar-placeholder {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    flex-shrink: 0;
    object-fit: cover;
  }

  .message-avatar-placeholder {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: 600;
    font-size: 0.875rem;
  }

  .message-content {
    background: white;
    padding: 0.75rem 1rem;
    border-radius: 12px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  }

  .own-message .message-content {
    background: #3b82f6;
    color: white;
  }

  .message-content p {
    margin: 0;
    word-wrap: break-word;
    line-height: 1.5;
  }

  .message-time {
    display: block;
    font-size: 0.75rem;
    margin-top: 0.25rem;
    opacity: 0.7;
  }

  .message-input-container {
    padding: 1rem 1.5rem;
    border-top: 1px solid #e5e7eb;
    background: white;
  }

  .input-error {
    background: #fee2e2;
    color: #dc2626;
    padding: 0.5rem;
    border-radius: 6px;
    font-size: 0.875rem;
    margin-bottom: 0.5rem;
  }

  .input-wrapper {
    display: flex;
    gap: 0.75rem;
    align-items: flex-end;
  }

  textarea {
    flex: 1;
    padding: 0.75rem;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    font-family: inherit;
    font-size: 0.875rem;
    resize: none;
    max-height: 120px;
    transition: border-color 0.2s;
  }

  textarea:focus {
    outline: none;
    border-color: #3b82f6;
  }

  textarea:disabled {
    background: #f3f4f6;
    cursor: not-allowed;
  }

  .send-button {
    padding: 0.75rem;
    background: #3b82f6;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.2s;
    min-width: 44px;
    height: 44px;
  }

  .send-button:hover:not(:disabled) {
    background: #2563eb;
  }

  .send-button:disabled {
    background: #9ca3af;
    cursor: not-allowed;
  }

  .button-spinner {
    width: 20px;
    height: 20px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top: 2px solid white;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @media (max-width: 640px) {
    .chat-container {
      height: calc(100vh - 60px);
      max-height: none;
      border-radius: 0;
    }

    .message {
      max-width: 85%;
    }
  }
</style>