const ngrok = require('ngrok');

async function testNgrok() {
    try {
        // Configure ngrok with auth token
        await ngrok.authtoken('2xXjYsM97c7l345IsMSdmKHiZjL_4PPJcB2yAfo2TKV7MGFce');
        
        // Try to connect
        const url = await ngrok.connect({
            addr: 3000,
            region: 'us',
            hostname: 'prompt-liberal-vulture.ngrok-free.app',
            authtoken: '2xXjYsM97c7l345IsMSdmKHiZjL_4PPJcB2yAfo2TKV7MGFce'
        });
        
        console.log('Ngrok tunnel established successfully!');
        console.log('Tunnel URL:', url);
        
        // Get all tunnels
        const api = ngrok.getApi();
        const tunnels = await api.listTunnels();
        console.log('\nActive tunnels:', tunnels);
        
    } catch (err) {
        console.error('Error testing ngrok:', err);
    }
}

testNgrok(); 