renders = {};

renders.wizard = {
	render: false,
	data: {},
	forms: {}
}
renders.wizard.fill = function(options){
	var doc = renders.wizard.data.doc;
	var country = doc.querySelector('select[name="country"]');
	var city = doc.querySelector('select[name="city"]');
	var city_item = doc.querySelector('li.city_item');
	var instrument = doc.querySelector('select[name="instrument"]');
	var instruments = zenMoney.instrument.get();
	var opts = '';
	for( var i in options.countries ){
		opts += '<option value="'+i+'">'+options.countries[i].title+'</li>'
	}
	var opts2 = '';
	for( var i in instruments ){
		opts2 += '<option value="'+i+'">'+instruments[i].title_short+' ('+instruments[i].symbol+')</li>'
	}
	instrument.innerHTML = opts2;
	var countryChange = function(){
		var n = country.value;
		instrument.value = options.countries[n].currency;
		var chtml = '';
		if( options.countries[n].citys_sort.length != 0 ){
			for( var i = 0; i < options.countries[n].citys_sort.length; i ++ ){
				chtml += '<option value="'+options.countries[n].citys[options.countries[n].citys_sort[i]].id+'">'+options.countries[n].citys[options.countries[n].citys_sort[i]].title+'</option>'
			}
			city.innerHTML = chtml;
			city_item.style.display = 'block';
		}else{
			city.value = 0;
			city_item.style.display = 'none';
		}
	}
	country.onchange = countryChange;
	country.innerHTML = opts;
	countryChange();
	renders.wizard.data.layer.data.content.appendChild( doc );
}
renders.wizard.forms.foruser = function(){
	return false;
}
renders.wizard.forms.wizard = function(){
	var doc = renders.wizard.data.doc;
	var params = {};
	params.country = doc.querySelector('select[name="country"]').value;
	params.city = doc.querySelector('select[name="city"]').value;
	params.title = doc.querySelector('input[name="title"]').value;
	params.sum = doc.querySelector('input[name="sum"]').value;
	params.instrument = doc.querySelector('select[name="instrument"]').value;
	params.pin = doc.querySelector('input[name="pin"]').value;
	if( params.title == '' ) params.title = 'Наличные';
	params.sum = String( params.sum ).replace(/[^\d.,]/g, '').replace(/,/g, '.');
	if( params.sum == '' ){
		params.sum = 0;
	}else{
		if( isNaN( parseFloat( params.sum ) ) ){
			params.sum = 0;
		}
	}
	params.time = new Date();
	params.time = params.time.getTime();
	zenMoney.user.add({
		country:params.country,
		city:params.city,
		currency:params.instrument,
		created:params.time,
		sum:params.sum,
		title:params.title,
		pin:params.pin
	}, function(){
		wps.add.show();
	});
	return false;
}
renders.wizard.init = function(layer){
	if( !renders.wizard.render ){
		renders.wizard.data.layer = layer;
		renders.wizard.data.doc = document.createElement('div');
		renders.wizard.data.doc.setAttribute('id', 'wizardContent');
		
		var tpl = '<form class="foruser">';
		tpl += '<h2>У меня есть аккаунт zenmoney</h2>';
		tpl += '<ul class="iList">';
		tpl += '<li><label><input type="text" placeholder="Логин"></label></li>';
		tpl += '<li><label><input type="password" placeholder="Пароль"></label></li>';
		tpl += '<li><label><input type="text" placeholder="PIN для доступа к приложению"></label></li>';
		tpl += '</ul>';
		tpl += '<div class="submit"><input type="submit" value="Синхронизировать"></div>';
		tpl += '</form>';
		tpl += '<form class="wizard">';
		tpl += '<h2>Для новых пользователей</h2>';
		tpl += '<ul class="iList">';
		tpl += '<li><label><span class="title">Страна:</span> <select name="country"></select></label></li>';
		tpl += '<li class="city_item"><label><span class="title">Город:</span> <select name="city"></select></label></li>';
		tpl += '</ul>';
		tpl += '<h3>Основной счет</h3>';
		tpl += '<ul class="iList">';
		tpl += '<li><input name="title" type="text" placeholder="Название счета" value="Наличные"></li>';
		tpl += '<li><input name="sum" type="number" placeholder="Начальный остаток"> <select name="instrument"></select></li>';
		tpl += '</ul>';
		tpl += '<h3>Безопасность</h3>';
		tpl += '<ul class="iList">';
		tpl += '<li><input name="pin" type="text" placeholder="PIN для доступа к приложению"></li>';
		tpl += '</ul>';
		tpl += '<div class="submit"><input type="submit" value="Продолжить"></div>';
		tpl += '</form>';
		
		renders.wizard.data.doc.innerHTML = tpl;
		setTimeout(function(){
			renders.wizard.data.layer.data.scroll.refresh();
		}, 100);
		
		var fu = renders.wizard.data.doc.querySelector('form.foruser');
		var wi = renders.wizard.data.doc.querySelector('form.wizard');
		fu.onsubmit = renders.wizard.forms.foruser;
		wi.onsubmit = renders.wizard.forms.wizard;
		
		zenMoney.sql.db.transaction(function(tx){
			var options = {};
			options.countries = {};
			var countries = function(result){
				for( var i = 0; i < result.rows.length; i++ ){
					var id = result.rows.item(i)['id'];
					options.countries[id] = {};
					options.countries[id]['id'] = result.rows.item(i)['id'];
					options.countries[id]['title'] = result.rows.item(i)['title'];
					options.countries[id]['currency'] = result.rows.item(i)['currency'];
					options.countries[id]['domain'] = result.rows.item(i)['domain'];
					options.countries[id]['hidden'] = result.rows.item(i)['hidden'];
					options.countries[id]['deleted'] = result.rows.item(i)['deleted'];
					options.countries[id]['edited'] = result.rows.item(i)['edited'];
					options.countries[id]['citys'] = {};
					options.countries[id]['citys_sort'] = [];
				}
			}
			var citys = function(result){
				for( var i = 0; i < result.rows.length; i++ ){
					var id = result.rows.item(i)['id'];
					var country = result.rows.item(i)['country'];
					options.countries[country]['citys_sort'].push(id);
					options.countries[country]['citys'][id] = {};
					options.countries[country]['citys'][id]['id'] = result.rows.item(i)['id'];
					options.countries[country]['citys'][id]['country'] = result.rows.item(i)['country'];
					options.countries[country]['citys'][id]['title'] = result.rows.item(i)['title'];
					options.countries[country]['citys'][id]['priority'] = result.rows.item(i)['priority'];
					options.countries[country]['citys'][id]['deleted'] = result.rows.item(i)['deleted'];
					options.countries[country]['citys'][id]['edited'] = result.rows.item(i)['edited'];
				}
				renders.wizard.fill(options);
			}
			tx.executeSql('SELECT * FROM countries WHERE hidden=0;', [], function(tx, result){ countries(result); }, null);
			tx.executeSql('SELECT * FROM citys ORDER BY priority DESC;', [], function(tx, result){ citys(result); }, null);
		});
	}else{
		alert('Уже отрисован');
	}
}



renders.add = {
	render: false,
	data: {},
	forms: {}
};
renders.add.init = function(layer){
	there = this;
	there.data.layer = layer;
	if( !renders.add.render ){
		renders.add.data.form = new zenForm({
			type: 'add',
			place: layer.data.content
		});
		renders.add.render = true;
	}else{
		
	}
}


generateLiElement = function(res){
	var cats = zenMoney.category.cache;
	var accs = zenMoney.account.cache;
	var inst = zenMoney.instrument.cache;
	var li = document.createElement('li');
	var tpl = '';
	tpl += '<div class="transaction">';
	tpl += '	<div class="h">';
	
	if( res.type != 0 ){
		tpl += '		<div class="t">'+cats[res.type][res.category].title+'</div>';
		if( res.type == -1 ){
			if( inst[res.instrument] ){
				tpl += '		<div class="s">&minus;'+costToString(res.sum)+' '+inst[res.instrument].symbol+'</div>';
			}else{
				tpl += '		<div class="s">&minus;'+costToString(res.sum)+' ?</div>';
			}
		}else{
			tpl += '		<div class="s">'+costToString(res.sum)+' '+inst[res.instrument].symbol+'</div>';
		}
	}else{
		tpl += '		<div class="t">Перевод '+accs[res.account].title+' &rarr; '+accs[res.account_transfer].title+'</div>';
		if( ( res.sum == res.sum_transfer ) && ( res.instrument == res.instrument_transfer ) ){
			tpl += '		<div class="s">'+costToString(res.sum)+' '+inst[res.instrument].symbol+'</div>';
		}else{
			tpl += '		<div class="s">'+costToString(res.sum)+' '+inst[res.instrument].symbol+' &rarr; '+costToString(res.sum_transfer)+' '+inst[res.instrument_transfer].symbol+'</div>';
		}
	}
	
	tpl += '	</div>';
	tpl += '	<div class="b">';
	if( res.payee != '' ){
		if( res.comment == '' ){
			tpl += '		<span class="p">'+res.payee+'</span>';
			tpl += '		<span class="c"></span>';
		}else{
			tpl += '		<span class="p">'+res.payee+' &mdash; </span>';
			tpl += '		<span class="c">'+res.comment+'</span>';
		}
	}
	tpl += '	</div>';
	tpl += '</div>';
	var drag = false;
	li.ontouchstart = function(){
		drag = false;
	}
	li.ontouchmove = function(){
		drag = true;
	}
	li.ontouchend = function(){
		if( !drag ){
			renders.transactions.edit(res);
		}else{
			drag = false;
		}
	}
	li.innerHTML = tpl;
	return li;
}
renders.transactions = {
	render: false,
	data: {},
	forms: {}
};
renders.transactions.data.list = {};
renders.transactions.data.list.sort = [];
renders.transactions.edit = function(res){
	var there = renders.transactions;
	wps.transactions.show(1);
	if( !renders.transactions.forms.edit ){
		there.forms.edit = new zenForm({
			type:'edit',
			place: wps.transactions.layers[1].data.content
		})
	}
	var edit = there.forms.edit;
	edit.fill( res );
	edit.callback = function(res){
		there = renders.transactions;
		if( res.result ){
			wps.transactions.show(0);
			there.data.list = {};
			there.data.list.sort = [];
			var options = {
				type:'last',
				skip:0,
				limit:30
			};
			renders.transactions.data.doc.innerHTML = '';
			zenMoney.transaction.get.list(options, renders.transactions.list);
		}else{
			alert('Чота не так...');
		}
	}
}
renders.transactions.list = function(res){
	var there = renders.transactions;
	var list = there.data.list;
	var sort = there.data.list.sort;
	var fragment = document.createDocumentFragment();
	var output = '';
	for( var i=0; i<res.length; i++ ){
		if( !res[i].date ) res[i].date = 0;
		if( !( res[i].date in list ) ){
			var date = res[i].date;
			var d = new Date(date);
			sort.push(date);
			list[date] = {};
			list[date].h2 = document.createElement('h2');
			list[date].h2.appendChild(
				document.createTextNode( d.toFormat('%j %Fmr, %Y') )
			);
			list[date].ul = document.createElement('ul');
			list[date].ul.className = 'iList';
			list[date].list = {};
		}
		list[date].list[res[i].id] = res[i];
		list[date].list[res[i].id].li = generateLiElement(res[i]);
		list[date].ul.appendChild(list[date].list[res[i].id].li);
	}
	for( var i = 0; i<sort.length; i++){
		fragment.appendChild(list[sort[i]].h2);
		fragment.appendChild(list[sort[i]].ul);
	}
	
	there.data.doc.appendChild(fragment);
}
renders.transactions.init = function(layer){
	if( !renders.transactions.render ){
		var there = renders.transactions;
		there.data.layer = layer;
		there.data.doc = document.createElement('div');
		there.data.doc.setAttribute('id', 'transactionsContent');
		there.data.layer.data.content.appendChild( there.data.doc );
		var options = {
			type:'last',
			skip:0,
			limit:30
		};
		zenMoney.transaction.get.list(options, renders.transactions.list);
		
		renders.transactions.render = true;
	}else{
		//alert('Уже отрисован (список транзакций)');
	}
}



renders.settings = {
	render: false,
	data: {},
	forms: {}
};
renders.settings.accounts = {
	render: false,
	data: {}
};
renders.settings.accounts.init = function(layer){
	var there = renders.settings.accounts;
	if( !there.render ){
		there.data.layer = layer;
		var accList = zenMoney.account.get();
		var accListSort = zenMoney.account.sort;
		var tpl = '<ul class="iList itemsList">';
		for( var i = 0; i < accListSort.length; i++ ){
			tpl += '<li rel="'+accList[accListSort[i]].id+'">'+accList[accListSort[i]].title+'</li>';
		}
		tpl += '</ul>';
		there.data.layer.data.content.innerHTML = tpl;
		var lis = there.data.layer.data.content.querySelectorAll('li');
		for( var i=0; i<lis.length; i++ ){
			lis[i].ontouchstart = function(){
				var id = this.getAttribute('rel');
				wps.settings.show(4);
				renders.settings.accounts.edit.actiont(id);
			}
		}
	}else{
		
	}
}
renders.settings.accounts.edit = {
	render: false,
	data: {}
};
renders.settings.accounts.edit.actiont = function(query){
	var there = renders.settings.accounts.edit;
	var form = there.data.form;
	var id = form.querySelector('input[name="id"]');
	var title = form.querySelector('input[name="title"]');
	var sum = form.querySelector('input[name="sum"]');
	var instrument = form.querySelector('select[name="instrument"]');
	if( query ){
		var accList = zenMoney.account.get(query);
		var accListSort = zenMoney.account.sort;
		id.value = query;
		title.value = accList.title;
		sum.value = costToString( ( accList.sum == '' )?0:accList.sum );
		instrument.value = accList.instrument;
	}else{
		id.value = '';
		title.value = '';
		sum.value = 0;
		instrument.value = 2;
	}
}
renders.settings.accounts.edit.init = function(layer){
	var there = renders.settings.accounts.edit;
	if( !there.render ){
		there.data.layer = layer;
		var accList = zenMoney.account.get();
		var accListSort = zenMoney.account.sort;
		var tpl = '<form method="post">';
		tpl += '<input type="hidden" name="id" value="">';
		tpl += '<ul class="iList">';
		tpl += '<li><input name="title" type="text" placeholder="Название счета" value=""></li>';
		tpl += '<li><input name="sum" type="number" placeholder="Начальный остаток"> <select name="instrument"></select></li>';
		tpl += '</ul>';
		tpl += '<div class="submit"><input type="submit" value="Сохранить"></div>';
		tpl += '</form>';
		
		there.data.layer.data.content.innerHTML = tpl;
		var instrument = there.data.layer.data.content.querySelector('select[name="instrument"]');
		var instruments = zenMoney.instrument.get();
		var opts2 = '';
		for( var i in instruments ){
			opts2 += '<option value="'+i+'">'+instruments[i].title_short+' ('+instruments[i].symbol+')</li>'
		}
		instrument.innerHTML = opts2;
		
		renders.settings.accounts.edit.data.form = there.data.layer.data.content.querySelector('form');
		form = renders.settings.accounts.edit.data.form;
		form.onsubmit = function(){
			var there = this;
			var id = there.querySelector('input[name="id"]');
			var title = there.querySelector('input[name="title"]');
			var sum = there.querySelector('input[name="sum"]');
			var instrument = there.querySelector('select[name="instrument"]');
			var sum = parseFloat( String( sum.value ).replace(/[^\d.,]/g, '').replace(/,/g, '.') );
			if( isNaN(sum) ) sum = 0;
			if( id.value != '' ){
				if( title.value != '' ){
					zenMoney.account.edit({
						id: id.value,
						title: title.value,
						sum: sum,
						instrument: instrument.value
					}, function(options){
						wps.settings.show(1);
					});
				}
			}else{
				if( title.value != '' ){
					zenMoney.account.add({
						title: title.value,
						sum: sum,
						instrument: instrument.value
					}, function(){
						wps.settings.show(1);
					});
				}
			}
			return false;
		}
	}else{
		
	}
}


renders.settings.categories = {
	render: false,
	data: {}
};
renders.settings.categories.init = function(layer){
	var there = renders.settings.categories;
	if( !there.render ){
		there.data.layer = layer;
		var catList = zenMoney.category.get(-1);
		var catListSort = zenMoney.category.sort[-1];
		var tpl = '<h2>Расходные</h2>';
		tpl += '<ul class="iList itemsList">';
		for( var i = 0; i < catListSort.length; i++ ){
			tpl += '<li>'+catList[catListSort[i]].title+'</li>';
		}
		tpl += '</ul>';
		catList = zenMoney.category.get(1);
		catListSort = zenMoney.category.sort[1];
		tpl += '<h2>Доходные</h2>';
		tpl += '<ul class="iList itemsList">';
		for( var i = 0; i < catListSort.length; i++ ){
			tpl += '<li>'+catList[catListSort[i]].title+'</li>';
		}
		tpl += '</ul>';
		there.data.layer.data.content.innerHTML = tpl;
	}else{
		
	}
}
renders.settings.sinc = {
	render: false,
	data: {}
};
renders.settings.sinc.init = function(layer){
	var there = renders.settings.sinc;
	if( !there.render ){
		
	}else{
		
	}
}
renders.settings.init = function(layer){
	var there = renders.settings;
	if( !there.render ){
		there.data.layer = layer;
		there.data.doc = document.createElement('div');
		there.data.doc.setAttribute('id', 'settingsContent');
		
		var tpl = '<ul class="iList itemsList">';
		tpl += '<li class="acoounts">Счета</li>';
		tpl += '<li class="categories">Категории</li>';
		tpl += '<li class="sinc">Синхронизация</li>';
		tpl += '</ul>';
		
		there.data.doc.innerHTML = tpl;
		var ac = there.data.doc.querySelector('.acoounts');
		var ca = there.data.doc.querySelector('.categories');
		var si = there.data.doc.querySelector('.sinc');
		ac.ontouchstart = function(){
			wps.settings.show(1);
		}
		ca.ontouchstart = function(){
			wps.settings.show(2);
		}
		si.ontouchstart = function(){
			wps.settings.show(3);
		}
		there.data.layer.data.content.appendChild( there.data.doc );
		there.render = true;
	}else{
		//alert('Уже отрисован (список транзакций)');
	}
}