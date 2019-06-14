BEGIN TRANSACTION;

CREATE TABLE notifications (
    notification_id serial PRIMARY key, 
    user_id serial references users(user_id),
    appointment_id serial references appointments(appointment_id),
    time_ahead interval NOT NULL
);

COMMIT;