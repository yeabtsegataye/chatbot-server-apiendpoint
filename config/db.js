const mongoose = require("mongoose");

const ConnectDB = () => {
  try {
    mongoose.connect(process.env.MONGOODBURL).then(() => {
      console.log("connected to mongoDB");
    });
  } catch (error) {
    console.log(error.message);
  }
};
module.exports = ConnectDB;
