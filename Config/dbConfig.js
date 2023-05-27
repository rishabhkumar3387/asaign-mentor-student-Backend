const mongodb = require("mongodb");
const Mongoclient = mongodb.Mongoclient;
const dbName="assignMentor"
const dbUrl=`mongodb+srv://rishabhkumar06:12345@cluster0.7gsrxw8.mongodb.net/mentor_data/`
module.exports={dbUrl,mongodb,Mongoclient};
