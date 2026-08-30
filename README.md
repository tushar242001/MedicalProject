# Meddesk

Pharmacy inventory and billing dashboard built with React, Vite, Express, and MongoDB.

## Run locally

1. Copy `.env.example` to `.env` and set `MONGODB_URI` and `MONGODB_DB`.
2. Run `npm run dev:all`.
3. Open `http://localhost:5173`.

The API runs on port `3001`. Inventory is read from the `medicines` collection and completed bills are stored in the `bills` collection. Check the connection with `http://localhost:3001/api/health`.
# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.
