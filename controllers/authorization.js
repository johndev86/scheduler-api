const redisClient = require('./signin').redisClient;
const jwt = require('jsonwebtoken');

const requireAuth = (req, res, next) => {
    const {authorization} = req.headers;

    if (!authorization) {
        return res.status(401).json('unauthorized');
    }

    return redisClient.get(authorization, (err, reply) => {
        if (err || !reply) {
            return res.status(401).json('unauthorized');
        }
        try {
            const data = jwt.verify(authorization,process.env.JWT_SECRET);
            
            if (!data.id || !data.type) {
                return res.status(401).json('unauthorized');
            }
            req.body.id = data.id
            req.body.type = data.type;
            return next();
            
        } catch(err) {
            res.status(401).json('unauthorized');
        }
        
    });
}

module.exports = {
    requireAuth: requireAuth
}