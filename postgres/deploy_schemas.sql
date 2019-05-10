-- Deploy database tables

\i '/docker-entrypoint-initdb.d/tables/users.sql'
\i '/docker-entrypoint-initdb.d/tables/login.sql'
\i '/docker-entrypoint-initdb.d/tables/schedules.sql'
\i '/docker-entrypoint-initdb.d/tables/notifications.sql'
\i '/docker-entrypoint-initdb.d/tables/user_schedule.sql'
\i '/docker-entrypoint-initdb.d/seed/seed.sql'