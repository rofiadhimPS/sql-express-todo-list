const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mysql = require('mysql');

const app = express();
const port = 3000;

// Setup MySQL connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'username',     // Ganti dengan nama pengguna MySQL Anda
  password: 'password', // Ganti dengan kata sandi MySQL Anda
  database: 'todo_app_db',
});


db.connect(err => {
  if (err) throw err;
  console.log('Connected to the database');
});

app.use(bodyParser.json());

// Middleware to check JWT authentication
const authenticateJWT = (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) return res.sendStatus(401);

  jwt.verify(token, 'secretKey', (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Create User
app.post('/api/users', async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  const query = 'INSERT INTO users (username, password) VALUES (?, ?)';
  db.query(query, [username, hashedPassword], (err, result) => {
    if (err) throw err;
    res.status(201).send('User created successfully');
  });
});

// User Login
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  const query = 'SELECT * FROM users WHERE username = ?';
  db.query(query, [username], async (err, result) => {
    if (err) throw err;
    
    if (result.length === 0) {
      return res.status(404).send('User not found');
    }

    const user = result[0];
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).send('Incorrect password');
    }

    const token = jwt.sign({ id: user.id }, 'secretKey');
    res.json({ token });
  });
});

// Create Todo
app.post('/api/todos', authenticateJWT, (req, res) => {
  const { userId, task } = req.body;
  const query = 'INSERT INTO todos (user_id, task) VALUES (?, ?)';
  db.query(query, [userId, task], (err, result) => {
    if (err) throw err;
    res.status(201).send('Todo created successfully');
  });
});

// Get Todos by User
app.get('/api/todos/:userId', authenticateJWT, (req, res) => {
  const userId = req.params.userId;
  const query = 'SELECT * FROM todos WHERE user_id = ?';
  db.query(query, [userId], (err, result) => {
    if (err) throw err;
    res.json(result);
  });
});

// Update Todo
app.put('/api/todos/:todoId', authenticateJWT, (req, res) => {
  const todoId = req.params.todoId;
  const { task } = req.body;
  const query = 'UPDATE todos SET task = ? WHERE id = ?';
  db.query(query, [task, todoId], (err, result) => {
    if (err) throw err;
    res.send('Todo updated successfully');
  });
});

// Delete Todo
app.delete('/api/todos/:todoId', authenticateJWT, (req, res) => {
  const todoId = req.params.todoId;
  const query = 'DELETE FROM todos WHERE id = ?';
  db.query(query, [todoId], (err, result) => {
    if (err) throw err;
    res.send('Todo deleted successfully');
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
