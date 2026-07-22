# TraderOS AI

## Run locally

1. Install a current version of Node.js.
2. In this folder, run `node server.js`.
3. Open `http://localhost:3000` in your browser.

The first run creates `data/users.json` automatically. It is local private account data and is excluded from Git.

## Authentication

Passwords are salted and hashed on the server. The browser receives an HttpOnly session cookie, so it does not store user passwords or login state in `localStorage`.
