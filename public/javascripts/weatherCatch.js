const AmericaZipCodeArr=[12201,30301,21401,21201,35201,14201,60601,45201,44101,43085,71953,80002,99701,19019,96801,46201,32099,64101,90001,89101,55199,10001,70112,68046,85001,15122,84101,94203,92101,94101,95101,55101,63101,98101,33601];
let GeometryList=[];
const GeometryAsset=[{"city":"12201, Albany, New York","lon":"-73.8176","lat":"42.6994"},{"city":"30301, Atlanta, Georgia","lon":"-84.3906","lat":"33.7555"},{"city":"21401, Annapolis, Maryland","lon":"-76.4926","lat":"38.9770"},{"city":"21201, Baltimore, Maryland","lon":"-76.6200","lat":"39.2936"},{"city":"35201, Birmingham, Alabama","lon":"-86.8009","lat":"33.5199"},{"city":"14201, Buffalo, New York","lon":"-78.8825","lat":"42.8967"},{"city":"60601, Chicago, Illinois","lon":"-87.6265","lat":"41.8859"},{"city":"45201, Cincinnati, Ohio","lon":"-84.5140","lat":"39.1019"},{"city":"44101, Cleveland, Ohio","lon":"-81.6733","lat":"41.4912"},{"city":"43085, Columbus, Ohio","lon":"-83.0177","lat":"40.0875"},{"city":"71953, Mena, Arkansas","lon":"-94.2433","lat":"34.5837"},{"city":"80002, Arvada, Colorado","lon":"-105.0899","lat":"39.7945"},{"city":"99701, Fairbanks, Alaska","lon":"-147.7199","lat":"64.8372"},{"city":"19019, Philadelphia, Pennsylvania","lon":"-75.1624","lat":"39.9523"},{"city":"96801, Honolulu, Hawaii","lon":"-157.8607","lat":"21.3061"},{"city":"46201, Indianapolis, Indiana","lon":"-86.0935","lat":"39.7746"},{"city":"32099, Jacksonville, Florida","lon":"-81.7706","lat":"30.3411"},{"city":"64101, Kansas City, Missouri","lon":"-94.5999","lat":"39.1043"},{"city":"90001, Los Angeles, California","lon":"-118.2497","lat":"33.9793"},{"city":"89101, Las Vegas, Nevada","lon":"-115.1335","lat":"36.1695"},{"city":"10001, New York","lon":"-73.9924","lat":"40.7491"},{"city":"70112, New Orleans, Louisiana","lon":"-90.0755","lat":"29.9562"},{"city":"68046, Papillion, Nebraska","lon":"-96.0361","lat":"41.1409"},{"city":"85001, Phoenix, Arizona","lon":"-112.0741","lat":"33.4540"},{"city":"15122, West Mifflin, Pennsylvania","lon":"-79.8833","lat":"40.3917"},{"city":"84101, Salt Lake City, Utah","lon":"-111.8970","lat":"40.7649"},{"city":"94203, Sacramento, California","lon":"-121.4909","lat":"38.5793"},{"city":"92101, San Diego, California","lon":"-117.1634","lat":"32.7193"},{"city":"94101, San Francisco, California","lon":"-122.4168","lat":"37.7772"},{"city":"95101, San Jose, California","lon":"-121.8869","lat":"37.3887"},{"city":"55101, Saint Paul, Minnesota","lon":"-93.0904","lat":"44.9515"},{"city":"63101, Saint Louis, Missouri","lon":"-90.1946","lat":"38.6316"},{"city":"98101, Seattle, Washington","lon":"-122.3349","lat":"47.6113"},{"city":"33601, Tampa, Florida","lon":"-82.4595","lat":"27.9473"}];
let CurrentWeatherInfo=[];

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

function singleSearch(){
    let text=$('#zipInput').val();
    getCityInfo(text);
}
function LoadGeometryList(){
    for(let i=0;i<AmericaZipCodeArr.length;i++){
        setTimeout(function(){getCityInfo(AmericaZipCodeArr[i],true)},i*1000);
    }
}
function LoadchWeather(){
    if(CurrentWeatherInfo.length>0){
        CurrentWeatherInfo=[];
    }
    for(let i=0;i<GeometryAsset.length;i++){
        let j=i;
        setTimeout(function(){catchWeather(GeometryAsset[i],j)},i*1000);
    }
}


function getCityInfo(text,flag){
    console.log(text);
    let params = {
        f: 'json',
        countryCode:'USA,PRI,VIR,GUM,ASM',
        category: 'Land Features,Bay,Channel,Cove,Dam,Delta,Gulf,Lagoon,Lake,Ocean,Reef,Reservoir,Sea,Sound,Strait,Waterfall,Wharf,Amusement Park,Historical Monument,Landmark,Tourist Attraction,Zoo,College,Beach,Campground,Golf Course,Harbor,Nature Reserve,Other Parks and Outdoors,Park,Racetrack,Scenic Overlook,Ski Resort,Sports Center,Sports Field,Wildlife Reserve,Airport,Ferry,Marina,Pier,Port,Resort,Postal,Populated Place',
        maxSuggestions: 10,
        text:text
    };
    $.ajax({
         url: 'https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/suggest?'+urlEncode(params),
         type: 'GET',
         dataType: "jsonp",
         success: function (data) {
             if(data.suggestions.length>0){
                 if(flag){
                     find(data.suggestions,true);
                 }else{
                     find(data.suggestions);
                 }
             }
         }
 });
}
function find(obj,flag){
    let params = {
        f: 'json',
        magicKey:obj[0].magicKey,
        text:obj[0].text,
    };
    $.ajax({
        url: 'https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/find?'+urlEncode(params),
        type: 'GET',
        dataType: "jsonp",
        success: function (data) {
            if(data.locations.length>0){
                console.log(data.locations[0].name);
                let name=data.locations[0].name;
                let lon=data.locations[0].feature.geometry.x.toFixed(4);
                let lat=data.locations[0].feature.geometry.y.toFixed(4);
                console.log('lon:',lon,' lat:',lat);
                if(flag){
                    setGeometryList(name,lon,lat);
                }else{
                    getWeather(lon,lat);
                }
            }
        }
    });
}
function getWeather(lon,lat){
    //Node Server request php page
    /*$.ajax({
        url: '/getWeather?lon='+lon+'&lat='+lat,
        type: 'GET',
        success: function (data) {
           console.log(data)
        }
    });*/
    //Browser ajax request php page
   $.ajax({
        url: 'https://forecast.weather.gov/MapClick.php?lon='+lon+'&lat='+lat,
        type: 'GET',
        dataType:"html",
        success: function (result) {
            //console.log(result);

            /*//html to xml
            let start=result.indexOf('<div id="current-conditions" class="panel panel-default">');
            let end=result.indexOf('<div id="current_conditions_station">');
            let temp=result.slice(start,end)+'</div>';
            console.log(temp);
            let xmlObj=loadXMLString(temp);
            console.log(xmlObj);*/

            let start=result.indexOf('<div id="current-conditions" class="panel panel-default">');
            let end=result.indexOf('<div id="current_conditions_station">');
            let temp=result.slice(start,end)+'</div>';
            //console.log(temp);
            var Obj = $("<code></code>").append($(temp));
            var $summary = $("#current_conditions-summary", Obj);
            //summary
            var describe = $("p.myforecast-current", $summary).html();
            var FTempture = $("p.myforecast-current-lrg", $summary).html();
            var CTempture = $("p.myforecast-current-sm", $summary).html();
            console.log(describe,FTempture,CTempture);
            //detail
            var $detail = $("#current_conditions_detail", Obj);
            var detailArr = $("td", $detail);
            let detailInfoArr=[];
            for(let i=0;i<detailArr.length;i++){
                if(i%2!=0){
                    let temKey=$.trim(detailArr[i-1].getElementsByTagName('b')[0].innerHTML);
                    let temValue=$.trim(detailArr[i].innerHTML);
                    //detailInfoArr.push({[temKey]:temValue});
                    detailInfoArr[temKey]=temValue;
                }
            }
            console.log(detailInfoArr);

        }
    });
}

function catchWeather(cityinfo,index){
    //Node Server request php page
    /*$.ajax({
        url: '/getWeather?lon='+lon+'&lat='+lat,
        type: 'GET',
        success: function (data) {
           console.log(data)
        }
    });*/
    //Browser ajax request php page
    let {city,lon,lat}=cityinfo;
    let singleInfo={};
    $.ajax({
        url: 'https://forecast.weather.gov/MapClick.php?lon='+lon+'&lat='+lat,
        type: 'GET',
        dataType:"html",
        success: function (result) {
            let start=result.indexOf('<div id="current-conditions" class="panel panel-default">');
            let end=result.indexOf('<div id="current_conditions_station">');
            let temp=result.slice(start,end)+'</div>';
            //console.log(temp);
            var Obj = $("<code></code>").append($(temp));
            var $summary = $("#current_conditions-summary", Obj);
            //summary
            var describe = $("p.myforecast-current", $summary).html();
            var FTempture = $("p.myforecast-current-lrg", $summary).html();
            var CTempture = $("p.myforecast-current-sm", $summary).html();
            //detail
            var $detail = $("#current_conditions_detail", Obj);
            var detailArr = $("td", $detail);
            let detailInfoArr={};
            for(let i=0;i<detailArr.length;i++){
                if(i%2!=0){
                    let temKey=$.trim(detailArr[i-1].getElementsByTagName('b')[0].innerHTML);
                    let temValue=$.trim(detailArr[i].innerHTML);
                    //detailInfoArr.push({[temKey]:temValue});
                    detailInfoArr[temKey]=temValue;
                }
            }
            singleInfo={
                city:city,
                summary:{ describe,FTempture,CTempture},
                detail:detailInfoArr
            };
            //console.log(singleInfo);
            CurrentWeatherInfo.push(singleInfo);
            if(CurrentWeatherInfo.length===GeometryAsset.length){
                alert('catch end !');
                console.table(CurrentWeatherInfo);
            }
        }
    });
}
function initWeatherInfo(){
    if(CurrentWeatherInfo.length>0){
        for(let i=0;i<CurrentWeatherInfo.length;i++){
            $.ajax({
                url: 'http://localhost:1337/weatherinfos',
                type: 'POST',
                data:CurrentWeatherInfo[i],
                success: function (result) {
                    console.log(result)
                }
            });
        }
    }else{
        alert('先检查抓取的信息长度不为0 ')
    }

}
function updateWeatherInfo(){
    if(CurrentWeatherInfo.length>0){
        let cityMappingId={};
        $.ajax({
            url: 'http://localhost:1337/weatherinfos',
            type: 'GET',
            success: function (result) {
                result.map(function(item){
                    cityMappingId[item.city]=item['id'];
                });
                CurrentWeatherInfo.map(function(item){
                    let id=cityMappingId[item['city']];
                    $.ajax({
                        url: 'http://localhost:1337/weatherinfos/'+id,
                        type: 'PUT',
                        data:item,
                        success: function (result) {
                            //console.log(result)
                        }
                    });
                });
            }
        });
    }else{
        alert('必须先LoadchWeather(抓取信息)');
    }

}
function setGeometryList(name,lon,lat){
    GeometryList.push({
        city:name,
        lon:lon,
        lat:lat
    });
}
function findWeatherInfo(){
    $.ajax({
        url: 'http://localhost:1337/weatherinfos',
        type: 'GET',
        success: function (result) {
            console.table(result)
        }
    });
}