const db = require("../models");
const Order = db.order;
const OrderProduct = db.orderProduct;
const Product = db.product;

// Create and Save a new Order
exports.create = async (req, res) => {
    // Create a Order
    const order = new Order({
        userId: req.userId,
        orderCode: "ORD" + Math.floor(Math.random() * 10000)
    });

    // Save Order in the database
    let productData;
    var amount = 0;
    await order.save(order).then(async data => {
        if (req.body.products) {
            for await (let product of req.body.products) {
                product.orderId = data._id.toString();
                productData = await Product.findById(product.productId);
                amount += productData.price * product.count;
                await new OrderProduct(product).save();
            }
        }
        const orderData = await Order.findByIdAndUpdate({ _id: data._id }, { amount: amount }, { new: true });
        res.send(orderData);
    }).catch(err => {
        res.status(500).send({
            message: err.message || "Some error occurred while creating the Order."
        });
    });
};

// Retrieve all order from the database.
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

    if (req.loginUserRole == "user") {
        condition.userId = req.userId
    }

    Order.find(condition).sort(
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
                    err.message || "Some error occurred while retrieving order."
            });
        });
};

// Find a single Order with an id
exports.findOne = (req, res) => {
    const id = req.params.id;
    let condition = { _id: id };
    if (req.loginUserRole == "user") {
        condition.userId = req.userId
    }

    Order.find(condition)
        .then(data => {
            if (!data)
                res.status(404).send({ message: "Not found Order with id " + id });
            else res.send(data);
        })
        .catch(err => {
            res
                .status(500)
                .send({ message: "Error retrieving Order with id=" + id });
        });
};

// Update a Order by the id in the request
exports.update = (req, res) => {
    if (!req.body) {
        return res.status(400).send({
            message: "Data to update can not be empty!"
        });
    }

    const id = req.params.id;

    Order.findByIdAndUpdate(id, req.body, { useFindAndModify: false })
        .then(data => {
            if (!data) {
                res.status(404).send({
                    message: `Cannot update Order with id=${id}. Maybe Order was not found!`
                });
            } else res.send({ message: "Order was updated successfully." });
        })
        .catch(err => {
            res.status(500).send({
                message: "Error updating Order with id=" + id
            });
        });
};

// Delete a Order with the specified id in the request
exports.delete = (req, res) => {
    const id = req.params.id;

    Order.findByIdAndRemove(id, { useFindAndModify: false })
        .then(data => {
            if (!data) {
                res.status(404).send({
                    message: `Cannot delete Order with id=${id}. Maybe Order was not found!`
                });
            } else {
                res.send({
                    message: "Order was deleted successfully!"
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: "Could not delete Order with id=" + id
            });
        });
};

// Delete all order from the database.
exports.deleteAll = (req, res) => {
    Order.deleteMany({})
        .then(data => {
            res.send({
                message: `${data.deletedCount} order were deleted successfully!`
            });
        })
        .catch(err => {
            res.status(500).send({
                message:
                    err.message || "Some error occurred while removing all order."
            });
        });
};

// Retrieve all report from the database.
exports.report = (req, res) => {
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

    if (req.query.userId) {
        condition.userId = req.query.userId
    }
    if (req.query.fromDate && req.query.toDate) {
        var nextDayDate = new Date(new Date(req.query.toDate).setDate(new Date(req.query.toDate).getDate() + 1));
        condition.orderDate = { $gte: req.query.fromDate, $lte: nextDayDate.toISOString().substr(0, 10) }
    }

    Order.find(condition).sort(
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
                    err.message || "Some error occurred while retrieving order."
            });
        });
};
