var express = require('express');
var router = express.Router();
const stripAnsi = require('strip-ansi');

var elasticsearch = require('elasticsearch');

var client = new elasticsearch.Client({
    host: 'http://130.65.159.143:9200',
    log: 'trace'
});

client.ping({
    // ping usually has a 3000ms timeout
    requestTimeout: 1000
}, function (error) {
    if (error) {
        console.trace('elasticsearch cluster is down!');
    } else {
        console.log('All is well');
    }
});

//creating this array as a global variable because we need to save the previous errors as well
//if we keep it inside the function it will get erased each time
var resultForErrorsTable=[];

/* GET home page. */

function fetchNeutronLogs(req,res){
    // var MyDate = new Date();
    // var isoDate = new Date(MyDate).toISOString();
    // var MyDateString;
    //
    // var dateObj = new Date();
    // var month = dateObj.getUTCMonth() + 1; //months from 1-12
    // var day = dateObj.getUTCDate();
    // var year = dateObj.getUTCFullYear();

    // MyDateString =year+'.'+('0' + month).slice(-2)+'.'+('0' + day).slice(-2);
    // console.log(MyDateString);

    var component=req.body.component;
    var date=req.body.date;
    var level=req.body.level;

    console.log("Devanjal" +level);

    var index=component+'index-'+date;
    console.log(index);
    client.search({
        index: index,
        q:"message:*m"+level+"*",
        sort: '@timestamp:desc',
        size: '10',
        pretty: true
    }).then(function (body) {
        var hits=body.hits.hits;
        var resultForCommontable=[];


        //Creating a json object with timestamp, loglevel and message
        var jsonObject={};
        for (var i=0; i<hits.length;i++){
            var strippedMessage= stripAnsi(hits[i]._source.message[1]);

            var loglevel=strippedMessage.substr(0,strippedMessage.indexOf(' '));
            var message=strippedMessage.substr(strippedMessage.indexOf(' ')+1);
            var timestamp=hits[i]._source.timestamp;

            // if(loglevel==="ERROR" || loglevel==="WARNING"){
            //     jsonObject={"timestamp":timestamp, "loglevel":loglevel, "message":message};
            //     resultForErrorsTable.push(jsonObject);
            //
            //     //Deleting old entries, as we only want to keep this table of length 10
            //     if (resultForErrorsTable.length>10){
            //         resultForErrorsTable.shift();
            //     }
            // }

            jsonObject={"timestamp":timestamp, "loglevel":loglevel, "message":message};
            resultForCommontable.push(jsonObject);
        }

       // Since i was getting unicode and ansi code characters with the message i am striping those
       // so we can show only the ascii characters on the UI
        console.log(stripAnsi(hits));
        console.log("Successful");
        res.send({"commontable":resultForCommontable});
    }, function (error) {
        console.trace(error.message);
    });


}

exports.fetchNeutronLogs=fetchNeutronLogs;


function search(req,res){
    res.render("search",{username:"abc"});
}


exports.search=search;