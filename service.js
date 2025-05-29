const Service = require('node-windows').Service;
const ngrok = require('ngrok');
const path = require('path');

// Create a new service for the REST API
const svc = new Service({
    name: 'Firebird REST API',
    description: 'Firebird REST API service with ngrok tunnel',
    script: path.join(__dirname, 'server.js'),
    nodeOptions: [],
    wait: 2,
    grow: .5,
    maxRestarts: 3
});

// Listen for service install/uninstall
svc.on('install', () => {
    svc.start();
    console.log('Service installed and started');
    
    // Start ngrok tunnel after the service starts
    setupNgrok();
});

svc.on('uninstall', () => {
    console.log('Service uninstalled');
});

async function setupNgrok() {
    try {
        // Configure ngrok with auth token
        await ngrok.authtoken('2xXjYsM97c7l345IsMSdmKHiZjL_4PPJcB2yAfo2TKV7MGFce');
        
        const url = await ngrok.connect({
            addr: process.env.PORT || 3000,
            region: 'us',
            hostname: 'prompt-liberal-vulture.ngrok-free.app',
            authtoken: '2xXjYsM97c7l345IsMSdmKHiZjL_4PPJcB2yAfo2TKV7MGFce'
        });
        console.log('Ngrok tunnel established:', url);
    } catch (err) {
        console.error('Error setting up ngrok:', err);
    }
}

// Install the service
if (require.main === module) {
    svc.install();
} 