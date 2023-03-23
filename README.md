# Yet Another Todo List

## Description

This project is very similiar to Todoist, but not a 1 to 1 copy, I'm gonna change some stuff that annoys me in Todoist and add feature if I feel like doing it

## Setup

Make sure to install the firebase cli

```bash
# Required by the firebase tools
sudo apt install openjdk-18-jre
```

```bash
curl -sL firebase.tools | bash
```

```bash
npm install
```

## To start a local server

```bash
# Start firebase emulators
firebase emulators:start

# if you want to also make data persist across restarts
firebase emulators:start --import=./firebase_emulators_data --export-on-exit
```

```bash
# Start a development server
npm start
```
