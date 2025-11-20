import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { api } from './api.js';

export default {
    template: `
    <div class="flex flex-col h-screen bg-gray-100 fixed inset-0">
        <div class="bg-white/90 backdrop-blur-md border-b px-4 py-3 flex justify-between items-center z-20">
            <div class="flex items-center gap-2">
                <div class="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                    {{ user.name ? user.name.charAt(0).toUpperCase() : 'U' }}
                </div>
                <div>
                    <h2 class="font-bold text-gray-800 leading-tight">Messenger</h2>
                    <div class="flex items-center gap-1">
                        <span class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        <span class="text-xs text-gray-500">Online</span>
                    </div>
                </div>
            </div>
            <button @click="logout" class="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            </button>
        </div>

        <div class="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-100 scroll-smooth" id="chat-container">
            <div v-if="loading" class="flex justify-center py-10">
                 <svg class="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            </div>
            
            <div v-for="msg in messages" :key="msg.id" class="group flex w-full" :class="msg.sender === user.username ? 'justify-end' : 'justify-start'">
                <div class="max-w-[75%] sm:max-w-[60%]">
                    <div class="px-5 py-3 text-[15px] shadow-sm break-words relative transition-all"
                        :class="msg.sender === user.username 
                            ? 'bg-blue-600 text-white rounded-2xl rounded-tr-none hover:bg-blue-700' 
                            : 'bg-white text-gray-800 rounded-2xl rounded-tl-none border border-gray-200 hover:bg-gray-50'">
                        {{ msg.content }}
                    </div>
                    <div class="text-[10px] text-gray-400 mt-1 px-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        :class="msg.sender === user.username ? 'text-right' : 'text-left'">
                        {{ msg.sender }}
                    </div>
                </div>
            </div>
            <div class="h-2"></div> </div>

        <div class="bg-white p-3 sm:p-4 border-t shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-20">
            <div class="flex items-center gap-2 bg-gray-100 rounded-full px-2 py-2 border border-gray-200 focus-within:ring-2 focus-within:ring-blue-500 focus-within:bg-white transition-all">
                <input 
                    v-model="newMessage" 
                    @keyup.enter="send"
                    type="text" 
                    placeholder="Type a message..." 
                    class="flex-1 bg-transparent border-none px-3 py-1 focus:ring-0 text-gray-700 placeholder-gray-400 outline-none w-full"
                >
                <button 
                    @click="send" 
                    :disabled="sending || !newMessage"
                    class="bg-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-blue-700 active:scale-95 disabled:opacity-50 disabled:scale-100 transition shadow-md">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 translate-x-0.5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                    </svg>
                </button>
            </div>
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
                const shouldScroll = messages.value.length !== res.messages.length;
                messages.value = res.messages;
                if (shouldScroll) scrollToBottom();
            }
            loading.value = false;
        };

        const send = async () => {
            if (!newMessage.value.trim()) return;
            
            const tempMsg = {
                id: Date.now(),
                sender: user.value.username,
                content: newMessage.value
            };
            messages.value.push(tempMsg);
            scrollToBottom();

            const msgToSend = newMessage.value;
            newMessage.value = ''; 
            sending.value = true;

            await api.sendMessage(user.value.username, msgToSend);
            sending.value = false;
            fetchMessages();
        };

        const logout = () => {
            localStorage.clear();
            router.push('/');
        };

        onMounted(() => {
            fetchMessages();
            pollingInterval = setInterval(fetchMessages, 3000);
        });

        onUnmounted(() => {
            clearInterval(pollingInterval);
        });

        return { user, messages, newMessage, loading, sending, send, logout };
    }
};