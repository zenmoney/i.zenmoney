DOC = {};

Layer_browse = function(){
	var parent = document.getElementById('Layer_browse');
	var reload = parent.querySelector('.reload');
	var elem = {};
	elem.acc_list = parent.querySelector('.accounts');
	var init = function(){
		var accs = zenMoney.account.get();
		var accs_sort = zenMoney.account.sort;
		elem.acc_list.innerHTML = '';
		for( var i = 0; i<accs_sort.length ;i++ ){
			var out = '';
			var acc = document.createElement('li');
			var id = accs_sort[i];
			acc.setAttribute('id', 'account_list_'+id);
			acc.innerHTML = '<span class="name">'+accs[id].title+'</span> <span class="sum"><span class="val"></span><span class="instrument"></span></span>';
			elem.acc_list.appendChild(acc);
			(function(id, acc){
				zenMoney.account.balance(id, function(sum){
					acc.querySelector('.val').innerHTML = costToString(sum);
					acc.querySelector('.instrument').innerHTML = zenMoney.instrument.get()[ accs[id].instrument ].symbol;
				});
			})(id, acc)
		}
	}
	
	init();
	reload.addEventListener(EVENTS.touchend, init, false);
}

Layer_category = function(){
	var parent = document.getElementById('Layer_category');
	var reload = parent.querySelector('.reload');
	var form = parent.querySelector('form.new_category');
	var content = parent.querySelector('.content');
	var list = parent.querySelector('.list');
	var init = function(){
		var cats = zenMoney.category.get();
		var cats_sort = {};
		cats_sort[-1] = zenMoney.category.sort[-1];
		cats_sort[1] = zenMoney.category.sort[1];
		list.innerHTML = '';
		var generateFormElement = function(res){
			var frag = document.createDocumentFragment();
			var form = document.createElement('form');
			form.addEventListener('submit', send_form, false);
			var tpl = '<p><input type="hidden" name="id"><input type="hidden" name="type"><input type="text" name="title" placeholder="Название" size="30"><br><input type="submit" value="Сохр"> <input type="button" value="X" name="delete"></p>';
			form.innerHTML = tpl;
			frag.appendChild(form);
			
			form.querySelector('[name="id"]').value = res.id;
			form.querySelector('[name="type"]').value = res.type;
			form.querySelector('[name="title"]').value = res.title;
			form.querySelector('[name="delete"]').addEventListener(EVENTS.touchend, function(){
				zenMoney.category.del({
					id: res.id
				}, function(res){
					init();
				});
			}, false);
			//frag
			return frag;
		}
		var h2 = document.createElement('h2');
		h2.appendChild(document.createTextNode('Расход'));
		list.appendChild( h2 );
		for( var j = 0; j<cats_sort[-1].length; j++ ){
			var i = cats_sort[-1][j];
			if( i != 0 && i != 1 && i != 2 ){
				list.appendChild(generateFormElement(cats[-1][i]));
			}
		}
		h2 = document.createElement('h2');
		h2.appendChild(document.createTextNode('Доход'));
		list.appendChild( h2 );
		for( var j = 0; j<cats_sort[1].length; j++ ){
			var i = cats_sort[1][j];
			if( i != 0 && i != 1 && i != 2 ){
				list.appendChild(generateFormElement(cats[1][i]));
			}
		}
	}
	var send_form = function(e){
		var form = this;
		
		var input = {};
		input.id = form.querySelector('[name="id"]');
		input.title = form.querySelector('[name="title"]');
		input.type = form.querySelector('[name="type"]');
		var data = {};
		data.title = input.title.value;
		data.type = input.type.value;
		if( data.title == '' ){
			data.title = prompt('Укажите название счета', 'Без названия');
			if( data.title == '' || data.title == null ){
				if( input.id.value != 'new' ){
					input.title.value = zenMoney.category.get( input.id.value )['title'];
				}
				e.preventDefault();
				return false;
			}
		}
		switch( input.id.value ){
		case 'new':
			zenMoney.category.add(data, function(){
				init();
			});
		break;
		default:
			data.id = input.id.value;
			zenMoney.category.edit(data, function(res){
				init();
			});
		}
		e.preventDefault();
		return false;
	}
	
	form.addEventListener('submit', send_form, false);
	init();
}

Layer_accounts = function(){
	var parent = document.getElementById('Layer_accounts');
	var reload = parent.querySelector('.reload');
	var form = parent.querySelector('form.new_account');
	var content = parent.querySelector('.content');
	var list = parent.querySelector('.list');
	var inst = zenMoney.instrument.get();
	var inst_opts = '';
	for( var i in inst ){
		inst_opts += '<option value="'+inst[i].id+'">'+safeText(inst[i].symbol)+'</option>';
	}
	var init = function(){
		var accs = zenMoney.account.get();
		var accs_sort = zenMoney.account.sort;
		list.innerHTML = '';
		var generateFormElement = function(res){
			var frag = document.createDocumentFragment();
			var form = document.createElement('form');
			form.addEventListener('submit', send_form, false);
			var tpl = '<p><input type="hidden" name="id"><input type="text" name="title" placeholder="Название" size="30"><br><input type="text" name="sum" placeholder="Начальный остаток" size="12"><select name="instrument">'+inst_opts+'</select> <input type="submit" value="Сохр"> <input type="button" value="X" name="delete"></p>';
			form.innerHTML = tpl;
			frag.appendChild(form);
			
			form.querySelector('[name="id"]').value = res.id;
			form.querySelector('[name="title"]').value = res.title;
			form.querySelector('[name="instrument"]').value = res.instrument;
			form.querySelector('[name="sum"]').value = res.sum;
			form.querySelector('[name="delete"]').addEventListener(EVENTS.touchend, function(){
				zenMoney.account.del({
					id: res.id
				}, function(res){
					init();
				});
			}, false);
			//frag
			return frag;
		}
		
		for( var i = 0; i<accs_sort.length; i++ ){
			list.appendChild(generateFormElement(accs[accs_sort[i]]));
		}
	}
	var send_form = function(e){
		var form = this;
		
		var input = {};
		input.id = form.querySelector('[name="id"]');
		input.title = form.querySelector('[name="title"]');
		input.sum = form.querySelector('[name="sum"]');
		input.instrument = form.querySelector('[name="instrument"]');
		var data = {};
		data.title = input.title.value;
		data.sum = input.sum.value;
		data.instrument = input.instrument.value;
		if( data.title == '' ){
			data.title = prompt('Укажите название счета', 'Без названия');
			if( data.title == '' || data.title == null ){
				if( input.id.value != 'new' ){
					input.title.value = zenMoney.account.get( input.id.value )['title'];
				}
				e.preventDefault();
				return false;
			}
		}
		switch( input.id.value ){
		case 'new':
			zenMoney.account.add(data, function(){
				init();
			});
		break;
		default:
			data.id = input.id.value;
			zenMoney.account.edit(data, function(){
				init();
			});
		}
		e.preventDefault();
		return false;
	}
	var i_t = form.querySelector('[name="instrument"]');
	i_t.innerHTML = inst_opts;
	form.addEventListener('submit', send_form, false);
	init();
}

Layer_edit = {};
Layer_edit.params = {};
Layer_edit.init = function(){
	Layer_edit.params.parent = document.getElementById('Layer_edit');
	Layer_edit.params.reload = Layer_edit.params.parent.querySelector('.reload');
	Layer_edit.params.form = Layer_edit.params.parent.querySelector('form');
	Layer_edit.params.input = {}; // Непосредственно инпуты
	var input = Layer_edit.params.input;
	var form = Layer_edit.params.form;
	input.id = form.querySelector('[name="id"]');
	input.type = form.querySelector('[name="type"]');
	input.date = form.querySelector('[name="date"]');
	input.sum = form.querySelector('[name="sum"]');
	input.sum_transfer = form.querySelector('[name="sum_transfer"]');
	input.category_outcome = form.querySelector('[name="category_outcome"]');
	input.category_income = form.querySelector('[name="category_income"]');
	input.account = form.querySelector('[name="account"]');
	input.account_transfer = form.querySelector('[name="account_transfer"]');
	input.payee = form.querySelector('[name="payee"]');
	input.comment = form.querySelector('[name="comment"]');
	input.submit = form.querySelector('[type="submit"]');
	input.del = form.querySelector('.delete');
	
	Layer_edit.params.field = {}; // Блоки с инпутами
	var field = Layer_edit.params.field;
	field.id = form.querySelector('.id');
	field.type = form.querySelector('.type');
	field.date = form.querySelector('.date');
	field.sum = form.querySelector('.sum');
	field.sum_transfer = form.querySelector('.sum_transfer');
	field.category_outcome = form.querySelector('.category_outcome');
	field.category_income = form.querySelector('.category_income');
	field.account = form.querySelector('.account');
	field.account_transfer = form.querySelector('.account_transfer');
	field.payee = form.querySelector('.payee');
	field.comment = form.querySelector('.comment');
	var del = function(){
		var data = {}
		data.id = input.id.value;
		if( data.id != '' && data.id != null ){
			zenMoney.transaction.del(data, function(options){
				if( options.result ){
					alert('Удалено');
				}else{
					alert('Ошибка');
				}
			});
		}else{
			input.submit.removeAttribute('disabled');
		}
	}
	var send_form = function(){
		input.submit.setAttribute('disabled', 'disabled');
		var data = {}
		data.id = input.id.value;
		data.date = parseDate(input.date.value);
		data.payee = input.payee.value;
		data.comment = input.comment.value;
		data.type = input.type.value;
		switch( data.type ){
		case '-1':
		case -1:
			data.sum = parseFloat(input.sum.value, 10);
			data.category = input.category_outcome.value;
			data.account = input.account.value;
		break;
		case '1':
		case 1:
			data.sum = parseFloat(input.sum.value, 10);
			data.category = input.category_income.value;
			data.account = input.account.value;
		break;
		case '0':
		case 0:
			data.sum = parseFloat(input.sum.value, 10);
			data.account = input.account.value;
			data.account_transfer = input.account_transfer.value;
			data.sum_transfer = parseFloat(input.sum_transfer.value, 10);
		break;
		}
		if( data.date && data.sum ){
			zenMoney.transaction.edit(data, function(options){
				input.submit.removeAttribute('disabled');
			});
		}else{
			input.submit.removeAttribute('disabled');
		}
	}
	form.addEventListener('submit', function(e){ send_form(); e.preventDefault(); return false; }, false);
	input.del.addEventListener(EVENTS.touchend, function(e){ del(); e.preventDefault(); return false; }, false);
}
Layer_edit.edit = function(trans){
	var parent = Layer_edit.params.parent;
	var form = Layer_edit.params.form;
	var input = Layer_edit.params.input;
	var field = Layer_edit.params.field;
	/* События формы */
	var setType = function(type){
		input.type.value = type;
		switch(type){
		case '-1':
		case -1:
			field.category_outcome.style.display = 'block';
			field.payee.style.display = 'block';
			field.category_income.style.display = 'none';
			field.account_transfer.style.display = 'none';
			field.sum_transfer.style.display = 'none';
		break;
		case '1':
		case 1:
			field.category_outcome.style.display = 'none';
			field.payee.style.display = 'block';
			field.category_income.style.display = 'block';
			field.account_transfer.style.display = 'none';
			field.sum_transfer.style.display = 'none';
		break;
		case '0':
		case 0:
			field.category_outcome.style.display = 'none';
			field.payee.style.display = 'none';
			field.category_income.style.display = 'none';
			field.account_transfer.style.display = 'block';
			field.sum_transfer.style.display = 'block';
		break;
		}
	}
	input.type.addEventListener('change', function(){ setType(this.value); }, false);
	/* События формы */
	var init = function(){
		var cats = zenMoney.category.get();
		var cats_sort = zenMoney.category.sort;
		var accs = zenMoney.account.get();
		var accs_sort = zenMoney.account.sort;
		var getOpts = function(type){
			var tpl = '';
			var id = undefined;
			for( var i = 0; i < cats_sort[type].length; i++ ){
				id = cats_sort[type][i];
				tpl += '<option value="'+id+'">'+cats[type][id].title+'</option>';
			}
			return tpl;
		}
		input.category_outcome.innerHTML = getOpts(-1);
		input.category_income.innerHTML = getOpts(1);
		
		var getAccs = function(){
			var tpl = '';
			var id = undefined;
			for( var i = 0; i < accs_sort.length; i++ ){
				id = accs_sort[i];
				tpl += '<option value="'+id+'">'+accs[id].title+'</option>';
			}
			return tpl;
		}
		var a = getAccs();
		input.account.innerHTML = a;
		input.account_transfer.innerHTML = a;
	}
	init();
	/* Заполняем поля */
	setType(trans.type);
	input.id.value = trans.id;
	input.sum.value = trans.sum;
	input.date.value = new Date(trans.date).toFormat('%d.%m.%Y');
	input.payee.value = trans.payee;
	input.comment.value = trans.comment;
	switch( trans.type ){
	case '-1':
	case -1:
		input.category_outcome.value = trans.category;
		input.category_income.value = 0;
		input.account.value = trans.account;
	break;
	case '1':
	case 1:
		input.category_outcome.value = 0;
		input.category_income.value = trans.category;
		input.account.value = trans.account;
	break;
	case '0':
	case 0:
		input.category_outcome.value = 0;
		input.category_income.value = 0;
		input.account.value = trans.account;
		input.account_transfer.value = trans.account_transfer;
		input.sum_transfer.value = trans.sum_transfer;
	break;
	}
	/* Заполняем поля */
}
Layer_list = function(){
	var parent = document.getElementById('Layer_list');
	var reload = parent.querySelector('.reload');
	var content = parent.querySelector('.content');
	var cats = {};
	var accs = {};
	var inst = zenMoney.instrument.get();
	
	var generateLiElement = function(res){
		var li = document.createElement('li');
		var tpl = '';
		tpl += '<div class="transaction">';
		tpl += '	<div class="h">';
		if( res.type != 0 ){
			res.category = (isNaN(parseInt(res.category))?0:res.category);
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
				tpl += '		<span class="p">'+safeText(res.payee)+'</span>';
				tpl += '		<span class="c"></span>';
			}else{
				tpl += '		<span class="p">'+safeText(res.payee)+' &mdash; </span>';
				tpl += '		<span class="c">'+safeText(res.comment)+'</span>';
			}
		}
		tpl += '	</div>';
		tpl += '</div>';
		
		var drag = false;
		li.addEventListener(EVENTS.touchstart, function(){ drag = false; }, false);
		li.addEventListener(EVENTS.touchmove, function(){ drag = true; }, false);
		li.addEventListener(EVENTS.touchend, function(){
			if( !drag ){
				Layer_edit.edit(res);
			}else{
				drag = false;
			}
		}, false);
		
		li.innerHTML = tpl;
		return li;
	}
	var draw_transactions = function(trans){
		var frag = document.createDocumentFragment();
		var ul = undefined;
		var dh, dt = undefined;
		content.innerHTML = '';
		var last_date = undefined;
		for( var i = 0; i<trans.length; i++ ){
			if( last_date != trans[i].date ){
				last_date = trans[i].date;
				dh = document.createElement('h3');
				dt = document.createTextNode( new Date(trans[i].date).toFormat('%j %Fmr %Y') );
				dh.appendChild(dt);
				frag.appendChild(dh);
				ul = document.createElement('ul');
				frag.appendChild(ul);
			}
			ul.appendChild( generateLiElement(trans[i]) );
		}
		content.appendChild(frag);
	}
	var init = function(){
		cats = zenMoney.category.get();
		accs = zenMoney.account.get();
		zenMoney.transaction.get.list({skip:0, limit:30}, draw_transactions);
	}
	reload.addEventListener(EVENTS.touchend, init, false);
	init();
}
Layer_add = function(){
	var parent = document.getElementById('Layer_add');
	var reload = parent.querySelector('.reload');
	var form = parent.querySelector('form');
	var input = {}; // Непосредственно инпуты
	input.type = form.querySelector('[name="type"]');
	input.date = form.querySelector('[name="date"]');
	input.sum = form.querySelector('[name="sum"]');
	input.sum_transfer = form.querySelector('[name="sum_transfer"]');
	input.category_outcome = form.querySelector('[name="category_outcome"]');
	input.category_income = form.querySelector('[name="category_income"]');
	input.account = form.querySelector('[name="account"]');
	input.account_transfer = form.querySelector('[name="account_transfer"]');
	input.payee = form.querySelector('[name="payee"]');
	input.comment = form.querySelector('[name="comment"]');
	input.submit = form.querySelector('[type="submit"]');
	var field = {}; // Блоки с инпутами
	field.type = form.querySelector('.type');
	field.date = form.querySelector('.date');
	field.sum = form.querySelector('.sum');
	field.sum_transfer = form.querySelector('.sum_transfer');
	field.category_outcome = form.querySelector('.category_outcome');
	field.category_income = form.querySelector('.category_income');
	field.account = form.querySelector('.account');
	field.account_transfer = form.querySelector('.account_transfer');
	field.payee = form.querySelector('.payee');
	field.comment = form.querySelector('.comment');
	/* События формы */
	var setType = function(type){
		switch(type){
		case '-1':
		case -1:
			field.category_outcome.style.display = 'block';
			field.payee.style.display = 'block';
			field.category_income.style.display = 'none';
			field.account_transfer.style.display = 'none';
			field.sum_transfer.style.display = 'none';
		break;
		case '1':
		case 1:
			field.category_outcome.style.display = 'none';
			field.payee.style.display = 'block';
			field.category_income.style.display = 'block';
			field.account_transfer.style.display = 'none';
			field.sum_transfer.style.display = 'none';
		break;
		case '0':
		case 0:
			field.category_outcome.style.display = 'none';
			field.payee.style.display = 'none';
			field.category_income.style.display = 'none';
			field.account_transfer.style.display = 'block';
			field.sum_transfer.style.display = 'block';
		break;
		}
	}
	input.type.addEventListener('change', function(){ setType(this.value); }, false);
	/* События формы */
	var init = function(){
		var cats = zenMoney.category.get();
		var cats_sort = zenMoney.category.sort;
		var accs = zenMoney.account.get();
		var accs_sort = zenMoney.account.sort;
		var getOpts = function(type){
			var tpl = '';
			var id = undefined;
			for( var i = 0; i < cats_sort[type].length; i++ ){
				id = cats_sort[type][i];
				tpl += '<option value="'+id+'">'+cats[type][id].title+'</option>';
			}
			return tpl;
		}
		input.category_outcome.innerHTML = getOpts(-1);
		input.category_income.innerHTML = getOpts(1);
		
		var getAccs = function(){
			var tpl = '';
			var id = undefined;
			for( var i = 0; i < accs_sort.length; i++ ){
				id = accs_sort[i];
				tpl += '<option value="'+id+'">'+accs[id].title+'</option>';
			}
			return tpl;
		}
		var a = getAccs();
		input.account.innerHTML = a;
		input.account_transfer.innerHTML = a;
	}
	reload.addEventListener(EVENTS.touchend, init, false);
	init();
	var send_form = function(){
		input.submit.setAttribute('disabled', 'disabled');
		var data = {}
		data.date = parseDate(input.date.value);
		data.payee = input.payee.value;
		data.comment = input.comment.value;
		data.type = input.type.value;
		switch( data.type ){
		case '-1':
		case -1:
			data.sum = parseFloat(input.sum.value, 10);
			data.category = input.category_outcome.value;
			data.account = input.account.value;
		break;
		case '1':
		case 1:
			data.sum = parseFloat(input.sum.value, 10);
			data.category = input.category_income.value;
			data.account = input.account.value;
		break;
		case '0':
		case 0:
			data.sum = parseFloat(input.sum.value, 10);
			data.account = input.account.value;
			data.account_transfer = input.account_transfer.value;
			data.sum_transfer = parseFloat(input.sum_transfer.value, 10);
		break;
		}
		if( data.date && data.sum ){
			zenMoney.transaction.add(data, function(){
				input.submit.removeAttribute('disabled');
			});
		}else{
			input.submit.removeAttribute('disabled');
		}
	}
	form.addEventListener('submit', function(e){ send_form(); e.preventDefault(); return false; }, false);
}
Layer_sync_send = function(diff, startTs){
	var parent = document.getElementById('Layer_sync');
	var content = parent.querySelector('.content');
	try{
		var sDiff = JSON.stringify(diff);
		//sDiff = '{"diff_timestamp":0}';
	}catch(err){
		alert(err);
		return false;
	}finally{
	
	}
	var url = 'http://'+SINC.dev+'i.zenmoney.ru/v2/diff/'+localStorage['diff']+'/';
	var request = {
		'method': 'POST',
		'body': sDiff
	};
	SINC.oauth.sendSignedRequest(url, function(text, xhr){
		var sDiff = false;
		try{
			sDiff = JSON.parse(text);
		}catch(err){
			sDiff = false;
		}finally{
		
		}
		if( sDiff ){
			SINC.applyDiff(sDiff, startTs, function(){
				alert('Синхронизация завершена, поздравляю!');
			});
		}else{
			try{
				console.log(text);
			}catch(err){
				
			}finally{
				alert('Херня пришла, отправил в консоль.');
			}
		}
	}, request);
}
Layer_sync = function(){
	var parent = document.getElementById('Layer_sync');
	var reload = parent.querySelector('.reload');
	var content = parent.querySelector('.content');
	var oauth = function(){
		
		if( SINC.oauth.hasToken() ){
			SINC.getDiff( Layer_sync_send );
			//content.innerHTML
			/*
			var url = 'http://'+SINC.dev+'i.zenmoney.ru/v2/diff/'+localStorage['diff']+'/';
			var request = {
				'method': 'POST',
				'body': '{"diff_timestamp":0}'
			};
			SINC.oauth.sendSignedRequest(url, function(text, xhr){
				content.innerHTML = text;
			}, request);
			*/
		}else{
			SINC.oauth.authorize(function(){
				alert('Готово!');
				SINC.checkOauthState();
			});
			content.appendChild(SINC.oauth.iframe);
		}
	}
	var init = function(){
		content.innerHTML = '';
		reload.addEventListener(EVENTS.touchend, oauth, false);
	}
	init();
}
Layer_sql = function(){
	var els = {}
	var start_time = undefined;
	var end_time = undefined;
	var query = function(){
		start_time = new Date();
		zenMoney.sql.db.transaction(function(tx){
			tx.executeSql(els.textarea.value, [], function(tx, result){
				end_time = new Date();
				var out = 'Готово<br>';
				try {
					out += 'insertId: ' + result.insertId + ',';
				}catch(exception_var){
					
				}finally{
					
				}

				out += 'rows: ' + result.rows.length + ', rowsAffected: ' + result.rowsAffected + '<br>';
				out += 'время: ' + ( end_time - start_time );
                                window.__last_result = result;
				els.answer.innerHTML = out;
			}, function(tx, error){
				var out = 'Ошибка<br>';
				out += '<strong>code:</strong> ' + error.code + ', <strong>message:</strong> ' + error.message;
				els.answer.innerHTML = out;
			})
		});
	}
	var red_action = function(){
		zenMoney.sql.db.transaction(function(tx){
			tx.executeSql('DROP TABLE accounts;', [], function(){}, function(){});
			tx.executeSql('DROP TABLE categories;', [], function(){}, function(){});
			tx.executeSql('DROP TABLE citys;', [], function(){}, function(){});
			tx.executeSql('DROP TABLE countries;', [], function(){}, function(){});
			tx.executeSql('DROP TABLE instruments;', [], function(){}, function(){});
			tx.executeSql('DROP TABLE reminders;', [], function(){}, function(){});
			tx.executeSql('DROP TABLE transactions;', [], function(){}, function(){});
			tx.executeSql('DROP TABLE users;', [], function(){
				localStorage['diff'] = 0;
				els.answer.innerHTML = 'Domestos!';
				setTimeout(function(){
					window.location.reload();
				}, 100);
			}, function(){});
		});
	}
	els.textarea = document.getElementById('textarea');
	els.submit = document.getElementById('submit');
	els.red_button = document.getElementById('red_button');
	els.answer = document.getElementById('answer');
	els.submit.addEventListener('click', query, false);
	els.red_button.addEventListener('click', red_action, false);
	els.answer.innerHTML = 'Что, новый хозяин, надо?';
}
Layer_js = function(){
	var els = {}
	var start_time = undefined;
	var end_time = undefined;
	var query = function(){
		var out = 'Готово<br>';
		try {
			eval(els.textarea.value);
		}catch(exception_var){
			out += exception_var;
		}finally{
			
		}
		els.answer.innerHTML = out;
	}
	els.textarea = document.getElementById('js_textarea');
	els.submit = document.getElementById('js_submit');
	els.answer = document.getElementById('js_answer');
	els.submit.addEventListener('click', query, false);
	els.answer.innerHTML = 'Что, новый хозяин, надо?';
}
pageOnLoad = function(){
	Layer_add();
	Layer_browse();
	Layer_list();
	Layer_edit.init();
	Layer_accounts();
	Layer_category();
	Layer_sync();
	Layer_sql();
	Layer_js();
}
checkUser = function(){
	if( zenMoney.user.get() == false ){
		zenMoney.user.add({
			country:1,
			city:1,
			currency:2,
			sum:0,
			title:'Наличные',
			static_id:18,
			pin:false
		}, function(){
			setTimeout(function(){
				pageOnLoad();
			}, 100);
		});
	}else{
		setTimeout(function(){
			pageOnLoad();
		}, 100);
	}
}
/* Стартуем */
window.addEventListener('load', function(){
	zenMoney.sql.connect( checkUser, function(){
		alert('Не могу создать базу.');
	} );
}, false);
/* Стартуем */