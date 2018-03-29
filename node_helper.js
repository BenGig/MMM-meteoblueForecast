'use strict';

/* Magic Mirror
 * Module: MMM-meteoblueForecast
 *
 * By Bengt Giger
 * MIT Licensed.
 */

const NodeHelper = require('node_helper');
var request = require('request');
// var _ = require('underscore');

module.exports = NodeHelper.create({
  start: function() {
    this.config = {};
  },

  /* getParams()
   * Generates an url with api parameters based on the config.
   *
   * return String - URL params.
   */
  getParams: function(config) {
    var params = "?";
    params += "apikey=" + config.apikey;
    params += "&name=" + config.city;
    params += "&lat=" + config.lat;
    params += "&lon=" + config.lon;
    params += "&tz=" + config.tz;
    params += "&windspeed=" + config.windspeed;
    
    return params;
  },

  processJson: function(json, id) {
    var self = this;
    var weatherInfo = JSON.parse(json);
    return weatherInfo;
  },
    
  // Subclass socketNotificationReceived received.
  socketNotificationReceived: function(notification, payload) {
    if (notification === 'GETDATA') {
      this.getPredictions(payload);
    }
  },

  getPredictions: function(payload) {
    var self = this;
    var returned = 0;
    var predictions = new Array();
    self.config = payload;

    request(self.config.apiBase + this.getParams(self.config), function(error, response, body) {
        if (!error && response.statusCode == 200) {
          var data = JSON.parse(body);

          if (data.error_message) {
            console.log("MMM-meteoblueForecast: " + data.error_message);
          }
        } else {
          console.log("Error getting forecast: " + response.statusCode);
        }
      self.sendSocketNotification('DATARECEIVED', data);
    });
  },
});
