# Predusk Assignment

A profile management application with project showcase, work experience tracking, and social links management.

## Architecture

### Frontend (Next.js)

- **Framework**: Next.js 14 with TypeScript
- **UI**: TailwindCSS + shadcn/ui components
- **Icons**: Lucide React
- **Deployment**: Vercel
- **URL**: https://predusk-assignment-seven.vercel.app/

### Backend (Node.js)

- **Runtime**: Node.js with Express
- **Database**: MongoDB with Mongoose ODM
- **Language**: TypeScript
- **Deployment**: Render
- **URL**: https://predusk-assignment-backend-yrdf.onrender.com/

## Database Schema

### User Model

```typescript
interface IUser {
  name: string;
  email: string;
  password: string; // Argon2 hashed
  education?: string;
  skills: string[];
  work: IWork[];
  links?: IUserLinks;
  projects: IProject[];
}

interface IWork {
  title: string;
  description: string;
}

interface IUserLinks {
  github?: string;
  linkedin?: string;
  portfolio?: string;
  codechef?: string;
  leetcode?: string;
}

interface IProject {
  title: string;
  description: string;
  skills: string[];
  links?: IProjectLink[];
}

interface IProjectLink {
  label: string;
  url: string;
}
```

## Setup

### Local Development

#### Backend

```bash
cd backend
npm install
npm run dev
```

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

#### Environment Variables

**Backend (.env)**

```
MONGODB_URI=your_mongodb_connection_string
BASIC_AUTH_EMAIL=your_email
BASIC_AUTH_PASSWORD=your_password
PORT=5000
```

**Frontend (.env.local)**

```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### Production

- **Backend**: Deployed on Render with automatic builds from GitHub
- **Frontend**: Deployed on Vercel with automatic builds from GitHub

## API Documentation

### Base URL

- Local: `http://localhost:5000/api`
- Production: `https://predusk-assignment-backend-yrdf.onrender.com/api`

### Authentication

All protected endpoints use Basic Authentication:

```javascript
Authorization: Basic base64(email:password)
```

### Key Endpoints

#### Profile Management

- `GET /user/profile` - Get user profile
- `PUT /user/profile` - Update profile (education, skills)

#### Work Experience

- `POST /user/work` - Add work experience
- `GET /user/work` - Get all work

#### Projects

- `POST /user/project/add` - Add project
- `GET /user/projects/search` - Search projects with pagination
- `PUT /user/project/update` – Update a project (project ID and updated data sent in request body)
- `DELETE /user/project/delete` – Delete a project (project ID sent in request body)

#### Links

- `PUT /user/links` - Update social links

#### Search & Pagination

```javascript
GET /user/projects/search?q=react&skills=node,mongodb&page=1&limit=4
```

## Resume

[View Resume](https://drive.google.com/file/d/1RKvVe9IUih16EOwpyRCS1kaxIJrAs6ja/view?usp=sharing)

## Postman Collection

[View and test all APIs here](https://universal-firefly-774237-1.postman.co/workspace/Backend~9541e76e-a85d-4d95-b955-6a2f43f09d23/collection/24977220-d23fa22d-2813-4081-b420-42177d218921?action=share&creator=24977220)

## Features

### Security

- **Basic Authentication**: Simple email/password auth for API access
- **Password Hashing**: Argon2 for secure password storage
- **Rate Limiting**: Request throttling to prevent abuse
- **CORS**: Configured for frontend-backend communication

### Performance

- **Pagination**: Projects paginated (4 items per page)
- **Debounced Search**: Real-time search with 300ms debounce
- **Database Indexing**: Optimized queries on skills and text fields

### Development

- **CI/CD**: GitHub Actions for automated testing and deployment
- **Code Formatting**: Prettier for consistent code style
- **TypeScript**: Full type safety across frontend and backend

## Testing

The project includes a small but meaningful test setup focused on core stability and security.

### Implemented Tests

- **Health Check**  
  Verifies that the server is running correctly (`/health`).

- **Unauthorized Access**  
  Ensures write routes are protected and reject requests without Basic Auth.

- **Authorized Access**  
  Confirms write routes work correctly when valid Basic Auth credentials are provided.

### Notes

- Tests are written using **Jest** and **Supertest**.
- **mongodb-memory-server** is used, so no real database is required for testing.
- The goal is to validate core behavior without over-testing or over-engineering.

## Known Limitations

- Designed for a **single-user profile**; not intended for multi-user scenarios.
- Projects are stored as an embedded array; filtering/search/pagination are handled at the application layer, which may not scale for very large datasets.
- Uses **Basic Auth** for write operations instead of a full authentication system (JWT/session).
- Rate limiting is in-memory and resets on server restart.

## CI/CD Pipeline

### GitHub Actions

- **Backend Tests**: Automated testing on pull requests
- **Frontend Tests**: Automated testing on pull requests
- **Deployment**: Automatic deployment to Render/Vercel on main branch push
- **Build Validation**: TypeScript compilation and code formatting checks

### Quality Gates

- All tests must pass before merge
- Code must be properly formatted with Prettier
- TypeScript compilation must succeed
- Build process must complete successfully

## Usage Notes

- **First-time setup**: Run `npm run seed` in backend to populate initial data
- **Search functionality**: Supports both text queries and skill filtering
- **Project links**: Each project can have multiple links with custom labels
- **Work experience**: Chronological display with automatic sorting
- **Skills normalization**: All skills stored in lowercase for consistency
