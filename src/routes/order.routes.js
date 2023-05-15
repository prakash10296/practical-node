const { authJwt } = require("../middlewares");
const orders = require("../controllers/order.controller.js");
module.exports = app => {

  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  var router = require("express").Router();

  // Retrieve all orders report
  router.get("/report", [authJwt.verifyToken, authJwt.isAdmin], orders.report);

  // Create a new order
  router.post("/", [authJwt.verifyToken, authJwt.isUserOrAdmin], orders.create);

  // Retrieve all orders
  router.get("/", [authJwt.verifyToken, authJwt.isUserOrAdmin], orders.findAll);

  // Retrieve a single order with id
  router.get("/:id", [authJwt.verifyToken, authJwt.isUserOrAdmin], orders.findOne);

  // Update a order with id
  router.put("/:id", [authJwt.verifyToken, authJwt.isAdmin], orders.update);

  // Delete a order with id
  router.delete("/:id", [authJwt.verifyToken, authJwt.isAdmin], orders.delete);

  // Delete all orders
  router.delete("/", [authJwt.verifyToken, authJwt.isAdmin], orders.deleteAll);

  app.use("/api/orders", router);
};