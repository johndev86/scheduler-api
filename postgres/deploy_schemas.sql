-- Deploy database tables

\i '/docker-entrypoint-initdb.d/tables/users.sql'
\i '/docker-entrypoint-initdb.d/tables/login.sql'
\i '/docker-entrypoint-initdb.d/tables/appointments.sql'
\i '/docker-entrypoint-initdb.d/tables/notifications.sql'
\i '/docker-entrypoint-initdb.d/tables/user_appointment.sql'
\i '/docker-entrypoint-initdb.d/seed/seed.sql'