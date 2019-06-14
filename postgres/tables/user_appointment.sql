BEGIN TRANSACTION;

CREATE TABLE user_appointment (
    appointment_id serial references appointments(appointment_id),
    user_id serial references users(user_id),
    PRIMARY KEY (appointment_id, user_id)
);

COMMIT;