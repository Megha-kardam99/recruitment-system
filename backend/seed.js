// backend/seed.js
// Run this script to populate the database with demo data
// Usage: node backend/seed.js

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const connectDB = require('./config/database');
const User = require('./models/User');
const Job = require('./models/Job');
const Application = require('./models/Application');

const seedData = async () => {
  await connectDB();
  console.log('🌱 Starting database seed...');

  // Clear existing data
  await User.deleteMany({});
  await Job.deleteMany({});
  await Application.deleteMany({});
  console.log('🗑  Cleared existing data');

  // ─── Create Demo Users ──────────────────────────────────────────────────────
  const salt = await bcrypt.genSalt(10);

  const hrUser = await User.create({
    name: 'Priya Sharma (HR)',
    email: 'demo.hr@hirehub.com',
    password: 'demo1234',
    role: 'hr',
    company: {
      name: 'TechCorp India',
      website: 'https://techcorp.example.com',
      description: 'A leading technology company building the future'
    }
  });

  const hrUser2 = await User.create({
    name: 'Rahul Mehta (HR)',
    email: 'hr2@hirehub.com',
    password: 'demo1234',
    role: 'hr',
    company: {
      name: 'StartupXYZ',
      website: 'https://startupxyz.example.com',
      description: 'Fast-growing startup disrupting the fintech space'
    }
  });

  const seekerUser = await User.create({
    name: 'Arjun Kumar',
    email: 'demo.seeker@hirehub.com',
    password: 'demo1234',
    role: 'jobseeker',
    phone: '+91 98765 43210',
    location: 'Bangalore',
    bio: 'Passionate full-stack developer with 3 years of experience building scalable web applications.',
    skills: ['javascript', 'react', 'node.js', 'mongodb', 'css', 'html', 'python'],
    experience: 3,
    education: { degree: 'B.Tech Computer Science', institution: 'VIT University', year: 2021 }
  });

  const seekerUser2 = await User.create({
    name: 'Sneha Patel',
    email: 'sneha@hirehub.com',
    password: 'demo1234',
    role: 'jobseeker',
    location: 'Mumbai',
    skills: ['python', 'machine learning', 'data science', 'tensorflow', 'sql'],
    experience: 2,
    bio: 'Data scientist passionate about turning data into insights.',
    education: { degree: 'M.Sc Data Science', institution: 'IIT Bombay', year: 2022 }
  });

  console.log('👤 Created demo users');

  // ─── Create Demo Jobs ────────────────────────────────────────────────────────
  const jobs = await Job.insertMany([
    // Technology
    {
      title: 'Senior React Developer',
      company: 'TechCorp India',
      description: 'We are looking for an experienced React developer to join our product team. You will be responsible for building and maintaining our web applications, working closely with designers and backend engineers. You will architect scalable frontend solutions, conduct code reviews, and mentor junior developers.',
      skills: ['react', 'javascript', 'node.js', 'typescript', 'css', 'html', 'redux'],
      location: 'Bangalore',
      jobType: 'full-time',
      salary: { min: 1200000, max: 2000000, currency: 'INR', period: 'yearly' },
      experience: { min: 3, max: 7 },
      education: "B.Tech / B.E. in Computer Science",
      postedBy: hrUser._id,
      category: 'technology',
      openings: 2,
      status: 'active',
      responsibilities: [
        'Build and maintain high-quality React components',
        'Collaborate with UX/UI designers to implement designs',
        'Write clean, maintainable, and well-documented code',
        'Participate in code reviews and team standups',
        'Optimize applications for maximum speed and scalability'
      ],
      benefits: ['Health Insurance', 'Work from Home 3 days/week', 'Stock Options', 'Annual Bonus', 'Learning Budget'],
      views: 142,
      applicationCount: 0
    },
    {
      title: 'Python Backend Engineer',
      company: 'TechCorp India',
      description: 'Join our backend team to build robust APIs and microservices. You will design and develop Python-based backend systems that power our platform serving millions of users. Experience with Django or FastAPI is required.',
      skills: ['python', 'django', 'fastapi', 'postgresql', 'redis', 'docker', 'aws'],
      location: 'Hyderabad',
      jobType: 'full-time',
      salary: { min: 1000000, max: 1800000, currency: 'INR', period: 'yearly' },
      experience: { min: 2, max: 6 },
      education: 'B.Tech / MCA',
      postedBy: hrUser._id,
      category: 'technology',
      status: 'active',
      openings: 3,
      responsibilities: [
        'Design and develop RESTful APIs using Python',
        'Work with PostgreSQL and Redis for data storage and caching',
        'Implement authentication, authorization, and security measures',
        'Write unit and integration tests',
        'Participate in architecture discussions'
      ],
      benefits: ['Health & Dental Insurance', 'Remote Work Option', 'Gym Membership', '5-day work week'],
      views: 98,
      applicationCount: 0
    },
    {
      title: 'Data Scientist',
      company: 'StartupXYZ',
      description: 'We are building the next generation of fintech products using AI and ML. As a Data Scientist, you will develop predictive models, analyze large datasets, and create data-driven solutions. You will work with our engineering team to deploy models into production.',
      skills: ['python', 'machine learning', 'data science', 'tensorflow', 'sql', 'scikit-learn', 'pandas'],
      location: 'Remote',
      jobType: 'remote',
      salary: { min: 900000, max: 1600000, currency: 'INR', period: 'yearly' },
      experience: { min: 1, max: 4 },
      education: 'M.Sc / B.Tech with strong Statistics background',
      postedBy: hrUser2._id,
      category: 'technology',
      status: 'active',
      openings: 1,
      responsibilities: [
        'Develop and deploy machine learning models',
        'Analyze large datasets to find patterns and insights',
        'Create dashboards and visualizations for stakeholders',
        'Work with engineers to put models into production',
        'Stay updated with latest ML research and techniques'
      ],
      benefits: ['100% Remote', 'Flexible Hours', 'ESOPs', 'Conference Budget', 'Top-of-market compensation'],
      views: 203,
      applicationCount: 0
    },
    {
      title: 'UI/UX Designer',
      company: 'TechCorp India',
      description: 'We are hiring a creative UI/UX Designer to design beautiful and intuitive interfaces for our SaaS products. You will conduct user research, create wireframes, prototypes, and high-fidelity designs. Close collaboration with product managers and developers is key.',
      skills: ['figma', 'adobe xd', 'ui design', 'ux research', 'prototyping', 'design systems'],
      location: 'Bangalore',
      jobType: 'full-time',
      salary: { min: 800000, max: 1400000, currency: 'INR', period: 'yearly' },
      experience: { min: 2, max: 5 },
      education: 'B.Des / B.Tech with design background',
      postedBy: hrUser._id,
      category: 'design',
      status: 'active',
      openings: 1,
      responsibilities: [
        'Design user interfaces for web and mobile applications',
        'Conduct user research and usability testing',
        'Create wireframes, user flows, and high-fidelity prototypes',
        'Maintain and evolve our design system',
        'Collaborate with developers to ensure pixel-perfect implementation'
      ],
      benefits: ['Creative Environment', 'Latest Design Tools', 'Remote-friendly', 'Annual Design Conference'],
      views: 87,
      applicationCount: 0
    },
    {
      title: 'Digital Marketing Manager',
      company: 'StartupXYZ',
      description: 'Looking for a data-driven Digital Marketing Manager to lead our growth efforts. You will own our digital marketing strategy across SEO, SEM, social media, email, and content marketing. Proven experience growing B2C or fintech brands is highly valued.',
      skills: ['seo', 'google ads', 'facebook ads', 'content marketing', 'email marketing', 'analytics'],
      location: 'Mumbai',
      jobType: 'full-time',
      salary: { min: 800000, max: 1500000, currency: 'INR', period: 'yearly' },
      experience: { min: 3, max: 8 },
      education: 'MBA Marketing / Any Graduate with experience',
      postedBy: hrUser2._id,
      category: 'marketing',
      status: 'active',
      openings: 1,
      responsibilities: [
        'Develop and execute multi-channel digital marketing strategy',
        'Manage paid advertising on Google, Facebook, and LinkedIn',
        'Drive organic growth through SEO and content strategy',
        'Analyze marketing metrics and optimize campaigns',
        'Lead a team of 3 marketing specialists'
      ],
      benefits: ['Performance Bonus', 'Marketing Budget', 'Flexible Hours', 'Health Insurance'],
      views: 56,
      applicationCount: 0
    },
    {
      title: 'Full Stack Developer Intern',
      company: 'TechCorp India',
      description: 'Great opportunity for final-year students and fresh graduates to kickstart their tech career! You will work on real products, learn from senior engineers, and contribute meaningful code from day one. We value learning attitude over experience.',
      skills: ['javascript', 'html', 'css', 'react', 'node.js', 'mongodb'],
      location: 'Bangalore',
      jobType: 'internship',
      salary: { min: 25000, max: 40000, currency: 'INR', period: 'monthly' },
      experience: { min: 0, max: 1 },
      education: 'B.Tech / BCA (Final Year or Graduate)',
      postedBy: hrUser._id,
      category: 'technology',
      status: 'active',
      openings: 4,
      responsibilities: [
        'Build features for our web platform under senior guidance',
        'Fix bugs and improve code quality',
        'Learn industry best practices for software development',
        'Participate in daily standups and weekly demos',
        'Potential for full-time conversion based on performance'
      ],
      benefits: ['Stipend ₹25K-40K/month', 'Mentorship', 'Certificate', 'PPO Opportunity', 'Snacks & Lunch'],
      views: 310,
      applicationCount: 0
    },
    {
      title: 'DevOps Engineer',
      company: 'StartupXYZ',
      description: 'We are scaling our infrastructure and need a skilled DevOps Engineer to build and maintain our cloud infrastructure. You will work with Kubernetes, AWS, and implement CI/CD pipelines to help us ship faster and more reliably.',
      skills: ['aws', 'kubernetes', 'docker', 'terraform', 'ci/cd', 'linux', 'python'],
      location: 'Remote',
      jobType: 'remote',
      salary: { min: 1400000, max: 2400000, currency: 'INR', period: 'yearly' },
      experience: { min: 3, max: 8 },
      education: 'B.Tech / Any Engineering Degree',
      postedBy: hrUser2._id,
      category: 'technology',
      status: 'active',
      openings: 1,
      responsibilities: [
        'Design, build, and maintain cloud infrastructure on AWS',
        'Manage Kubernetes clusters and containerized applications',
        'Build and maintain CI/CD pipelines for automated deployments',
        'Implement monitoring, alerting, and incident response',
        'Work closely with development teams to improve deployment processes'
      ],
      benefits: ['100% Remote', 'Top Salary', 'ESOPs', 'Equipment Budget', 'Unlimited PTO'],
      views: 120,
      applicationCount: 0
    },
    {
      title: 'HR Business Partner',

      company: 'TechCorp India',
      description: 'We are looking for a strategic HR Business Partner to support our engineering and product teams. You will manage talent acquisition, employee relations, performance management, and culture initiatives. You will work closely with leadership to align HR strategy with business goals.',
      skills: ['hr management', 'recruitment', 'performance management', 'employee relations', 'hr analytics'],
      location: 'Pune',
      jobType: 'full-time',
      salary: { min: 700000, max: 1200000, currency: 'INR', period: 'yearly' },
      experience: { min: 3, max: 7 },
      education: 'MBA HR / PGDM HR / MSW',
      postedBy: hrUser._id,
      category: 'hr',
      status: 'active',
      openings: 1,
      responsibilities: [
        'Partner with business leaders on workforce planning',
        'Lead end-to-end recruitment for tech and non-tech roles',
        'Drive performance management and employee development',
        'Handle employee relations, grievances, and conflict resolution',
        'Analyze HR metrics and present insights to leadership'
      ],
      benefits: ['Health Insurance', 'Professional Development', 'Hybrid Work', 'Annual Bonus'],
      views: 44,
      applicationCount: 0
    }
  ]);

  console.log(`💼 Created ${jobs.length} demo jobs`);

  // ─── Create Demo Application ──────────────────────────────────────────────
  await Application.create({
    job: jobs[0]._id,
    applicant: seekerUser._id,
    coverLetter: 'I am very excited about this React Developer role at TechCorp India. With 3 years of experience building production React applications, I am confident I can contribute significantly to your team. I have worked on complex state management with Redux, built reusable component libraries, and optimized applications for performance. I would love the opportunity to discuss how I can help your team.',
    matchScore: 71,
    status: 'reviewing'
  });

  // Update job application count
  await Job.findByIdAndUpdate(jobs[0]._id, { $inc: { applicationCount: 1 } });

  await Application.create({
    job: jobs[2]._id,
    applicant: seekerUser2._id,
    coverLetter: 'As a Data Scientist with experience in ML and Python, I am very interested in this role at StartupXYZ. I have built and deployed multiple machine learning models in production, worked with TensorFlow and scikit-learn extensively.',
    matchScore: 85,
    status: 'shortlisted'
  });

  await Job.findByIdAndUpdate(jobs[2]._id, { $inc: { applicationCount: 1 } });

  console.log('📝 Created demo applications');

  console.log('\n✅ Database seeded successfully!\n');
  console.log('═══════════════════════════════════════════');
  console.log('  DEMO CREDENTIALS:');
  console.log('═══════════════════════════════════════════');
  console.log('  Job Seeker:');
  console.log('    Email: demo.seeker@hirehub.com');
  console.log('    Password: demo1234');
  console.log('');
  console.log('  HR / Employer:');
  console.log('    Email: demo.hr@hirehub.com');
  console.log('    Password: demo1234');
  console.log('═══════════════════════════════════════════\n');

  process.exit(0);
};

seedData().catch(err => {
  console.error('❌ Seed error:', err);
  process.exit(1);
});
