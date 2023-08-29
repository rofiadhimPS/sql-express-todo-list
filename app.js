async function createUser() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
  
    const response = await fetch('/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });
  
    if (response.ok) {
      alert('User created successfully');
    } else {
      alert('Failed to create user');
    }
  }
  
  async function login() {
    const loginUsername = document.getElementById('loginUsername').value;
    const loginPassword = document.getElementById('loginPassword').value;
  
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username: loginUsername, password: loginPassword }),
    });
  
    if (response.ok) {
      const data = await response.json();
      localStorage.setItem('token', data.token);
      alert('Login successful');
    } else {
      alert('Login failed');
    }
  }
  
  async function createTodo() {
    const todoTask = document.getElementById('todoTask').value;
    const token = localStorage.getItem('token');
  
    const response = await fetch('/api/todos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token,
      },
      body: JSON.stringify({ userId: 1, task: todoTask }), // Replace userId with actual user id
    });
  
    if (response.ok) {
      alert('Todo created successfully');
      loadTodoList();
    } else {
      alert('Failed to create todo');
    }
  }
  
  async function loadTodoList() {
    const token = localStorage.getItem('token');
  
    const response = await fetch('/api/todos/1', {
      headers: {
        'Authorization': token,
      },
    });
  
    if (response.ok) {
      const data = await response.json();
      const todoList = document.getElementById('todoList');
      todoList.innerHTML = '';
  
      data.forEach(todo => {
        const li = document.createElement('li');
        li.textContent = todo.task;
        todoList.appendChild(li);
      });
    }
  }
  
  window.onload = () => {
    loadTodoList();
  };
  