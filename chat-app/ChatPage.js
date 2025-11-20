import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { api } from './api.js';

export default {
    template: `
    <div class="flex flex-col h-screen bg-gray-100">
        <div class="bg-white shadow p-4 flex justify-between items-center sticky top-0 z-10">
            <h2 class="text-xl font-bold text-blue-600">SheetMessenger</h2>
            <div class="flex items-center gap-3">
                <span class="text-sm font-medium text-gray-600">{{ user.name }}</span>
                <button @click="logout" class="text-sm text-red-500 hover:underline">Logout</button>
            </div>
        </div>

        <div class="flex-1 overflow-y-auto p-4 space-y-3" id="chat-container">
            <div v-if="loading" class="text-center text-gray-400 text-sm py-4">Loading messages...</div>
            
            <div v-for="msg in messages" :key="msg.id" 
                class="flex" 
                :class="msg.sender === user.username ? 'justify-end' : 'justify-start'">
                
                <div class="max-w-[70%] rounded-2xl px-4 py-2 shadow-sm text-sm"
                    :class="msg.sender === user.username ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white text-gray-800 rounded-bl-none'">
                    
                    <div v-if="msg.sender !== user.username" class="text-xs text-gray-400 mb-1">{{ msg.sender }}</div>
                    {{ msg.content }}
                </div>
            </div>
        </div>

        <div class="bg-white p-4 border-t flex gap-2">
            <input 
                v-model="newMessage" 
                @keyup.enter="send"
                type="text" 
                placeholder="Type a message..." 
                class="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:border-blue-500 transition"
            >
            <button 
                @click="send" 
                :disabled="sending || !newMessage"
                class="bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-blue-700 disabled:opacity-50 shadow">
                ➤
            </button>
        </div>
    </div>
    `,
    setup() {
        const router = useRouter();
        const user = ref(JSON.parse(localStorage.getItem('user') || '{}'));
        const messages = ref([]);
        const newMessage = ref('');
        const loading = ref(true);
        const sending = ref(false);
        let pollingInterval = null;

        const scrollToBottom = () => {
            nextTick(() => {
                const container = document.getElementById('chat-container');
                if(container) container.scrollTop = container.scrollHeight;
            });
        };

        const fetchMessages = async () => {
            const res = await api.getMessages();
            if (res.success) {
                // Only scroll if it's the first load or if a new message arrived
                const shouldScroll = messages.value.length !== res.messages.length;
                messages.value = res.messages;
                if (shouldScroll) scrollToBottom();
            }
            loading.value = false;
        };

        const send = async () => {
            if (!newMessage.value.trim()) return;
            
            // Optimistic UI: Add message immediately before server confirms
            const tempMsg = {
                id: Date.now(),
                sender: user.value.username,
                content: newMessage.value
            };
            messages.value.push(tempMsg);
            scrollToBottom();

            const msgToSend = newMessage.value;
            newMessage.value = ''; // Clear input
            sending.value = true;

            await api.sendMessage(user.value.username, msgToSend);
            sending.value = false;
            // Fetch immediately to sync IDs
            fetchMessages();
        };

        const logout = () => {
            localStorage.clear();
            router.push('/');
        };

        onMounted(() => {
            fetchMessages();
            // Poll every 3 seconds
            pollingInterval = setInterval(fetchMessages, 3000);
        });

        onUnmounted(() => {
            clearInterval(pollingInterval);
        });

        return { user, messages, newMessage, loading, sending, send, logout };
    }
};