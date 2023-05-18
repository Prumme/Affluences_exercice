const express = require('express')
const axios = require('axios');
const moment = require('moment');
const app = express()
const port = 3000

app.get('/check', (req : any, res : any) => {

    let datetime : any = moment(req.query.date, "YYYY-MM-DD hh:mm:ss");
    
    let id : any = req.query.id;

    let available : boolean = true;

    if (id != 1337) {
        res.status(404).json({ "error": "resource not found" });
        return;
    }

    if(!datetime.isValid()) {
        res.status(404).json({ "error": "wrong format for param startDatetime, expected: \"DD MM YYYY hh:mm:ss\"" });
        return;
    }

    axios.get('http://localhost:8080/reservations?date=2023-05-18&resourceId=1337'
    ).then((response : any) => {
        let reservations : any = response.data.reservations;

        for (let i = 0; i < reservations.length; i++) {
            let reservation : any = reservations[i];
            if (datetime.isAfter(reservation.reservationStart, 'minutes') && datetime.isBefore(reservation.reservationEnd, 'minutes')) {
                available = false;
                break;
            }
        }

        axios.get('http://localhost:8080/timetables?date=2023-05-18&resourceId=1337'
        ).then((response : any) => {
            let timetables : any = response.data.timetables;
            let open : boolean = response.data.open;

            if (!open) {
                available = false;
            }

            if(datetime.isBefore(timetables[0].opening, 'minutes') || datetime.isAfter(timetables[1].closing, 'minutes') || (datetime.isBefore(timetables[1].opening, 'minutes') && datetime.isAfter(timetables[0].closing, 'minutes'))) {
                available = false;
            }

            res.status(200).json({ "available": available });
            
        }).catch((error : any) => {
            console.log(error);
            res.status(500).json({ "Error": "Internal Serveur Error" });
        })

    }).catch((error : any) => {
        console.log(error);
        res.status(500).json({ "Error": "Internal Serveur Error" });
    })  
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})