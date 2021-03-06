var express = require('express');
var router = express.Router();
const stripAnsi = require('strip-ansi');
var request = require('request');
var nodemailer = require('nodemailer');
var Sync = require('sync');

//Api for openstack nova, blockstorage etc.
var pkgcloud = require('pkgcloud'),
    _ = require('lodash');


var OSWrap = require('openstack-wrapper');
var keystone = new OSWrap.Keystone('http://130.65.159.143:5000/v3');

var password="redacted"

// create our client with your openstack credentials
var novaClient = pkgcloud.compute.createClient({
    provider: 'openstack',
    username: 'admin',
    password: password,
    region: 'RegionOne', //default for DevStack, might be different on other OpenStack distributions
    authUrl: 'http://130.65.159.143:5000'
    });


var blockStorageClient = pkgcloud.blockstorage.createClient({
    provider: 'openstack',
    username: 'admin',
    password: password,
    region: 'RegionOne', //default for DevStack, might be different on other OpenStack distributions
    authUrl: 'http://130.65.159.143:5000'
});


var elasticsearch = require('elasticsearch');
var elasticsearchWatcher = require('elasticsearch-watcher');

var client = new elasticsearch.Client({
    plugins: [ elasticsearchWatcher ],
    host: 'http://130.65.159.143:9200',
    log: 'trace'
});

/*client.watcher.putWatch([{
    "input" : {
        "search" : {
            "request" : {
                "indices" : [ "novaindex-2017.09.24" ],
                "body" : {
                    "size" : 1,
                    "sort" : {
                        "timestamp" : { "order" : "desc"}
                    },
                    "query" : {
                        "term" : { "q" : "*DEBUG*"}
                    }
                }
            }
        }
    }
}, testWatcher])

function testWatcher(req,res){
    client.watcher.getWatch({ id: 42 })
        .then(function (resp) {

        });

}*/


//Pinging elastic search server
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


function infoMessages(serversList,callback){
    var MyDate = new Date();
    var isoDate = new Date(MyDate).toISOString();
    var MyDateString;

    var dateObj = new Date();
    var month = dateObj.getUTCMonth() + 1; //months from 1-12
    var day = dateObj.getUTCDate();
    var year = dateObj.getUTCFullYear();

    MyDateString =year+'.'+('0' + month).slice(-2)+'.'+('0' + day).slice(-2);
    console.log(MyDateString);

    var index='novaindex-'+MyDateString;
    console.log(index);


    process.nextTick(function() {
        client.search({
            index: index,
            q: 'message:*spawned*',
            sort: '@timestamp:desc',
            size: '10',
            pretty: true
        }).then(function (body) {
            var hits = body.hits.hits;
            var infoMessageForHomePage=[];

            //Creating a json object with timestamp, loglevel and message
            var jsonObject = {};
            for (var i = 0; i < hits.length; i++) {

                if (serversList === undefined) {
                    break;
                }

                var strippedMessage = stripAnsi(hits[i]._source.message[1]);

                var loglevel = strippedMessage.substr(0, strippedMessage.indexOf(' '));
                var message = strippedMessage.substr(strippedMessage.indexOf(' ') + 1);

                //If the instance is not already mapped into the array then only we go ahead else we go to next iteration
                /*if(!infoMessageForHomePage.messsage.indexOf(message)===-1){
                    continue;
                }*/

                var timestamp = hits[i]._source.timestamp;
                var instanceIp;

                //1) If a new instance is created
                if (loglevel === "INFO") {

                    var instanceName = message.split("instance: ", 3)[1].split("]")[0];

                    //Fetching the details of the servers(instances) to match the instance ID and setting the IP address
                    for (var i = 0; i < serversList.length; i++) {
                        if (serversList[i].id === instanceName) {
                            instanceIp = serversList[i].addresses.private[1].addr;
                            jsonObject = {
                                "timestamp": timestamp,
                                "loglevel": loglevel,
                                "message": message,
                                "instanceIp": instanceIp
                            };
                            infoMessageForHomePage.push(jsonObject);
                            instanceIp = "";
                            break;
                        }
                    }

                }

            }

            //Since i was getting unicode and ansi code characters with the message i am striping those
            //so we can show only the ascii characters on the UI
            //console.log(stripAnsi(hits));
            console.log("Successful");
            callback(null,infoMessageForHomePage);

        }, function (error) {
            console.trace(error.message);
        });

    });

}

/* GET home page. */
//Making it a global variable but once the date changes, index changes and for the current index
//There may not be any entry for new instaces, So this will save the old entries as well
//from the time when server was started


var jsonAllQuota={"volumeQuota":0,"instanceQuota":0,"floatingIpQuota":0,"securityGroupQuota":0,"ramQuota":0,"cpuQuota":0};
var volumeAlert=false;
var instanceAlert=false;
var securityGroupAlert=false;
var FloatingIpAlert=false;
var RamAlert=false;
var cpuAlert=false;
function fetchInfoForHomePage(req,res){

    Sync(function() {
        //Fetching the details of the servers(instances) to match the instance ID and setting the IP address
        var serverList=totalInstancesUsed.sync();

        var infoMessageForHomePage=infoMessages.sync(null,serverList);

        var keystonetoken = fetchingKeyStoneToken.sync(null, 2, 3);
        var limits=homePageLimits.sync(null,keystonetoken);

        var volumesList=totalVolumesUsed.sync();

        //Limit check for Volumes

        if(jsonAllQuota["volumeQuota"]!=limits.body.quota_set.volumes) {
            jsonAllQuota["volumeQuota"]=limits.body.quota_set.volumes;

            if (volumesList.length >= limits.body.quota_set.volumes - 1) {
                volumeAlert = true;
                emailAlert("WARNING ALERT!!!! Please release volumes or increase the volume quota");
            } else {
                volumeAlert = false;
            }
        }

        //Limit check for instances, Need to remove the hardcoding

      //  var maxServer=4;
        var maxServerDetail=maxInstanceLimt.sync(null,keystonetoken);

        var maxServer=maxServerDetail.quota_set.instances.limit;

        if(jsonAllQuota["instanceQuota"]!=maxServer) {
            jsonAllQuota["instanceQuota"]=maxServer;

            if (serverList.length >= maxServer - 1) {
                instanceAlert = true;
                emailAlert("WARNING ALERT!!!! Please release instances or increase the instance quota");
            } else {
                instanceAlert = false;
            }
        }

        var FloatingIplength=floatingIps.sync(null,keystonetoken);

        var maxLimits=maxfloatingIps.sync(null,keystonetoken);

        var maxFloationIps= maxLimits.quota.floatingip;

        var maxSecurityGroups= maxLimits.quota.security_group;

        var securityGroupList=totalSecurityGroup.sync();


        // var maxFloationIps=3;
        //
        // var maxSecurityGroups=3;
        var count=0;
        for( i=0; i<securityGroupList.length;i++){
            if(securityGroupList[i].tenantId=='4bd09f787534467eb0dc7f8b2e931a1d') {
                count++;
            }
        }


        if(jsonAllQuota["securityGroupQuota"]!=maxSecurityGroups) {

            jsonAllQuota["securityGroupQuota"]=maxSecurityGroups;
            if (count >= maxSecurityGroups - 1) {
                securityGroupAlert = true;
                emailAlert("WARNING ALERT!!!! Please release Security Groups or increase the quota for Security Groups");
            }else{
                securityGroupAlert = false;
            }
        }



        if(jsonAllQuota["floatingIpQuota"]!=maxFloationIps) {
            jsonAllQuota["floatingIpQuota"]=maxFloationIps;

            if (FloatingIplength >= maxFloationIps - 1) {
                FloatingIpAlert = true;
                emailAlert("WARNING ALERT!!!! Please release Floating IPs or increase the quota for Floating IPs");
            }else{
                FloatingIpAlert = false;
            }
        }


        //RAM usage
        var ramMaxLimit=(maxServerDetail.quota_set.ram.limit)/1024;
        var ramUsed=(maxServerDetail.quota_set.ram.in_use)/1024;

        if(jsonAllQuota["ramQuota"]!=ramMaxLimit) {
            jsonAllQuota["ramQuota"]=ramMaxLimit;

            if (ramUsed >= ramMaxLimit - 5) {
                RamAlert = true;
                emailAlert("WARNING ALERT!!!! Please add more Ram or Release Memory ");
            }else{
                RamAlert = false;
            }
        }

        //CPU Usage
        var cpuMaxLimit=maxServerDetail.quota_set.cores.limit;
        var cpuUsed=maxServerDetail.quota_set.cores.in_use;
        if(jsonAllQuota["cpuQuota"]!=cpuMaxLimit) {
            jsonAllQuota["cpuQuota"]=cpuMaxLimit;

            if (cpuUsed >= cpuMaxLimit - 1) {
                cpuAlert = true;
                emailAlert("WARNING ALERT!!!! Please add more CPUs or Release CPUs ");
            }else{
                cpuAlert = false;
            }
        }

        var volumes=[{"Volume":"Used", "count":volumesList.length},{"Volume":"Unused", "count": limits.body.quota_set.volumes-volumesList.length+1}];
        var floatingPoints=[{"FloatingPoints":"Used", "count": FloatingIplength},{"FloatingPoints":"Unused", "count": maxFloationIps-FloatingIplength}];
        var securityGroup=[{"securityGroup":"Used","count":count },{"securityGroup":"Unused","count":maxSecurityGroups-count }];
        var instance=[{"instanceList":"Used","count":serverList.length},{"instanceList":"Unused","count":maxServer-serverList.length}];
        var ram=[{"ram":"Used (GB)","count":ramUsed},{"ram":"Unused (GB)","count":ramMaxLimit-ramUsed}];
        var cpu=[{"cpu":"Used(core)","count":cpuUsed},{"cpu":"Unused (Core)","count":cpuMaxLimit-cpuUsed}];

        res.send({"infoMessageForHomePage": infoMessageForHomePage,"volumeAlert":volumeAlert, "instanceAlert":instanceAlert,
            "FloatingIpAlert":FloatingIpAlert, "securityGroupAlert":securityGroupAlert,"RamAlert":RamAlert, "cpuAlert":cpuAlert,
            "volumes":volumes, "floatingPoints":floatingPoints, "securityGroup":securityGroup, "instance":instance,"ram":ram, "cpu":cpu });

    });

}

exports.fetchInfoForHomePage=fetchInfoForHomePage;



function totalInstancesUsed(callback){

    process.nextTick(function() {
        novaClient.getServers(function (err, servers) {
            if (err) {
                console.dir(err);
                return;
            } else {
                //serversList = servers;
                callback(null,servers);
            }
        });

    });

}

function totalVolumesUsed(callback){

    process.nextTick(function(){
    blockStorageClient.getVolumes(function (err, volumes) {
        if (err) {
            console.dir(err);
            return;
        }
        callback(null, volumes);
        console.log(volumes);
    });
    });
}




function fetchingKeyStoneToken(a, b, callback){


    var postdata= {
        "auth": {
            "tenantName": "admin",
            "passwordCredentials": {
                "username": "admin",
                "password": password
            }
        }
    };
    var options = {
        url: 'http://130.65.159.143:35357/v2.0/tokens/',
        method: 'POST',
        headers: {'content-type': 'application/json'},
        json: true,
        body: postdata
    };

    process.nextTick(function(){

        request(options, function (err, res, body) {
            if (err) {
                console.error('error posting json: ', err)
                throw err
            }
            /*var headers = res.headers
            var statusCode = res.statusCode
            console.log('headers: ', headers)
            console.log('statusCode: ', statusCode)
            console.log('body: ', body)*/

            callback(null, res.body.access.token.id);
        })

    })
}


function homePageLimits(keystoneToken,callback){
    var options = {
        url: 'http://130.65.159.143:8776/v2/ab40cc4abd5d40319bdd1c4447eb07d2/os-quota-sets/4bd09f787534467eb0dc7f8b2e931a1d?usage=False',
        method: 'GET',
        headers: {'content-type': 'application/json', 'X-Auth-Token':keystoneToken},
        json: true
    };

    process.nextTick(function(){
    request(options, function (err, res, body) {
        if (err) {
            console.error('error posting json: ', err)
            throw err
        }
       /* var headers = res.headers
        var statusCode = res.statusCode
        console.log('headers: ', headers)
        console.log('statusCode: ', statusCode)
        console.log('body: ', body)*/
        callback(null,res);
        })
    })

}

var username;

var securityGroupClient = pkgcloud.network.createClient({
    provider: 'openstack',
    username: 'admin',
    password: 'sjsumaster2017',
    region: 'RegionOne', //default for DevStack, might be different on other OpenStack distributions
    authUrl: 'http://130.65.159.143:5000'
});

function totalSecurityGroup(callback){

    process.nextTick(function(){
        securityGroupClient.getSecurityGroups(function (err, securityGroups) {
            if (err) {
                console.dir(err);
                return;
            }
            callback(null, securityGroups);
            console.log(securityGroups);
        });
    });
}

function floatingIps(keystoneToken, callback){

    console.log("in home page limit")
    var options = {
        url: 'http://130.65.159.143:9696/v2.0/floatingips',
        method: 'GET',
        headers: {'content-type': 'application/json', 'X-Auth-Token':keystoneToken},
        json: true
    };

    process.nextTick(function(){
        request(options, function (err, res, body) {
            if (err) {
                console.error('error posting json: ', err)
                throw err
            }
            var len=res.body.floatingips.length;
            console.log(len)
            callback(null,len);
        })
    })

}

function maxfloatingIps(keystoneToken, callback){

    console.log("in home page limit")
    var options = {
        url: 'http://130.65.159.143:9696/v2.0/quotas/4bd09f787534467eb0dc7f8b2e931a1d',
        method: 'GET',
        headers: {'content-type': 'application/json', 'X-Auth-Token':keystoneToken},
        json: true
    };

    process.nextTick(function(){
        request(options, function (err, res, body) {
            if (err) {
                console.error('error posting json: ', err)
                throw err
            }
            var len=res.body;
           // console.log(len)
            callback(null,len);
        })
    })

}

function maxInstanceLimt(keystoneToken, callback){

    console.log("in home page limit")
    var options = {
        url: 'http://130.65.159.143:8774/v2.1/ab40cc4abd5d40319bdd1c4447eb07d2/os-quota-sets/4bd09f787534467eb0dc7f8b2e931a1d/detail',
        method: 'GET',
        headers: {'content-type': 'application/json', 'X-Auth-Token':keystoneToken},
        json: true
    };

    process.nextTick(function(){
        request(options, function (err, res, body) {
            if (err) {
                console.error('error posting json: ', err)
                throw err
            }
            var len=res.body;
            // console.log(len)
            callback(null,len);
        })
    })

}
function emailAlert(emailMessage){
    var transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: 'alertopenstack@gmail.com',
            pass: '6692331052'
        }
    });

    console.log(emailMessage);
    transporter.sendMail({
        from: 'alertopenstack',
        to: 'devanjal@gmail.com',
        subject: 'Alert',
        text:emailMessage
    });
}

function home(req,res){

    if(req.session.user) {
        res.render("Home.ejs", {username: "abc"});
    }
    else{
        res.redirect("/login");
    }
}

function emailWarning(emailId){
    var transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: 'alertopenstack@gmail.com',
            pass: '6692331052'
        }
    });

  //  console.log(emailId);
    transporter.sendMail({
        from: 'alertopenstack',
        to: 'devanjal@gmail.com',
        subject: 'Alert',
        text:emailId
    });
}


exports.home=home;
