<div align="center">
  <img src="Backend/assets/StellersLogo.png" alt="Stellers Logo" height="150">
  <h2>
      Stellers E-Commerce
  </h2>
</div>

<div align="center">
    <a href="https://gitlab.com/jala-university1/cohort-3/ES.CSSD-245.GA.T2.25.M2/SD/grupo-1/stellers-backend/blob/main/licence.md">
        <img src="https://img.shields.io/badge/license-MIT-green?style=for-the-badge" alt="License">
    </a>
    <a href="https://gitlab.com/jala-university1/cohort-3/ES.CSSD-245.GA.T2.25.M2/SD/grupo-1/stellers-backend/-/releases">
        <img src="https://img.shields.io/badge/release-latest-blue?style=for-the-badge" alt="Latest Version">
    </a>
    <a href="https://gitlab.com/jala-university1/cohort-3/ES.CSSD-245.GA.T2.25.M2/SD/grupo-1/stellers-backend/-/issues">
        <img src="https://img.shields.io/badge/issues-open-red?style=for-the-badge" alt="Open Issues">
    </a>
    <a href="https://gitlab.com/jala-university1/cohort-3/ES.CSSD-245.GA.T2.25.M2/SD/grupo-1/stellers-backend/-/graphs/main">
        <img src="https://img.shields.io/badge/contributors-4-orange?style=for-the-badge" alt="Contributors">
    </a>
</div>

<div align="center">
    Backend API for the Stellers e-commerce platform. Built with NestJS, GraphQL, and Hexagonal Architecture for scalable e-commerce solutions.
</div>
<div align="center"><b>
<h4>See the <a href="https://gitlab.com/groups/jala-university1/cohort-3/ES.CSSD-245.GA.T2.25.M2/SD/grupo-1/-/wikis/home">docs</a> for more info.</h4>
</b>
</div>

<br>
<br>

<div align="center">
<h2>
🔐 About the Project</h2>

  <p>
    This project provides a robust backend API for the Stellers e-commerce platform using Clean Architecture principles. It implements Hexagonal Architecture (Ports & Adapters) with GraphQL API, Prisma ORM, and Supabase integration for authentication and database management. The system is designed to be scalable, maintainable, and easily extensible for future e-commerce features.
  </p>
</div>

<br>
<br>

<div align="center">
  <h2>🚀 Features</h2>
  <ul align="left">
    <li>🏗️ Hexagonal Architecture implementation for clean separation of concerns.</li>
    <li>📊 REST API with Swagger documentation.</li>
    <li>🔐 JWT authentication integrated with Supabase Auth.</li>
    <li>🗄️ Prisma ORM for type-safe database operations with Supabase Postgres.</li>
    <li>✅ Input validation using class-validator and class-transformer.</li>
    <li>📝 Full TypeScript support with strict type checking.</li>
    <li>🧪 Test-ready structure with Jest integration.</li>
    <li>📚 Comprehensive JSDoc documentation.</li>
  </ul>
</div>

<br>
<br>

<div align="center">
<h2>
🤝 Contributing
</h2>
</div>

We welcome contributions to the Stellers Backend API! Please fork the repository, create a feature branch, and submit a merge request with your improvements. Be sure to follow the guidelines in our [contribution documentation](./contributing.md).

<br>
<br>

<div align="center">
<h2>
License 📜
</h2>
</div>

This project is licensed under the MIT License - see the [LICENSE](./licence.md) file for details.

<br>
<br>

<div align="center">
<h2>
Technologies Used 🔧
</h2>
</div>

<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: 10px; justify-items: center;" align="center">
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg" height="40" alt="git logo"  />
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/gitlab/gitlab-original.svg" height="40" alt="gitlab logo"  />
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg" height="40" alt="nodejs logo"  />
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nestjs/nestjs-original.svg" height="40" alt="nestjs logo"  />
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/swagger/swagger-original.svg" height="40" alt="swagger logo"  />
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg" height="40" alt="typescript logo"  />
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg" height="40" alt="postgresql logo"  />
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/prisma/prisma-original.svg" height="40" alt="prisma logo"  />
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg" height="40" alt="docker logo"  />
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/jest/jest-plain.svg" height="40" alt="jest logo"  />
</div>

<br>
<br>

<div align="center">
<h2>
SetUp 💻🔌
</h2>
</div>

### 1. Clone the repository:

 ```bash
   git clone https://gitlab.com/jala-university1/cohort-3/ES.CSSD-245.GA.T2.25.M2/SD/grupo-1/stellers-backend.git
   cd stellers-backend
 ```

### 2. Install dependencies:

 ```bash
   npm install
 ```

### 3. Set up environment variables:

 ```bash
   cp .env.example .env
 ```

 Edit the `.env` file with your Supabase database credentials.

### 4. Set up the database:

 ```bash
   npx prisma generate
   npx prisma db push
 ```

### 5. Start the development server:

 ```bash
   npm run start:dev
 ```

### 6. Open Swagger Documentation:

```bash
http://localhost:3000/api
```

## Authentication Flows

### Direct Registration & Login
For users who register directly through your application (not using OAuth providers):

1. **Registration**: User provides email, password, display name, and optional bio
2. **Account Creation**: Creates user in Supabase Auth + UserProfile in your database
3. **Login**: User can login with email/password anytime

### OAuth Registration & Login
For users who authenticate through OAuth providers (Google, etc.):

1. **OAuth Flow**: User authenticates through Supabase Auth (Google, etc.)
2. **Profile Creation**: System creates UserProfile in your database using OAuth data
3. **Login**: User provides the Supabase access token to get your internal JWT

### Profile Management
- Users can upload custom avatars through `/user/avatar` endpoint
- Profile information can be updated through various endpoints
- All user data stays synchronized between Supabase Auth and your database

## Usage

### Authentication

The API uses **Supabase Authentication** for user management. Users authenticate through Supabase OAuth providers (Google, GitHub, etc.).

#### OAuth with Supabase
- `POST /auth/login-supabase` - Login with Supabase access token

#### Protected Endpoints
Include the JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

### API Endpoints

#### Authentication
- `POST /auth/register` - Register new user with email and password (creates account in Supabase Auth + UserProfile)
- `POST /auth/login` - Login with email and password (direct authentication)
- `POST /auth/login-supabase` - Login with Supabase OAuth token (for existing Supabase Auth users)

#### Products
- `GET /products` - Get all products (with pagination)
- `GET /products/:id` - Get product by ID
- `POST /products` - Create new product (requires auth)

#### Stores

- `POST /stores` — creates a new store.  
- `GET /stores/:id` — public: returns a `StoreOutput` with active products.  
- `PUT /stores/:id` — protected: only the owner or an ADMIN can update the store.  
- `DELETE /stores/:id` — protected: only the owner or an ADMIN can delete it (performs a logical delete delegated to `storeRepository.deleteById`).  

### Example Requests

**Login with Supabase token:**
```bash
curl -X POST http://localhost:3000/auth/login-supabase \
  -H "Content-Type: application/json" \
  -d '{
    "supabaseAccessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }'
```

**Register new user:**
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepassword123",
    "displayName": "John Doe",
    "bio": "E-commerce enthusiast"
  }'
```

**Login with email and password:**
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepassword123"
  }'
```

**Create product (requires auth):**
```bash
curl -X POST http://localhost:3000/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "storeId": "store-123",
    "name": "Wireless Headphones",
    "description": "High-quality wireless headphones",
    "price": 99.99,
    "stock": 50,
    "categoryId": "electronics",
    "imageUrls": ["https://example.com/image1.jpg"]
  }'
```

**Create Store:**
```bash
curl -X POST https://localhost:3000/stores \
  -H "Authorization: Bearer <token containing sub=<userId> and roles e.g. ['SELLER']>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Juan's Store",
    "description": "Exclusive handmade products",
    "logoUrl": "https://example.com/logo.png"
  }'
  ```

**Get Public Store:**
```bash
curl -X GET https://localhost:3000/stores/{id}
```

**Delete Store (logical delete):**
```bash
curl -X DELETE https://localhost:3000/stores/{id} \
  -H "Authorization: Bearer <token of owner or admin>"
```

**Create product (requires auth):**

## 🚀 **Server Status**

✅ **Server is running successfully!**
- Main API: `http://localhost:3000`
- Swagger Docs: `http://localhost:3000/api`

## 🧪 **Testing the API**

### 1. **Login with Supabase OAuth**
```bash
curl -X POST http://localhost:3000/auth/login-supabase \
  -H "Content-Type: application/json" \
  -d '{
    "supabaseAccessToken": "your-supabase-jwt-token-here"
  }'
```

### 2. **Get Products (Public)**
```bash
curl -X GET "http://localhost:3000/products?limit=10&offset=0"
```

### 3. **Create Product (Requires Auth)**
```bash
curl -X POST http://localhost:3000/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "Test Product",
    "description": "A test product",
    "price": 29.99,
    "stock": 100
  }'
```

## 📋 **Architecture Summary**

- ✅ **Hexagonal Architecture** implemented
- ✅ **Prisma ORM** with Supabase Postgres
- ✅ **Supabase Auth** integration
- ✅ **UserProfile** table (not User) for business data
- ✅ **REST API** with Swagger documentation
- ✅ **JWT authentication** for protected endpoints
- ✅ **Clean separation** of concerns

## 🎯 **Next Steps**

1. **Frontend Integration**: Connect with Next.js frontend
2. **Role Management**: Implement proper role-based access control
3. **Product Categories**: Add category management
4. **Order Management**: Implement shopping cart and orders
5. **File Upload**: Add image upload for products
6. **Email Notifications**: Add email service integration

and enjoy! 🚀
