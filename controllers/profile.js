const getUserProfile = (req, res, db) => {
    const {id} = req.body;

    db.select('*').from('users').where({user_id: id})
    .then(user => {
        if (user.length) {
            res.json(user[0]);
        } else {
            res.status(400).json('not found');
        }
    });
}

const updateUserProfile = (req, res, db) => {
    const {id} = req.body;

    const {name, description, profile_img} = req.body;

    db('users').where({user_id: id}).update({name,description,profile_img})
    .then(resp => {
        if (resp) {
            res.json('success');
        } else {
            res.status(400).json('failed to update');
        }
    })
    .catch(err => {
        console.log(err);
        res.status(400).json('failed to update');
    });


}

module.exports = {
    getUserProfile: getUserProfile,
    updateUserProfile: updateUserProfile
}