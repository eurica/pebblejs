/**
 * First pass at a Pebble app for PagerDuty
 *
 * This is horrible it polls until all hours
 */

var UI = require('ui');
var Vector2 = require('vector2');
var Vibe = require('ui/vibe');

var user_id = "P304FC8";
var subdomain = "webdemo";
var token = "sVVWs84QqzkXqbvVsetM";
// 2000ms = 2 seconds: about as high as you can get without rate limiting kicking in
var polling_interval = 2000; 



var wind = new UI.Window();
var textfield

var ajax = require('ajax')
var count = -1;
var interval;

// Query the PD API
PDupdate = function(e) {
  console.log("updating");
  ajax(
    {
      url: 'http://'+subdomain+'.pagerduty.com/api/v1/incidents/count?status=triggered,acknowledged&assigned_to_user='+user_id,
      type: 'json',
      headers: {
        Authorization: 'Token token='+token,
        contentType: 'application/json; charset=utf-8'
      }
    },
    updateScreen,
    function (error) {
      console.log("Error:");
      console.log(error);
    }
  );
}

// User feedback
updateScreen = function (data) {      
  new_count = data.total || 0
  console.log("Found " + new_count + " incidents from " + count);
  if(new_count != count) {
    str = ""
    if(new_count>count && new_count > 0) { 
      Vibe.vibrate('short'); 
      str = "Oh dear"
    } else if(new_count<count){
      Vibe.vibrate('long'); 
      str = "Yay!"
    }
    count = new_count
    textfield.text(count + " incidents\n" + str)

  }
}

// Polling the API to make the web team cry
PDupdate()
interval = window.setInterval(PDupdate,polling_interval)


// Load a basic screen
wind = new UI.Window(); 
textfield = new UI.Text({
  position: new Vector2(0, 50),
  size: new Vector2(144, 30),
  font: 'gothic-24-bold',
  text: "Contacting PagerDuty",
  textAlign: 'center'
});
wind.add(textfield);
wind.show();




// Some basic interactivity
wind.on('click', 'down', function() {
  textfield.text("Paused, up to resume")
  count = -1
  clearInterval(interval);
});

wind.on('click', 'up', function() {
  textfield.text("Contacting PagerDuty")
  PDupdate()
  clearInterval(interval);
  interval = window.setInterval(PDupdate,polling_interval)  
});