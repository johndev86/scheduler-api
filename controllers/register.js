const handleRegister =  (req, res, db, bcrypt) => {
    const {name, email, password} = req.body;
    const saltRounds = 10;

    bcrypt.genSalt(saltRounds, (err, salt) => {

        if (err) {
            console.log(err);
            return res.status(400).json(err);
        }

        bcrypt.hash(password, salt, (err, hash) => {
        // Store hash in your password DB.
            
            if (err) {
                console.log(err);
                return res.status(400).json(err);
            }
            
            db.transaction(trx => {
                return trx
                    .insert({hash: hash, email: email})
                    .into('login')
                    .returning('email')
                    .then(loginEmail => {
                        return trx('users')
                            .returning('*')
                            .insert({email: loginEmail[0], name: name, joined: new Date(), user_type: "client"})
                            .then(user => {
                                res.json(user[0]);
                            })
                    })
            })
        })
    });
}

module.exports = {
    handleRegister: handleRegister
};