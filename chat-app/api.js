import axios from 'axios'; // The import map will find the URL

// REPLACE THIS WITH YOUR ACTUAL GOOGLE SCRIPT URL
const API_URL = 'https://script.google.com/macros/s/AKfycbzpJURs1_u8kcN6GNA2RNZvCheCnpU4yd56Z5SGfA7Wj-mljNH7z_iOAiN6NPGNLMy_/exec'; 

export const api = {
    async request(data) {
        if (API_URL.includes('YOUR_GOOGLE_SCRIPT')) {
            alert("Error: You forgot to paste your Google Script URL in chat-app/api.js!");
            return { success: false, message: "API URL not configured" };
        }
        try {
            const response = await axios.post(API_URL, JSON.stringify(data), {
                headers: { 'Content-Type': 'text/plain' }
            });
            return response.data;
        } catch (error) {
            console.error("API Connection Error:", error);
            return { success: false, message: "Could not connect to server." };
        }
    },
    login(user, pass) { return this.request({ action: 'login', username: user, password: pass }); },
    register(name, user, pass) { return this.request({ action: 'register', name, username: user, password: pass }); },
    sendMessage(username, msg) { return this.request({ action: 'sendMessage', username: username, message: msg }); },
    getMessages() { return this.request({ action: 'getMessages' }); }
};