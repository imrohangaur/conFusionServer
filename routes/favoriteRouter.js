const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const Favorites = require('../models/favorite');
const authenticate = require('../authenticate'); // i added this and it looks good

const favsRouter = express.Router();
favsRouter.use(bodyParser.json());

favsRouter.route('/')
.get(authenticate.verifyOrdinaryUser, (req, res, next) => {
    console.log('User Id', req.user._id);
    Favorites.find({"user": req.user._id})  
        .populate('user')
        .populate('dishes')
        .exec((err, favs) => {
        if (err) throw err;
        res.json(favs);
    });
})
.post(authenticate.verifyOrdinaryUser, (req, res, next) => {
    Favorites.findOne({"user": req.user._id }, (err, favs) => { 
        if(!favs){
                 Favorites.create(req.body, function (err, favs) {
                    if (err) throw err;
                    favs.user = req.user._id; 
                    console.log('your favorite has been created!');
                    favs.dishes.push(req.body.dishId);
                     favs.save(function (err, favs) {
                        if (err) throw err;
                        console.log('Dish added');
                        res.json(favs);
                    }); 
                  }); 

        }else{
              // see whether this dish already exists
              const test = favs.dishes.includes(req.body.dishId)
              console.log("the test value is  "+test);
              if(test){
                 var err = new Error('This recipe is already in your favorite list');
                 err.status = 401;
                return next(err);
              }else{
              favs.dishes.push(req.body.dishId);
                favs.save((err, favs) => {
                  if (err) throw err;
                  console.log('Another Dish has been added');
                    res.json(favs);
                 });
              }
              } 
    });  
})

.delete(authenticate.verifyOrdinaryUser, (req, res, next) => {
    Favorites.remove({"user":req.user._id}, (err, resp) => {
        if (err) throw err;
        res.json(resp);
    });
});

favsRouter.route('/:dishId')
    .post(authenticate.verifyOrdinaryUser, (req, res, next) => {
        Favorites.findOne({ user: req.user._id }, (err, favs) => {
            if (err)
                throw err;
            if (favs) {
                const test = favs.dishes.includes(req.params.dishId)
                console.log("the test value is  " + test);
                if (test) {
                    var err = new Error('This recipe is already in your favorite list');
                    err.status = 401;
                    return next(err);
                } else {
                    favs.dishes.push(req.params.dishId);
                    favs.save((err, favs) => {
                        if (err) throw err;
                        console.log('Another Dish has been added');
                        res.json(favs);
                    });
                }
            }
        })
    })
.delete(authenticate.verifyOrdinaryUser, (req, res, next) =>{
    Favorites.findOne({user: req.user._id}, (err, favs) => {
        if (err) 
            throw err;
        if (favs) {
            var index = favs.dishes.includes(req.params.dishId);
            var indexOfDish = favs.dishes.indexOf(req.params.favsId);
            if (index) {
                favs.dishes.splice(indexOfDish, 1);
            }
            favs.save((err, favorite) => {
                if (err) throw err;
                res.json(favorite);
            });
        } else {
            var err = new Error('There\' no Favorites');
            err.status = 401;
            return next(err);
        }
    });
});


module.exports = favsRouter;