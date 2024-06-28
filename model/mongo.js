const mongoose = require("mongoose");

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
    name: {
        type: String,
        minLength: 3,
        required: true,
    },
    number: {
        type: String,
        validate: {
            validator: function (num) {
                return /^\d{2,3}-\d+$/.test(num);
            },
            message: (props) => `${props.value} is not a valid number`,
        },
        required: true,
    },
});

personSchema.set("toJSON", {
    transform: (person, returnedPerson) => {
        returnedPerson.id = person._id.toString();
        delete returnedPerson._id;
        delete returnedPerson.__v;
    },
});
const Person = mongoose.model("Person", personSchema);

module.exports = Person;
