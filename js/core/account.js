/*	Account
*	id					(int)
*	server_id			(int)
*	
*	instrument			(int) Валюта
*	title				(text)
*	sum					(float) 20.4
*	type				(text) Тип счета: cash - наличный, checking - счет в банке, ccard - кредитная карта, loan - кредит, virtual_loan - виртуальный кредит, deposit - депозит, virtual_deposit - виртуальный депозит, uit - пиф
*
*	created				(date) Дата начала: кредита/депозит/виртуальный кредит/виртуальный депозит/карта/вклад/наличные
*	date_limit			(date) Срок кредита в date_limit_interval-ах
*	percent				(float) 4.2
*	payoff_period		(int) Переодичность начисления процентов. 1 - месяц, 2 - год
*	capitalization		(int) Капитализация процентов
*	date_limit_interval	(int) Единица измерения срока 1 - месяц, 2 - год
*	payoff_type			(int) Тип выплат. 1 - аннуитетный, 2 - дифференцированный
*	email				(text) 
*	bank				(int) 
*	card_system			(int) 
*	archive				(bool) Архивный счет
*	
*	deleted				(float)
*	edited				(float)
*/
zenMoney.account = {};

// Get object account
zenMoney.account.cache = false;
zenMoney.account.sort = [];
zenMoney.account.balances = {};
zenMoney.account.activity_cache = 1;
zenMoney.account.activity = function(){
    if( typeof arguments[0] == 'undefined' ){
        return zenMoney.account.activity_cache;
    }else{
        if( typeof zenMoney.account.get( arguments[0] ) != 'undefined' ){
            var id = arguments[0];
            zenMoney.sql.db.transaction(function(tx){
                tx.executeSql("UPDATE accounts SET transactions_date_avg = 0 WHERE transactions_date_avg is null OR transactions_date_avg = '';", []);
                tx.executeSql("UPDATE accounts SET transactions_date_avg = (transactions_date_avg + strftime('%s', 'now')) / 2 WHERE id = ?;", [id]);
                tx.executeSql("SELECT id FROM accounts ORDER BY transactions_date_avg DESC LIMIT 1", [], function(tx, result){
                    if( result.rows.length == 1 ){
                        zenMoney.account.activity_cache = result.rows.item(0)['id'];
                    }
                });
            });
        }
    }
}
zenMoney.account.init = function(tx, callback){
    zenMoney.account.cache = false;
    zenMoney.account.sort = new Array;
    tx.executeSql('SELECT * FROM accounts WHERE deleted = 0 ORDER BY title;', [], function(tx, result){
        zenMoney.account.cache = {};
        var debt = false;
        for( var i = 0; i < result.rows.length; i++ ) {
            var id = result.rows.item(i)['id'];
            if( result.rows.item(i)['type'] != 'uit' ){
                if( result.rows.item(i)['type'] == 'debt' ){
                    debt = result.rows.item(i)['id'];
                }else{
                    zenMoney.account.sort.push( id );
                }
					
                zenMoney.account.cache[ id ] = {};
                zenMoney.account.cache[ id ]['id'] = result.rows.item(i)['id'];
                zenMoney.account.cache[ id ]['server_id'] = result.rows.item(i)['server_id'];
                zenMoney.account.cache[ id ]['static_id'] = result.rows.item(i)['static_id'];
                zenMoney.account.cache[ id ]['instrument'] = result.rows.item(i)['instrument'];
                zenMoney.account.cache[ id ]['title'] = result.rows.item(i)['title'];
                zenMoney.account.cache[ id ]['sum'] = result.rows.item(i)['sum'];
                zenMoney.account.cache[ id ]['type'] = result.rows.item(i)['type'];
                // type
                zenMoney.account.cache[ id ]['created'] = result.rows.item(i)['created'];
                zenMoney.account.cache[ id ]['date_limit'] = result.rows.item(i)['date_limit'];
                zenMoney.account.cache[ id ]['percent'] = result.rows.item(i)['percent'];
                zenMoney.account.cache[ id ]['payoff_period'] = result.rows.item(i)['payoff_period'];
                zenMoney.account.cache[ id ]['capitalization'] = result.rows.item(i)['capitalization'];
                zenMoney.account.cache[ id ]['date_limit_interval'] = result.rows.item(i)['date_limit_interval'];
                zenMoney.account.cache[ id ]['payoff_type'] = result.rows.item(i)['payoff_type'];
//                zenMoney.account.cache[ id ]['email'] = result.rows.item(i)['email'];
                zenMoney.account.cache[ id ]['bank'] = result.rows.item(i)['bank'];
                zenMoney.account.cache[ id ]['card_system'] = result.rows.item(i)['card_system'];
                zenMoney.account.cache[ id ]['archive'] = result.rows.item(i)['archive'];
                zenMoney.account.cache[ id ]['deleted'] = result.rows.item(i)['deleted'];
                zenMoney.account.cache[ id ]['edited'] = result.rows.item(i)['edited'];
                zenMoney.account.cache[ id ]['diff'] = result.rows.item(i)['diff'];
            }
        }
        if( debt ){
            zenMoney.account.sort.push( debt );
        }
       
        tx.executeSql("SELECT id FROM accounts ORDER BY transactions_date_avg DESC LIMIT 1", [], function(tx, result){
            if( result.rows.length == 1 ){
                zenMoney.account.activity_cache = result.rows.item(0)['id'];
            }
            if (callback) callback();
        });
    }, null);
}
zenMoney.account.get = function(){
    if( !arguments[0] ){
        return zenMoney.account.cache;
    }else{
        return zenMoney.account.cache[arguments[0]];
    }
}
zenMoney.account.edit = function(options, callback){
    if( options.title == '' || options.id == '' ){
        callback({
            result: false
        });
        return false;
    }
    options.sum = parseFloat( String(options.sum).replace(/[^\d,\.\-]/g, '') );
    if( isNaN( options.sum ) ){
        options.sum = 0;
    }
    if( options.type != 'cash' && options.type != 'checking' && options.type != 'ccard' ){
        options.type = zenMoney.account.get()[options.id]['type'];
    }
    var prepare_data = [options.title, options.type, options.sum, options.instrument, options.id];
    if( prepare_data ){
        zenMoney.sql.db.transaction(function(tx){
            tx.executeSql('UPDATE transactions SET instrument_income=?, edited=1, diff=strftime("%s") WHERE account_income=?;', [options.instrument, options.id], function(){}, function(){});
            tx.executeSql('UPDATE transactions SET instrument_outcome=?, edited=1, diff=strftime("%s") WHERE account_outcome=?;', [options.instrument, options.id], function(){}, function(){});
            tx.executeSql('UPDATE accounts SET title=?, type=?, sum=?, instrument=?, edited=1, diff=strftime("%s") WHERE id=?;', prepare_data, function(tx, res){
                /* Сброс балансов */
                zenMoney.account.balances = {};
                /* Сброс балансов */
                if( callback ){
                    options.result = true;
                    zenMoney.account.init(tx, function(){
                        callback(options);
                    });
                }
            }, function(){
                if( callback ){
                    callback({
                        result: false
                    });
                }
            });
        });
    }else{
        if( callback ){
            callback({
                result: false
            });
        }
    }
}
zenMoney.account.add = function(options, callback){
    if( options.title == '' ){
        callback({
            result: false
        });
        return false;
    }
    options.sum = parseFloat( String(options.sum).replace(/[^\d,\.\-]/g, '') );
    if( isNaN( options.sum ) ){
        options.sum = 0;
    }
    if( options.type != 'cash' && options.type != 'checking' && options.type != 'ccard' && options.type != 'debt' ){
        options.type = 'cash';
    }
    if( isNaN(parseInt(options.static_id)) ){
        options.static_id = null;
    }else{
        options.static_id = parseInt(options.static_id);
    }
    var prepare_data = [options.title, options.static_id, options.sum, options.instrument, options.type, new Date().getTime()];
    if( prepare_data ){
        zenMoney.sql.db.transaction(function(tx){
            tx.executeSql('INSERT INTO accounts (title, static_id, sum, instrument, type, created, deleted, edited, diff) VALUES (?, ?, ?, ?, ?, ?, 0, 1, strftime("%s"));', prepare_data, function(tx, res){
                /* Сброс балансов */
                zenMoney.account.balances = {};
                /* Сброс балансов */
                if( callback ){
                    options.result = true;
                    zenMoney.account.init(tx, function(){
                        callback(options);
                    });
                }
            }, function(){
                if( callback ){
                    callback({
                        result: false
                    });
                }
            });
        });
    }else{
        if( callback ){
            callback({
                result: false
            });
        }
    }
}
zenMoney.account.del = function(options, callback){
    if( options.id ){
        zenMoney.sql.db.transaction(function(tx){
            tx.executeSql('UPDATE transaction_tag SET created = 0, deleted = 0, edited = 0 WHERE "transaction" IN (SELECT id FROM transactions WHERE account_income = account_outcome AND account_outcome = ?);', [options.id], function(tx, res){}, function(tx, res){});
            tx.executeSql('UPDATE transactions SET deleted = 1, edited = 1, diff=strftime("%s") WHERE account_income = account_outcome AND account_outcome = ?;', [options.id], function(tx, res){}, function(tx, res){});
            tx.executeSql('UPDATE transactions SET account_income = account_outcome, income = 0, edited = 1, diff=strftime("%s") WHERE account_income = ?;', [options.id], function(tx, res){}, function(tx, res){});
            tx.executeSql('UPDATE transactions SET account_outcome = account_income, outcome = 0, edited = 1, diff=strftime("%s") WHERE account_outcome = ?;', [options.id], function(tx, res){}, function(tx, res){});
            tx.executeSql('UPDATE accounts SET deleted = 1, edited = 1, diff = strftime("%s") WHERE id = ?;', [options.id], function(tx, res){}, function(tx, res){});
        }, function(){ }, function(){
            /* Сброс балансов */
            zenMoney.account.balances = {};
            /* Сброс балансов */
            zenMoney.sql.db.transaction(function(tx) {
                zenMoney.account.init(tx, callback);
            });
        });
    }else{
        if( callback ){
            callback({
                result: false
            });
        }
    }
}
zenMoney.account.balance = function(id, callback){
	if( typeof id.length != 'undefined' ){
		// Пакетный запрос балансов
		var needed_bal = [];
		for( var i = 0; i < id.length; i++ ){
			if( !zenMoney.account.balances[id[i]] ){
				if( zenMoney.account.get(id[i])['type'] != 'debt' ){
					needed_bal.push(id[i]);
				}
			}else{
				
			}
		}
		if( needed_bal.length ){
			var acc_count = [];
			for( i = 0; i < needed_bal.length; i++ ){
				acc_count.push( ' ( account_income = '+needed_bal[i]+' ) ' );
			}
			acc_count = acc_count.join('OR');
			zenMoney.sql.db.transaction(function(tx){
				var sum = {};
				var out = {};
				for( var i = 0; i < needed_bal.length; i++ ){
					sum[needed_bal[i]] = 0;
					out[needed_bal[i]] = 0;
				}
				tx.executeSql('SELECT account_income as account, SUM(income) AS sum FROM transactions WHERE ('+acc_count+') AND ( deleted = 0 ) GROUP BY account;', [], function(tx, res){
					for( var i = 0; i < res.rows.length; i++ ) {
						var acc = res.rows.item(i)['account'];
						sum[acc] = parseFloat( res.rows.item(i)['sum'] );
					}
					acc_count = acc_count.replace(/account_income/g, 'account_outcome');
					
					tx.executeSql('SELECT account_outcome as account, SUM(outcome) AS sum FROM transactions WHERE ('+acc_count+') AND ( deleted = 0 ) GROUP BY account;', [], function(tx, res){
						
						for( var i = 0; i < res.rows.length; i++ ) {
							var acc = res.rows.item(i)['account'];
							out[acc] = parseFloat( res.rows.item(i)['sum'] );
						}
						for( i in sum ){
							var acc = i;
							var type = zenMoney.account.get(acc)['type'];
							if( !Boolean( ['cash', 'checking', 'ccard', 'debt', 'emoney'].indexOf(type)+1 ) ){
								zenMoney.account.balances[acc] = sum[acc] - out[acc];
							}else{
								zenMoney.account.balances[acc] = sum[acc] - out[acc] + zenMoney.account.get(acc)['sum'];
							}
						}
						
						var output = {};
						for( var i = 0; i < id.length; i++ ){
							if( zenMoney.account.get(id[i])['type'] != 'debt' ){
								output[ id[i] ] = zenMoney.account.balances[ id[i] ];
							}
						}
						callback( output );
						/*
						out = parseFloat( res.rows.item(0)['sum'] );
						if( isNaN(out) ) out=0;
						var type = zenMoney.account.get(id)['type'];
						if( !Boolean( ['cash', 'checking', 'ccard', 'debt', 'emoney'].indexOf(type)+1 ) ){
							zenMoney.account.balances[id] = sum - out;
						}else{
						        zenMoney.account.balances[id] = sum - out + zenMoney.account.get(id)['sum'];
						}
						callback( zenMoney.account.balances[id] );
						*/
					}, function(tx, res){
						callback( 0 );
					});
					/*
					sum = parseFloat( res.rows.item(0)['sum'] );
					if( isNaN(sum) ) sum=0;
					tx.executeSql('SELECT SUM(outcome) AS sum FROM transactions WHERE ( account_outcome = ? ) AND ( deleted = 0 );', [id], function(tx, res){
						out = parseFloat( res.rows.item(0)['sum'] );
						if( isNaN(out) ) out=0;
						var type = zenMoney.account.get(id)['type'];
						if( !Boolean( ['cash', 'checking', 'ccard', 'debt', 'emoney'].indexOf(type)+1 ) ){
							zenMoney.account.balances[id] = sum - out;
						}else{
						        zenMoney.account.balances[id] = sum - out + zenMoney.account.get(id)['sum'];
						}
						callback( zenMoney.account.balances[id] );
					}, function(tx, res){
						callback( 0 );
					});
					*/
				}, function(tx, res){
					callback( 0 );
				});
			});
		}
	}else{
		if( !zenMoney.account.balances[id] ){
			var sum = 0;
			var out = 0;
			if( zenMoney.account.get(id)['type'] != 'debt' ){
				zenMoney.sql.db.transaction(function(tx){
					tx.executeSql('SELECT SUM(income) AS sum FROM transactions WHERE ( account_income = ? ) AND ( deleted = 0 );', [id], function(tx, res){
						sum = parseFloat( res.rows.item(0)['sum'] );
						if( isNaN(sum) ) sum=0;
						tx.executeSql('SELECT SUM(outcome) AS sum FROM transactions WHERE ( account_outcome = ? ) AND ( deleted = 0 );', [id], function(tx, res){
							out = parseFloat( res.rows.item(0)['sum'] );
							if( isNaN(out) ) out=0;
							var type = zenMoney.account.get(id)['type'];
							if( !Boolean( ['cash', 'checking', 'ccard', 'debt', 'emoney'].indexOf(type)+1 ) ){
								zenMoney.account.balances[id] = sum - out;
							}else{
							        zenMoney.account.balances[id] = sum - out + zenMoney.account.get(id)['sum'];
							}
							callback( zenMoney.account.balances[id] );
						}, function(tx, res){
							callback( 0 );
						});
					}, function(tx, res){
						callback( 0 );
					});
				});
			}else{
				var insts = zenMoney.instrument.get();
				var usr = zenMoney.user.get();
				zenMoney.sql.db.transaction(function(tx){
					tx.executeSql('SELECT SUM(income) AS sum, instrument_outcome FROM transactions WHERE ( account_income = ? ) AND ( deleted = 0 ) GROUP BY instrument_outcome;', [id], function(tx, res){
						for( var i = 0; i < res.rows.length; i++ ) {
							sum += parseFloat( res.rows.item(i)['sum'] ) * (insts[ res.rows.item(i)['instrument_outcome'] ].value / insts[ res.rows.item(i)['instrument_outcome'] ].multiplier) / (insts[ usr['currency'] ].value / insts[ usr['currency'] ].multiplier);
							if( isNaN(sum) ) sum=0;
						}
						tx.executeSql('SELECT SUM(outcome) AS sum, instrument_income FROM transactions WHERE ( account_outcome = ? ) AND ( deleted = 0 ) GROUP BY instrument_income;', [id], function(tx, res){
							for( var i = 0; i < res.rows.length; i++ ) {
								out += parseFloat( res.rows.item(i)['sum'] ) * (insts[ res.rows.item(i)['instrument_income'] ].value / insts[ res.rows.item(i)['instrument_income'] ].multiplier) / (insts[ usr['currency'] ].value / insts[ usr['currency'] ].multiplier);
								if( isNaN(out) ) out=0;
							}
							zenMoney.account.balances[id] = sum - out
							callback( zenMoney.account.balances[id] );
						}, function(tx, res){
							callback( 0 );
						});
					}, function(tx, res){
						callback( 0 );
					});
				});
			}
		}else{
			callback(zenMoney.account.balances[id]);
		}
	}
}