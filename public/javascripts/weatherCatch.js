
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
function loadXMLString(txt) {
    try //Internet Explorer
    {
        xmlDoc=new ActiveXObject("Microsoft.XMLDOM");
        xmlDoc.async="false";
        xmlDoc.loadXML(txt);
        //alert('IE');
        return(xmlDoc);
    }
    catch(e)
    {
        try //Firefox, Mozilla, Opera, etc.
        {
            parser=new DOMParser();
            xmlDoc=parser.parseFromString(txt,"text/xml");
            //alert('FMO');
            return(xmlDoc);
        }
        catch(e) {alert(e.message)}
    }
    return(null);
}

function singleSearch(){
    let text=$('#zipInput').val();
    getCityInfo(text);
}
function getCityInfo(text){
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
                 find(data.suggestions);
             }
         }
 });
}
function find(obj){
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
                let lon=data.locations[0].feature.geometry.x.toFixed(4);
                let lat=data.locations[0].feature.geometry.y.toFixed(4);
                console.log('lon:',lon,' lat:',lat);
                getWeather(lon,lat);
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
                let tem;
                if(i%2==0){
                    tem=$.trim(detailArr[i].getElementsByTagName('b')[0].innerHTML);
                }else{
                    tem=$.trim(detailArr[i].innerHTML);
                }
                detailInfoArr.push(tem);
            }
console.log(detailInfoArr);
            detailInfoArr.map(function(item){

            });
        }
    });
}