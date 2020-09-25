const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const cors = require("./cors");
const Favorites = require("../models/favorite");
const authenticate = require("../authenticate");

const favoriteRouter = express.Router();

favoriteRouter.use(bodyParser.json());

favoriteRouter
  .route("/")
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200);
  })
  .get(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.find({ user: req.user._id })
      .populate("user")
      .populate("dishes")
      .then(
        (favorites) => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(favorites);
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({ user: req.user._id })
      .then(
        (favorite) => {
          if (favorite != null && favorite.dishes.length > 0) {
            req.body.forEach((element) => {
              if (!favorite.dishes.includes(element._id)) {
                favorite.dishes.push(element._id);
              }
            });
            favorite
              .save()
              .then(
                (favorite) => {
                  Favorites.findById(favorite._id)
                    .populate("user")
                    .populate("dishes")
                    .then((favorite) => {
                      res.statusCode = 200;
                      res.setHeader("Content-Type", "application/json");
                      res.json(favorite);
                    });
                },
                (err) => next(err)
              )
              .catch((err) => next(err));
          } else {
            Favorites.create({
              user: req.user._id,
              dishes: req.body.map((dish) => dish._id),
            })
              .then(
                (favorite) => {
                  Favorites.findById(favorite._id)
                    .populate("user")
                    .populate("dishes")
                    .then((favorite) => {
                      res.statusCode = 200;
                      res.setHeader("Content-Type", "application/json");
                      res.json(favorite);
                    });
                },
                (err) => next(err)
              )
              .catch((err) => next(err));
          }
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })
  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end("PUT operation not supported on /favorites");
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.remove({})
      .then(
        (favorite) => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(favorite);
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  });

favoriteRouter
  .route("/:dishId")
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200);
  })
  .get(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({ user: req.user._id })
      .then(
        (favorites) => {
          if (!favorites) {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            return res.json({ exists: false, favorites: favorites });
          } else {
            if (favorites.dishes.indexOf(req.params.dishId) < 0) {
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              return res.json({ exists: false, favorites: favorites });
            } else {
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              return res.json({ exists: true, favorites: favorites });
            }
          }
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({ user: req.user._id })
      .then(
        (favorite) => {
          if (favorite != null && favorite.dishes.length > 0) {
            if (!favorite.dishes.includes(req.params.dishId)) {
              favorite.dishes.push(req.params.dishId);
              favorite
                .save()
                .then(
                  (favorite) => {
                    Favorites.findById(favorite._id)
                      .populate("user")
                      .populate("dishes")
                      .then((favorite) => {
                        res.statusCode = 200;
                        res.setHeader("Content-Type", "application/json");
                        res.json(favorite);
                      });
                  },
                  (err) => next(err)
                )
                .catch((err) => next(err));
            } else {
              err = new Error(
                "Dish " + req.params.dishId + " already exists in favorites!"
              );
              err.statusCode = 403;
              next(err);
            }
          } else {
            Favorites.create({
              user: req.user._id,
              dishes: [req.params.dishId],
            })
              .then(
                (favorite) => {
                  Favorites.findById(favorite._id)
                    .populate("user")
                    .populate("dishes")
                    .then((favorite) => {
                      res.statusCode = 200;
                      res.setHeader("Content-Type", "application/json");
                      res.json(favorite);
                    });
                },
                (err) => next(err)
              )
              .catch((err) => next(err));
          }
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })
  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end("PUT operation not supported on /favorites");
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({ user: req.user._id })
      .then((favorite) => {
        if (favorite != null && favorite.dishes.length > 0) {
          const dishIndex = favorite.dishes.indexOf(req.params.dishId);
          if (dishIndex > -1) {
            favorite.dishes.splice(dishIndex, 1);
            favorite.save().then(
              (favorite) => {
                Favorites.findById(favorite._id)
                  .populate("user")
                  .populate("dishes")
                  .then((favorite) => {
                    res.statusCode = 200;
                    res.setHeader("Content-Type", "application/json");
                    res.json(favorite);
                  });
              },
              (err) => next(err)
            );
          } else {
            err = new Error(
              "Dish " + req.params.dishId + " is not exists in favorites!"
            );
            err.statusCode = 403;
            next(err);
          }
        } else {
          err = new Error(
            "Dish " + req.params.dishId + " is not exists in favorites!"
          );
          err.statusCode = 403;
          next(err);
        }
      })
      .catch((err) => next(err));
  });

module.exports = favoriteRouter;
