const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();
const Person = require("./model/mongo");

app.use(express.static(path.join(__dirname, "dist")));
app.use(express.json());
app.use(cors());
app.use(
    morgan(
        ":method :url :status :res[content-length] - :response-time ms :postBody",
    ),
);

morgan.token("postBody", (request) => {
    if (request.method === "POST") {
        return JSON.stringify(request.body);
    }
    return "--";
});

app.get("/api/persons/:id", (request, response, next) => {
    const id = request.params.id;
    Person.findById(id)
        .then((person) => {
            if (person) {
                response.json(person);
            } else {
                response.status(404).send("Person not found");
            }
        })
        .catch((error) => {
            next(error);
        });
});

app.get("/api/persons", (request, response) => {
    Person.find({})
        .then((persons) => response.json(persons))
        .catch((error) =>
            response
                .status(404)
                .json({ error: error, message: "coludn't fetch persons" }),
        );
    // response.json(persons);
});

app.post("/api/persons", (request, response, next) => {
    const newPerson = request.body;
    const person = new Person({
        name: newPerson.name,
        number: newPerson.number,
    });
    person
        .save()
        .then((result) => {
            response.json(result);
        })
        .catch((error) => next(error));
});

app.put("/api/persons/:id", (request, response, next) => {
    const id = request.params.id;
    const newPerson = request.body;
    Person.findByIdAndUpdate(id, newPerson, { new: true, runValidators: true })
        .then((person) => response.json(person))
        .catch((error) => next(error));
});

app.delete("/api/persons/:id", (request, response, next) => {
    const id = request.params.id;
    Person.findByIdAndDelete(id)
        .then(() => {
            response.status(204).end();
        })
        .catch((error) => next(error));
});

app.get("/info", (request, response) => {
    Person.find({}).then((persons) => {
        const res = `<p>Phonebook has info for ${persons.length} people</p>
                <p>${new Date().toUTCString()}</p>`;
        response.send(res);
    });
});
const unknownEndpoint = (request, response, next) => {
    response.status(404).send({ error: "unknown endpoint" });
    next();
};

const errorHandler = (error, request, response, next) => {
    console.error(error.message);
    if (error.name === "CastError") {
        return response.status(400).send({ error: "malformatted id" });
    }
    if (error.name === "ValidationError") {
        return response.status(400).send({ error: error.message });
    }

    next(error);
};

app.use(unknownEndpoint);
app.use(errorHandler);
const PORT = process.env.PORT || 3001;

app.listen(PORT, "127.0.0.1", () => {
    console.log(`Started Server in ${PORT} port`);
});

module.exports = app;
