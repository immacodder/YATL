# Yet Another Todo List

## Description

This project is very similiar to Todoist, but not a 1 to 1 copy, I'm gonna change some stuff that annoys me in Todoist and add feature if I feel like doing it

## Setup

```bash
npm install && cd functions && npm install && cd ..
```

```bash
cd functions
npm run build
```

## To start a local server

```bash
# Start firebase emulators
npx firebase emulators:start

# if you want to also make data persist across restarts
npx firebase emulators:start --import=./firebase_emulators_data --export-on-exit
```

```bash
# Start a development server
npm start
```
