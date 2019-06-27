# Scheduler App API

API used by the Scheduler app

## Available End Points

All endpointments, with the exception of register and initial signin, are accessed through the use of authorization token in request header. 

All unauthorized requests (no token/invalid token) will see 401 response: 'unauthorized'

Request/response data is in JSON format.

- [/register](#/register)
- [/signin](#/signin)
- [/profile](#/profile)
- [/getschedule](#/getschedule)
- [/setappointment](#/setappointment)
- [/deleteappointment](#/deleteappointment)
- [/getstafflist](#/getstafflist)

---

## /register
### POST
Register new users
- Request:
```
{
    "name": string,
    "email": string,
    "password": string
}
```
- Success response (user info):
```
{
    "user_id": int,
    "name": string,
    "email": string,
    "joined": timestamp,
    "user_type": string,
    "description": string,
    "profile_img": string
}
```

- Fail response: Status 400, error string
---

## Signin
### POST
Authenticate users
- Request:
```
{
    "email": string,
    "password": string
}
```
- Success response (initial sign in - no authorization token in header):
```
{
    "success": "true",
    "token": string,
}
```
- Success response (authorization token in header):
```
//returning user id
{
    "id": int
}
```
- Fail response: Status 400, error string

**NOTE: Authorization token is valid for 2 days**

---

## /profile
### GET
Retrieve user information
- Request: no body, authorization token in header

- Success response:
```
{
    "user_id": int,
    "name": string,
    "email": string,
    "joined": timestamp,
    "user_type": string,
    "description": string,
    "profile_img": string
}
```

- Fail response: Status 400, error string


### POST
Update user information
- Request:
```
{
    "user_id": int,
    "name": string,
    "email": string,
    "joined": timestamp,
    "user_type": string,
    "description": string
}
```

- Success response: 'success'

- Fail response: Status 400, error string
---

## /getschedule
### GET
Retrieve user (self or staff) schedule
- Request:
```
//all inputs are optional

//if 'staff_id' is not provided, the current users schedule will be returned

//if both 'from' and 'to' are provided, only schedules between those two timestamps will be returned

//if 'staff_id' is provided, the staff's schedule will be 'masked' before being returned, with each event title set to 'Booked Event'
{
    "from": timestamp,
    "to": timestamp,
    "staff_id": int
}
```

- Success response (response string 'nothing scheduled' if no appointments):
```
{
    "appointments": [
        {
            "appointment_id": int,
            "user_id": int,
            "type": string,
            "time_from": timestamp,
            "time_to": timestamp,
            "title": string,
            "note": string,
            "pending": boolean,
            "recurring": string,
            "recurr_schedule": string,
            "name": string,
            "email": string,
            "joined": timestamp,
            "user_type": string,
            "description": string,
            "profile_img": string
        }
        ...
    ]
}
```

- Fail response: Status 400, string 'failed'

---
## /setappointment
### POST

Create/update appointment

- Request:
```
//user_ids: *only used on create. Specify users to be associated with appointment

//appointment_id: *only used on update
{
    "user_ids": int[],
    "appointment_id": int,
    "type": string,
    "time_from": timestamp,
    "time_to": timestamp,
    "title": string,
    "note": string,
    "pending": boolean
}
```

- Success response: 'success'

- Failure response: Status 400, error string

---
## /deleteappointment
### POST

Delete appointment

- Request:
```
{
    "appointment_id": int
}
```

- Success response: 'success'

- Failure response: Status 400, error string

---
## /getstafflist
### GET

Get list of staff users

- Request: no body, authorization token in header

- Success response (string 'no staff', if no staff available): 
```
{
    "staff": [
        {
            "user_id": int,
            "name": string,
            "email": string,
            "joined": timestamp,
            "user_type": string,
            "description": string,
            "profile_img": string
        }
        ...
    ]
}
```

- Failure response: Status 400, string 'failed'
---
