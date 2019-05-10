BEGIN TRANSACTION;

CREATE TABLE users (
    user_id serial PRIMARY key, 
    name varchar(100), 
    email text UNIQUE NOT null,
    joined TIMESTAMP NOT NULL,
    user_type varchar(50) NOT NULL,
    description text,
    profile_img text
);

COMMIT;