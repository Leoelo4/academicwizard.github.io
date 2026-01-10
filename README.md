# Academic Wizard

A tutoring platform for booking sessions, accessing free resources, and managing tutors. Built for a university web development project.

## Features

- **Student Features**: Book sessions, view bookings, access free resources
- **Tutor Dashboard**: View scheduled sessions and manage bookings
- **Admin Panel**: Manage tutors, bookings, and resources
- **Authentication**: JWT-based login system with role management
- **Email Notifications**: Automatic booking confirmations

## Project Structure

```
Academic-Wizard/
├── public/              # Frontend files
│   ├── index.html      # Homepage
│   ├── book.html       # Booking page
│   ├── resources.html  # Free resources
│   ├── login.html      # Login/signup
│   ├── admin.html      # Admin dashboard
│   ├── css/
│   └── javascript/
│
└── backend/            # Backend API
    ├── models/         # MongoDB schemas
    ├── routes/         # API endpoints
    ├── middleware/     # Auth middleware
    ├── server.js       # Express server
    └── .env           # Configuration
```

## Quick Start

1. **Install dependencies:**
```bash
cd backend
npm install
```

2. **Configure .env file:**
```bash
cd backend
# Edit .env with your MongoDB URI and email settings
```

3. **Start the server:**
```bash
npm run dev
```

4. **Open the frontend:**
- Open `public/index.html` in your browser

## Default Login

**Admin Account:**
- Email: `admin@academicwizard.com`
- Password: `leokade1`

## Technologies Used

**Frontend:**
- HTML5, CSS3, JavaScript
- Responsive design

**Backend:**
- Node.js + Express.js
- MongoDB with Mongoose
- JWT authentication
- Nodemailer (email confirmations)
- bcrypt (password hashing)

## Main Features

### For Students
- Browse available tutors by subject
- Book tutoring sessions
- View booking history and status
- Access free educational resources (KS3, GCSE, A-Level)

### For Tutors
- View scheduled sessions
- Track student bookings
- Manage availability

### For Admins
- Create and manage tutors
- View all bookings
- Upload educational resources
- Manage users

## API Endpoints

**Authentication:**
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

**Bookings:**
- `GET /api/bookings` - Get user's bookings
- `POST /api/bookings` - Create booking
- `PUT /api/bookings/:id` - Update booking
- `DELETE /api/bookings/:id` - Cancel booking

**Users:**
- `GET /api/users/tutors` - Get all tutors (public)
- `POST /api/users` - Create tutor (admin only)

**Resources:**
- `GET /api/resources` - Get all resources
- `POST /api/resources` - Create resource (admin)
- `DELETE /api/resources/:id` - Delete resource (admin)

---

Built as part of university coursework
