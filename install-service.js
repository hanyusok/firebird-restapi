const Service = require('node-windows').Service;
const path = require('path');

// Create a new service object
const svc = new Service({
    name: 'Firebird REST API',
    description: 'Firebird REST API service with ngrok tunnel',
    script: path.join(__dirname, 'service.js')
});

// Listen for the "install" event
svc.on('install', () => {
    svc.start();
    console.log('Service installed and started successfully');
});

// Listen for the "uninstall" event
svc.on('uninstall', () => {
    console.log('Service uninstalled successfully');
});

// Listen for the "alreadyinstalled" event
svc.on('alreadyinstalled', () => {
    console.log('Service is already installed');
});

// Check command line arguments
const args = process.argv.slice(2);
if (args.includes('uninstall')) {
    // Uninstall the service
    svc.uninstall();
} else {
    // Install the service
    svc.install();
} 