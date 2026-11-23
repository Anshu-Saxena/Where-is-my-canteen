@echo off
set "PATH=C:\Users\Divyansh\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin;C:\Users\Divyansh\.cache\codex-runtimes\codex-primary-runtime\dependencies\bin\fallback;%PATH%"
echo Starting "Where is my Canteen" development server...
node ./node_modules/vite/bin/vite.js
