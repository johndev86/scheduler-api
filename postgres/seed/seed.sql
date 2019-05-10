BEGIN TRANSACTION;

INSERT INTO users (email, name, joined, user_type, description, profile_img) 
values ('john@email.com', 'John', '2018-01-01', 'provider', 'blahblah I provide some kinda service', 'https://somelocation.com/img.jpg');

INSERT INTO users (email, name, joined, user_type, description, profile_img) 
values ('client@email.com', 'Client 1', '2018-01-01', 'client', 'blahblah I use this service', 'https://somelocation.com/img2.jpg');

INSERT INTO login (hash, email) values ('$2a$10$OdWBo9oIifMog91/AxbTxu0FrIwczAUVwsWqhNqEWfqHs9ieERIe2', 'john@email.com');
INSERT INTO login (hash, email) values ('$2a$10$OdWBo9oIifMog91/AxbTxu0FrIwczAUVwsWqhNqEWfqHs9ieERIe2', 'client@email.com');

INSERT INTO schedules (type, time_from, time_to, title, note, recurring)
values ('initial', '2019-06-01 10:00:00', '2019-06-01 11:00:00', 'Initial appointment', 'First time stuff here', false);
INSERT INTO schedules (type, time_from, time_to, title, note, recurring, recurr_schedule)
values ('training', '2019-06-03 16:00:00', '2019-06-03 17:00:00', 'Monday Training', 'Training legs', true, '{"every": "wk"}');

INSERT INTO user_schedule (schedule_id, user_id) values (1, 1);
INSERT INTO user_schedule (schedule_id, user_id) values (1, 2);
INSERT INTO user_schedule (schedule_id, user_id) values (2, 1);
INSERT INTO user_schedule (schedule_id, user_id) values (2, 2);

-- create (1 hour prior to initial appointment) notification for john and client
INSERT INTO notifications (user_id, schedule_id, time_ahead) values (1, 1, '1 hours');
INSERT INTO notifications (user_id, schedule_id, time_ahead) values (2, 1, '1 hours');

COMMIT;