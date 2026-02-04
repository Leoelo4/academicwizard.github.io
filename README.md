# Academic Wizard 🧙‍♂️

This is Academic Wizard - a tutoring platform that connects students with tutors. Students can book sessions, browse resources, and track their learning progress. Tutors manage schedules and sessions through their dashboard. There's also an admin panel for overall management.

## What is This?

Academic Wizard is a platform for tutoring services. Students browse resources, book sessions with tutors, and track progress. Tutors manage their schedules and sessions. The admin panel controls users, bookings, and resources.

Built with vanilla JavaScript on the frontend with a Node.js/Express backend and MongoDB database. Simple, clean code without complex frameworks.

## Features

- **Student Dashboard** - View upcoming sessions, track progress, manage bookings
- **Tutor Management** - Dashboard for tutors to handle sessions and availability
- **Admin Panel** - Control over users, bookings, and resources
- **Free Resources** - Study materials for KS3, GCSE, and A-Level
- **Booking System** - Session booking with email confirmations
- **Responsive Design** - Works on phones, tablets, and desktops
- **Authentication** - Login with JWT tokens and password hashing

## Tech Stack

**Frontend:**
- HTML/CSS/JavaScript (no frameworks)
- Custom CSS with animations and responsive design
- Modular JavaScript

**Backend:**
- Node.js + Express for the API
- MongoDB for the database
- JWT for authentication
- Bcrypt for password security
- Nodemailer for email notifications

## Getting Started

### Prerequisites

Requirements:
- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas account)
- Gmail account for sending emails

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/academic-wizard.git
   cd academic-wizard
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Set up environment variables**
   
   In the `backend` folder, update the `.env` file with your credentials:

   ```env
   # Email Configuration
   EMAIL_USER=Academicwizard@gmail.com
   EMAIL_PASSWORD=password123
   ```

   **Note:** These are placeholder values. For production:
   - Go to https://myaccount.google.com/apppasswords
   - Generate an app password for Gmail
   - Add it to the `.env` file

   The MongoDB connection and JWT secret are configured but can be changed for your own database.

4. **Start the backend server**
   ```bash
   npm start
   ```
   API runs on `http://localhost:5000`

5. **Start the frontend** (in a new terminal)
   ```bash
   cd public
   python -m http.server 3000
   ```
   Or use any static file server. Site will be at `http://localhost:3000`

## Project Structure

```
Academic-Wizard/
├── backend/
│   ├── config/
│   │   └── database.js          # MongoDB connection
│   ├── middleware/
│   │   └── auth.js               # Authentication middleware
│   ├── models/
│   │   ├── User.js               # User schema (students/tutors/admins)
│   │   ├── Booking.js            # Booking schema
│   │   └── Resource.js           # Study resources schema
│   ├── routes/
│   │   ├── auth.js               # Login/signup endpoints
│   │   ├── bookings.js           # Booking management
│   │   ├── users.js              # User management
│   │   └── resources.js          # Resource management
│   ├── scripts/
│   │   ├── create-admin.js       # Create admin account
│   │   └── view-users.js         # View all users
│   ├── utils/
│   │   └── email.js              # Email sending utility
│   ├── .env                      # Environment variables
│   ├── server.js                 # Main server file
│   └── package.json              # Dependencies
│
└── public/
    ├── css/
    │   └── style.css             # All styling in one file
    ├── javascript/
    │   ├── api.js                # Backend communication
    │   ├── navbar.js             # Mobile menu
    │   ├── login.js              # Login functionality
    │   ├── signup.js             # Registration
    │   ├── booking.js            # Session booking
    │   ├── student-dashboard.js  # Student dashboard
    │   ├── tutor-dashboard.js    # Tutor dashboard
    │   ├── admin.js              # Admin panel
    │   └── ...more JS files
    ├── index.html                # Homepage
    ├── about.html                # About page
    ├── contact.html              # Contact page
    ├── book.html                 # Booking page
    ├── login.html                # Login page
    ├── signup.html               # Registration page
    └── ...more HTML pages
```

## How It Works

### User Flow

1. **Students** sign up, browse resources, and book tutoring sessions
2. **Tutors** log in to view schedule and manage sessions
3. **Admins** create tutors, manage users, and add/remove resources

### Authentication

- JWT tokens stored in localStorage
- Passwords hashed with bcrypt
- Protected routes check for valid tokens

### Booking System

- Students select tutor, date, and time
- System checks tutor availability
- Sends confirmation email to student
- Updates student and tutor dashboards

### Database

Data stored in MongoDB with three main collections:
- **Users** - Student/tutor/admin accounts
- **Bookings** - Tutoring session records
- **Resources** - Study materials metadata

## Creating an Admin Account

Run from the backend folder:

```bash
node scripts/create-admin.js
```

Creates an admin account with full access to the admin panel.

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create new student account
- `POST /api/auth/login` - Login (returns JWT token)

### Bookings
- `GET /api/bookings` - Get all bookings (student's own or all if admin)
- `POST /api/bookings` - Create new booking
- `PUT /api/bookings/:id` - Update booking
- `DELETE /api/bookings/:id` - Cancel booking

### Users
- `GET /api/users` - Get all users (admin only)
- `GET /api/users/:id` - Get specific user
- `PUT /api/users/:id` - Update user

### Resources
- `GET /api/resources` - Get all resources
- `POST /api/resources` - Add resource (admin only)
- `DELETE /api/resources/:id` - Delete resource (admin only)

## Security Notes

**For Public GitHub:**
- The `.env` file includes placeholder values for passwords
- Never commit real email passwords or API keys
- MongoDB connection string uses a demo database
- Change JWT_SECRET in production

**For Deployment:**
1. Generate a strong JWT_SECRET
2. Set up your own MongoDB database
3. Use environment variables on hosting platform
4. Enable CORS properly for your domain

## Contact Info Update

Contact email is set to `Academicwizard@gmail.com` throughout the site. To change it, update:
- `public/index.html` - Contact section and footer
- `public/contact.html` - Contact info boxes and footer
- `public/about.html` - Footer
- `backend/.env` - EMAIL_USER variable

Phone number and address are placeholder values.

## Known Issues

- Resources page dynamically loads content, requires backend running
- Email notifications require Gmail app password setup
- Booking times are hardcoded (9AM-8PM) - can be changed in `booking.js`

## Future Ideas

Potential additions:
- Payment integration (Stripe/PayPal)
- Video call integration for online sessions
- Calendar sync (Google Calendar)
- Review/rating system for tutors
- Automated reminder emails

## Why Vanilla JavaScript?

Vanilla JavaScript keeps things simple and performant. No build process, no frontend dependencies, clean code that's easy to understand and modify. Fast loading times.

## License

Open source - use it for your own tutoring platform or as a learning resource. Do not sell as your own work.

## Questions?

Check the code comments for guidance. The code is organized and documented.

---

Built as part of university coursework

4. **Open the frontend:**
- Open `public/index.html` in your browser

## Default Login

**Admin Account:**
- Email: `Academicwizard@gmail.com`
- Password: `password123`

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
