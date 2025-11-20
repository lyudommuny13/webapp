import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { api } from './api.js'; // Finds sibling api.js

export default {
    template: `
    <div class="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
        <div class="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden transform transition-all">
            
            <div class="p-8 text-center bg-white">
                <h1 class="text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">
                    {{ isLogin ? 'Welcome Back' : 'Join Us' }}
                </h1>
                <p class="text-gray-500 text-sm">
                    {{ isLogin ? 'Sign in to continue to Chat' : 'Create your account instantly' }}
                </p>
            </div>

            <form @submit.prevent="handleSubmit" class="px-8 pb-8 space-y-5">
                <div v-if="!isLogin" class="relative">
                    <input v-model="form.name" type="text" placeholder="Full Name" required
                        class="w-full pl-4 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition bg-gray-50 focus:bg-white">
                </div>
                
                <div class="relative">
                    <input v-model="form.username" type="text" placeholder="Username" required
                        class="w-full pl-4 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition bg-gray-50 focus:bg-white">
                </div>

                <div class="relative">
                    <input v-model="form.password" type="password" placeholder="Password" required
                        class="w-full pl-4 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition bg-gray-50 focus:bg-white">
                </div>
                
                <div v-if="error" class="p-3 rounded-lg bg-red-50 text-red-600 text-sm text-center font-medium border border-red-100">
                    {{ error }}
                </div>
                
                <button :disabled="loading" class="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-bold hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-200 transition transform active:scale-95 disabled:opacity-70 disabled:scale-100 shadow-lg shadow-indigo-500/30">
                    <span v-if="loading" class="flex items-center justify-center gap-2">
                        <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        Processing...
                    </span>
                    <span v-else>{{ isLogin ? 'Sign In' : 'Create Account' }}</span>
                </button>
            </form>

            <div class="bg-gray-50 px-8 py-4 text-center border-t border-gray-100">
                <p class="text-sm text-gray-600">
                    {{ isLogin ? "New here?" : "Already have an account?" }}
                    <button @click="toggleMode" class="text-indigo-600 font-bold hover:text-indigo-700 ml-1 transition">
                        {{ isLogin ? 'Sign up' : 'Log in' }}
                    </button>
                </p>
            </div>
        </div>
    </div>
    `,
    setup() {
        const router = useRouter();
        const isLogin = ref(true);
        const loading = ref(false);
        const error = ref('');
        const form = reactive({ name: '', username: '', password: '' });

        const toggleMode = () => {
            isLogin.value = !isLogin.value;
            error.value = '';
            form.name = ''; form.username = ''; form.password = '';
        };

        const handleSubmit = async () => {
            loading.value = true;
            error.value = '';
            const res = isLogin.value 
                ? await api.login(form.username, form.password)
                : await api.register(form.name, form.username, form.password);

            if (res.success) {
                localStorage.setItem('user', JSON.stringify(res.user));
                localStorage.setItem('token', res.token);
                router.push('/chat');
            } else {
                error.value = res.message || 'Connection failed';
            }
            loading.value = false;
        };

        return { isLogin, loading, error, form, toggleMode, handleSubmit };
    }
};