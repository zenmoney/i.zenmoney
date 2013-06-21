Settings = {
    main:{
        render: false,
        data: {},
        init: function(layer){
            var there = Settings.main;
            there.data.layer = layer;
            if( !there.render ){
                there.render = true;
                there.create(layer);
            }else{
                there.update();
            }
        }
    },
    accounts:{
        render: false,
        data: {},
        init: function(layer){
            var there = Settings.accounts;
            there.data.layer = layer;
            if( !there.render ){
                there.render = true;
                there.create(layer);
            }else{
                there.update();
            }
        }
    },
    categories:{
        render: false,
        data: {},
        init: function(layer){
            var there = Settings.categories;
            there.data.layer = layer;
            if( !there.render ){
                there.render = true;
                there.create(layer);
            }else{
                there.update();
            }
        }
    },
    account_edit:{
        render: false,
        data: {},
        init: function(layer){
            var there = Settings.account_edit;
            there.data.layer = layer;
            if( !there.render ){
                there.render = true;
                there.create(layer);
            }else{
                there.update();
            }
        }
    }
}

Settings.main.create = function(layer){
    var there = Settings.main;
    there.data.parent = document.createElement('div');
    there.data.parent.setAttribute('id', 'LayerSettings');
    there.data.parent.innerHTML = '<div class="baseCurrency"><h3>Валюта</h3><select class="currency" name="currency"></select></div><ul class="iList"><li class="accounts"><span class="row"><span class="title">Настройки счетов</span><span class="status"><span class="rightArrow"></span></span></span></li><li class="categories hidden"><span class="row"><span class="title">Настройки категорий</span><span class="status"><span class="rightArrow"></span></span></span></li></ul><ul class="iList" style="margin-top:80px;"><li class="updatecache"><span class="row"><span class="title">Проверить обновления<div class="version_info">('+$('#loadScreen span').html()+')</div></span><span class="status"><span class="rightArrow"></span></span></span></li><li class="reset"><span class="row"><span class="title">Начать все сначала</span><span class="status"><span class="rightArrow"></span></span></span></li><ul>';
    layer.data.content.appendChild( there.data.parent );
    // Элементы на странице
    there.els = {};
    there.els.acc = {}
    there.els.acc.block = there.data.parent.querySelector('.accounts');
    zenEvents.ontap(there.els.acc.block, function(){
        wps.settings.show(1);
    });
    there.els.cats = {}
    there.els.cats.block = there.data.parent.querySelector('.categories');
    zenEvents.ontap(there.els.cats.block, function(){
        wps.settings.show(2);
    });
    there.els.currency = {}
    there.els.currency.block = there.data.parent.querySelector('.baseCurrency');
    there.els.currency.select = there.data.parent.querySelector('.currency');
    there.els.currency.select.onchange = function(){
        var value = parseInt(there.els.currency.select.value);
        if( !isNaN(value) ){
            var usr = zenMoney.user.get();
            var data = {};
            data.id = usr['id'];
            data.currency = value;
            data.country = usr['country'];
            data.city = usr['city'];
			
            zenMoney.user.edit(data, function(){
                zenMoney.account.balances = {};
                zForm.refill();
            });
        }
    }
	
    there.els.update = {}
    there.els.update.block = there.data.parent.querySelector('.updatecache');
    zenEvents.ontap(there.els.update.block, function(){
        zenMoney.cacheupdate();
    });
	
    there.els.reset = {}
    there.els.reset.block = there.data.parent.querySelector('.reset');
    zenEvents.ontap(there.els.reset.block, function(){
        setTimeout(function(){
            if( confirm('Удалить все данные и начать все сначала?') ){
                var cnsl = document.getElementById('console');
                cnsl.style.display = 'none';
                var loadScreen = document.getElementById('loadScreen');
                loadScreen.style.display = 'block';
                loadScreen.style.opacity = '0.8';
                zenMoney.account.balances = {};
                zenMoney.sql.db.transaction(function(tx){
                    tx.executeSql('DROP TABLE accounts;', []);
                    tx.executeSql('DROP TABLE categories;', []);
                    tx.executeSql('DROP TABLE citys;', []);
                    tx.executeSql('DROP TABLE countries;', []);
                    tx.executeSql('DROP TABLE instruments;', []);
                    tx.executeSql('DROP TABLE reminders;', []);
                    tx.executeSql('DROP TABLE transactions;', []);
                    tx.executeSql('DROP TABLE users;', []);
                }, function(){
                    loadScreen.style.display = 'none';
                    alert('Ошибка');
                }, function(){
                    zenMoney.sql.newdb(function(){
                        zenMoney.user.add({
                            country:1,
                            city:1,
                            currency:2,
                            sum:0,
                            title:'Наличные',
                            pin:false
                        }, function(){
                            zenMoney.prepare.init(function(){
                                wps.browse.show(0);
                                loadScreen.style.display = 'none';
                            //alert('Восстановлено.');
                            });
                        });
						
                    });
                    SINC.logout();
                    localStorage['diff'] = 0;
                });
            }
        }, 300);
    });
	
    Settings.main.update();
}
Settings.main.update = function(){
    var there = Settings.main;
    var inst = zenMoney.instrument.get();
    var inst_sort = zenMoney.instrument.sort;
    var inst_list = '';
    var usr = zenMoney.user.get();
    for( var i = 0; i < inst_sort.length; i++ ){
        if( String( usr['currency'] ) == String( inst_sort[i] ) ){
            inst_list += '<option value="'+inst_sort[i]+'" selected="selected">'+inst[ inst_sort[i] ].symbol+'</option>';
        }else{
            inst_list += '<option value="'+inst_sort[i]+'">'+inst[ inst_sort[i] ].symbol+'</option>';
        }
    }
	
    there.els.currency.select.innerHTML = inst_list;
	
    there.data.layer.data.scroll.refresh();
}

Settings.accounts.generateForm = function(res){
    var inst = zenMoney.instrument.get();
    var inst_sort = zenMoney.instrument.sort;
    var inst_tpl = '';
    for( var i = 0; i < inst_sort.length; i++ ){
        var sel = '';
                
        if( res.instrument == inst_sort[i] ) sel = ' selected="selected"';
        inst_tpl += '<option value="'+inst_sort[i]+'"'+sel+'>'+inst[inst_sort[i]].symbol+'</option>';
    }
    switch(res.id){
        case 'new':
            var tpl = '<div class="row"><input type="hidden" name="id" value="'+res.id+'"><input type="text" name="title" placeholder="Название счета" value="'+safeText(res.title)+'"></div><div class="row"><span class="title"><input type="text" name="sum" placeholder="Начальный остаток"></span><span class="status"><select name="instrument">'+inst_tpl+'</select></span></div><div class="row"><input class="iSubmit" type="submit" value="Создать"></div>';
            break;
        default:
            if( res.deleted ){
                var deleted = '<button class="delete">X</button>';
            }else{
                var deleted = '';
            }
            var tpl = '<div class="row"><input type="hidden" name="id" value="'+res.id+'"><input type="text" name="title" placeholder="Название счета" value="'+safeText(res.title)+'"></div><div class="row"><span class="title"><input type="text" name="sum" placeholder="Начальный остаток" value="'+res.sum+'"></span><span class="status"><select name="instrument" value="'+res.instrument+'">'+inst_tpl+'</select></span></div><div class="row"><input class="iSubmit" type="submit" value="Сохранить">'+deleted+'</div>';
    }
    var form = document.createElement('form');
    form.innerHTML = tpl;
    if( res.deleted ){
        zenEvents.ontap(form.querySelector('button.delete'), function(){
            zenMoney.account.del({
                id: res.id
            }, function(res){
                Settings.accounts.update();
            });
        });
    }
    form.addEventListener('submit', Settings.accounts.submit, false);
    var inputs = form.querySelectorAll('input:not([type="submit"]),select');
    for( var i=0; i<inputs.length; i++ ){
        zenEvents.ontap(inputs[i], function(el){
            el.focus();
        })
    }
	
    return form;
}

var edit_account_form = {};
edit_account_form.form = undefined;
edit_account_form.f = {};
edit_account_form.edit = function(obj){
    wps.settings.show(3);
	
    var input = edit_account_form.f;
    input.id.value = obj.id;
    input.title.value = obj.title;
    input.type.value = obj.type;
    input.instrument.value = obj.instrument;
    input.sum.value = obj.sum;
	
    if( zenMoney.account.sort.length <= 1 ){
        edit_account_form.f.del.style.display = 'none';
    }else{
        edit_account_form.f.del.style.display = 'block';
    }
    input.submit.setAttribute('src', 'images/buttons/btn2.png');
    input.submit.setAttribute('alt', 'Сохранить');
}
edit_account_form.add = function(){
    wps.settings.show(3);
	
    var input = edit_account_form.f;
    input.id.value = 'new';
    input.title.value = '';
    input.type.value = 'cash';
    input.instrument.value = zm.user.get().currency;
    input.sum.value = '';
	
    input.submit.setAttribute('src', 'images/buttons/btn3.png');
    input.submit.setAttribute('alt', 'Добавить');
    edit_account_form.f.del.style.display = 'none';
}
edit_account_form.del = function(id){
    var input = edit_account_form.f;
    if(!isNaN(Number(id))){
        zenMoney.transaction.get.list({
            skip:0, 
            limit:1, 
            account:[Number(id)]
            }, function(list){
            var accs = zenMoney.account.get();
            var confirm_text = 'Вы действительно хотите удалить счет «'+accs[id].title+'»?';
            if( list ){
                if( list.length > 0 )
                    confirm_text = 'При удалении счета будут удалены все транзакций по счету «'+accs[id].title+'»!\nВы уверены?';
            }
            if( confirm( confirm_text ) ){
                zenMoney.account.del( {
                    id:Number(id)
                    }, function(){
                    wps.settings.show(1);
                    zForm.refill();
                } );
            }
        });
    }
}
edit_account_form.save = function(e){

    var input = edit_account_form.f;
	
    var data = {};
    data.title = input.title.value;
    data.type = input.type.value;
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
                wps.settings.show(1);
                zForm.refill();
            });
            break;
        default:
            data.id = input.id.value;
            zenMoney.account.edit(data, function(){
                wps.settings.show(1);
                zForm.refill();
            });
    }
	
    e.preventDefault();
    return false;
}


Settings.accounts.submit = function(e){
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
                appChanged();
                Settings.accounts.update();
                zForm.refill();
            });
            break;
        default:
            data.id = input.id.value;
            zenMoney.account.edit(data, function(){
                appChanged();
                Settings.accounts.update();
                zForm.refill();
            });
    }
	
    e.preventDefault();
    return false;
}
Settings.accounts.create = function(layer){
    var there = Settings.accounts;
    there.data.parent = document.createElement('div');
    there.data.parent.setAttribute('id', 'LayerSettingsAccounts');
    var parent = there.data.parent;
	
    var accounts_list = document.createElement('div');
    accounts_list.className = 'accounts_list';
	
    var edit_accounts_list = document.createElement('div');
    edit_accounts_list.className = 'edit_accounts_list';
	
    parent.appendChild(accounts_list);
    parent.appendChild(edit_accounts_list);
	
    layer.data.content.appendChild( there.data.parent );
	
    Settings.accounts.update();
}
Settings.accounts.update = function(){
    var there = Settings.accounts;
    var content = there.data.layer.data.content;
    var parent = content.querySelector('#LayerSettingsAccounts');
	
    var accounts = parent.querySelector('.accounts_list');
    var accounts_edit = parent.querySelector('.edit_accounts_list');
    accounts.innerHTML = '';
    accounts_edit.innerHTML = '';
	
    var accs = zenMoney.account.get();
    var accs_sort = zenMoney.account.sort;
    var accs_by_type = {};
    var accs_count = accs_sort.length;
    var insts = zenMoney.instrument.get();
    var usr = zenMoney.user.get();
	
    var generateLiElement = function(obj){
        var li = document.createElement('li');
        var symbol = '';
        try{
            symbol = insts[obj.instrument].symbol;
        }catch(exception){ }finally{ }
        var sum = zenMoney.account.balances[obj.id];
        if( typeof sum == 'undefined' ){
            var bal = '<span class="value"><span class="val"></span><span class="cur"></span></span>';
        }else{
            var bal = '<span class="value"><span class="val">'+costToString(sum, 2)+'</span><span class="cur">'+symbol+'</span></span>';
        }
        if( acc.type == 'cash' || acc.type == 'checking' || acc.type == 'ccard' ){
            var tpl = '<span class="row"><span class="title"><strong>'+String(obj.title).safeText()+'</strong></span><span class="status"><span class="bal">'+bal+'</span><span class="rightArrow"></span></span></span>';
        }else{
            var tpl = '<span class="row"><span class="title"><strong>'+String(obj.title).safeText()+'</strong></span><span class="status"><span class="bal">'+bal+'</span></span></span>';
        }
        li.innerHTML = tpl;
		
        (function(li, obj){
            zenMoney.account.balance(obj.id, function(sum){
                var out = li.querySelector('.bal');
                var symbol = '';
                try{
                    symbol = insts[obj.instrument].symbol;
                }catch(exception){ }finally{ }
                out.innerHTML = '<span class="value"><span class="val">'+costToString(sum, 2)+'</span><span class="cur">'+symbol+'</span></span>';
                accs[obj.id].bal = sum;
            //show_balance();
            });
            if( acc.type == 'cash' || acc.type == 'checking' || acc.type == 'ccard' ){
                zenEvents.ontap(li, function(el){
                    edit_account_form.edit(obj);
                });
            }
        })(li, obj)
		
        return li;
    }
	
    var generateLiElementEdit = function(obj){
        var li = document.createElement('div');
        li.className = "li";
        var delBtn = '';
        if( accs_sort.length > 1 ){
            delBtn = '<span class="del" onclick="edit_account_form.del('+obj.id+');"></span>';
        }
        var tpl = '<span class="row">'+delBtn+'<span class="title">'+String(obj.title).safeText()+'</span></span>';
        li.innerHTML = tpl;
		
        return li;
    }
	
    for( var i = 0; i < accs_sort.length; i++ ){
        var acc = accs[accs_sort[i]];
        if( typeof accs_by_type[ accs[accs_sort[i]].type ] == 'undefined' ){
            accs_by_type[ acc.type ] = {};
            accs_by_type[ acc.type ].h = document.createElement('h3');
            var title = zenMoney.types(acc.type);
            if( acc.type != 'debt' ){
                accs_by_type[ acc.type ].h.innerHTML = String(title).safeText();
                accs_by_type[ acc.type ].ul = document.createElement('ul');
                accs_by_type[ acc.type ].ul.className = 'iList';
                accounts.appendChild( accs_by_type[ acc.type ].h );
                accounts.appendChild( accs_by_type[ acc.type ].ul );
            }
        }
        if( acc.type != 'debt' ){
            var li = generateLiElement( acc );
            var li_e = generateLiElementEdit( acc );
            accs_by_type[ acc.type ].ul.appendChild(li);
            accounts_edit.appendChild(li_e);
        }
    }
    there.data.layer.data.scroll.refresh();
}

Settings.account_edit.create = function(layer){
    var there = Settings.account_edit;
    there.data.parent = document.createElement('div');
    there.data.parent.setAttribute('id', 'LayerSettingsAccountEdit');
    var parent = there.data.parent;

    var inst = zenMoney.instrument.get();
    var inst_sort = zenMoney.instrument.sort;
    var inst_list = '';
    var ucur = zm.user.get().currency;
    console.log('ucur', ucur);
    for( var i = 0; i < inst_sort.length; i++ ){
        console.log('inst_sort[i]', i, inst_sort[i]);
        inst_list += '<option value="'+inst_sort[i]+'" '+((inst_sort[i] == ucur) ? ' ': '')+'>'+inst[ inst_sort[i] ].symbol+'</option>';
    }


    edit_account_form.form = document.createElement('form');
    edit_account_form.form.className = 'account_edit_form';
    var tpl = '<p>';
    tpl += '<input type="hidden" name="id"/>';
    tpl += '	<span>Наименование счета</span>';
    tpl += '	<br>';
    tpl += '	<span class="inputText"><input type="text" name="title"/></span>';
    tpl += '</p>';
    tpl += '<p>';
    tpl += '	<span>Тип счета</span>';
    tpl += '	<br>';
    tpl += '	<select name="type"><option value="cash">Наличные</option><option value="checking" selected="selected">Банковский счет</option><option value="ccard">Кредитная карта</option></select>';
    tpl += '</p>';
    tpl += '<p>';
    tpl += '	<span>Валюта</span>';
    tpl += '	<br/>';
    tpl += '	<select name="instrument"></select>';
    tpl += '</p>';
    tpl += '<p>';
    tpl += '	<span>Начальный остаток</span>';
    tpl += '	<br>';
    tpl += '	<span class="inputText"><input type="text" name="sum"></span>';
    tpl += '</p>';
    tpl += '<p><span class="delete">Удалить</span><input class="submit" type="image" width="102" height="31" src="images/buttons/btn2.png" value="Сохранить"></p>';
	
    edit_account_form.form.innerHTML = tpl;

    edit_account_form.f.id = edit_account_form.form.querySelector('[name="id"]');
    edit_account_form.f.title = edit_account_form.form.querySelector('[name="title"]');
    zenEvents.ontap(edit_account_form.f.title, function(el){
        el.focus();
    });
    edit_account_form.f.type = edit_account_form.form.querySelector('[name="type"]');
    edit_account_form.f.instrument = edit_account_form.form.querySelector('[name="instrument"]');
    edit_account_form.f.instrument.innerHTML = inst_list;
    edit_account_form.f.sum = edit_account_form.form.querySelector('[name="sum"]');
    zenEvents.ontap(edit_account_form.f.sum, function(el){
        el.focus();
    });
    edit_account_form.f.del = edit_account_form.form.querySelector('.delete');
    edit_account_form.f.submit = edit_account_form.form.querySelector('.submit');
	
    zenEvents.ontap(edit_account_form.f.del, function(){
        edit_account_form.del( edit_account_form.f.id.value );
    });
	
	
    edit_account_form.form.addEventListener('submit', edit_account_form.save, false);
    console.log('S', edit_account_form.f.instrument.querySelector('option[selected' +']'));

    parent.appendChild( edit_account_form.form );
    layer.data.content.appendChild( there.data.parent );
    $(edit_account_form.f.instrument).val(ucur);
    Settings.account_edit.update();
}
Settings.account_edit.update = function(){
    var there = Settings.account_edit;
	
    there.data.layer.data.scroll.refresh();
}

Settings.categories.generateForm = function(res){
    var tpl = '<input type="hidden" value="'+res.id+'" name="id"><input type="hidden" value="'+res.type+'" name="type"><div class="deleteBtn"></div><div class="saveBtn"><input type="image" src="images/buttons/btn2.png" width="102" height="31" alt="Сохранить"></div><div class="inputText"><input type="text" value="'+String(res.title).safeText()+'" name="title"></div>';
	
    var form = document.createElement('form');
    form.innerHTML = tpl;
    zenEvents.ontap(form.querySelector('.deleteBtn'), function(){
        zenMoney.category.del({
            id: res.id
        }, function(res){
            Settings.categories.update();
            zForm.refill();
        });
    });
    form.addEventListener('submit', Settings.categories.submit, false);
    (function(form, res){
        var title = form.querySelector('input[name="title"]');
        title.addEventListener('focus', function(el){
            var forms = Settings.categories.els.catsList.block.querySelectorAll('form');
            for( var i = 0; i < forms.length; i++ ){
                forms[i].className = ''; 
            }
            form.className = 'edit';
        });
    /*
		title.addEventListener('blur', function(){
			form.className = '';
			var id = form.querySelector('[name="id"]');
			id = id.value;
			var titleEl = form.querySelector('[name="title"]');
			if( titleEl.value != res ){
				titleEl.value = res.title;
			}
		}, false);
		*/
    })(form, res)
	
    return form;
}
Settings.categories.submit = function(e){
    e.preventDefault();
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
                input.title.value = zenMoney.category.get()[input.type.value][input.id.value]['title'];
            }
            e.preventDefault();
            return false;
        }
    }
    switch( input.id.value ){
        case 'new':
            zenMoney.category.add(data, function(){
                appChanged();
                Settings.categories.update();
                zForm.refill();
            });
            break;
        default:
            data.id = input.id.value;
            zenMoney.category.edit(data, function(res){
                appChanged();
                Settings.categories.update();
                zForm.refill();
            });
    }
	
    return false;
}
Settings.categories.create = function(layer){
    var there = Settings.categories;
    there.data.parent = document.createElement('div');
    there.data.parent.setAttribute('id', 'LayerSettingsCategories');
    var layerTpl = '<div class="typeMenu"><div class="row"><div class="outcome active">Расход</div><div class="income">Доход</div></div></div>';
    layerTpl += '<form class="addForm"><input type="hidden" value="new" name="id"><input type="hidden" value="-1" name="type"><div class="inputSubmit"><input type="image" src="images/buttons/btn3.png" alt="Добавить" width="102" height="31"></div><div class="inputText"><input name="title" type="text" placeholder="Название"></div></form>';
    layerTpl += '<div class="categoriesList"></div>';
    there.data.parent.innerHTML = layerTpl;
    layer.data.content.appendChild( there.data.parent );
	
    there.els = {};
    there.els.type = {};
    there.els.type.parent = there.data.parent.querySelector('.typeMenu');
    there.els.type.income = there.data.parent.querySelector('.typeMenu .income');
    there.els.type.outcome = there.data.parent.querySelector('.typeMenu .outcome');
    there.els.type.value = -1;
	
    zenEvents.ontap( there.els.type.outcome, function(){
        there.els.type.value = -1;
        there.els.addForm.type.value = -1;
        there.els.type.income.className = 'income';
        there.els.type.outcome.className = 'outcome active';
        setTimeout(function(){
            Settings.categories.update();
        }, 50);
    } );
    zenEvents.ontap( there.els.type.income, function(){
        there.els.type.value = 1;
        there.els.addForm.type.value = 1;
        there.els.type.income.className = 'income active';
        there.els.type.outcome.className = 'outcome';
        setTimeout(function(){
            Settings.categories.update();
        }, 50);
    } );
	
    there.els.addForm = {};
    there.els.addForm.block = there.data.parent.querySelector('.addForm');
    there.els.addForm.title = there.els.addForm.block.querySelector('input[name="title"]');
    there.els.addForm.id = there.els.addForm.block.querySelector('input[name="id"]');
    there.els.addForm.type = there.els.addForm.block.querySelector('input[name="type"]');
    there.els.addForm.block.onsubmit = Settings.categories.submit;
	
    zenEvents.ontap( there.els.addForm.title, function(){
        there.els.addForm.title.focus();
    } );
	
    there.els.catsList = {};
    there.els.catsList.block = there.data.parent.querySelector('.categoriesList');
	
    Settings.categories.update();
}
Settings.categories.update = function(){
    var there = Settings.categories;
    there.els.addForm.title.value = '';
    there.els.addForm.title.blur();
	
    var type = there.els.type.value;
	
    var cats = zenMoney.category.get()[type];
    var cats_sort = zenMoney.category.sort[type];
	
    there.els.catsList.block.innerHTML = '';
    var row = undefined;
    if( cats_sort.length == 1 ){
        var deleted = false;
    }else{
        var deleted = true;
    }
    for( var i = 0; i < cats_sort.length; i++ ){
        if( cats[ cats_sort[i] ].id != 0 ){
            row = document.createElement('div');
			
            row.className = 'row';
            var form = Settings.categories.generateForm({
                id: cats[ cats_sort[i] ].id,
                title: cats[ cats_sort[i] ].title,
                type: cats[ cats_sort[i] ].type
            });
            row.appendChild(form);
            there.els.catsList.block.appendChild(row);
        }
    }
	
    there.data.layer.data.scroll.refresh();
}