# 💼 HireHub – Recruitment Management System

A full-stack, production-ready **Recruitment Management System** built with Node.js, Express, MongoDB, and Vanilla JavaScript. Features AI-powered skill matching, a chatbot assistant, and dashboards for both Job Seekers and HR/Employers.

---

## 🚀 Features

### For Job Seekers
- ✅ Register / Login with JWT authentication
- ✅ Create and update profile (skills, experience, education, resume)
- ✅ Search and filter jobs by keyword, location, type, category, skills
- ✅ View skill match score on every job listing
- ✅ Apply for jobs with cover letter
- ✅ Track all application statuses in real-time
- ✅ Save/bookmark jobs for later
- ✅ AI-powered job recommendations based on your skills

### For HR / Employers
- ✅ Register / Login as HR role
- ✅ Post detailed job listings with skills, salary, benefits
- ✅ Edit, close, or delete job postings
- ✅ View all applicants sorted by skill match score
- ✅ Filter candidates by skill or application status
- ✅ Update application statuses (shortlist, interview, offer, reject)
- ✅ Dashboard with recruitment analytics

### AI Features
- 🤖 **HireBot Chatbot** – AI assistant to answer platform questions
- ⚡ **Skill Matching Algorithm** – Matches user skills against job requirements (0–100% score)
- 🎯 **Smart Recommendations** – Personalized job recommendations based on your skill profile
- 📊 **Candidate Ranking** – Applicants are automatically ranked by match score

---

## 🗂 Project Structure

```
recruitment-system/
├── frontend/
│   ├── index.html          # Landing page
│   ├── login.html          # Login page
│   ├── register.html       # Registration (Job Seeker & HR)
│   ├── jobs.html           # Job listings with search & filters
│   ├── dashboard.html      # Job Seeker dashboard
│   ├── hr-dashboard.html   # HR / Employer dashboard
│   ├── css/
│   │   └── style.css       # Complete responsive stylesheet
│   └── js/
│       └── main.js         # Shared utilities, API helper, chatbot
│
├── backend/
│   ├── server.js           # Express app entry point
│   ├── seed.js             # Database seeder with demo data
│   ├── config/
│   │   └── database.js     # MongoDB connection
│   ├── middleware/
│   │   └── auth.js         # JWT auth middleware
│   ├── models/
│   │   ├── User.js         # User schema (seeker + HR)
│   │   ├── Job.js          # Job listing schema
│   │   └── Application.js  # Job application schema
│   ├── controllers/
│   │   ├── authController.js         # Auth, profile, save job
│   │   ├── jobController.js          # CRUD jobs, recommend
│   │   └── applicationController.js  # Apply, track, update
│   └── routes/
│       ├── auth.js         # /api/auth routes
│       ├── jobs.js         # /api/jobs routes
│       └── applications.js # /api/applications routes
│
├── .env                    # Environment variables
├── package.json
└── README.md
```

---

## ⚙️ Setup Instructions

### Prerequisites
- **Node.js** v16+ → [Download](https://nodejs.org/)
- **MongoDB** (Community Edition) → [Download](https://www.mongodb.com/try/download/community)
- A code editor (VS Code recommended)

---

### Step 1: Clone / Extract the Project

```bash
cd recruitment-system
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Configure Environment Variables

Edit the `.env` file (already created):

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/recruitment_db
JWT_SECRET=your_super_secret_jwt_key_change_in_production_2024
JWT_EXPIRE=7d
```

> ⚠️ Change `JWT_SECRET` to a strong random string in production!

### Step 4: Start MongoDB

**Windows:**
```bash
# Run MongoDB as a service (if installed as service)
net start MongoDB
# Or manually
"C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe"
```

**Mac:**
```bash
brew services start mongodb-community
```

**Linux:**
```bash
sudo systemctl start mongod
```

### Step 5: Seed Demo Data (Optional but Recommended)

```bash
node backend/seed.js
```

This creates:
- 2 demo HR accounts
- 2 demo Job Seeker accounts  
- 8 realistic job listings
- Sample applications

**Demo Credentials:**
| Role | Email | Password |
|------|-------|----------|
| Job Seeker | demo.seeker@hirehub.com | demo1234 |
| HR / Employer | demo.hr@hirehub.com | demo1234 |

### Step 6: Start the Backend Server

```bash
# Production
npm start

# Development (auto-restart on changes)
npm run dev
```

You should see:
```
✅ MongoDB Connected: localhost
🚀 Server running on http://localhost:5000
```

### Step 7: Open the Frontend

The Express server also serves the frontend files. Open:

```
http://localhost:5000
```

Or open `frontend/index.html` directly in your browser (most features will work, but set `API_URL` in `main.js` to `http://localhost:5000/api`).

---

## 📡 API Reference

### Auth Routes (`/api/auth`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/register` | Create new account | ❌ |
| POST | `/login` | Login and get token | ❌ |
| GET | `/me` | Get current user | ✅ |
| PUT | `/profile` | Update profile | ✅ |
| PUT | `/password` | Change password | ✅ |
| POST | `/save-job/:id` | Save/unsave a job | ✅ |

### Job Routes (`/api/jobs`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | Get all jobs (with filters) | ❌ |
| GET | `/:id` | Get single job | ❌ |
| POST | `/` | Create new job | ✅ HR |
| PUT | `/:id` | Update job | ✅ HR |
| DELETE | `/:id` | Delete job | ✅ HR |
| GET | `/hr/myjobs` | HR's posted jobs | ✅ HR |
| GET | `/user/recommend` | AI job recommendations | ✅ Seeker |

### Application Routes (`/api/applications`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/:jobId` | Apply for a job | ✅ Seeker |
| GET | `/my/applications` | My applications | ✅ Seeker |
| DELETE | `/:id` | Withdraw application | ✅ Seeker |
| GET | `/job/:jobId` | Get job's applicants | ✅ HR |
| PUT | `/:id/status` | Update app status | ✅ HR |
| GET | `/hr/stats` | HR recruitment stats | ✅ HR |

### Query Parameters for `GET /api/jobs`
- `search` – keyword search (title, description, skills)
- `location` – filter by location
- `jobType` – full-time, part-time, contract, internship, remote
- `category` – technology, marketing, finance, design, hr, operations, sales
- `skills` – comma-separated skill filter
- `minExp` – minimum experience filter
- `page` – pagination (default: 1)
- `limit` – results per page (default: 10)
- `sort` – sort field (default: -createdAt)

---

## 🧠 AI Feature: Skill Matching Algorithm

The skill matching algorithm compares a user's skills array with a job's required skills:

```javascript
// Match Score = (matched skills / total job skills) × 100
const matchedSkills = jobSkills.filter(skill => userSkills.includes(skill));
const matchScore = Math.round((matchedSkills.length / jobSkills.length) * 100);
```

- **Green highlighting** shows matched skills on job cards
- **Match score badge** (⚡ 75% match) shown on listings
- **AI Recommendations** ranks jobs by match score for logged-in users
- **Applicant ranking** sorts candidates from best match to lowest

---

## 🤖 HireBot Chatbot

The chatbot is a knowledge-based assistant (no external API required) that answers questions about:
- Finding and applying for jobs
- Profile and skills management
- Application tracking
- HR features

The chatbot parses user input and maps it to pre-defined knowledge categories, then responds with markdown-formatted guidance.

---

## 🗄️ Database Models

### User Model
```javascript
{
  name, email, password (hashed),
  role: 'jobseeker' | 'hr' | 'admin',
  phone, location, bio,
  skills: [String],   // Used for matching
  experience: Number,
  education: { degree, institution, year },
  resume: String,     // URL to resume
  savedJobs: [JobId],
  company: { name, website, description }  // For HR
}
```

### Job Model
```javascript
{
  title, company, description,
  skills: [String],  // Keywords for matching
  location, jobType, category,
  salary: { min, max, currency, period },
  experience: { min, max },
  education, responsibilities, benefits,
  postedBy: UserId,
  status: 'active' | 'closed' | 'draft',
  views, applicationCount, deadline
}
```

### Application Model
```javascript
{
  job: JobId,
  applicant: UserId,
  coverLetter, resume,
  status: 'pending' | 'reviewing' | 'shortlisted' | 'interviewed' | 'offered' | 'rejected' | 'withdrawn',
  matchScore: Number,  // 0-100, computed at apply time
  hrNotes, interview: { date, type, notes }
}
```

---

## 🎨 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| Styling | Custom CSS with CSS Variables, Flexbox, Grid |
| Fonts | Plus Jakarta Sans + Fraunces (Google Fonts) |
| Backend | Node.js + Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcryptjs |
| AI | Custom skill matching algorithm + rule-based chatbot |

---

## 🔧 Troubleshooting

**"Cannot connect to server" error**
- Make sure MongoDB is running
- Make sure backend is running on port 5000
- Check `.env` file for correct `MONGODB_URI`

**"Access denied" when logging in as HR**
- Make sure you registered with "Employer / HR" role selected
- Or use the demo HR account: `demo.hr@hirehub.com`

**Jobs not showing on homepage**
- Run `node backend/seed.js` to add demo data
- Check that backend server is running

**Port 5000 already in use**
- Change `PORT=5001` in `.env` and update `API_URL` in `frontend/js/main.js`

---

## 📦 Dependencies

```json
{
  "express": "^4.18.2",
  "mongoose": "^7.3.1",
  "jsonwebtoken": "^9.0.0",
  "bcryptjs": "^2.4.3",
  "cors": "^2.8.5",
  "dotenv": "^16.0.3",
  "multer": "^1.4.5-lts.1",
  "nodemon": "^3.0.1"  // devDependency
}
```

---

## 👨‍🎓 Student Notes

This project demonstrates:
1. **RESTful API design** with Express.js
2. **JWT-based authentication** and role-based access control
3. **MongoDB schema design** with Mongoose
4. **Responsive frontend** with CSS Grid, Flexbox, and CSS Variables
5. **AI/ML concepts** – skill matching as a simple recommendation system
6. **Software architecture** – MVC pattern (Models, Controllers, Routes)
7. **CRUD operations** for all three entities (Users, Jobs, Applications)

---

*Built with ❤️ as a college project demonstrating full-stack web development*
