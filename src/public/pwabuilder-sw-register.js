if('serviceWorker'in navigator){window.addEventListener('load',()=>{navigator.serviceWorker.register('/pwabuilder-sw.js').then((reg)=>{console.log('Service worker registered.',reg);});});}