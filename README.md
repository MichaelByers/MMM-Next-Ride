# MMM-Next-Ride
Displays the next three buses coming for RTD Denver

##Installing the Module
Navigate into your MagicMirror's modules folder and execute <br>
`git clone https://github.com/MichaelByers/MMM-Next-Ride.git`
## Using the module

To use this module, add it to the modules array in the `config/config.js` file:
````javascript
{
    	route: RTD Route #,
	direction: 'Northbound', // [Northbound, Eastbound, Southbound, Westbound
	interval: refresh time
}
````
