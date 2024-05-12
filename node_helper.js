/* Magic Mirror Module: MMM-Next-Ride helper
 * Version: 1.0.0
 *
*/

var NodeHelper = require('node_helper');
var axios = require('axios').default;

module.exports = NodeHelper.create({

    start: function () {
        console.log('MMM-Next-Ride helper, started...');
    },


    getRouteData: function(payload) {

        var _this = this;
        this.url = payload;
        const options = {
            url: this.url,
            method: 'get',
            headers: {
                "api-key": "e7b926a1-cddb-46e7-bb27-6d134e5b5feb",
                "referer": "https://app.rtd-denver.com"
            }
        };

		axios(options)
			.then(function (response) {
				var data = null; // Clear the array

				// Check to see if we are error free and got an OK response
				if (response.status == 200) {
					data = response.data;
				} else {
					// In all other cases it's some other error
					console.log('[MMM-Next-Ride] ** ERROR ** : ' + response.status);
				}
				// We have the response figured out so lets fire off the notifiction
				_this.sendSocketNotification('GOT-NEXT-RIDE', {'url': _this.url, 'data': data});
        	})
			.catch(function (error) {
				console.log('[MMM-Next-Ride] ** ERROR ** : ' +error);
			});
    },

    socketNotificationReceived: function(notification, payload) {
        // Check this is for us and if it is let's get the weather data
        if (notification === 'GET-NEXT-RIDE') {
            this.getRouteData(payload);
        }
    }

});
