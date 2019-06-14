const redis = require('redis');
const jwt = require('jsonwebtoken');

const redisClient = process.env.REDIS_URL ? redis.createClient({url: process.env.REDIS_URL}) 
: redis.createClient({host: 'redis', port: 6379});

const handleSignin = (req, res, db, bcrypt) => {
    const {email, password} = req.body;

    if (!email || !password) {
        return Promise.reject('email and password required for signin');
    }

    return db.select('email', 'hash').from('login').where('email','=',email)
    .then(login=>{
        if (login.length && bcrypt.compareSync(password,login[0].hash)) {
            return db.select('*').from('users').where('email','=',email)
            .then(user => user[0])
            .catch(err => Promise.reject('error signing in'));
        } else {
            return Promise.reject('invalid credentials');
        }
    })
    .catch(() => Promise.reject('invalid credentials'));
}

const getAuthTokenId = (req, res) => {
    const {authorization} = req.headers;
    return redisClient.get(authorization, (err, reply) => {
        if (err || !reply)
            return res.status(400).json('unauthorized');
        else
            return res.json({id: reply});
    })
}

const signToken = (id, type) => {
    const jwtPayload = { id, type };
    return jwt.sign(jwtPayload, process.env.JWT_SECRET, {expiresIn: '2 days'});
}

const setToken = (key, value) => {
    return Promise.resolve(redisClient.set(key, value));
}

const createSession = (user) => {
    const { user_id, user_type } = user;
    const token = signToken(user_id, user_type);
    return setToken(token, user_id)
    .then(() => ({success: 'true', token}))
    .catch(()=>Promise.reject('failed to create session'));
}

const signinAuthentication = (req, res, db, bcrypt) => {
    const {authorization} = req.headers;
    authorization ? getAuthTokenId(req, res) : 
        (handleSignin(req, res, db, bcrypt)
        .then(data => {
            return (data.user_id && data.email) ? createSession(data) : Promise.reject(data);
        })
        .then(session => res.json(session))
        .catch(err => {
            console.log('catching error: ', err);
            res.status(400).json(err)
        }));
}

module.exports = {
    signinAuthentication: signinAuthentication,
    redisClient: redisClient
};