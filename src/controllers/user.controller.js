const db = require("../models");
const User = db.user;
const Role = db.role;
const fs = require('fs');
const bcrypt = require("bcryptjs");

exports.allAccess = (req, res) => {
  res.status(200).send("Public Content.");
};

exports.userBoard = (req, res) => {
  res.status(200).send("User Content.");
};

exports.adminBoard = (req, res) => {
  res.status(200).send("Admin Content.");
};

// Create and Save a new User
exports.create = async (req, res) => {
  // Validate request
  if (!req.body.username) {
    res.status(400).send({ message: "Name can not be empty!" });
    return;
  } else if (!req.body.mobile) {
    res.status(400).send({ message: "Mobile can not be empty!" });
    return;
  } else if (!req.body.password) {
    res.status(400).send({ message: "Password can not be empty!" });
    return;
  }

  // Create a User
  const user = new User({
    username: req.body.username,
    mobile: req.body.mobile,
    password: bcrypt.hashSync(req.body.password, 8)
  });

  // Save User in the database
  user
    .save(user)
    .then(data => {
      if (req.body.roles) {
        Role.find({ name: { $in: req.body.roles }, }).then(roles => {
          user.roles = roles.map((role) => role._id);
          user.save().then(() => {
            res.send({ message: "User was created successfully!" });
          }).catch(err => {
            res.status(500).send({ message: err });
            return;
          });
        }).catch(err => {
          res.status(500).send({ message: err });
          return;
        });
      } else {
        Role.findOne({ name: "user" }).exec().then(role => {
          user.roles = [role._id];
          user.save().then(() => {
            res.send({ message: "User was created successfully!" });
          }).catch(err => {
            res.status(500).send({ message: err });
            return;
          });
        }).catch(err => {
          res.status(500).send({ message: err });
          return;
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the User."
      });
    });
};

// Retrieve all user from the database.
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

  User.find(condition).sort(
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
          err.message || "Some error occurred while retrieving user."
      });
    });
};

// Find a single User with an id
exports.findOne = (req, res) => {
  const id = req.params.id;

  User.findById(id)
    .then(data => {
      if (!data)
        res.status(404).send({ message: "Not found User with id " + id });
      else res.send(data);
    })
    .catch(err => {
      res
        .status(500)
        .send({ message: "Error retrieving User with id=" + id });
    });
};

// Update a User by the id in the request
exports.update = (req, res) => {
  if (!req.body) {
    return res.status(400).send({
      message: "Data to update can not be empty!"
    });
  }

  const id = req.params.id;

  var user = {
    username: req.body.username,
    mobile: req.body.mobile,
    password: bcrypt.hashSync(req.body.password, 8)
  };

  User.findByIdAndUpdate(id, user, { useFindAndModify: false })
    .then(data => {
      if (req.body.roles) {
        Role.find({ name: { $in: req.body.roles }, }).then(roles => {
          console.log(roles);
          var changeUser = {};
          changeUser.roles = roles.map((role) => role._id);
          console.log(changeUser);
          User.findByIdAndUpdate(id, changeUser, { useFindAndModify: false }).then(data1 => {
            //console.log(data1);
          }).catch(err => {
            //console.log(err);
          });
        });
      }

      if (!data) {
        res.status(404).send({
          message: `Cannot update User with id=${id}. Maybe User was not found!`
        });
      } else res.send({ message: "User was updated successfully." });
    }).catch(err => {
      console.log(err);
      res.status(500).send({
        message: "Error updating User with id=" + id
      });
    });
};

// Delete a User with the specified id in the request
exports.delete = (req, res) => {
  const id = req.params.id;

  User.findByIdAndRemove(id, { useFindAndModify: false })
    .then(data => {
      if (!data) {
        res.status(404).send({
          message: `Cannot delete User with id=${id}. Maybe User was not found!`
        });
      } else {
        res.send({
          message: "User was deleted successfully!"
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Could not delete User with id=" + id
      });
    });
};

// Delete all user from the database.
exports.deleteAll = (req, res) => {
  User.deleteMany({})
    .then(data => {
      res.send({
        message: `${data.deletedCount} user were deleted successfully!`
      });
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while removing all user."
      });
    });
};