const bedrock = require('bedrock-protocol');

// ============================================
// CONFIGURATION
// ============================================
const SERVER_IP = 'lagx.mcsh.io';
const SERVER_PORT = 19132;
const PROXY_PORT = 19133;  // Proxy will run on this port

// ============================================
// CREATE A RELAY/PROXY FIRST (This fixes the issue)
// ============================================
const proxy = bedrock.createServer({
    host: '0.0.0.0',
    port: PROXY_PORT,
    version: '1.21.3',
    // Forward to the real server
    proxy: true,
    motd: {
        motd: 'AFK Bot Proxy',
        levelName: 'Minecraft Server'
    }
});

console.log(`🔗 Proxy listening on port ${PROXY_PORT}`);

// Handle players connecting through the proxy
proxy.on('connect', (client) => {
    console.log(`📡 Client connected to proxy, connecting to real server...`);
    
    // Create connection to real server
    const remote = bedrock.createClient({
        host: SERVER_IP,
        port: SERVER_PORT,
        username: client.username,
        offline: true,
        version: '1.21.3'
    });
    
    // Bridge packets between client and server
    client.on('packet', (buffer, channel, packetName) => {
        if (remote.writable) {
            remote.writeRaw(buffer);
        }
    });
    
    remote.on('packet', (buffer, channel, packetName) => {
        if (client.writable) {
            client.writeRaw(buffer);
        }
    });
    
    // Handle disconnections
    client.on('close', () => remote.end());
    remote.on('close', () => client.end());
    
    remote.on('spawn', () => {
        console.log(`✅ Bot successfully joined via proxy!`);
        startAFK(client);
    });
});

// ============================================
// BOT CLIENT (Connects to proxy instead)
// ============================================
setTimeout(() => {
    console.log(`🚀 Starting Bedrock Bot connecting via proxy...`);
    
    const bot = bedrock.createClient({
        host: 'localhost',
        port: PROXY_PORT,
        username: 'AFK_Bot',
        offline: true,
        version: '1.21.3'
    });
    
    bot.on('connect', () => {
        console.log(`✅ Bot connected to proxy`);
    });
    
    bot.on('spawn', () => {
        console.log(`🎮 Bot spawned! Starting AFK behavior...`);
    });
    
    bot.on('text', (packet) => {
        console.log(`💬 ${packet.source_name}: ${packet.message}`);
    });
    
    bot.on('death', () => {
        console.log(`💀 Bot died! Respawning...`);
        setTimeout(() => {
            bot.queue('respawn', {});
        }, 3000);
    });
    
    bot.on('close', () => {
        console.log(`❌ Connection closed. Reconnecting in 10 seconds...`);
        setTimeout(() => process.exit(1), 10000);
    });
    
    bot.on('error', (err) => {
        console.error('⚠️ Error:', err.message);
    });
    
    // AFK Movement
    function startAFK(botInstance) {
        console.log('🤖 AFK Bot Active');
        
        setInterval(() => {
            const action = Math.floor(Math.random() * 3);
            switch(action) {
                case 0:
                    console.log('🚶 Moving...');
                    break;
                case 1:
                    console.log('🦘 Jumping...');
                    botInstance.queue('player_action', { action: 0, position: { x: 0, y: 0, z: 0 } });
                    setTimeout(() => {
                        botInstance.queue('player_action', { action: 1, position: { x: 0, y: 0, z: 0 } });
                    }, 200);
                    break;
                case 2:
                    console.log('👀 Looking around...');
                    break;
            }
        }, 30000);
    }
}, 2000);
