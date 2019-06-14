const moment = require('moment');

const getSchedule = (req, res, db) => {
    const {id, from, to, staff_id} = req.body;
    
    const fromDate = moment(from).toDate();
    const toDate = moment(to).toDate();

    const getAll = !from || !to;

    //If staff id provided, return staff schedule
    const userId = staff_id ? staff_id : id;

    (getAll ?
    db('user_appointment')
    .join('appointments', 'user_appointment.appointment_id', '=', 'appointments.appointment_id')
    .where('user_appointment.user_id', '=', userId)
    :
    db('user_appointment')
    .join('appointments', 'user_appointment.appointment_id', '=', 'appointments.appointment_id')
    .where('user_appointment.user_id', '=', userId)
    .andWhere('appointments.time_from', '>=', fromDate)
    .andWhere('appointments.time_from', '<=', toDate)
    )
    .then(appointments => {
        if (appointments.length > 0) {
            res.json({appointments: appointments});
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

const validateAppointment = (db, user_id, user_ids, time_from, time_to, user_type, pending) => {

    return new Promise((resolve, reject) => {
        //Only staff can confirm appointment
        if (user_type === 'client' && pending === false) {
            return reject(validateResult.INVALID);
        }

        //Check for access violation - set for self and staff
        db('users').whereIn('user_id', user_ids).andWhere('user_type', '<>', 'staff')
        .then(clients => {
            clients.forEach((client) => {
                //if client other than self
                if (client.user_id !== user_id) {
                    return reject(validateResult.INVALID);
                }
            })
        })
        .then(() => {
            //If confirmed/confirming appointment, check for other confirmed appointment overlap
            if (!pending) {
                db('appointments')
                .join('user_appointment', 'user_appointment.appointment_id', '=', 'appointments.appointment_id')
                .whereIn('user_appointment.user_id', user_ids)
                .andWhere('pending', '=', false)
                .andWhere((cond) => {
                    cond.where('time_from', '<=', time_from)
                    .andWhere('time_to', '>=', time_from)
                })
                .orWhere((cond) => {
                    cond.where('time_from', '<=', time_to)
                    .andWhere('time_to', '>=', time_to)
                })
                .returning('appointment_id')
                .then((apptIds) => {
                    if (apptIds.length > 0) {
                        return reject(validateResult.CONFLICT);
                    }
                    return resolve(validateResult.VALID);
                })
                .catch((err) => {
                    return reject(err);
                })
            } else {
                return resolve(validateResult.VALID);
            }
        })
        .catch(err => {
            return reject(err);
        })
    })
    
}

const setAppointment = (req, res, db) => {
    const {type, id, user_ids, appointment_id, appointment_type, time_from, time_to, title, note, pending} = req.body;

        
    validateAppointment(db, id, user_ids, time_from, time_to, type, pending)
    .then(() => {
        console.log('validated appt, creating...');
        db.transaction(trx => {
            return (appointment_id ? 
            trx('appointments')
            .update({type: appointment_type, time_from: time_from, time_to: time_to, title: title, note: note, pending: pending})
            .where('appointment_id', '=', appointment_id)
            : 
            trx
            .insert({type: appointment_type, time_from: time_from, time_to: time_to, title: title, note: note, pending: pending})
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

module.exports = {
    getSchedule: getSchedule,
    setAppointment: setAppointment,
    getStaffList: getStaffList

}

