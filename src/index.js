const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find((user) => user.username === username);

  if (!user) {
    return response.status(404).json({ error: "User not found!" });
  }

  request.user = user;

  return next();
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;

  const usersExists = users.some((user) => user.username === username);

  if (usersExists) {
    return response
      .status(400)
      .json({ error: "Esse nome de usuário já existe!" });
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  };

  users.push(user);

  return response.status(201).json(user);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const user = request.user

  const todos = user.todos

  return response.status(201).json(todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const user = request.user
  const {title, deadline} = request.body

  const todo = { 
    id: uuidv4(),
    title,
    done: false, 
    deadline: new Date(deadline),
    created_at: new Date(),
  }

  user.todos.push(todo);

  return response.status(201).json(todo)
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const user = request.user

  const {id} = request.query
  const {title, deadline} = request.body

  const indexTodo = user.todos.findIndex((todo) => todo.id === id)

  if (indexTodo) {
    return response.status(404).json({error: "Esse todo não existe!"})
  }
  const todo = user.todos.find((todo) => todo.id === id)
  const updatedTodo = {...todo, title, deadline: new Date(deadline)}
  user.todos[indexTodo] = updatedTodo

  return response.status(201).json(user.todos)
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const user = request.user
  const {id} = request.query

  const indexTodo = user.todos.findIndex((todo) => todo.id === id)

  if (indexTodo) {
    return response.status(404).json({error: "Esse todo não existe!"})
  }

  const todo = user.todos.find((todo) => todo.id === id)
  const updatedTodo = {...todo, done: true}
  user.todos[indexTodo] = updatedTodo

  return response.status(201).json(user.todos)
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {  
  const user = request.user

  const {id} = request.query

  const indexTodo = user.todos.findIndex((todo) => todo.id === id)

  if (indexTodo) {
    return response.status(404).json({error: "Esse todo não existe!"})
  }
  
  user.todos.splice(indexTodo, 1)

  return response.status(204).send()

});

module.exports = app;
