const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const morgan = require('morgan');
const fs = require('fs')
const rfs = require('rotating-file-stream')

// logging
const path = require('path')
const logDirectory = path.join(__dirname, 'log')
 
// ensure log directory exists
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory)
 
// create a rotating write stream
var accessLogStream = rfs('access.log', {
  interval: '1d', // rotate daily
  path: logDirectory
})
 
// setup the logger
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

const auth = require('./controllers/authorization');
const register = require('./controllers/register');
const signin = require('./controllers/signin');
const profile = require('./controllers/profile');
const schedule = require('./controllers/schedule');

const db = require('knex')({
    client: 'pg',
    connection: connection
});

const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use(morgan('combined',  { stream: accessLogStream }));
app.use(compression());

app.get('/', (req, res) => { res.send('api working') });
app.post('/register', (req, res) => {register.handleRegister(req, res, db, bcrypt)});
app.post('/signin', (req, res) => {signin.signinAuthentication(req, res, db, bcrypt)});
app.get('/profile', auth.requireAuth, (req, res) => {profile.getUserProfile(req, res, db)});
app.post('/profile', auth.requireAuth, (req, res) => { profile.updateUserProfile(req, res, db) });
app.post('/getschedule', auth.requireAuth, (req, res) => { schedule.getSchedule(req, res, db) });
app.post('/setappointment', auth.requireAuth, (req, res) => { schedule.setAppointment(req, res, db) });
app.get('/getstafflist', auth.requireAuth, (req, res) => { schedule.getStaffList(req, res, db) });

/* TODO: 

    DB schema:
    users
        -name: varchar(50)
        -user_id: int primary key
        -email: varchar(100)
        -joined: datetime
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

    appointments
        -appointment_id: int primary key
        -type: varchar(50) ()
        -time_from: datetime (YYYY/MM/DD HH/mm)
        -time_to: datetime (YYYY/MM/DD HH/mm)
        -title: varchar(200)
        -note: TEXT
        -pending: boolean
        -recurring: boolean
        -recurr_schedule: TEXT - json format: 
            {
                every: wk | 2wk | 3wk | 4wk
            }
        
    user_appointment
        -appointment_id: int FOREIGN KEY
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

    ** set appointment (for user: id in jwt, type: in jwt, with users: input, note: input)
    set appointment json format:
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
