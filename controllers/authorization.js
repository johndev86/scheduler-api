const redisClient = require('./signin').redisClient;
const jwt = require('jsonwebtoken');

const requireAuth = (req, res, next) => {
    const {authorization} = req.headers;

    if (!authorization) {
        res.status(401).json('unauthorized');
    }

    return redisClient.get(authorization, (err, reply) => {
        if (err || !reply) {
            res.status(401).json('unauthorized');
        }
        try {
            const data = jwt.verify(authorization,process.env.JWT_SECRET);
            if (!data.id) {
                throw new Error();
            }
            req.body.id = data.id;
        } catch(err) {
            res.status(401).json('unauthorized');
        }

        console.log(reply);
        return next();
    });
}

module.exports = {
    requireAuth: requireAuth
}