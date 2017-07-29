var cron     = require('node-cron');
var rp       = require('request-promise');
var five     = require("johnny-five");
var board    = new five.Board();
var anode;
var colorCode;
const URL    = 'http://api.openweathermap.org/data/2.5/weather';
const APPID  = "your app id.";
const CITYID = "your city id.";

board.on("ready", function() {
    anode = new five.Led.RGB({
        pins: {
            red: 6,
            green: 5,
            blue: 3
        },
        isAnode: true
    });
    //初回起動時にLEDを点灯させるプログラムを実行する
    onLed();

    //現在の天気を把握するために３０分ごとにAPIリクエストを送りLEDを点灯させる
    var task = cron.schedule('*/30 * * * *',()=>{
        onLed();
    }, false);
    task.start();
});

function onLed() {
    var weatherJson = function() {
        var options = {
            uri: URL,
            qs : {
                id: CITYID,
                APPID: APPID
            },
            transform: function(body) {
                return JSON.parse(body);
            }
        };
        return rp(options);
    }

    weatherJson().
      then(function (json) {
          //現在の天気をターミナルに出力
          console.log(json.weather[0].main);
          //アイコンのファイル名から数字のみを取り出す
          var iconName = json.weather[0].icon.replace(/[^0-9]/g,'');
          console.log("colorCode:"+getColorCode(iconName));
          //指定した色でLEDを点灯させる
          anode.color(getColorCode(iconName));
      })
      .catch(function (err) {
          console.log(err.length);
      });
}

function getColorCode(iconName) {
    switch (iconName) {
        //晴れの場合は赤
        case "01":
            colorCode = "FF0000";
            break;
        //曇りは紫（このカラーコードは本来ならオレンジだがフルカラーLEDだと紫になる）
        case "02":
            colorCode = "FF7F00";
            break;
        case "03":
            colorCode = "FF7F00";
            break;
        case "04":
            colorCode = "FF7F00";
            break;
        //雨は水色
        case "09":
            colorCode = "00BFFF";
            break;
        case "10":
            colorCode = "00BFFF";
            break;
        case "11":
            colorCode = "00BFFF";
            break;
        //雪は白
        case "13":
            colorCode = "FFFFFF";
            break;
        //霧は緑
        case "50":
            colorCode = "2E2EFE";
            break;
    }

    return colorCode;
}
