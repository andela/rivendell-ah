const router = require("express").Router();
const passport = require("passport");
const User = require("../../models/").User;

router.get("/user", function(req, res, next) {
    User.findById(req.payload.id)
        .then(function(user) {
            if (!user) {
                return res.sendStatus(401);
            }
            return res.json({ user: user.toAuthJSON() });
        })
        .catch(next);
});

router.put("/user", function(req, res, next) {
    User.findById(req.payload.id)
        .then(function(user) {
            if (!user) {
                return res.sendStatus(401);
            }

            // only update fields that were actually passed...
            if (typeof req.body.user.username !== "undefined") {
                user.username = req.body.user.username;
            }
            if (typeof req.body.user.email !== "undefined") {
                user.email = req.body.user.email;
            }
            if (typeof req.body.user.bio !== "undefined") {
                user.bio = req.body.user.bio;
            }
            if (typeof req.body.user.image !== "undefined") {
                user.image = req.body.user.image;
            }
            if (typeof req.body.user.password !== "undefined") {
                user.setPassword(req.body.user.password);
            }

            return user.save().then(function() {
                return res.json({ user: user.toAuthJSON() });
            });
        })
        .catch(next);
});

router.post("/users/login", function(req, res, next) {
    if (!req.body.user.email) {
        return res.status(422).json({ errors: { email: "can't be blank" } });
    }

    if (!req.body.user.password) {
        return res.status(422).json({ errors: { password: "can't be blank" } });
    }
    passport.authenticate("local", { session: false }, function(
        err,
        user,
        info
    ) {
        if (err) {
            return next(err);
        }

        if (user) {
            return res.json({ user: user.toAuthJSON() });
        } else {
            return res.status(422).json(info);
        }
    })(req, res, next);
});

router.post("/users", function(req, res, next) {
 
    const username = req.body.username,
    email = req.body.email,
    hash= req.body.password;

    User.create({ username, email, hash})
    .then(function(user){
        return res.status(201).json({ 
            email: user.email,
            token: 'This feature is yet to be developed',
            username: user.username,
            bio: user.bio || `Hi ${user.username}, please update your profile`,
            image: user.image || `Don't forget to upload your profile image`,
        });
    }).catch(next);
});

module.exports = router;
