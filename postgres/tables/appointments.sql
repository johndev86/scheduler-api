BEGIN TRANSACTION;

CREATE TABLE appointments (
    appointment_id serial PRIMARY key, 
    type varchar(50),
    time_from TIMESTAMP NOT NULL,
    time_to TIMESTAMP NOT NULL,
    title varchar(200) NOT NULL,
    note TEXT,
    pending boolean DEFAULT true,
    recurring boolean,
    recurr_schedule TEXT
);

COMMIT;