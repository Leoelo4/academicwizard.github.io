# Academic Wizard 🧙‍♂️

Hey! This is Academic Wizard - a full-stack tutoring platform I built to connect students with tutors. It's got everything from booking sessions to managing resources, all with a clean, modern UI.

## What's This All About?

Academic Wizard is basically a one-stop platform for tutoring. Students can browse resources, book sessions with tutors, and track their progress. Tutors can manage their schedules and sessions. And there's an admin panel to keep everything running smoothly.

I built this using vanilla JavaScript on the frontend (keeping it simple and fast) with a Node.js/Express backend and MongoDB for the database. No fancy frameworks - just clean, straightforward code.

## The Cool Stuff 🚀

- **Student Dashboard** - Students can see their upcoming sessions, track progress, and manage bookings
- **Tutor Management** - Tutors get their own dashboard to handle sessions and availability
- **Admin Panel** - Full control over users, bookings, and resources
- **Free Resources** - Study materials for KS3, GCSE, and A-Level students
- **Booking System** - Easy session booking with email confirmations
- **Responsive Design** - Looks great on phones, tablets, and desktops
- **Authentication** - Secure login with JWT tokens and password hashing

## Tech Stack

**Frontend:**
- Pure HTML/CSS/JavaScript (no frameworks, keeping it lean)
- Custom CSS with modern animations and responsive design
- Modular JavaScript for clean code organization

**Backend:**
- Node.js + Express for the API
- MongoDB for the database
- JWT for authentication
- Bcrypt for password security
- Nodemailer for email notifications

## Getting Started

### Prerequisites

You'll need:
- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas account)
- A Gmail account for sending emails

### Installation

1. **Clone the repo**
   ```bash
   git clone https://github.com/yourusername/academic-wizard.git
   cd academic-wizard
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Set up your environment variables**
   
   In the `backend` folder, there's a `.env` file. You need to add your own credentials:

   ```env
   # Email Configuration - ADD YOUR OWN
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-gmail-app-password
   ```

   **Important:** I've left the email password blank in the public repo for security reasons. You need to:
   - Go to https://myaccount.google.com/apppasswords
   - Generate an app password for Gmail
   - Add it to the `.env` file

   The MongoDB connection and JWT secret are already set up, but feel free to change them if you want to use your own database.

4. **Start the backend server**
   ```bash
   npm start
   ```
   The API will run on `http://localhost:5000`

5. **Start the frontend** (in a new terminal)
   ```bash
   cd public
   python -m http.server 3000
   ```
   Or use any static file server you prefer. The site will be at `http://localhost:3000`

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

1. **Students** can sign up, browse free resources, and book tutoring sessions
2. **Tutors** log in to see their schedule and manage sessions
3. **Admins** can create tutors, manage users, and add/remove resources

### Authentication

- Uses JWT tokens stored in localStorage
- Passwords are hashed with bcrypt
- Protected routes check for valid tokens

### Booking System

- Students select a tutor, date, and time
- System checks tutor availability
- Sends confirmation email to student
- Updates both student and tutor dashboards

### Database

All data is stored in MongoDB with three main collections:
- **Users** - Student/tutor/admin accounts
- **Bookings** - Tutoring session records
- **Resources** - Study materials metadata

## Creating an Admin Account

Run this from the backend folder:

```bash
node scripts/create-admin.js
```

This creates an admin account with full access to the admin panel.

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
- The `.env` file is included but with placeholder values for passwords
- Never commit real email passwords or API keys
- The MongoDB connection string uses a demo database
- Change JWT_SECRET in production

**If you're deploying this:**
1. Generate a strong JWT_SECRET
2. Set up your own MongoDB database
3. Use environment variables on your hosting platform
4. Enable CORS properly for your domain

## Contact Info Update

I've set the contact email to `Leo.mills7777@gmail.com` throughout the site. If you want to change it, update:
- `public/index.html` - Contact section and footer
- `public/contact.html` - Contact info boxes and footer
- `public/about.html` - Footer
- `backend/.env` - EMAIL_USER variable

Same goes for phone number and address - they're placeholder values right now.

## Known Quirks

- Resources page dynamically loads content, so you need the backend running
- Email notifications require Gmail app password setup
- Booking times are hardcoded (9AM-8PM) - you can change this in `booking.js`

## Future Ideas

Some things I might add later:
- Payment integration (Stripe/PayPal)
- Video call integration for online sessions
- Calendar sync (Google Calendar)
- Review/rating system for tutors
- Automated reminder emails

## Why No Fancy Framework?

I went with vanilla JavaScript to keep things simple and performant. No build process, no dependencies on the frontend, just clean code that's easy to understand and modify. Plus it loads fast!

## License

This is open source - feel free to use it for your own tutoring platform or as a learning resource. Just don't sell it as your own work!

## Questions?

If you're stuck or have questions, check the code comments or reach out. The code is pretty well organized and should be straightforward to follow.

---

Built with ☕ and late nights by someone who probably should have used React but didn't 😄

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
