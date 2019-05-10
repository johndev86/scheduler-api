const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();
const compression = require('compression');

let connection = {};
if (process.env.DATABASE_URL === 'localhost') {
  connection = process.env.POSTGRES_URI
} else {
  connection = {
    connectionString: process.env.DATABASE_URL,
    ssl: true
  }
}

const register = require('./controllers/register');
const signin = require('./controllers/signin');

const db = require('knex')({
    client: 'pg',
    connection: connection
});

const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use(morgan('combined'));
app.use(compression());

app.get('/', (req, res) => { res.send('api working') });
app.post('/register', (req, res) => {register.handleRegister(req, res, db, bcrypt)});
app.post('/signin', (req, res) => {signin.signinAuthentication(req, res, db, bcrypt)});

/* TODO: 

    ** get user profile (id in jwt, type in jwt):
        *Clients can only get self and all providers
        *Providers can get all providers, all clients
    ** update user profile (id in jwt, type in jwt)

    DB schema:
    users
        -name: varchar(50)
        -user_id: int primary key
        -email: varchar(100)
        -joined: 
        -type: varchar(50) (client, provider, admin, etc)
        -description: TEXT (html format)
        -profile_img: TEXT (link to Amazon S3 bucket)

    notifications
        -notification_id: int primary key
        -user_id: int foreign key
        -schedule_id: int foreign key
        -time_ahead: int (X hrs)

    login
        -email: varchar(100)
        -hash: varchar(100)
        -id: int primary key

    schedule
        -schedule_id: int primary key
        -type: varchar(50) ()
        -time_from: datetime (YYYY/MM/DD HH/mm)
        -time_to: datetime (YYYY/MM/DD HH/mm)
        -title: varchar(200)
        -note: TEXT
        -recurring: boolean
        -recurr_schedule: TEXT - json format: 
            {
                every: wk | 2wk | 3wk | 4wk
            }
        
    user_schedule
        -schedule_id: int FOREIGN KEY
        -user_id: int FOREIGN KEY


    ** get user schedule (for user: id in jwt, type: in jwt, from/to: input)
    get user schedule request format:
    {
        from: YYYY/MM/DD HH/mm
        to: YYYY/MM/DD HH/mm
    }
    get user schedule response format:
    {
        user: id
        type: client | provider
        appointments: {
            appointment: {
                from: YYYY/MM/DD HH/mm
                to: YYYY/MM/DD HH/mm
                title: ...
                note: ...
                providers: name[]
                clients: name[]
                recurring: yes | no
                notification: no | X hrs
                recurr_schedule: {
                    every: wk | 2wk | 3wk | 4wk
                }
            }
            ...
        }
    }

    ** add appointment (for user: id in jwt, type: in jwt, with users: input, note: input)
    add appointment json format:
    {
        from: YYYY/MM/DD HH/mm
        to: YYYY/MM/DD HH/mm
        title: ...
        note: ...
        providers: name[]
        clients: name[]
        recurring: yes | no
        notification: no | X hrs
        recurr_schedule: {
            every: wk | 2wk | 3wk | 4wk
        }
    }

    ** update appointment (for user: id in jwt, type: in jwt, with users: input, note: input)
    {
        appointment_id: number
        from: YYYY/MM/DD HH/mm
        to: YYYY/MM/DD HH/mm
        title: ...
        note: ...
        providers: name[]
        clients: name[]
        recurring: yes | no
        notification: no | X hrs
        recurr_schedule: {
            every: wk | 2wk | 3wk | 4wk
        }
    }

    notify user

*/

app.listen(process.env.PORT || 3000, () => {
    console.log('app is running on port 3000');
});
