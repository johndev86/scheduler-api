BEGIN TRANSACTION;

CREATE TABLE notifications (
    notification_id serial PRIMARY key, 
    user_id serial references users(user_id),
    schedule_id serial references schedules(schedule_id),
    time_ahead interval NOT NULL
);

COMMIT;