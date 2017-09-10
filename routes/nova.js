var express = require('express');
var router = express.Router();

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

/* GET home page. */

function fetchNovaLogs(req,res){
    var MyDate = new Date();
    var MyDateString;

    MyDateString =MyDate.getFullYear()+'.'+('0' + (MyDate.getMonth()+1)).slice(-2)+'.'+('0' + MyDate.getDate()).slice(-2);
    console.log(MyDateString);

    var index='novaindex-'+MyDateString;
    console.log(index);
    client.search({
        index: index,
        q: '*',
        sort: '@timestamp:desc',
        size: '5',
        pretty: true
    }).then(function (body) {
        var hits = body.hits.hits;
        console.log("Successfull");
        res.send(JSON.stringify(hits));
    }, function (error) {
        console.trace(error.message);
    });

}

exports.fetchNovaLogs=fetchNovaLogs;


function nova(req,res){
        //Set these headers to notify the browser not to maintain any cache for the page being loaded
        res.render("nova-cpu",{username:"abc"});
}


exports.nova=nova;