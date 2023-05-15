const jwt = require("jsonwebtoken");
const config = require("../config/auth.config");
const db = require("../models");
const User = db.user;
const Role = db.role;

const { TokenExpiredError } = jwt;

const catchError = (err, res) => {
  if (err instanceof TokenExpiredError) {
    return res.status(401).send({ message: "Unauthorized! Access Token was expired!" });
  }

  return res.sendStatus(401).send({ message: "Unauthorized!" });
}

const verifyToken = (req, res, next) => {
  let token = req.headers.authorization.split(" ")[1];

  if (!token) {
    return res.status(403).send({ message: "No token provided!" });
  }

  jwt.verify(token, config.secret, (err, decoded) => {
    if (err) {
      return catchError(err, res);
    }
    req.userId = decoded.id;
    next();
  });
};

const isAdmin = (req, res, next) => {
  User.findById(req.userId).exec().then(user => {
    Role.find(
      {
        _id: { $in: user.roles }
      }).then(roles => {
        for (let i = 0; i < roles.length; i++) {
          if (roles[i].name === "admin") {
            req.loginUserRole = roles[i].name;
            next();
            return;
          }
        }

        res.status(403).send({ message: "Require Admin Role!" });
        return;
      }).catch(err => {
        res.status(500).send({ message: err });
        return;
      });
  }).catch(err => {
    res.status(500).send({ message: err });
    return;
  });
};

const isUser = (req, res, next) => {
  User.findById(req.userId).exec().then(user => {
    Role.find(
      {
        _id: { $in: user.roles }
      }).then(roles => {
        for (let i = 0; i < roles.length; i++) {
          if (roles[i].name === "user") {
            req.loginUserRole = roles[i].name;
            next();
            return;
          }
        }

        res.status(403).send({ message: "Require User Role!" });
        return;
      }).catch(err => {
        res.status(500).send({ message: err });
        return;
      });
  }).catch(err => {
    res.status(500).send({ message: err });
    return;
  });
};

const isUserOrAdmin = (req, res, next) => {
  User.findById(req.userId).exec().then(user => {
    Role.find(
      {
        _id: { $in: user.roles }
      }).then(roles => {
        for (let i = 0; i < roles.length; i++) {
          if (roles[i].name === "user" || roles[i].name === "admin") {
            req.loginUserRole = roles[i].name;
            next();
            return;
          }
        }

        res.status(403).send({ message: "Require User OR Admin Role!" });
        return;
      }).catch(err => {
        res.status(500).send({ message: err });
        return;
      });
  }).catch(err => {
    res.status(500).send({ message: err });
    return;
  });
}

const authJwt = {
  verifyToken,
  isAdmin,
  isUser,
  isUserOrAdmin
};
module.exports = authJwt;
