BEGIN TRANSACTION;

CREATE TABLE user_schedule (
    schedule_id serial references schedules(schedule_id),
    user_id serial references users(user_id)
);

COMMIT;