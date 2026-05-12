# Repository Guidelines

## Project Structure & Module Organization
This repository is a monorepo containing a full-stack On-Screen Marking (OSM) portal.

- **`.\API\API`**: ASP.NET Core Web API (.NET 8.0).
  - **`Controllers\`**: API endpoints for authentication, scripts, reports, etc.
  - **`Data\`**: `ApplicationDbContext` and EF Core configurations.
  - **`Models\`**: Domain models and **`DTOs\`** for data transfer.
  - **`Migrations\`**: Entity Framework Core database migrations for MySQL.
- **`.\UI`**: React 19 frontend application powered by Vite 5.
  - **`src\pages\`**: Main application views (Home, Scripts, Reports, Login).
  - **`src\components\`**: Reusable UI components (Navbar, Sidebar, Layout).
  - **`src\services\`**: API interaction logic.
  - **`src\data\`**: Static data and configuration.

## Build, Test, and Development Commands

### Backend (API)
Run these commands from the `.\API\API` directory:
- **Build**: `dotnet build`
- **Run**: `dotnet run`
- **Database Migrations**:
  - Add migration: `dotnet ef migrations add <MigrationName>`
  - Update database: `dotnet ef database update`

### Frontend (UI)
Run these commands from the `.\UI` directory:
- **Install Dependencies**: `npm install`
- **Development Server**: `npm run dev`
- **Production Build**: `npm run build`
- **Preview Build**: `npm run preview`

## Coding Style & Naming Conventions
- **Backend**:
  - Follows standard C#/.NET conventions (PascalCase for classes/methods).
  - Uses **DTOs** for all API inputs and outputs to decouple domain models from the API.
  - **JSON Naming**: CamelCase is enforced via `Program.cs`.
- **Frontend**:
  - Uses **Tailwind CSS 4** for styling via the `@tailwindcss/vite` plugin.
  - React components use **PascalCase** for filenames and component names (`.jsx`).
  - **Lucide React** is the preferred icon library.

## Testing Guidelines
- The backend includes a Swagger UI for API exploration, accessible at the root URL `/` (redirects to `/swagger/index.html`) in both development and production.
- A health check endpoint is available at `/api/health`.

## Commit & Pull Request Guidelines
- **Commit Messages**: Use descriptive, sentence-case messages (e.g., `Modernize Admin Dashboard: Add Section features`, `Assign examiners`).
- **Workflows**: Ensure all database changes are captured in migrations before committing.
