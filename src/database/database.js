const mongoose = require("mongoose");
try {
    const conn =  mongoose.connect(process.env.database);
    console.log(`MongoDB Connected`);
  } catch (error) {
    console.log(error);
  }
mongoose.Promise = global.Promise;
module.exports = mongoose;