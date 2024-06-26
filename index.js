const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const path = require("path");

const app = express();

app.use(express.static(path.join(__dirname, "dist")));
app.use(express.json());
app.use(cors());
app.use(
  morgan(
    ":method :url :status :res[content-length] - :response-time ms :postBody",
  ),
);

morgan.token("postBody", (request, response) => {
  if (request.method === "POST") {
    return JSON.stringify(request.body);
  }
  return "--";
});

let persons = [
  {
    id: "1",
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: "2",
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: "3",
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: "4",
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

app.get("/api/persons/:id", (request, response) => {
  const id = request.params.id;
  const person = persons.find((person) => person.id === id);
  if (!person) {
    response.status(404).send("Person not found");
  } else {
    response.json(person);
  }
});

app.get("/api/persons", (request, response) => {
  response.json(persons);
});

app.post("/api/persons", (request, response) => {
  const newPerson = request.body;
  if (!newPerson.name || !newPerson.number) {
    response.status(400).json({ error: "Content missing" });
  } else if (
    persons.findIndex((person) => person.name === newPerson.name) !== -1
  ) {
    response.status(400).json({ error: "Name already exists" });
  } else {
    newPerson.id = String(Math.floor(Math.random() * 1000));
    persons = persons.concat(newPerson);
    response.json(newPerson);
  }
});

app.delete("/api/persons/:id", (request, response) => {
  const id = request.params.id;
  persons = persons.filter((person) => person.id !== id);

  response.status(204).end();
});

app.get("/info", (request, response) => {
  const res = `<p>Phonebook has info for ${persons.length} people</p>
                <p>${new Date().toUTCString()}</p>`;
  response.send(res);
});
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

app.use(unknownEndpoint);
const PORT = process.env.PORT || 3001;

app.listen(PORT, "127.0.0.1", () => {
  console.log(`Started Server in ${PORT} port`);
});

module.exports = app;
