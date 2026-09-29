import { defineConfig } from '@playwright/test';
export default defineConfig({testDir:'./tests/browser',use:{baseURL:'http://127.0.0.1:5173'},webServer:{command:process.platform === 'win32' ? 'npm.cmd run dev -- --port 5173' : 'npm run dev -- --port 5173',url:'http://127.0.0.1:5173',reuseExistingServer:true},projects:[{name:'mobile',use:{viewport:{width:390,height:844}}},{name:'desktop',use:{viewport:{width:1440,height:1000}}}]});

