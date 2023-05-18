const express = require('express')
const axios = require('axios');
const moment = require('moment');
const app = express()
const port = 3000

app.get('/check', (req : any, res : any) => {

    //Je recupere la date dans les parametres de la requete
    let datetime : any = moment(req.query.date, "YYYY-MM-DD hh:mm:ss");
    
    //Je recupere l'id de la ressource dans les parametres de la requete
    let id : any = req.query.id;

    //J'instancie une variable qui va me permettre de savoir si la ressource est disponible ou non
    let available : boolean = true;

    // Comme la seule ressource disponible est la 1337, je renvoie une erreur si l'id est different
    if (id != 1337) {
        res.status(404).json({ "error": "resource not found" });
        return;
    }

    //Je renvoie une erreur si la date n'est pas au bon format
    if(!datetime.isValid()) {
        res.status(404).json({ "error": "wrong format for param startDatetime, expected: \"DD MM YYYY hh:mm:ss\"" });
        return;
    }

    //Axios me permet de faire des requetes http
    axios.get('http://localhost:8080/reservations?date=2023-06-18&resourceId=1337'
    ).then((response : any) => {

        //Je recupere les reservations de la ressource
        let reservations : any = response.data.reservations;

        if(reservations !== null){

            for (let i = 0; i < reservations.length; i++) {
                let reservation : any = reservations[i];

                //Je verifie si la date est entre le debut et la fin de la reservation
                if (datetime.isAfter(reservation.reservationStart, 'minutes') && datetime.isBefore(reservation.reservationEnd, 'minutes')) {
                    // Si oui alors la ressource n'est pas disponible
                    available = false;
                    break;
                }
            }

            axios.get('http://localhost:8080/timetables?date=2023-05-18&resourceId=1337'
            ).then((response : any) => {
                //Je recupere les horaires de la ressource
                let timetables : any = response.data.timetables;
                let open : boolean = response.data.open;

                if (!open) {
                    available = false;
                }

                if(timetables !== null){

                    if(datetime.isBefore(timetables[0].opening, 'minutes') || datetime.isAfter(timetables[1].closing, 'minutes') || (datetime.isBefore(timetables[1].opening, 'minutes') && datetime.isAfter(timetables[0].closing, 'minutes'))) {
                        available = false;
                    }

                    res.status(200).json({ "available": available });
                } else {
                    // Dans le cas où Je ne ressois pas d'horaire
                    res.status(500).json({ "Error": "Internal Serveur Error" });
                }
            
            }).catch((error : any) => {
                // Dans le cas où J'ai une ereur lors de la recuperation des horaires
                res.status(500).json({ "Error": "Internal Serveur Error" });
            })

        }else{
            // Dans le cas où il n'y a pas de reservation
            res.status(500).json({ "Error": "Internal Serveur Error" });
        }
    }).catch((error : any) => {
        // Dans le cas où J'ai une ereur lors de la recuperation des reservations
        res.status(500).json({ "Error": "Internal Serveur Error" });
    })  

})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})