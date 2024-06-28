const mongoose = require("mongoose");

if (process.argv.length !== 2 && process.argv.length !== 4) {
    console.log("the file only accepts 0 or 3 arguments");
    process.exit(1);
}

const url = process.env.MONGODB_URI;

mongoose.set("strictQuery", false);

mongoose
    .connect(url)
    .then(() => {
        console.log("Connected to MongoDB");
    })
    .catch((error) => {
        console.log("error connecting to MongoDB", error.message);
    });

const personSchema = new mongoose.Schema({
    name: String,
    number: String,
});

const Person = mongoose.model("Person", personSchema);

if (process.argv.length === 4) {
    const person = new Person({
        name: process.argv[2],
        number: process.argv[3],
    });

    person.save().then((result) => {
        console.log(
            `added ${result.name} number ${result.number} to phonebook`,
        );
        mongoose.connection.close();
    });
}
if (process.argv.length === 1) {
    console.log("phonebook:");
    Person.find({}).then((result) => {
        result.forEach((person) => {
            console.log(`${person.name} ${person.number}`);
        });
        mongoose.connection.close();
    });
}
