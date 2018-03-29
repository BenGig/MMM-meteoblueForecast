/* Module for MeteoBlue */

/* Magic Mirror
 * Module: MMM-meteoblueForecat based on MMM-meteoblueCurrent
 * 
 * Written by Bengt Giger
 * Current weather written by Benjamin Angst "Bangee44" http://www.beny.ch
 * Original by Michael Teeuw http://michaelteeuw.nl
 * MIT Licensed.
 * 
 */
Module.register("MMM-meteoblueForecast",{
  
  // Default module config.
  defaults: {
    city: "",
    lat: "",
    lon: "",
    tz: "Europe/Zurich",
    apikey: "",
    daysAhead: 4, // max. 7
    units: config.units,
    updateInterval: 60 * 60 * 1000, // every 60 minutes
    animationSpeed: 1000,
    timeFormat: config.timeFormat,
    showPeriod: true,
    showPeriodUpper: false,
    showWindDirection: false,
    windspeed: 'kmh',
    debug: false,
    lang: config.language,
    
    initialLoadDelay: 0, // 0 seconds delay
    retryDelay: 30000,
    
    apiBase: "http://my.meteoblue.com/packages/basic-day",
    
    iconTable: {                        
      // meteoblue
      "1": "wi-day-sunny", // Sunny, cloudless sky
      "2": "wi-day-sunny-overcast", // Sunny and few clouds
      "3": "wi-cloud", // Partly cloudy
      "4": "wi-cloudy", // Overcast
      "5": "wi-fog", // Fog
      "6": "wi-rain", // Overcast with rain
      "7": "wi-day-hail", // Mixed with showers
      "8": "wi-thunderstorm", // Showers, thunderstorms likely
      "9": "wi-snow", // Overcast with snow
      "10": "wi-snow",// Mixed with snow showers
      "11": "wi-day-snow", // Mostly cloudy with a mixture of snow and rain
      "12": "wi-showers", // Overcast with light rain
      "13": "wi-snow", // Overcast with light snow
      "14": "wi-day-rain-mix", // Mostly cloudy with rain
      "15": "wi-day-snow", // Mostly cloudy with snow
      "16": "wi-day-rain-mix", // Mostly cloudy with light rain
      "17": "wi-day-snow", // Mostly cloudy with light snow 
    },
  },    
    
    
  // Define required scripts.
  getScripts: function() {
    return ["moment.js"];
  },
  
  // Define required scripts.
  getStyles: function() {
    return ["weather-icons.css","meteoblueForecast.css"];
  },
  
  // Define start sequence.
  start: function() {
    Log.info("Starting module: " + this.name);

    // Set locale.
    moment.locale(config.language);

    this.windSpeed = null;
    this.windDirection = null;
    this.sunriseSunsetTime = null;
    this.sunriseSunsetIcon = null;
    this.temperature = null;
    this.weatherType = null;

    this.loaded = false;
    this.scheduleUpdate(this.config.initialLoadDelay);

    this.updateTimer = null;

  },    
    
  // Override dom generator.
  getDom: function() {
    if ( this.config.debug ) { "DOM rendering started" };
    var wrapper = document.createElement("div");
    
    if (this.config.apikey === "") {
      wrapper.innerHTML = "Please set the correct meteoblue <i>apikey</i> in the config for module: " + this.name + ".";
      wrapper.className = "dimmed light small";
      return wrapper;
    }
    
    if (this.config.city === "") {
      wrapper.innerHTML = "Please set the meteoblue <i>city</i> in the config for module: " + this.name + ".";
      wrapper.className = "dimmed light small";
      return wrapper;
    }
    
    if (!this.loaded) {
      wrapper.innerHTML = "Loading weather ...";
      wrapper.className = "dimmed light small";
      return wrapper;
    }

    var wrapper = document.createElement("div");
    wrapper.className = "small table";

    headline = document.createElement("div");
    headline.className = "tr";
    hl_empty = document.createElement("div");
    hl_empty.className = "td";
    hl_empty.innerHTML = "&nbsp;";
    headline.appendChild(hl_empty);
    hl_empty2 = document.createElement("div");
    hl_empty2.className = "td";
    hl_empty2.innerHTML = '<i class="fa fa-calendar">&nbsp;</i>';
    headline.appendChild(hl_empty2);

    hl_temp = document.createElement("div");
    hl_temp.className = "td";
    hl_temp.innerHTML = '<i class="fa fa-thermometer-half">&nbsp;</i>';
    headline.appendChild(hl_temp);

    hl_wind = document.createElement("div");
    hl_wind.className = "td";
    hl_wind.innerHTML = '<i class="wi wi-strong-wind">&nbsp;</i>';
    headline.appendChild(hl_wind);

    hl_rain = document.createElement("div");
    hl_rain.className = "td";
    hl_rain.innerHTML = '<i class="wi wi-umbrella">&nbsp;</i>';
    headline.appendChild(hl_rain);

    hl_uv = document.createElement("div");
    hl_uv.className = "td";
    hl_uv.innerHTML = '<i class="wi wi-hot">&nbsp;</i>';
    headline.appendChild(hl_uv);
    
    wrapper.appendChild(headline);
    
    for (var i = 0; i < this.config.daysAhead; i++) {
      wrapper.appendChild(this.tableRow(this.days[i]));
    }

    return wrapper;
  },

  tableRow: function(dayInfo) {
    var dayRow = document.createElement("tr");
    dayRow.className = "tr";

    var weatherIcon = document.createElement("div");
    weatherIcon.className = "table-cell wi " + dayInfo.icon;
    dayRow.appendChild(weatherIcon);
    
    var date = document.createElement("div");
    date.className = "td";
    date.innerHTML = dayInfo.date;
    dayRow.appendChild(date);
    
    if (this.config.showWindDirection) {
      var windDirection = document.createElement("div");
      windDirection.className = "td";
      windDirection.innerHTML = dayInfo.windDirection;
      dayRow.appendChild(windDirection);
    }
    
    var temperature = document.createElement("div");
    temperature.className = "td";
    temperature.innerHTML = dayInfo.tempMin+"/"+dayInfo.tempMax + "&deg;";
    dayRow.appendChild(temperature);

    var windSpeed = document.createElement("div");
    windSpeed.className = "td";
    windSpeed.innerHTML = dayInfo.windMin+"/"+dayInfo.windMax;
    dayRow.appendChild(windSpeed);
    
    var rain = document.createElement("div");
    rain.className = "td";
    rain.innerHTML = dayInfo.rainProb+"%";
    dayRow.appendChild(rain);
    
    var uv = document.createElement("div");
    uv.className = "td";
    uv.innerHTML = dayInfo.uvindex;
    dayRow.appendChild(uv);
    
    return dayRow;
  },

  /* processWeather(data)
   * Uses the received data to set the various values.
   *
   * argument data object - Weather information received form meteoblue.com.
   */
  processWeather: function(data) {
    this.days = [];
    for ( var i = 0; i < this.config.daysAhead; i++) {
      dates = data.data_day.time[i].split("-");
      this.days[i] = {
        date_full: data.data_day.time[i],
        date: dates[2]+"."+dates[1]+".",
        tempMax: this.roundValue(data.data_day.temperature_max[i]),
        tempMin: this.roundValue(data.data_day.temperature_min[i]),
        rainProb: data.data_day.precipitation_probability[i],
        windMin: this.roundValue(data.data_day.windspeed_min[i]),
        windMax: this.roundValue(data.data_day.windspeed_max[i]),
        windDirection: data.data_day.winddirection[i],
        humidity: data.data_day.relativehumidity_mean[i],
        uvindex: data.data_day.uvindex[i],
        icon: this.config.iconTable[data.data_day.pictocode[i]],
      }
    }
    this.loaded = true;
    this.updateDom(this.config.animationSpeed);
  },

  /* scheduleUpdate()
   * Schedule next update.
   *
   * argument delay number - Milliseconds before next update. If empty, this.config.updateInterval is used.
   */
  scheduleUpdate: function (delay) {
    if ( this.config.debug ) { "Scheduling update" }
    var nextLoad = this.config.updateInterval;
    if (typeof delay !== 'undefined' && delay >= 0) {
      nextLoad = delay;
    }
    
    var self = this;
    clearTimeout(this.updateTimer);
    // Timer to fetch new data
    this.updateTimer = setTimeout(function () {
      self.sendSocketNotification('GETDATA', self.config);
      // Log.log('meteblueForecast new data fetched...');
    }, nextLoad);
  },

  // Override socket notification handler.
  // Module notifications from node_helper
  socketNotificationReceived: function(notification, payload) {
    if (notification === 'DATARECEIVED') {
      this.processWeather(payload);
      this.lastUpdate = Date.now();
//      this.updateDom();
      this.scheduleUpdate(this.config.updateInterval);
    }
  },

  /* ms2Beaufort(ms)
   * Converts m2 to beaufort (windspeed).
   *
   * argument ms number - Windspeed in m/s.
   *
   * return number - Windspeed in beaufort.
   */
  ms2Beaufort: function(kmh) {
    var speeds = [1, 5, 11, 19, 28, 38, 49, 61, 74, 88, 102, 117, 1000];
    for (var beaufort in speeds) {
      var speed = speeds[beaufort];
      if (speed > kmh) {
	return beaufort;
      }
    }
    return 12;
  },
  
  /* function(temperature)
   * Rounds a temperature to 1 decimal.
   *
   * argument temperature number - Temperature.
   *
   * return number - Rounded Temperature.
   */
  
  deg2Cardinal: function(deg) {
    if (deg>11.25 && deg<33.75){
      return "NNE";
    }else if (deg>33.75 && deg<56.25){
      return "ENE";
    }else if (deg>56.25 && deg<78.75){
      return "E";
    }else if (deg>78.75 && deg<101.25){
      return "ESE";
    }else if (deg>101.25 && deg<123.75){
      return "ESE";
    }else if (deg>123.75 && deg<146.25){
      return "SE";
    }else if (deg>146.25 && deg<168.75){
      return "SSE";
    }else if (deg>168.75 && deg<191.25){
      return "S";
    }else if (deg>191.25 && deg<213.75){
      return "SSW";
    }else if (deg>213.75 && deg<236.25){
      return "SW";
    }else if (deg>236.25 && deg<258.75){
      return "WSW";
    }else if (deg>258.75 && deg<281.25){
      return "W";
    }else if (deg>281.25 && deg<303.75){
      return "WNW";
    }else if (deg>303.75 && deg<326.25){
      return "NW";
    }else if (deg>326.25 && deg<348.75){
      return "NNW";
    }else{
      return "N";
    }
  },
  
    
  roundValue: function(temperature) {
    return parseFloat(temperature).toFixed(1);
  }
});
