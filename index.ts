const express = require('express')
const axios = require('axios');
const app = express()
const port = 3000

app.get('/check', (req : any, res : any) => {

    let datetime : any = req.query.date;
    let id : any = req.query.id;

    if (id != 1337) {
        res.status(404).json({ "error": "resource not found" });
        return;
    }

    axios.get('http://localhost:8080/reservations?date=2023-05-17&resourceId=1337'
    ).then((response : any) => {
        let reservations : any = response.data.reservations;

        for (let i = 0; i < reservations.length; i++) {
            let reservation : any = reservations[i];
            if (datetime >= reservation.reservationStart && datetime <= reservation.reservationEnd) {
                res.status(200).json({ "available": false });
                break;
            }

        }
    })

    res.status(200).json({ "available": true });
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})