const API_URL = 'https://script.google.com/macros/s/AKfycbzpJURs1_u8kcN6GNA2RNZvCheCnpU4yd56Z5SGfA7Wj-mljNH7z_iOAiN6NPGNLMy_/exec'; // <--- PASTE URL HERE

export const api = {
    async request(data) {
        try {
            const response = await axios.post(API_URL, JSON.stringify(data), {
                headers: { 'Content-Type': 'text/plain' }
            });
            return response.data;
        } catch (error) {
            console.error("API Error:", error);
            return { success: false, message: "Network Error" };
        }
    },
    login(user, pass) { return this.request({ action: 'login', username: user, password: pass }); },
    register(name, user, pass) { return this.request({ action: 'register', name, username: user, password: pass }); },
    sendMessage(username, msg) { return this.request({ action: 'sendMessage', username: username, message: msg }); },
    getMessages() { return this.request({ action: 'getMessages' }); }
};