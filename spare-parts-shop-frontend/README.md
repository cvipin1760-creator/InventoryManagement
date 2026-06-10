# Spare Parts Shop - React Frontend

React frontend for the Jai Maa Sharda Spare Parts Shop, connecting to the Spring Boot backend.

## Features

- **Authentication**: JWT login, init default admin
- **Dashboard**: Today/weekly/monthly sales, bills count, low stock alert
- **Customers**: CRUD, search
- **Products**: CRUD, search, low stock filter, Excel import/export
- **Bills**: List, search by customer, filter by date range, create bill, download invoice PDF

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the Spring backend on `http://localhost:8080` (see `spare-parts-shop` folder).

3. Start the dev server:
   ```bash
   npm run dev
   ```

4. Open http://localhost:3000

The Vite dev server proxies `/api` to `http://localhost:8080`, so API calls work without CORS issues.

## Default Login

If no admin exists, click "Initialize default admin" on the login page, then sign in with:
- **Username**: admin
- **Password**: admin123

## Build

```bash
npm run build
```

Output is in `dist/`. For production, serve the static files and ensure your backend or reverse proxy serves the API at `/api` or configure the frontend to use the correct API base URL.
