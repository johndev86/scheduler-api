const moment = require('moment');

const maskAppointments = (appointments) => {
    //remove pending appointments and 
    return appointments.filter(e => e.pending === false)
    .map(e=>{
        const appt = e;
        Object.assign(e, {
            appointment_id: e.appointment_id,
            note: '',
            title: 'Booked Event',
            type: '',
            email: '',
            joined: null,
            user_type: '',
            description: '',
            profile_img: '',
            recurring: e.recurring,
            recurr_schedule: e.recurr_schedule,
            time_from: e.time_from,
            time_to: e.time_to,
            masked: true
        });
        return appt;
    })
};

const getSchedule = (req, res, db) => {
    const {id, from, to, staff_id} = req.body;
    
    const fromDate = moment(from).toDate();
    const toDate = moment(to).toDate();

    const getAll = !from || !to;

    //If staff id provided, return staff schedule
    const userId = staff_id ? staff_id : id;
    const maskData = userId != id;

    let query = db('user_appointment')
        .join('appointments', 'user_appointment.appointment_id', '=', 'appointments.appointment_id')
        .join('users', 'user_appointment.user_id', '=', 'users.user_id')
        .where('user_appointment.user_id', '=', userId);

    if (staff_id) {
        query = query.andWhere('users.user_type', '=', 'staff');
    }

    if (!getAll) {
        query = query.andWhere('appointments.time_from', '>=', fromDate)
            .andWhere('appointments.time_from', '<=', toDate)
    }

    query
    .then(appointments => {
        if (appointments.length > 0) {
            if (maskData) {
                res.json({appointments: maskAppointments(appointments)});
            } else {
                res.json({appointments: appointments});
            }
        } else {
            res.json('nothing scheduled');
        }
    })
    .catch(err => {
        res.status(400).json('failed');
    });
}

const getStaffList = (req, res, db) => {

    db('users').where('user_type', '=', 'staff')
    .then(staff => {
        if (staff.length > 0) {
            res.json({staff: staff});
        } else {
            res.json('no staff');
        }
    })
    .catch(err => {
        res.status(400).json('failed');
    });
}

const validateResult = {
    INVALID: 'access violation',
    VALID: 'valid',
    CONFLICT: 'conflicting schedule',
}

const validateSetAppointment = (db, user_id, user_ids, time_from, time_to, user_type, pending) => {

    return new Promise((resolve, reject) => {

        //Check for access violation - set for self and staff
        db('users').whereIn('user_id', user_ids).andWhere('user_type', '<>', 'staff')
        .then(clients => {
            clients.forEach((client) => {
                //if client other than self
                if (client.user_id !== user_id) {
                    return reject({error: validateResult.INVALID});
                }
            })
        })
        .then(() => {
            //If confirmed/confirming appointment, check for other confirmed appointment overlap
            if (!pending) {
                const query = db('appointments')
                    .join('user_appointment', 'user_appointment.appointment_id', '=', 'appointments.appointment_id')
                    .whereIn('user_appointment.user_id', user_ids)
                    .andWhere('appointments.pending', '=', false)
                    .andWhere((cond) => {
                        cond.where('time_from', '<=', time_from)
                        .andWhere('time_to', '>=', time_from)
                        .orWhere('time_from', '<=', time_to)
                        .andWhere('time_to', '>=', time_to)
                    })
                    .returning('appointments.appointment_id');

                query
                .then((apptIds) => {
                    if (apptIds.length > 0) {
                        return reject({error: validateResult.CONFLICT});
                    }
                    return resolve({result: validateResult.VALID});
                })
                .catch((err) => {
                    return reject({error: err});
                })
            } else {
                return resolve({result: validateResult.VALID});
            }
        })
        .catch(err => {
            return reject({error: err});
        })
    })
    
}

const setAppointment = (req, res, db) => {
    const {type, id, user_ids, appointment_id, appointment_type, time_from, time_to, title, note, pending} = req.body;
    
    const data = {type: appointment_type, time_from: time_from, time_to: time_to, title: title, note: note};
    
    //client user type cannot change appointment status
    if (type !== 'client') {
        data.pending = pending;
    }

    validateSetAppointment(db, id, user_ids, time_from, time_to, type, pending)
    .then(() => {
        db.transaction(trx => {
            return (appointment_id ? 
            trx('appointments')
            .update(data)
            .where('appointment_id', '=', appointment_id)
            : 
            trx
            .insert(data)
            .into('appointments')
            .returning('appointment_id')
            .then(apptId => {
                return Promise.all(user_ids.map((userid) => {
                    return trx.insert({appointment_id: apptId[0], user_id: userid})
                    .into('user_appointment');
                }));
            }))
        })
        .then(() => {
            res.json('success');
        })
        .catch(err => {
            res.status(400).json('db error');
        });
    })
    .catch(err => {
        res.status(400).json(err);
    })

}

const validateDeleteAppointment = (db, user_id, apptId) => {
    return new Promise((resolve, reject) => {
        //only users included in the appointment can delete
        db('appointments')
        .join('user_appointment', 'user_appointment.appointment_id', '=', 'appointments.appointment_id')
        .andWhere('appointments.appointment_id', '=', apptId)
        .andWhere('user_appointment.user_id', '=', user_id)
        .returning('appointments.appointment_id')
        .then(appIds => {
            
            if (appIds.length > 0) {
                return resolve({result: validateResult.VALID});
            } else {
                return reject({error: validateResult.INVALID});
            }
        })
        .catch(err => {
            res.status(400).json(err);
        })
    });
}

const deleteAppointment = (req, res, db) => {
    const {id, appointment_id} = req.body;

    validateDeleteAppointment(db, id, appointment_id)
    .then(() => {
        db.transaction(trx => {
            return trx('user_appointment')
            .where('appointment_id', '=', appointment_id)
            .del()
            .then(() => {
                return trx('appointments')
                .where('appointment_id', '=', appointment_id)
                .del();
            })
        })
        .then(() => {
            res.json('success');
        })
        .catch(err => {
            res.status(400).json('db error');
        });
    })
    .catch(err => {
        res.status(400).json(err);
    })
}

module.exports = {
    getSchedule: getSchedule,
    setAppointment: setAppointment,
    getStaffList: getStaffList,
    deleteAppointment: deleteAppointment
}

