var express = require('express');
var router = express.Router();
const https = require('https');

router.get('/:ip', getLocationData);

function getLocationData(req, res) {
    https.get('https://freegeoip.net/json/' + req.params.ip, resp => {
        resp.on('data', function (chunk) {
            var locationData = JSON.parse(chunk.toString());
            res.json(locationData);
        });
    }).on("error", (err) => {
        console.log("Error: " + err.message);
    });
}

module.exports = router;