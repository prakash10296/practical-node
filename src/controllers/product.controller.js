const db = require("../models");
const Product = db.product;
const path = require("path");
const fs = require('fs');

// Create and Save a new Product
exports.create = async (req, res) => {
    // Validate request
    if (!req.body.name) {
        res.status(400).send({ message: "Name can not be empty!" });
        return;
    }

    var uploadedFiles = [];
    uploadedData = req.files.images;
    var allowedExtension = ['.png', '.jpg'];
    if (uploadedData.length > 1) {
        // for multiple image
        for (let i = 0; i < uploadedData.length; i++) {
            var extensionName = path.extname(uploadedData[i].name);
            if (!allowedExtension.includes(extensionName)) {
                return res.status(422).send("Upload only .png and .jpg format only.");
            }
            var newFileName = new Date().getTime() + '_' + uploadedData[i].name;
            const uploadPath = path.join(__dirname, '..', '../public/uploads/', newFileName)
            const fileName = newFileName;
            uploadedFiles.push(fileName)
            uploadedData[i].mv(uploadPath, function (err) {
                if (err) {
                    res.send(err);
                }
            });
        }
    } else {
        // for single image
        var extensionName = path.extname(uploadedData.name);
        if (!allowedExtension.includes(extensionName)) {
            return res.status(422).send("Upload only .png and .jpg format only.");
        }
        var newFileName = new Date().getTime() + '_' + uploadedData.name;
        const uploadPath = path.join(__dirname, '..', '../public/uploads/', newFileName)
        const fileName = newFileName;
        uploadedFiles.push(fileName)
        uploadedData.mv(uploadPath, function (err) {
            if (err) {
                res.send(err);
            }
        })
    }

    // Create a Product
    const product = new Product({
        name: req.body.name,
        size: req.body.size,
        images: uploadedFiles,
        colour: req.body.colour,
        price: req.body.price,
        quantity: req.body.quantity
    });

    // Save Product in the database
    product
        .save(product)
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message:
                    err.message || "Some error occurred while creating the Product."
            });
        });
};

// Retrieve all product from the database.
exports.findAll = (req, res) => {
    const name = req.query.name;
    let { page, size } = req.query;
    if (!page) {
        page = 1;
    }
    if (!size) {
        size = 10;
    }
    const limit = parseInt(size);

    var condition = name ? { name: { $regex: new RegExp(name), $options: "i" } } : {};

    Product.find(condition).sort(
        { _id: -1 }).limit(limit)
        .then(data => {
            res.send({
                page,
                size,
                data: data,
            });
        })
        .catch(err => {
            res.status(500).send({
                message:
                    err.message || "Some error occurred while retrieving product."
            });
        });
};

// Find a single Product with an id
exports.findOne = (req, res) => {
    const id = req.params.id;

    Product.findById(id)
        .then(data => {
            if (!data)
                res.status(404).send({ message: "Not found Product with id " + id });
            else res.send(data);
        })
        .catch(err => {
            res
                .status(500)
                .send({ message: "Error retrieving Product with id=" + id });
        });
};

// Update a Product by the id in the request
exports.update = (req, res) => {
    if (!req.body) {
        return res.status(400).send({
            message: "Data to update can not be empty!"
        });
    }

    const id = req.params.id;

    Product.findByIdAndUpdate(id, req.body, { useFindAndModify: false })
        .then(data => {
            if (!data) {
                res.status(404).send({
                    message: `Cannot update Product with id=${id}. Maybe Product was not found!`
                });
            } else res.send({ message: "Product was updated successfully." });
        })
        .catch(err => {
            res.status(500).send({
                message: "Error updating Product with id=" + id
            });
        });
};

// Delete a Product with the specified id in the request
exports.delete = (req, res) => {
    const id = req.params.id;

    Product.findByIdAndRemove(id, { useFindAndModify: false })
        .then(data => {
            if (!data) {
                res.status(404).send({
                    message: `Cannot delete Product with id=${id}. Maybe Product was not found!`
                });
            } else {
                for (var i = 0; i < data.images.length; i++) {
                    fs.unlinkSync('./public/uploads/' + data.images[i]);
                }
                res.send({
                    message: "Product was deleted successfully!"
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: "Could not delete Product with id=" + id
            });
        });
};

// Delete all product from the database.
exports.deleteAll = (req, res) => {
    Product.deleteMany({})
        .then(data => {
            res.send({
                message: `${data.deletedCount} product were deleted successfully!`
            });
        })
        .catch(err => {
            res.status(500).send({
                message:
                    err.message || "Some error occurred while removing all product."
            });
        });
};
