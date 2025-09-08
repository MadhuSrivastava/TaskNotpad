// Load environment variables
require('dotenv').config()

const express = require('express')
const cors = require('cors')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const rateLimit = require('express-rate-limit')

const app = express()

// ----- Environment Variables & Config -----
const SECRET = process.env.JWT_SECRET
const PORT = process.env.PORT || 3000
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173'

// Validate critical env variables
if (!SECRET) {
  console.error('JWT_SECRET is not set in environment variables')
  process.exit(1)
}

// ----- Middleware Setup -----
app.use(cors({ origin: CLIENT_ORIGIN, credentials: true }))
app.use(express.json())

// ----- In-memory Data Storage -----
const users = []
let tasks = []

// ----- Rate Limiter (for auth routes) -----
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  message: { message: 'Too many requests. Try again later.' },
})

// ----- Helpers -----

/**
 * Sends a JSON error response with a given status code and message
 * @param {*} res Express response object
 * @param {number} status HTTP status code
 * @param {string} message Error message
 */
const sendError = (res, status, message) => {
  res.status(status).json({ message })
}

// ----- Authentication Middleware -----

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization
  if (!authHeader) return sendError(res, 401, 'Authorization header missing')

  const token = authHeader.split(' ')[1]
  if (!token) return sendError(res, 401, 'Token missing')

  try {
    req.user = jwt.verify(token, SECRET)
    next()
  } catch {
    sendError(res, 403, 'Invalid or expired token')
  }
}

// ----- Validation Regex -----

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Password must have at least 6 characters, 1 uppercase letter, 1 digit, and 1 special symbol
const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{6,}$/

// ----- Routes -----

// Register a new user
app.post('/api/register', authLimiter, async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) return sendError(res, 400, 'Email and password are required')

  if (!emailRegex.test(email)) return sendError(res, 400, 'Invalid email format')

  if (!passwordRegex.test(password)) {
    return sendError(
      res,
      400,
      'Password must be at least 6 characters long and include 1 uppercase letter, 1 number, and 1 special symbol.'
    )
  }

  if (users.find(u => u.email === email)) return sendError(res, 409, 'User already exists')

  try {
    const hashedPassword = await bcrypt.hash(password, 10)
    users.push({ email, password: hashedPassword })
    res.status(201).json({ message: 'Registered successfully' })
  } catch {
    sendError(res, 500, 'Error registering user')
  }
})

// Login user and return JWT token
app.post('/api/login', authLimiter, async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) return sendError(res, 400, 'Email and password are required')

  const user = users.find(u => u.email === email)
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return sendError(res, 401, 'Invalid credentials')
  }

  const token = jwt.sign({ email: user.email }, SECRET, { expiresIn: '1h' })
  res.json({ token })
})

// Get current authenticated user's email
app.get('/api/me', authMiddleware, (req, res) => {
  res.json({ email: req.user.email })
})

// Get all tasks for authenticated user
app.get('/api/tasks', authMiddleware, (req, res) => {
  const userTasks = tasks.filter(t => t.user === req.user.email)
  res.json(userTasks)
})

// Create a new task
app.post('/api/tasks', authMiddleware, (req, res) => {
  const { title } = req.body
  if (!title || !title.trim()) return sendError(res, 400, 'Task title is required')

  const normalizedTitle = title.trim().toLowerCase()
  if (tasks.some(t => t.user === req.user.email && t.title.toLowerCase() === normalizedTitle)) {
    return sendError(res, 409, 'Task already exists')
  }

  const newTask = {
    id: Date.now(),
    title: title.trim(),
    completed: false,
    user: req.user.email,
  }

  tasks.push(newTask)
  res.status(201).json(newTask)
})

// Update task details (title and/or completed)
app.put('/api/tasks/:id', authMiddleware, (req, res) => {
  const { id } = req.params
  const { title, completed } = req.body

  const task = tasks.find(t => t.id == id && t.user === req.user.email)
  if (!task) return sendError(res, 404, 'Task not found')

  if (title !== undefined) {
    if (!title.trim()) return sendError(res, 400, 'Task title is required')

    const normalizedTitle = title.trim().toLowerCase()
    if (tasks.some(t => t.user === req.user.email && t.id != task.id && t.title.toLowerCase() === normalizedTitle)) {
      return sendError(res, 409, 'Task with this title already exists')
    }
    task.title = title.trim()
  }

  if (completed !== undefined) {
    task.completed = Boolean(completed)
  }

  res.json(task)
})

// Delete a task by ID
app.delete('/api/tasks/:id', authMiddleware, (req, res) => {
  const { id } = req.params
  const initialLength = tasks.length
  tasks = tasks.filter(t => !(t.id == id && t.user === req.user.email))

  if (tasks.length === initialLength) {
    return sendError(res, 404, 'Task not found or not authorized')
  }

  res.sendStatus(204)
})

// ----- Global Error Handler -----
app.use((err, req, res, next) => {
  console.error(err)
  sendError(res, 500, 'Internal server error')
})

// ----- Start Server -----
app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`)
})
