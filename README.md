# 🍔 Food Delivery API

A modern RESTful API for a food delivery application built with Node.js, Express, and TypeScript, following clean architecture principles.

## ✨ Features

- 🏗️ **Clean Architecture**: Organized with Controllers, Services, Repositories, and Entities
- 🔒 **Type Safety**: Full TypeScript support with strict type checking
- 📚 **API Documentation**: Interactive Swagger/OpenAPI documentation
- 🐳 **Docker Support**: Containerized application with Docker Compose
- ✅ **Validation**: Request validation using Joi schemas
- 🗄️ **Database**: PostgreSQL database integration
- 🔄 **Hot Reload**: Development server with automatic restart on changes

## 🛠️ Tech Stack

- **Runtime**: Node.js 20
- **Framework**: Express.js 5
- **Language**: TypeScript 5
- **Database**: PostgreSQL
- **Validation**: Joi
- **Documentation**: Swagger/OpenAPI (swagger-autogen, swagger-jsdoc)
- **Containerization**: Docker & Docker Compose
- **Dev Tools**: tsx, ts-node

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v20 or higher)
- [Docker](https://www.docker.com/get-started) and Docker Compose
- [npm](https://www.npmjs.com/) (comes with Node.js)
- [Git](https://git-scm.com/)

## 🚀 Getting Started

### Local Development Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/RedaAwwad/Food-Delivery.git
   cd Food-Delivery
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env` file in the root directory:

   ```env
   PORT=4000
   API_VERSION=v1
   APP_BASE_URL=http://localhost:4000

   # Database Configuration
   POSTGRES_USER=root
   POSTGRES_PASSWORD=example
   POSTGRES_DB=food_delivery
   DATABASE_URL=postgresql://root:example@postgres:5432/food_delivery
   ```

4. **Generate Swagger documentation**

   ```bash
   npm run swagger
   ```

5. **Start the development server**

   ```bash
   npm run dev
   ```

   The API will be available at `http://localhost:4000`

### Docker Setup

Start the entire application stack (API + PostgreSQL) with Docker Compose:

```bash
docker-compose up --build
```

This will start:

- Express API server on `http://localhost:4000`
- PostgreSQL database (accessible internally to the app)
- Automatic volume mounting for development

To run in detached mode:

```bash
docker-compose up -d
```

To stop all services:

```bash
docker-compose down
```

## 🏗️ Project Structure

```
Food-Delivery/
├── src/
│   ├── config/              # Application configuration
│   │   └── config.ts
│   ├── controllers/         # Request handlers
│   │   └── cart.controller.ts
│   ├── dto/                 # Data Transfer Objects
│   │   └── cart.dto.ts
│   ├── entities/            # Database entities/models
│   │   └── cart.entity.ts
│   ├── lib/                 # External library configurations
│   │   ├── joi/
│   │   │   └── joi.config.ts
│   │   └── swagger/
│   │       ├── swagger.config.ts
│   │       └── swagger-output.json
│   ├── middleware/          # Custom middleware
│   ├── repositories/        # Data access layer
│   │   └── cart.repository.ts
│   ├── routes/              # API routes
│   │   ├── index.ts
│   │   └── cart.routes.ts
│   ├── services/            # Business logic layer
│   │   └── cart.service.ts
│   ├── types/               # TypeScript type definitions
│   │   └── index.ts
│   ├── utils/               # Utility functions and constants
│   │   ├── constants.ts
│   │   ├── enums.ts
│   │   └── helpers.ts
│   ├── validation/          # Joi validation schemas
│   │   └── cart.schema.ts
│   └── server.ts            # Application entry point
├── docker-compose.yml       # Docker Compose configuration
├── Dockerfile               # Docker image definition
├── tsconfig.json            # TypeScript configuration
├── package.json             # Project dependencies and scripts
└── README.md
```

## 🎯 Architecture

This project follows a **layered architecture** pattern:

1. **Routes Layer** (`routes/`) - Defines API endpoints and maps them to controllers
2. **Controllers Layer** (`controllers/`) - Handles HTTP requests and responses
3. **Services Layer** (`services/`) - Contains business logic
4. **Repositories Layer** (`repositories/`) - Handles data access and database operations
5. **Entities Layer** (`entities/`) - Defines data models and schemas
6. **DTOs Layer** (`dto/`) - Data Transfer Objects for API contracts
7. **Validation Layer** (`validation/`) - Request validation schemas

## 📖 API Documentation

Once the server is running, you can access:

- **API Documentation**: `http://localhost:4000/api-docs`
- **Health Check**: `http://localhost:4000/`

## 🐳 Docker Commands

```bash
# Build and start all services
docker-compose up --build

# Start services in background
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f

# View logs for specific service
docker-compose logs -f node-app

# Rebuild and restart specific service
docker-compose up --build node-app

# Remove all containers and volumes
docker-compose down -v
```

## 🔍 Development

### TypeScript Configuration

The project uses strict TypeScript configuration with:

- Strict mode enabled
- No unchecked indexed access
- Exact optional property types
- ES modules with Node.js resolution

### Code Organization

- **Controllers**: Handle HTTP requests and responses, delegate to services
- **Services**: Contain business logic, orchestrate repositories
- **Repositories**: Direct database access, data persistence
- **Entities**: Database models and data structures
- **DTOs**: Define API request/response shapes
- **Validation**: Joi schemas for input validation

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. Commit your changes
   ```bash
   git commit -m 'Add some amazing feature'
   ```
4. Push to the branch
   ```bash
   git push origin feature/amazing-feature
   ```
5. Open a Pull Request

### 📝 Semantic Commit Messages

This project follows the [Conventional Commits](https://www.conventionalcommits.org/) specification for commit messages. This leads to more readable messages that are easy to follow when looking through the project history.

#### Commit Message Format

Each commit message consists of a **header**, a **body** (optional), and a **footer** (optional):

```
<type>(<scope>): <subject>

<body>

<footer>
```

#### Type

Must be one of the following:

- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation only changes
- **style**: Changes that do not affect the meaning of the code (white-space, formatting, etc)
- **refactor**: A code change that neither fixes a bug nor adds a feature
- **perf**: A code change that improves performance
- **test**: Adding missing tests or correcting existing tests
- **build**: Changes that affect the build system or external dependencies
- **ci**: Changes to CI configuration files and scripts
- **chore**: Other changes that don't modify src or test files
- **revert**: Reverts a previous commit

#### Scope

The scope should be the name of the affected module/component (optional but recommended):

- `cart`

#### Subject

The subject contains a succinct description of the change:

- Use the imperative, present tense: "change" not "changed" nor "changes"
- Don't capitalize the first letter
- No dot (.) at the end

#### Examples

```bash
# Feature
git commit -m "feat(cart): add ability to update item quantity"

# Bug fix
git commit -m "fix(cart): resolve issue with cart total calculation"

# Documentation
git commit -m "docs(readme): update installation instructions"

# Refactoring
git commit -m "refactor(cart): extract cart validation logic to separate service"

# Performance
git commit -m "perf(cart): optimize cart retrieval query"

# Breaking change
git commit -m "feat(api): change cart response structure

BREAKING CHANGE: cart API now returns items array instead of items object"
```

#### Full Example

```bash
feat(cart): add cart item validation

- Add Joi schema for cart items
- Implement validation middleware
- Add error handling for invalid items

Closes #123
```

## 🌿 Git Flow

This project follows the **Git Flow** branching model for managing releases and features.

### Branch Structure

#### Main Branches

- **`main`**

  - Production-ready code
  - Always stable and deployable
  - Protected branch (no direct commits)
  - Tagged with version numbers

- **`dev`**
  - Integration branch for features
  - Contains the latest delivered development changes
  - Base branch for feature development

#### Supporting Branches

- **`feature/*`**

  - Purpose: Develop new features
  - Branch from: `dev`
  - Merge back into: `dev`
  - Naming: `feature/<feature-name>`
  - Example: `feature/cart-management`, `feature/user-authentication`

- **`release/*`**

  - Purpose: Prepare for production release
  - Branch from: `dev`
  - Merge back into: `main` and `dev`
  - Naming: `release/<version>`
  - Example: `release/1.0.0`, `release/2.1.0`

- **`hotfix/*`**

  - Purpose: Quick production fixes
  - Branch from: `main`
  - Merge back into: `main` and `dev`
  - Naming: `hotfix/<version>` or `hotfix/<issue-description>`
  - Example: `hotfix/1.0.1`, `hotfix/critical-cart-bug`

- **`bugfix/*`**
  - Purpose: Fix bugs in development
  - Branch from: `dev`
  - Merge back into: `dev`
  - Naming: `bugfix/<bug-description>`
  - Example: `bugfix/cart-quantity-validation`

### Branch Naming Conventions

| Branch Type | Pattern                 | Example                         |
| ----------- | ----------------------- | ------------------------------- |
| Feature     | `feature/<description>` | `feature/payment-integration`   |
| Bugfix      | `bugfix/<description>`  | `bugfix/cart-total-calculation` |
| Release     | `release/<version>`     | `release/2.0.0`                 |
| Hotfix      | `hotfix/<version>`      | `hotfix/1.0.1`                  |

### Guidelines

1. **Always branch from the correct source**

   - Features and bugfixes from `dev`
   - Hotfixes from `main`
   - Releases from `dev`

2. **Keep branches up to date**

   ```bash
   git checkout dev
   git pull origin dev
   git checkout feature/your-feature
   git merge dev
   ```

3. **Use Pull Requests**

   - All merges should go through Pull Requests
   - Require code review before merging
   - Run CI/CD checks before merging

### Version Tagging

Use [Semantic Versioning](https://semver.org/) for tags:

- **MAJOR** version (1.0.0): Incompatible API changes
- **MINOR** version (0.1.0): Add functionality (backwards compatible)
- **PATCH** version (0.0.1): Bug fixes (backwards compatible)

## 🔗 Links

- **Repository**: [https://github.com/RedaAwwad/Food-Delivery](https://github.com/RedaAwwad/Food-Delivery)
- **Issues**: [https://github.com/RedaAwwad/Food-Delivery/issues](https://github.com/RedaAwwad/Food-Delivery/issues)

---

Made with ❤️ using TypeScript and Express.js
