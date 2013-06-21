removeChildrens = function(node){  
    if (!node) return;  
    while (node.hasChildNodes()) {  
        removeChildrens(node.firstChild);  
        node.removeChild(node.firstChild);  
    }  
}
clone = function(obj){
	 if(obj == null || typeof(obj) != 'object')
		return obj;
	var temp = new obj.constructor(); 
	for(var key in obj)
		temp[key] = clone(obj[key]);
	return temp;
}
safeText = function(text){
	String(text).replace('<', '&lt;').replace('>', '&gt;');
	return text;
}
String.prototype.safeText = function(){
	var there = this;
	if( there != 'null' && there != 'undefined' ){
		there = there.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&prime;');
	}else{
		there = '';
	}
	return there;
}
parseDate = function(date){
	var dArr = String(date).split('-');
	if( dArr.length == 3 ){
		var d = new Date(dArr[0], parseInt(dArr[1],10)-1, dArr[2]);
		return d;
	}else{
		var dArr = String(date).split('.');
		if( dArr.length == 3 ){
			var d = new Date(dArr[2], parseInt(dArr[1],10)-1, dArr[0]);
			return d;
		}else{
			if( !isNaN(parseInt(date)) ){
				return new Date(parseInt(date));
			}else{
				return new Date(1970, 1, 1);
			}
		}
	}
}
var toStartMonth = function(d){
	d.setDate(1);
	d.setHours(0);
	d.setMinutes(0);
	d.setSeconds(0);
	d.setMilliseconds(0);
	return d;
}
Date.prototype.toFormat = function(format){
	var there = this;
	var regP = /%(\w+)/g
	var paramsList = [];
	var regOut = regP.exec(format);
	while( regOut != null ){
		paramsList.push(regOut[1]);
		regOut = regP.exec(format);
	}
	var output = format;
	for( var i = 0; i < paramsList.length; i++ ){
		switch( paramsList[i] ){
		case 'Y':
			var v = there.getFullYear();
			output = output.replace(/%Y/g, v);
		break;
		case 'd':
			var v = ( there.getDate() < 10 )?( '0'+there.getDate() ):( there.getDate() );
			output = output.replace(/%d/g, v);
		break;
		case 'j':
			var v = there.getDate();
			output = output.replace(/%j/g, v);
		break;
		case 'm':
			var v = ( there.getMonth()+1 < 10 )?( '0'+(there.getMonth()+1) ):( there.getMonth()+1 );
			output = output.replace(/%m/g, v);
		break;
		case 'F':
			var F = ['January','February','March','April','May','June','July','August','September','October','November','December']
			var v = F[there.getMonth()];
			output = output.replace(/%F/g, v);
		break;
		case 'Fm':
			var F = ['january','february','march','april','may','june','july','august','september','october','november','december']
			var v = F[there.getMonth()];
			output = output.replace(/%Fm/g, v);
		break;
		case 'Fr':
			var F = ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь']
			var v = F[there.getMonth()];
			output = output.replace(/%Fr/g, v);
		break;
		case 'Fmr0':
			var F = ['январь','февраль','март','апрель','май','июнь','июль','август','сентябрь','октябрь','ноябрь','декабрь']
			var v = F[there.getMonth()];
			output = output.replace(/%Fmr0/g, v);
		break;
		case 'Fmr':
			var F = ['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря']
			var v = F[there.getMonth()];
			output = output.replace(/%Fmr/g, v);
		break;
		case 'M':
			var F = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
			var v = F[there.getMonth()];
			output = output.replace(/%M/g, v);
		break;
		case 'Mm':
			var F = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec']
			var v = F[there.getMonth()];
			output = output.replace(/%Mm/g, v);
		break;
		case 'Mr':
			var F = ['Янв','Фев','Мар','Апр','Май','Июн','Июл','Авг','Сен','Окт','Ноя','Дек']
			var v = F[there.getMonth()];
			output = output.replace(/%Mr/g, v);
		break;
		case 'Mmr':
			var F = ['янв','фев','мар','апр','май','июн','июл','авг','сен','окт','ноя','дек']
			var v = F[there.getMonth()];
			output = output.replace(/%Mmr/g, v);
		break;
		case 'n':
			var v = there.getMonth();
			output = output.replace(/%n/g, v);
		break;
		case 'nr':
			var N = ['воскресенье','понедельник','вторник','среда','четверг','пятница','суббота'];
			var v = there.getDay();
			output = N[v];
		break;
		case 'Nr':
			var N = ['Воскресенье','Понедельник','Вторник','Среда','Четверг','Пятница','Суббота'];
			var v = there.getDay();
			output = N[v];
		break;
		}
	}
	if( output == format ){
		return this;
	}else{
		return output;
	}
}

costToString = function(cost, fixed){
	var triadSeparator = ' ';
	var decSeparator = ',';
	var minus = '&minus;';
	var num = '0';
	var numd = '';
	var fractNum = 2;
	fixed = ( typeof fixed == 'undefined' ) ? fixed = false : fixed;
	var fixedTest = '00';
	if( fixed != 2 ){
		fixedTest = '';
		for( var i = 0; i < fixed; i++ ) fixedTest += String('0');
	}
	if( !isNaN( parseFloat(cost) ) ){
		num = parseFloat(Math.abs(cost)).toFixed(fixed).toString();
		numd = num.substr(num.indexOf('.')+1, fixed).toString();
		num = parseInt(num).toString();
		var regEx = /(\d+)(\d{3})/;
		while (regEx.test(num)){
			num = num.replace(regEx,"$1"+triadSeparator+"$2");
		}
		if( typeof fixed == 'number' ){
			num += decSeparator+numd;
		}else{
			if( fixed == false ){
				if( numd != fixedTest ){
					var lastZeros = /[0]*$/g
					num += decSeparator+numd.replace(lastZeros,'');
				}
			}
		}
		if( cost < 0 ) num = '−'+num;
	}
	return num;
}

rspaces = /\s+/;
addClass = function(there, value){
	if ( value && typeof value === "string" ) {
		var classNames = (value || "").split( /\s+/ );

		var elem = there;
		
		if ( elem.nodeType === 1 ) {
			if ( !elem.className ) {
				elem.className = value;

			} else {
				var className = " " + elem.className + " ",
					setClass = elem.className;

				for ( var c = 0, cl = classNames.length; c < cl; c++ ) {
					if ( className.indexOf( " " + classNames[c] + " " ) < 0 ) {
						setClass += " " + classNames[c];
					}
				}
				elem.className = String(setClass).trim();
			}
		}
	}
}
removeClass = function(there, value){
	if ( (value && typeof value === "string") || value === undefined ) {
		var classNames = (value || "").split( /\s+/ );

		var elem = there;

		if ( elem.nodeType === 1 && elem.className ) {
			if ( value ) {
				var className = (" " + elem.className + " ").replace(/\s+/, " ");
				for ( var c = 0, cl = classNames.length; c < cl; c++ ) {
					className = className.replace(" " + classNames[c] + " ", " ");
				}
				elem.className = String(className).trim();

			} else {
				elem.className = "";
			}
		}
	}
}
zenEvents = {
	ontap: function(there, callback){
		(function(){
			var pos = {
				x:0,
				y:0
			};
			there.addEventListener(EVENTS.touchstart, function(e){
				if( e.touches ){
					pos.x = e.touches[0].pageX;
					pos.y = e.touches[0].pageY;
				}else{
					pos.x = e.clientX;
					pos.y = e.clientY;
				}
				addClass(there, 'ontap');
			}, false);
			there.addEventListener(EVENTS.touchmove, function(e){
				var distance = 5;
				var nx = 0;
				var ny = 0;
				
				if( e.touches ){
					nx = e.changedTouches[0].pageX;
					ny = e.changedTouches[0].pageY;
				}else{
					nx = e.clientX;
					ny = e.clientY;
				}
				var dX = nx - pos.x;
				var dY = ny - pos.y;
				if( Math.abs(dX) > distance && Math.abs(dY) > distance ){
					removeClass(there, 'ontap');
				}
			});
			there.addEventListener(EVENTS.touchend, function(e){
				var distance = 5;
				var nx = 0;
				var ny = 0;
				
				if( e.touches ){
					nx = e.changedTouches[0].pageX;
					ny = e.changedTouches[0].pageY;
				}else{
					nx = e.clientX;
					ny = e.clientY;
				}
				var dX = nx - pos.x;
				var dY = ny - pos.y;
				if( Math.abs(dX) < distance && Math.abs(dY) < distance ){
					callback(there, e);
					removeClass(there, 'ontap');
					e.preventDefault();
				}else{
					removeClass(there, 'ontap');
					e.preventDefault();
				}
			}, false);
		})(there, callback);
	},
	onslide: function(there, callback){
		(function(there, callback){
			var pos = {
				x:0,
				y:0
			};
			there.addEventListener(EVENTS.touchstart, function(e){
				if( e.touches ){
					pos.x = e.touches[0].pageX;
					pos.y = e.touches[0].pageY;
				}else{
					pos.x = e.clientX;
					pos.y = e.clientY;
				}
			}, false);
			there.addEventListener(EVENTS.touchend, function(e){
				var distance = 20;
				var nx = 0;
				var ny = 0;
				if( e.touches ){
					nx = e.changedTouches[0].pageX;
					ny = e.changedTouches[0].pageY;
				}else{
					nx = e.clientX;
					ny = e.clientY;
				}
				var dX = nx - pos.x;
				var dY = ny - pos.y;
				if( Math.abs(dX) > distance || Math.abs(dY) > distance ){
					if( Math.abs(dX) > distance && Math.abs(dY) < distance ){
						if( dX > 0 ){
							callback(there, 'right');
						}else{
							callback(there, 'left');
						}
					}
					if( Math.abs(dX) < distance && Math.abs(dY) > distance ){
						if( dY > 0 ){
							callback(there, 'down');
						}else{
							callback(there, 'top');
						}
					}
				}
			}, false);
		})(there, callback);
	}
}