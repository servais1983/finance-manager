const builder = require('electron-builder');

builder.build({
  config: {
    appId: 'com.finance.manager',
    productName: 'Finance Manager',
    win: {
      target: 'portable',
      sign: false
    },
    asar: true,
    forceCodeSigning: false,
    directories: {
      output: 'dist'
    }
  }
}).catch((error) => {
  console.error('Error during build:', error);
  process.exit(1);
});
