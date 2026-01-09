# Academic Wizard - Project Status

## 🎨 Frontend Complete

### Pages
- ✅ **index.html** - Home page with hero, services, stats, contact section
- ✅ **services.html** - Service catalog
- ✅ **resources.html** - Free and premium resources
- ✅ **testimonials.html** - Student testimonials
- ✅ **book.html** - Booking form (frontend only)
- ✅ **login.html** - Login system for students/tutors/admins
- ⚠️ **contact.html** - Deprecated (contact now on home page)

### Features Implemented
- Modern dark grey/blue design with minimal background
- Responsive layout (desktop, tablet, mobile)
- Contact section integrated into home page
- Login system with role selection (Student/Tutor/Admin)
- Navigation updated across all pages
- Form validation
- Hover effects and animations

## 🚧 Backend Required (Not Yet Built)

### Critical Missing Features

#### 1. Authentication System
**Priority: HIGH**
- User registration (students, tutors, admins)
- Password hashing (bcrypt)
- JWT or session-based authentication
- Role-based access control (RBAC)
- Password reset functionality
- Email verification

**Tech Stack Recommendation:**
- Node.js + Express
- bcrypt for password hashing
- jsonwebtoken for JWT
- Passport.js (optional)

#### 2. Database Setup
**Priority: HIGH**

**User Schema:**
```javascript
{
  email: String (unique),
  password: String (hashed),
  role: Enum ['student', 'tutor', 'admin'],
  name: String,
  phone: String,
  createdAt: Date,
  isVerified: Boolean
}
```

**Booking Schema:**
```javascript
{
  studentId: ObjectId,
  tutorId: ObjectId,
  subject: String,
  date: Date,
  time: String,
  duration: Number,
  status: Enum ['pending', 'confirmed', 'completed', 'cancelled'],
  paymentStatus: Enum ['pending', 'paid', 'refunded'],
  amount: Number,
  createdAt: Date
}
```

**Tech Stack Recommendation:**
- MongoDB + Mongoose OR PostgreSQL + Sequelize

#### 3. Dashboard Pages
**Priority: MEDIUM**

**Student Dashboard (`dashboard-student.html`):**
- View upcoming sessions
- Booking history
- Progress tracking
- Resource access
- Profile management

**Tutor Dashboard (`dashboard-tutor.html`):**
- Schedule management
- View assigned students
- Session notes
- Availability settings
- Earnings overview

**Admin Dashboard (`dashboard-admin.html`):**
- User management (CRUD)
- Booking oversight
- Analytics & reports
- System settings
- Payment management

#### 4. Booking System Backend
**Priority: HIGH**

**API Endpoints Needed:**
```
POST   /api/bookings          - Create booking
GET    /api/bookings/:userId  - Get user bookings
PUT    /api/bookings/:id      - Update booking
DELETE /api/bookings/:id      - Cancel booking
GET    /api/tutors/available  - Check tutor availability
```

**Features:**
- Calendar integration
- Time slot management
- Conflict prevention
- Email notifications
- SMS reminders (optional)

#### 5. Payment Integration
**Priority: MEDIUM**

**Stripe Integration:**
- Payment processing
- Refund handling
- Invoice generation
- Payment history
- Subscription management (for premium resources)

**API Endpoints:**
```
POST /api/payments/create-intent    - Create payment intent
POST /api/payments/confirm          - Confirm payment
GET  /api/payments/history/:userId  - Payment history
POST /api/payments/refund/:id       - Process refund
```

#### 6. Contact Form Backend
**Priority: MEDIUM**

**Features:**
- Form submission handling
- Email notifications to admin
- Auto-reply to user
- Spam protection (reCAPTCHA)
- Message storage in database

#### 7. File Upload System
**Priority: LOW**

**For Resources Section:**
- PDF uploads
- Image uploads
- File storage (AWS S3 or similar)
- Access control

## 📋 Next Steps (In Order)

### Phase 1: Basic Backend Setup (Week 1)
1. Initialize Node.js project
2. Set up Express server
3. Configure MongoDB/PostgreSQL
4. Create User model
5. Build authentication API
6. Connect login form to backend

### Phase 2: Booking System (Week 2)
1. Create Booking model
2. Build booking API endpoints
3. Implement calendar logic
4. Connect booking form to backend
5. Add email notifications

### Phase 3: Dashboards (Week 3)
1. Create dashboard HTML pages
2. Build dashboard API endpoints
3. Implement role-based access
4. Add data visualization
5. Session management features

### Phase 4: Payment Integration (Week 4)
1. Set up Stripe account
2. Integrate Stripe API
3. Build payment endpoints
4. Add payment UI
5. Test payment flow

### Phase 5: Additional Features (Week 5+)
1. Contact form backend
2. File upload system
3. Search functionality
4. Analytics dashboard
5. Mobile app (optional)

## 🛠️ Quick Start for Backend Development

### 1. Install Dependencies
```bash
npm init -y
npm install express mongoose bcryptjs jsonwebtoken cors dotenv
npm install --save-dev nodemon
```

### 2. Create `.env` File
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/academic-wizard
JWT_SECRET=your-super-secret-key-change-this
STRIPE_SECRET_KEY=sk_test_...
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### 3. Basic Server Structure
```
backend/
├── server.js           # Entry point
├── config/
│   ├── db.js          # Database connection
│   └── auth.js        # Auth middleware
├── models/
│   ├── User.js        # User schema
│   └── Booking.js     # Booking schema
├── routes/
│   ├── auth.js        # Auth routes
│   ├── bookings.js    # Booking routes
│   └── users.js       # User routes
└── controllers/
    ├── authController.js
    ├── bookingController.js
    └── userController.js
```

### 4. Run Development Server
```bash
npm run dev
```

## 📝 Environment Variables Needed

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/academic-wizard
# OR for PostgreSQL:
# DATABASE_URL=postgresql://user:password@localhost:5432/academic_wizard

# Authentication
JWT_SECRET=your-jwt-secret-key
JWT_EXPIRE=7d
BCRYPT_ROUNDS=10

# Email (for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Stripe
STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...

# Frontend URL
CLIENT_URL=http://localhost:3000

# AWS S3 (for file uploads)
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_BUCKET_NAME=academic-wizard-files
```

## 🔒 Security Checklist

- [ ] Hash passwords with bcrypt (10+ rounds)
- [ ] Use HTTPS in production
- [ ] Implement rate limiting
- [ ] Add input validation
- [ ] Sanitize user inputs
- [ ] Use CORS properly
- [ ] Implement CSRF protection
- [ ] Add helmet.js for security headers
- [ ] Validate JWT tokens
- [ ] Use environment variables for secrets
- [ ] Implement account lockout after failed logins
- [ ] Add reCAPTCHA to forms

## 📦 Recommended NPM Packages

### Core
- `express` - Web framework
- `mongoose` or `pg` + `sequelize` - Database ORM
- `dotenv` - Environment variables
- `cors` - CORS middleware

### Authentication
- `bcryptjs` - Password hashing
- `jsonwebtoken` - JWT tokens
- `passport` - Authentication middleware
- `express-validator` - Input validation

### Email
- `nodemailer` - Send emails
- `handlebars` - Email templates

### Payment
- `stripe` - Stripe API

### Utilities
- `moment` or `dayjs` - Date manipulation
- `multer` - File uploads
- `helmet` - Security headers
- `express-rate-limit` - Rate limiting
- `winston` - Logging

### Development
- `nodemon` - Auto-restart server
- `morgan` - HTTP request logger

## 🎯 Current Status Summary

**Frontend:** ✅ 100% Complete
- All pages designed and responsive
- Login system UI ready
- Contact integrated into home
- Navigation updated

**Backend:** ❌ 0% Complete
- No server setup
- No database
- No API endpoints
- No authentication
- No payment processing

**Next Immediate Action:** 
Set up Node.js/Express server and MongoDB, then build authentication API.
