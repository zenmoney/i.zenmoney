zencalendar = function(options){
	var there = this;
	this.element = document.createElement('div');
	this.element.className = 'zencalendar close';
	var tpl = '	<div class="zc-close">';
	tpl += '		<div class="zc-c-w">';
	tpl += '			<div class="icon-l"></div>';
	tpl += '			<div class="date"><span class="remained">Сегодня</span>, <strong class="current">18 марта</strong></div>';
	tpl += '			<div class="icon-r"></div>';
	tpl += '		</div>';
	tpl += '	</div>';
	tpl += '	<div class="zc-open">';
	tpl += '		<div class="zc-o-h">';
	tpl += '			<div class="zc-o-w">';
	tpl += '				<div class="icon-l"></div>';
	tpl += '				<div class="date"><strong class="month">Январь</strong>, <span class="year">2011</span></div>';
	tpl += '				<div class="icon-r"></div>';
	tpl += '			</div>';
	tpl += '		</div>';
	tpl += '		<div class="zc-o-c">';
	tpl += '			<table>';
	tpl += '				<thead>';
	tpl += '					<tr>';
	tpl += '						<td>Пн</td>';
	tpl += '						<td>Вт</td>';
	tpl += '						<td>Ср</td>';
	tpl += '						<td>Чт</td>';
	tpl += '						<td>Пт</td>';
	tpl += '						<td>Сб</td>';
	tpl += '						<td>Вс</td>';
	tpl += '					</tr>';
	tpl += '				</thead>';
	tpl += '				<tbody>';
	for( var i = 0; i < 6; ++i ){
		tpl += '<tr>';
		for( var j = 0; j < 7; ++j ){
			tpl += '<td></td>';
		}
		tpl += '</tr>';
	}
	tpl += '				</tbody>';
	tpl += '			</table>';
	tpl += '		</div>';
	tpl += '	</div>';
	this.element.innerHTML = tpl;
	options.parent.appendChild(this.element);
	this.data = {};
	this.els = {};
	this.els.close = {};
	this.els.close.parent = this.element.querySelector('.zc-close');
	this.els.close.left = this.els.close.parent.querySelector('.icon-l');
	this.els.close.right = this.els.close.parent.querySelector('.icon-r');
	this.els.close.info = {};
	this.els.close.info.date = this.els.close.parent.querySelector('.date');
	this.els.close.info.remained = this.els.close.parent.querySelector('.remained');
	this.els.close.info.current = this.els.close.parent.querySelector('.current');
	this.els.open = {};
	this.els.open.parent = this.element.querySelector('.zc-open');
	this.els.open.left = this.els.open.parent.querySelector('.icon-l');
	this.els.open.right = this.els.open.parent.querySelector('.icon-r');
	this.els.open.info = {};
	this.els.open.info.date = this.els.open.parent.querySelector('.date');
	this.els.open.info.month = this.els.open.parent.querySelector('.month');
	this.els.open.info.year = this.els.open.parent.querySelector('.year');
	this.els.open.tbody = this.els.open.parent.querySelector('tbody');
	this.els.open.td = [];
	for( var i = 1; i <= 6; ++i ){
		this.els.open.td.push([]);
		for( var j = 1; j <= 7; ++j ){
			this.els.open.td[i-1][j-1] = this.els.open.tbody.querySelector('tr:nth-of-type('+i+')>td:nth-of-type('+j+')');
			zenEvents.ontap( this.els.open.td[i-1][j-1], function(el){
				var date = parseDate( el.relativeDate );
				there.data.dateF = el.relativeDate;
				there.data.date = new Date(date);
				setTimeout(function(){ there.close(); }, 150);
			} );
		}
	}
	/* Инициализация событий */
	zenEvents.ontap( this.els.close.info.date, function(){
		there.open();
	} );
	zenEvents.ontap( this.els.open.info.date, function(){
		there.close();
	} );
	zenEvents.ontap( this.els.open.left, function(){
		there.data.currentMonth.setMonth( there.data.currentMonth.getMonth() - 1 );
		there.setCalendar( there.data.currentMonth );
	} );
	zenEvents.ontap( this.els.open.right, function(){
		there.data.currentMonth.setMonth( there.data.currentMonth.getMonth() + 1 );
		there.setCalendar( there.data.currentMonth );
	} );
	zenEvents.ontap( this.els.close.left, function(){
		there.data.date.setDate( there.data.date.getDate() - 1 );
		there.data.dateF = there.data.date.toFormat('%d.%m.%Y');
		if( there.data.dateF == there.data.todayF ){
			there.els.close.info.remained.innerHTML = 'Сегодня';
		}else{
			there.els.close.info.remained.innerHTML = there.data.date.toFormat('%Nr');
		}
		if( there.data.date.getFullYear() == there.data.today.getFullYear() ){
			there.els.close.info.current.innerHTML = there.data.date.toFormat('%j %Fmr');
		}else{
			there.els.close.info.current.innerHTML = there.data.date.toFormat('%j %Fmr %Y');
		}
	} );
	zenEvents.ontap( this.els.close.right, function(){
		there.data.date.setDate( there.data.date.getDate() + 1 );
		there.data.dateF = there.data.date.toFormat('%d.%m.%Y');
		if( there.data.dateF == there.data.todayF ){
			there.els.close.info.remained.innerHTML = 'Сегодня';
		}else{
			there.els.close.info.remained.innerHTML = there.data.date.toFormat('%Nr');
		}
		if( there.data.date.getFullYear() == there.data.today.getFullYear() ){
			there.els.close.info.current.innerHTML = there.data.date.toFormat('%j %Fmr');
		}else{
			there.els.close.info.current.innerHTML = there.data.date.toFormat('%j %Fmr %Y');
		}
	} );
	
	this.get = function(){
		return there.data.date.toFormat('%d.%m.%Y');
	}
	this.setCalendar = function(date){
		/* Заполняем календарь */
		there.els.open.info.month.innerHTML = date.toFormat('%Fr');
		there.els.open.info.year.innerHTML = date.getFullYear();
		var tDate = new Date(date);
		tDate.setDate(1);
		there.data.currentMonth = new Date(tDate);
		var delta = ( tDate.getDay() )*-1;
		if( delta == 0 ) delta = -7;
		delta = delta + 2;
		tDate.setDate( delta );
		for( var i = 0; i < 6; ++i ){
			for( var j = 0; j < 7; ++j ){
				if( tDate.getDay() == 0 ){
					day = 6;
				}else{
					day = tDate.getDay() - 1;
				}
				if( tDate.getMonth() == date.getMonth() ){
					// current
					there.els.open.td[i][j].innerHTML = tDate.getDate();
					there.els.open.td[i][j].relativeDate = tDate.toFormat('%d.%m.%Y');
					if( ( tDate.getDate() == there.data.date.getDate() ) && ( tDate.getMonth() == there.data.date.getMonth() ) && ( tDate.getFullYear() == there.data.date.getFullYear() ) ){
						there.els.open.td[i][j].className = 'active';
					}else{
						there.els.open.td[i][j].className = '';
					}
				}else{
					// out
					there.els.open.td[i][j].className = 'out';
					there.els.open.td[i][j].innerHTML = tDate.getDate();
					there.els.open.td[i][j].relativeDate = tDate.toFormat('%d.%m.%Y');
				}
				tDate.setDate( tDate.getDate()+1 );
			}
		}
		/* Заполняем календарь */
	}
	this.set = function(date){
		there.data.date = parseDate( date );
		there.data.dateF = date;
		if( there.data.dateF == there.data.todayF ){
			there.els.close.info.remained.innerHTML = 'Сегодня';
		}else{
			there.els.close.info.remained.innerHTML = there.data.date.toFormat('%Nr');
		}
		if( there.data.date.getFullYear() == there.data.today.getFullYear() ){
			there.els.close.info.current.innerHTML = there.data.date.toFormat('%j %Fmr');
		}else{
			there.els.close.info.current.innerHTML = there.data.date.toFormat('%j %Fmr %Y');
		}
		there.setCalendar(there.data.date);
		
		return there.data.date.toFormat('%d.%m.%Y');
	}
	this.close = function(){
		if( there.data.dateF == there.data.todayF ){
			there.els.close.info.remained.innerHTML = 'Сегодня';
		}else{
			there.els.close.info.remained.innerHTML = there.data.date.toFormat('%Nr');
		}
		if( there.data.date.getFullYear() == there.data.today.getFullYear() ){
			there.els.close.info.current.innerHTML = there.data.date.toFormat('%j %Fmr');
		}else{
			there.els.close.info.current.innerHTML = there.data.date.toFormat('%j %Fmr %Y');
		}
	
		there.element.className = 'zencalendar close';
	}
	this.open = function(){
		there.set( there.data.dateF );
		there.element.className = 'zencalendar open';
	}
	/* Инициализация событий */
	if( typeof options.date != 'undefined' ){
		this.data.date = parseDate(options.date);
	}else{
		this.data.date = new Date();
	}
	this.data.dateF = this.data.date.toFormat('%d.%m.%Y');
	this.data.today = new Date();
	this.data.today.setHours(0);
	this.data.today.setMinutes(0);
	this.data.today.setSeconds(0);
	this.data.today.setMilliseconds(0);
	this.data.todayF = this.data.today.toFormat('%d.%m.%Y');
	
	if( there.data.dateF == there.data.todayF ){
		there.els.close.info.remained.innerHTML = 'Сегодня';
	}else{
		there.els.close.info.remained.innerHTML = there.data.date.toFormat('%Nr');
	}
	if( there.data.date.getFullYear() == there.data.today.getFullYear() ){
		there.els.close.info.current.innerHTML = there.data.date.toFormat('%j %Fmr');
	}else{
		there.els.close.info.current.innerHTML = there.data.date.toFormat('%j %Fmr %Y');
	}
	
	return this;
}