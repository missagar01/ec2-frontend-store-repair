const fs=require('fs'); 
const path='src/pages/store/PendingIndents.tsx'; 
const lines=fs.readFileSync(path,'utf8').split(/\r?\n/); 
