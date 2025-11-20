import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { api } from './api.js';

export default {
    template: `
    <div class="min-h-screen flex items-center justify-center p-4 bg-gray-100">
        <div class="bg-white w-full max-w-md rounded-xl shadow-lg p-8">
            <h1 class="text-2xl font-bold text-center mb-6 text-blue-600">
                {{ isLogin ? 'Login' : 'Register' }}
            </h1>
            
            <form @submit.prevent="handleSubmit" class="space-y-4">
                <input v-if="!isLogin" v-model="form.name" type="text" placeholder="Full Name" class="w-full p-3 border rounded-lg" required>
                <input v-model="form.username" type="text" placeholder="Username" class="w-full p-3 border rounded-lg" required>
                <input v-model="form.password" type="password" placeholder="Password" class="w-full p-3 border rounded-lg" required>
                
                <div v-if="error" class="text-red-500 text-sm text-center">{{ error }}</div>
                
                <button :disabled="loading" class="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition disabled:opacity-50">
                    {{ loading ? 'Loading...' : (isLogin ? 'Enter Chat' : 'Create Account') }}
                </button>
            </form>

            <p class="mt-4 text-center text-sm text-gray-600">
                <span class="cursor-pointer hover:text-blue-600" @click="isLogin = !isLogin">
                    {{ isLogin ? 'Need an account? Register' : 'Have an account? Login' }}
                </span>
            </p>
        </div>
    </div>
    `,
    setup() {
        const router = useRouter();
        const isLogin = ref(true);
        const loading = ref(false);
        const error = ref('');
        const form = reactive({ name: '', username: '', password: '' });

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
                error.value = res.message || 'Error occurred';
            }
            loading.value = false;
        };

        return { isLogin, loading, error, form, handleSubmit };
    }
};