(function(){ 
	var currentInfoTableRowGUID;

	$(document).ready(function() {
		$( "#getDataButton" ).click(getWeatherData);
		$( "#weatherForm" ).bind( 'keypress', function(e) {
			if( e.keyCode == 13 ) {
				getWeatherData();
			}
		})
	});

	function getWeatherData() {
		var myApiKey = '0116a5a769a3454efe2793beee200c0f';
		var cityName = $("#cityName").val();
		var selectedParams = $("#parameterSelectionList").val();
		var apiCallType = $("#weatherDataType").val();
		
		//sanity check
		if( cityName === null || cityName === '' || selectedParams === null || selectedParams === 1 ) {
			// alert that parameters must be filled
			showError('You must provide both parameters - City and desired metrics.');
			return;
		}
		
		// make the ajax call
		$.ajax({
				url: "http://api.openweathermap.org/data/2.5/" + apiCallType + "?q=" + cityName + "&APPID=" + myApiKey,
				type: 'GET',
				dataType: 'json',
				success: function(result) {
					if (result && +result.cod !== 200) {
						showError("City not found.");
						return;
					}

					generateInfoBox(result, selectedParams, apiCallType);
					showSuccess('Successfully gathered information.');
				},
				error: function (xhr, ajaxOptions, thrownError) {
					showError(thrownError);
				}
			});
	};

	function showError(textToShow) {
		$.toast({
			heading: 'Error',
			text: textToShow,
			showHideTransition: 'fade',
			icon: 'error'
		});
	};

	function showSuccess(textToShow) {
		$.toast({
			heading: 'Success',
			text: textToShow,
			showHideTransition: 'slide',
			icon: 'success'
		});
	};

	function generateInfoBox(data, selectedParams, apiCallType) {
		var divGUID = generateUUID();
		var buttonGUID = generateUUID();
		var cityName = '';
		var boxType = '';
		var dataSet = {};
		var boxString = '';
		
		if( apiCallType === 'weather' ) {
			cityName = data.name;
			dataSet = data;
			boxType = 'Current Weather';
		} else if( apiCallType === 'forecast' ) {
			cityName = data.city.name;
			dataSet = data.list[20];
			dataSet.coord = data.city.coord;
			boxType = 'Forecast Weather';
		}
		
		boxString = '<div id="' + divGUID + '" class="panel panel-primary col-md-3"> \
						<button id="' + buttonGUID + '" type="button" class="close">×</button>\
						<div class="panel-heading">\
							<h3 class="panel-title">' + cityName + ' - ' + boxType + '</h3>\
						</div>\
						<div class="panel-body">' + generateWeatherParamSpecificContent(dataSet, selectedParams) + '</div>\
					</div>';
		
		if( shouldGenerateRow() ) {
			currentInfoTableRowGUID = generateUUID();
			$("#infoTable").append(	'<div id="' + currentInfoTableRowGUID  + '" class="row"></div>' );
			$( getIdSelectorFromString( currentInfoTableRowGUID ) ).click(function(){
					var $this = $(this);
					if( !$this.children().length ) {
						currentInfoTableRowGUID = $this.prop("id") === currentInfoTableRowGUID ? undefined : currentInfoTableRowGUID;
						$this.remove();
					}
				});
		}
		
		$( getIdSelectorFromString( currentInfoTableRowGUID ) ).append( boxString );
		
		$( getIdSelectorFromString( buttonGUID ) ).click(function(){
			$( getIdSelectorFromString( divGUID ) ).remove();
		});
	};
	
	function shouldGenerateRow() {
		return ( currentInfoTableRowGUID && $( getIdSelectorFromString( currentInfoTableRowGUID ) ).children().length === 3 ) || !currentInfoTableRowGUID;
	}
	
	function getIdSelectorFromString(idString) {
		return '#' + idString;
	}

	function generateUUID() {
		var d = new Date().getTime();
		var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
			var r = (d + Math.random()*16)%16 | 0;
			d = d / 16 | 0;
			return (c=='x' ? r : (r&0x3|0x8)).toString(16);
		});
		return uuid;
	};

	function generateWeatherParamSpecificContent(data, paramIndex) {
		var returnString = '';
		var rain = '';
		
		switch(paramIndex) {
			case '2':
				returnString += 'Wind Degree: ' + data.wind.deg + '<br/>' +
								'Temperature(K): ' + data.main.temp + '<br/>' +
								'Cloudiness(%): ' + data.clouds.all + '<br/>';
				break;
			case '3':
				returnString += 'Wind Speed: ' + data.wind.speed + '<br/>' +
								'Humidity(%): ' + data.main.humidity + '<br/>' +
								'Atmos. pressure: ' + data.main.pressure + '<br/>';
				break;
			case '4':
				returnString += 'Temperature(K): ' + data.main.temp + '<br/>' +
								'Minimum Temperature(K): ' + data.main.temp_min + '<br/>' +
								'Maximum Temperature(K): ' + data.main.temp_max + '<br/>';
				break;
			case '5':
				returnString += 'Atmos. pressure (sea): ' + data.main.sea_level + '<br/>' +
								'Atmos. pressure (ground): ' + data.main.grnd_level + '<br/>' +
								'Cloudiness (%): ' + data.clouds.all + '<br/>';
				break;
			case '6':
				if(!data.rain || !data.rain['3h']) {
					rain = 'N/A';
				} else {
					rain = data.rain['3h'];
				}
				returnString += 'Latitude: ' + data.coord.lat + '<br/>' +
								'Longitude: ' + data.coord.lon + '<br/>' +
								'Rain volume (past 3h): ' + rain + '<br/>';
				break;
			default:
				returnString = '';
		}
		
		return returnString;
	};
})()