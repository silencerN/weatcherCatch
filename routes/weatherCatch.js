var express = require('express');
var path = require('path');
var https = require('https');
var request = require('request');
var cheerio = require('cheerio');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    let lon=req.query.lon;
    let lat=req.query.lat;
    console.log(lon,lat);
    let targetUrl='https://forecast.weather.gov/MapClick.php?lon='+lon+'&lat='+lat;
    fetchPage(targetUrl);
    res.send('get weather')
});

router.get('/test', function(req, res, next) {
    var callback=function(result){
        console.log(result);
        res.send(result)
    };
    if(req.query.zipCode){
        getCityInfo(req.query.zipCode,callback);
    }else{
        res.send('have no zipcode')
    }
});

router.post('/', function(req, res, next) {
    let htmlBody=req.body.htmlBody;
    parseHTML(htmlBody);
});
function parseHTML(html){
    let $ = cheerio.load(html);
    let summarry = $('#current_conditions-summary').text();

    console.log($.html());
    console.log(summarry);
}
function fetchPage(targetUrl) {
    startRequest(targetUrl);
}
function startRequest(targetUrl) {
    request(
        {
            url: targetUrl,
            method: "GET"
        }, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            console.log(body)
        }
    });


    //采用http模块向服务器发起一次get请求
    /*https.get(x, function (res) {
        let html = '';        //用来存储请求网页的整个html内容
        let titles = [];
        res.setEncoding('utf-8'); //防止中文乱码
        //监听data事件，每次取一块数据
        res.on('data', function (chunk) {
            html += chunk;
        });
        //监听end事件，如果整个网页内容的html都获取完毕，就执行回调函数
        res.on('end', function () {
           // const $ = cheerio.load('<ul id="fruits">...</ul>');
            let $ = cheerio.load(html); //采用cheerio模块解析html

            //let summarry = $('#current_conditions-summary').text();

            console.log($.html());
            //console.log(summarry);


        });

    }).on('error', function (err) {
        console.log(err);
    });*/

}
function urlEncode(param, key, encode) {
    if(param==null) return '';
    var paramStr = '';
    var t = typeof (param);
    if (t == 'string' || t == 'number' || t == 'boolean') {
        paramStr += '&' + key + '=' + ((encode==null||encode) ? encodeURIComponent(param) : param);
    } else {
        for (var i in param) {
            var k = key == null ? i : key + (param instanceof Array ? '[' + i + ']' : '.' + i);
            paramStr += urlEncode(param[i], k, encode);
        }
    }
    return paramStr;
};
function getCityInfo(text,callback){
    let params = {
        f: 'json',
        countryCode:'USA,PRI,VIR,GUM,ASM',
        category: 'Land Features,Bay,Channel,Cove,Dam,Delta,Gulf,Lagoon,Lake,Ocean,Reef,Reservoir,Sea,Sound,Strait,Waterfall,Wharf,Amusement Park,Historical Monument,Landmark,Tourist Attraction,Zoo,College,Beach,Campground,Golf Course,Harbor,Nature Reserve,Other Parks and Outdoors,Park,Racetrack,Scenic Overlook,Ski Resort,Sports Center,Sports Field,Wildlife Reserve,Airport,Ferry,Marina,Pier,Port,Resort,Postal,Populated Place',
        maxSuggestions: 10,
        text:text
    };
    request(
        {
            url: 'https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/suggest?'+urlEncode(params),
            method: "GET"
        }, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                let info=JSON.parse(body);
                if(info.suggestions.length>0){
                    getGeometry(info.suggestions,callback);
                }
            }
        });
}
function getGeometry(text,callback){
    let params = {
        f: 'json',
        magicKey:text[0].magicKey,
        text:text[0].text,
    };
    request(
        {
            url: 'https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/find?'+urlEncode(params),
            method: "GET",
        }, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                let info=JSON.parse(body);
                if(info.locations.length>0){
                    console.log(info.locations[0].name);
                    let lon=info.locations[0].feature.geometry.x.toFixed(4);
                    let lat=info.locations[0].feature.geometry.y.toFixed(4);
                    console.log('lon:',lon,' lat:',lat);
                    getWeather(lon,lat,callback)
                }
            }
        });
}

function getWeather(lon,lat,callback){
    let params = {
        lon:lon,
        lat:lat
    };
    request(
        {
            url: 'https://forecast.weather.gov/MapClick.php?'+urlEncode(params),
            method: "GET",
            headers: {
                "content-type": "text/html",
            }
        }, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                callback(body);
            }else{
                callback(body);
            }
        });
}
module.exports = router;
