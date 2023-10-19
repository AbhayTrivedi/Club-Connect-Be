const mongoose = require("mongoose");

const db_name = "CC-Database";
const password = process.env.DB_PASSWORD;
const mongoUrl = `mongodb+srv://Abhay:${password}@cc-cluster.cuuunr3.mongodb.net/${db_name}?retryWrites=true&w=majority`;

const connectToMongo = () => {
   mongoose.connect(mongoUrl, () => {
      console.log(`Connected To The Mongo ${db_name} Successfully ^.^`);
   });
};

module.exports = connectToMongo;
