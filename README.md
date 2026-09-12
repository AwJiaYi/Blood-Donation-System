# Blood Donation System

> Full-stack web application for managing blood donation events, user registrations, attendance records, and administrative event operations.

The **Blood Donation System** is a full-stack web application built with **Next.js**, **TypeScript**, **Prisma ORM**, and **SQLite** for local development. The project includes public donation-event workflows, user account functionality, event registration, user dashboards, API routes, and separate administrator pages for managing events.

## Features

### Public / User
- Browse blood donation events
- View event information
- Register for donation events
- Create an account and log in
- Access a user dashboard
- View registrations linked to the logged-in user
- Bind an existing registration to a user account

### Administrator
- Separate administrator login area
- View and manage donation events
- Create and edit event information
- Access event-specific administration pages
- Manage registration-related data through backend API routes

## Technologies

### Frontend
- Next.js 16
- React 19
- TypeScript
- Tailwind CSS

### Backend
- Next.js App Router
- Next.js API Routes
- Prisma ORM
- SQLite for local development

### Authentication & Security
- NextAuth
- Prisma Adapter for NextAuth
- bcryptjs
- JSON Web Tokens (JWT)

### Other Tools
- Resend
- ESLint
- ts-node
- Git / GitHub

## Architecture

```text
Next.js UI / App Router
        |
        v
Application Routes
        |
        +-----------------------+
        |                       |
        v                       v
Public / User Pages        Admin Pages
        |                       |
        +-----------+-----------+
                    |
                    v
              API Routes
                    |
                    v
               Prisma ORM
                    |
                    v
              SQLite Database
```

## Project Structure

```text
Blood-Donation-System
│
├── app
│   ├── admin
│   │   ├── events
│   │   └── login
│   ├── api
│   │   ├── admin
│   │   ├── auth
│   │   ├── events
│   │   ├── registrations
│   │   └── user
│   ├── donate
│   ├── events
│   ├── login
│   ├── register
│   ├── register-account
│   └── user
│       └── dashboard
├── components
├── context
├── lib
├── prisma
│   ├── migrations
│   ├── schema.prisma
│   └── seed.ts
├── public
├── package.json
└── README.md
```

## Database Design

### Event
```text
id
title
description
location
dateTime
capacity
durationMinutes
createdAt
updatedAt
```

### Registration
```text
id
eventId
name
email
phone
status
token
notes
attendedAt
userId
createdAt
updatedAt
```

### User
```text
id
name
email
emailVerified
image
password
createdAt
updatedAt
```

### AdminUser
```text
id
email
passwordHash
role
createdAt
```

### Authentication Models
```text
Account
Session
VerificationToken
```

## Main Flows

### Donation Event Registration
```text
View Events
    |
    v
Select Event
    |
    v
Submit Registration
    |
    v
Registration Record Created
```

### User Account Flow
```text
Register Account
      |
      v
     Login
      |
      v
User Dashboard
      |
      v
View Linked Registrations
```

### Administrator Flow
```text
Admin Login
     |
     v
Admin Events
     |
     +-------------------+
     |                   |
     v                   v
Create Event         Edit Event
```

## API Structure

```text
/api/admin
/api/auth
/api/events
/api/registrations
/api/user/registrations/bind
```

The event and registration API areas also include dynamic `[id]` routes for record-specific operations.

## Event & Registration Relationship

```text
Event
  |
  | 1
  |
  |----< Registration
              |
              | optional
              v
             User
```

An event can contain multiple registrations. A registration may optionally be linked to a logged-in user through `userId`.

## Attendance Tracking

The `Registration` model includes:

```text
attendedAt
```

A null value indicates no attendance/check-in time has been recorded.

## Local Development

### Requirements
- Node.js
- npm
- Git

### Clone
```bash
git clone https://github.com/AwJiaYi/Blood-Donation-System.git
cd Blood-Donation-System
```

### Install dependencies
```bash
npm install
```

### Environment
Create a `.env` file. The Prisma schema expects:

```text
DATABASE_URL
```

Configure any additional environment variables required by the authentication or email features in your local setup.

### Prisma
```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

### Start development server
```bash
npm run dev
```

Then open:

```text
http://localhost:3000
```

## Available Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

## Software Engineering Practices Demonstrated

- Full-stack web development
- Next.js App Router
- TypeScript
- API route design
- Relational database modelling
- Prisma ORM
- Database migrations
- Authentication models
- User and administrator workflows
- One-to-many relationships
- User-registration linking
- CRUD-oriented event management
- Git version control

## SDLC Perspective

### Requirements
Identify the core actors and workflows:
- Blood donors / participants
- Registered users
- Administrators
- Donation events
- Event registrations

### Design
Design public pages, user flows, admin pages, API routes, and database entities.

### Implementation
Implement Next.js pages, TypeScript logic, authentication, Prisma access, API routes, and registration workflows.

### Testing
Verify login, event creation, registration, dashboard access, registration linking, persistence, and admin operations.

### Maintenance
Use Prisma migrations and separated user/admin areas to support future changes.

## Screenshots

Create:

```text
docs/screenshots/
```

Suggested files:

```text
01-home.png
02-events.png
03-event-detail.png
04-registration.png
05-login.png
06-user-dashboard.png
07-admin-login.png
08-admin-events.png
09-admin-event-form.png
```

Example:

```html
<p align="center">
  <img src="docs/screenshots/01-home.png" width="45%">
  <img src="docs/screenshots/02-events.png" width="45%">
</p>

<p align="center">
  <img src="docs/screenshots/06-user-dashboard.png" width="45%">
  <img src="docs/screenshots/08-admin-events.png" width="45%">
</p>
```

## Future Improvements

- More comprehensive role-based authorization
- Expanded automated testing
- Improved validation and error handling
- Production database deployment
- CI/CD workflow
- Deployment configuration
- Responsive UI refinement
- More detailed admin reporting
- Donation statistics dashboard
- Notification and reminder workflows

## Author

**Aw Jia Yi**  
Bachelor of Software Engineering (Honours)  
Southern University College
