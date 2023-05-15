const { authJwt } = require("../middlewares");
const products = require("../controllers/product.controller.js");
module.exports = app => {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  var router = require("express").Router();

  // Create a new product
  router.post("/", [authJwt.verifyToken, authJwt.isAdmin], products.create);

  // Retrieve all products
  router.get("/", [authJwt.verifyToken, authJwt.isUserOrAdmin], products.findAll);

  // Retrieve a single product with id
  router.get("/:id", [authJwt.verifyToken, authJwt.isUserOrAdmin], products.findOne);

  // Update a product with id
  router.put("/:id", [authJwt.verifyToken, authJwt.isAdmin], products.update);

  // Delete a product with id
  router.delete("/:id", [authJwt.verifyToken, authJwt.isAdmin], products.delete);

  // Delete all products
  router.delete("/", [authJwt.verifyToken, authJwt.isAdmin], products.deleteAll);

  app.use("/api/products", router);
};