const { authJwt } = require("../middlewares");
const users = require("../controllers/user.controller");
module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.get("/api/all", users.allAccess);

  app.get("/api/user", [authJwt.verifyToken, authJwt.isUser], users.userBoard);

  app.get(
    "/api/admin",
    [authJwt.verifyToken, authJwt.isAdmin],
    users.adminBoard
  );

  var router = require("express").Router();

  // Create a new user
  router.post("/", users.create);

  // Retrieve all users
  router.get("/", users.findAll);

  // Retrieve a single user with id
  router.get("/:id", users.findOne);

  // Update a user with id
  router.put("/:id", users.update);

  // Delete a user with id
  router.delete("/:id", users.delete);

  // Delete all users
  router.delete("/", users.deleteAll);

  app.use("/api/users", [authJwt.verifyToken, authJwt.isAdmin], router);
};
