/* Magic Mirror Module: MMM-Next-Ride
 * Version: 1.0.0
 *
 * By Michael Byers https://github.com/MichaelByers/
 * MIT Licensed.
 */

Module.register('MMM-Next-Ride', {

	defaults: {
            route:    35245,
            direction: 'Northbound',
            interval: 300000 // Every 5 mins
        },

    // Define required scripts.
    getScripts: function() {
        return ["moment.js"];
    },

    start:  function() {
        Log.log('Starting module: ' + this.name);
        let self = this;

        // Set up the local values, here we construct the request url to use
        this.loaded = false;
        this.route = null;

        // Trigger the first request
        this.getRouteData(this);
        setInterval(function() {
            self.getRouteData(self);
          }, self.config.interval);
    },

    getStyles: function() {
        return ['MMM-Next-Ride.css', 'font-awesome.css'];
    },


    getRouteData: function(_this) {
	this.url = 'https://nodejs-prod.rtd-denver.com/api/v2/nextride/stops/' + this.config.route;

    // Make the initial request to the helper then set up the timer to perform the updates
	let hour = moment().hour();

	if( (hour >= 5) && (hour <=22) ) {
            _this.sendSocketNotification('GET-NEXT-RIDE', _this.url);
        }
    },


    getDom: function() {
        // Set up the local wrapper
        let wrapper = null;


        // If we have some data to display then build the results
        if (this.loaded) {
            wrapper = document.createElement('table');
	 	    wrapper.className = 'busroute';

            let timeTable = [];
            let max = 0;
            const stopName = this.route.name;
            //fill time table array
            this.route.branches.map((branch) => {
				if(branch.directionName === this.config.direction) {
					branch.upcomingTrips.map((trip) => {
						let times = {
							"sTime": trip.scheduledArrivalTime,
							"pTime": trip.predictedArrivalTime,
                            "status": trip.tripStopStatus
						}
						timeTable.push(times);
					});
				}
            });
            //sort time table
            timeTable.sort(function(a,b){
                return parseFloat(a.sTime) - parseFloat(b.sTime);
            });
            max = timeTable.length;
            //only show next 3
            if(max > 3) {
                max = 3;
            }
            //Name
            let row = wrapper.insertRow();
            let td = row.insertCell();
            td.style.textAlign = "left";
            td.style.fontSize = "25px";
            td.textContent = stopName;

            let tripTable = document.createElement('table');
            //Trips
            row = tripTable.insertRow();
            td = row.insertCell();
            td.style.fontSize = "15px";
            td.textContent = "Next Trip";
            td = row.insertCell();
            td.style.fontSize = "15px";
            td.textContent = "2nd Trip";
            td = row.insertCell();
            td.style.fontSize = "15px";
            td.textContent = "3rd Trip";
            //Status
            let row1 = tripTable.insertRow();
            let row2 = tripTable.insertRow();
            for(let i=0; i<max; i++) {
                let sTime = moment(timeTable[i].sTime).format('hh:mm');
                let pTime = null;
                let dTime = null;
                let dTimeStr = "On Time";
                let td1 = row1.insertCell();
                td1.style.fontSize = "25px";
                td1.style.color = 'green';
                let td2 = row2.insertCell();
                td2.style.fontSize = "25px";

                if(timeTable[i].pTime){
                    pTime = moment(timeTable[i].pTime).format('hh:mm');
                    if(timeTable[i].pTime == timeTable[i].sTime){
                        dTimeStr = 'On Time'
                        td1.style.color = 'green';
                    } else if(timeTable[i].pTime > timeTable[i].sTime){
                        dTime = timeTable[i].pTime - timeTable[i].sTime;
                        dTimeStr = ":"+ moment(dTime).format('mm') + " late";
                        td1.style.color = 'red';
                    } else {
                        dTime = timeTable[i].sTime - timeTable[i].pTime;
                        dTimeStr = ":"+ moment(dTime).format('mm') + " early";
                        td1.style.color = 'green';
                    }
                }    
                if(timeTable[i].status === "CANCELLED") {
                    td1.textContent = timeTable[i].status;
                    td1.style.color = 'red';
                } else {
                    td1.textContent = dTimeStr;
                }
                td2.textContent = sTime;
            }
            wrapper.append(tripTable);    
        } else {
            // Otherwise lets just use a simple div
            wrapper = document.createElement('div');
            wrapper.innerHTML = 'LOADING...';
        }

        return wrapper;
    },


    socketNotificationReceived: function(notification, payload) {
        // check to see if the response was for us and used the same url
        if (notification === 'GOT-NEXT-RIDE' && payload.url === this.url) {
                // we got some data so set the flag, stash the data to display then request the dom update
                this.loaded = true;
                this.route = payload.data;
                this.updateDom(1000);
            }
        }
    });
