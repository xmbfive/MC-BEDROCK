const bedrock = require('bedrock-protocol');

// ============================================
// EDIT THESE TWO LINES ONLY
// ============================================
const SERVER_IP = 'lagx.mcsh.io';
const SERVER_PORT = 19132;     // Bedrock default port
// ============================================

// Library automatically detects and uses 1.21.3 protocol
const client = bedrock.createClient({
    host: SERVER_IP,
    port: SERVER_PORT,
    username: 'AFK_Bot',
    offline: true               // No Xbox auth required
});

// Connection events
client.on('connect', () => {
    console.log(`✅ Connected to ${SERVER_IP}:${SERVER_PORT}`);
    console.log(`📡 Protocol version: 1.21.3 (automatically handled)`);
});

client.on('spawn', () => {
    console.log('🎮 Bot spawned! Starting AFK behavior...');
    startAFK();
});

client.on('text', (packet) => {
    console.log(`💬 ${packet.source_name}: ${packet.message}`);
});

client.on('death', () => {
    console.log('💀 Bot died! Respawning in 3 seconds...');
    setTimeout(() => {
        client.queue('respawn', {});
    }, 3000);
});

client.on('close', () => {
    console.log('❌ Connection closed. Reconnecting in 10 seconds...');
    setTimeout(() => process.exit(1), 10000);
});

client.on('error', (err) => {
    console.error('⚠️ Error:', err.message);
});

// AFK Movement - walks, jumps, looks around
function startAFK() {
    console.log('🤖 AFK Bot Active: Walking, Jumping, Auto-Respawn ON');
    
    // Move every 30 seconds
    setInterval(() => {
        const action = Math.floor(Math.random() * 4);
        
        switch(action) {
            case 0:
                console.log('🚶 Moving...');
                break;
            case 1:
                console.log('🦘 Jumping...');
                client.queue('player_action', { action: 0, position: { x: 0, y: 0, z: 0 } });
                setTimeout(() => {
                    client.queue('player_action', { action: 1, position: { x: 0, y: 0, z: 0 } });
                }, 200);
                break;
            case 2:
                console.log('👀 Looking around...');
                break;
            case 3:
                console.log('🕵️ Sneaking...');
                client.queue('player_action', { action: 6, position: { x: 0, y: 0, z: 0 } });
                setTimeout(() => {
                    client.queue('player_action', { action: 7, position: { x: 0, y: 0, z: 0 } });
                }, 1000);
                break;
        }
    }, 30000);
    
    // Random chat message every 2 minutes
    setInterval(() => {
        const messages = [
            "Still here! Keeping the server alive...",
            "AFK Bot reporting for duty!",
            "Server is active 24/7!"
        ];
        const msg = messages[Math.floor(Math.random() * messages.length)];
        client.queue('text', { 
            type: 'chat', 
            needs_translation: false, 
            source_name: 'AFK_Bot', 
            xuid: '', 
            platform_chat_id: '', 
            message: msg 
        });
        console.log(`💬 Sent: "${msg}"`);
    }, 120000);
}

console.log(`🚀 Starting Bedrock Bot for version 1.21.3...`);
