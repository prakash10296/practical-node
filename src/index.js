const express = require("express");
const fileUpload = require("express-fileupload");
const cors = require("cors");
const dbConfig = require("./config/db.config");
const bcrypt = require("bcryptjs");

const app = express();

let corsOptions = {
  origin: "http://localhost:3000"
};

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(express.json());

app.use(fileUpload({
  limits: { fileSize: 50 * 1024 * 1024 },
  createParentPath: true,
}));

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

const db = require("./models");
const Role = db.role;
const User = db.user;

db.mongoose
  .connect(`mongodb://${dbConfig.HOST}:${dbConfig.PORT}/${dbConfig.DB}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log("Successfully connect to MongoDB.");
    initial();
  })
  .catch(err => {
    console.error("Connection error", err);
    process.exit();
  });

// simple route
app.get("/", (req, res) => {
  res.json({ message: "Welcome" });
});

// routes
require("./routes/auth.routes")(app);
require("./routes/user.routes")(app);
require("./routes/product.routes")(app);
require("./routes/order.routes")(app);

// set port, listen for requests
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});

async function initial() {
  await Role.estimatedDocumentCount().then(async (count) => {
    if (count === 0) {
      await new Role({
        name: "admin"
      }).save().then(data => {
        if (data) {
          console.log("'admin' role added to roles collection.", data);
        }
      });

      await new Role({
        name: "user"
      }).save().then(data => {
        if (data) {
          console.log("'user' role added to roles collection.", data);
        }
      });
    }
  });
  await User.estimatedDocumentCount().then(async (count) => {
    if (count === 0) {
      await new User({
        username: "admin",
        mobile: "7897897890",
        password: bcrypt.hashSync("123456", 8)
      }).save().then(async user => {
        await Role.findOne({ name: "admin" }).exec().then(role => {
          user.roles = [role._id];
          user.save().then(() => {
            console.log("Admin was registered successfully!");
          }).catch(err => {
            console.log(err);
          });
        }).catch(err => {
          console.log(err);
        });
      });
    }
  });
}
