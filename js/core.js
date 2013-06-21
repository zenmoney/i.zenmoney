/* События */
EVENTS = {};
if ('ontouchstart' in window) {
    EVENTS.touchstart = 'touchstart';
    EVENTS.touchend = 'touchend';
    EVENTS.touchmove = 'touchmove';
} else {
    EVENTS.touchstart = 'mousedown';
    EVENTS.touchend = 'mouseup';
    EVENTS.touchmove = 'mousemove';
}
/* События */

zm = {};
zenMoney = zm;
zm.fixed = false;
zm.console = {}
zm.console.link_tpl = 'mailto:support@zenmoney.ru?subject=iVersion loading log&body=';
zm.console.cache = '';
zm.console.log = function (msg) {
    try {
        if (typeof zm.console.body == 'undefined') {
            zm.console.body = document.getElementById('console_body');
            zm.console.link = document.getElementById('console_link');
            zm.console.time = new Date().getTime();
        }
        var div = document.createElement('div');
        var time = Number(( new Date().getTime() - zm.console.time ) / 1000).toFixed(3);
        var text = document.createTextNode(time + ') ' + msg);
        zm.console.cache += time + ') ' + msg + " \r\n";
        zm.console.link.setAttribute('action', zm.console.link_tpl + zm.console.cache);
        div.appendChild(text);
        zm.console.body.appendChild(div);
    } catch (ex) {

    }
}
zm.timezone = ( new Date().getTimezoneOffset() + 180 ) * 60000;
zm.types = function (type) {
    var types = {
        'cash':'Наличные',
        'checking':'Банковские счета',
        'ccard':'Кредитные карты',
        'loan':'Кредиты',
        'virtual_loan':'Виртуальные кредиты',
        'deposit':'Депозиты',
        'virtual_deposit':'Виртуальные депозиты',
        'debt':'Долги',
        'uit':'ПИФы',
        'emoney':'Электронные деньги'
    }
    if (typeof types[type] == 'undefined') {
        return '';
    } else {
        return types[type];
    }
}

zm.df = '%d.%m.%Y';
zm.sql = {};
zm.sql.db = undefined;
zm.sql.newdb = function (callback) {
    zm.console.log('core: new db');
    var script = document.createElement('script');
    script.setAttribute('src', 'database/download.php');
    script.onload = function () {
        zm.console.log('core: database onload');
        defaultSQLtransaction(callback);
    }
    document.body.appendChild(script);
}

zm.sql.checkVersion = function (callback) {
    zm.console.log('core: checkVersion db_ver = ' + localStorage['db_ver']+ ' (actual: '+window.actualDB+')');
    if (localStorage['db_ver'] < 1) {
        zm.sql.db.transaction(function (tx) {
            zm.console.log('core: UPDATE transactions date');
            tx.executeSql("UPDATE transactions SET date = strftime('%Y-%m-%d', datetime( round( date / 1000 ), 'unixepoch')) WHERE strftime('%Y-%m-%d', datetime( round( date / 1000 ), 'unixepoch')) > '1970-01-01';", [], function () {
                zm.console.log('core: UPDATE transactions date - done');
                localStorage['db_ver'] = 1;

                zm.sql.checkVersion(callback);
            }, function () {
                zm.console.log('core: UPDATE transactions date - fail');
                alert('Не удалось обновить БД до версии 1!');
            });
        });
        return false;
    }

    if (typeof window.actualDB == 'undefined' && window.navigator.onLine) {
        zm.console.log('core: check db');
        var script = document.createElement('script');
        script.setAttribute('src', 'database/download.php');
        script.onload = function () {
            zm.sql.checkVersion(callback)
        };
        document.body.appendChild(script);
        return;
    }

    if (window.actualAppHash != localStorage['appHash']) {
        localStorage['appHash'] = window.actualAppHash;
        zenMoney.cacheupdate();
        return;
    }

    if (localStorage['db_ver'] < window.actualDB) {

        for (var v in window.dbPatch) {
//            console.log('patching db to version', v);
            if (v <= localStorage['db_ver']) continue;

            var patch = function (cb, ver) {
//                cb(true);
//                return;
                console.log('+patching db to version', v);
                zenMoney.sql.db.transaction(function(tx) {
                    patchDb(tx, window.dbPatch[ver][0], window.dbPatch[ver][1]);
                }, function() {
                    console.log('Database Patch failed', arguments);
                    if (localStorage['db_version'] == 2) {
                        localStorage['db_ver'] = 2;
                        delete localStorage['db_version'];
                        window.location.reload;
                    }
                    cb(false);
                }, function() {
                    console.log('patch ok');
                    cb(true);
                });
            }
            patch(function (result) {
                if (!result) {
                    alert('Не удалось обновить базу данных до версии ' + v);
                } else {
                    localStorage['db_ver'] = v;

                    zenMoney.sql.checkVersion(callback);
                }
                return false;
            }, v);
            break;
        };
        return false;
    } else {
        try {
            zm.sql.db.transaction(function (tx) {
                tx.executeSql("ALTER TABLE accounts ADD transactions_date_avg REAL;");
            }, []);
        } catch (ex) {

        }
        /* Must delete !!! */
        zm.console.log('core: checkVersion - done');

        zm.prepare.init(callback);
    }
    /* Must delete !!! */
}
zm.sql.connect = function (callback, errorCallback) {
    if (typeof localStorage['db_ver'] == 'undefined') localStorage['db_ver'] = 0;
    zm.console.log('core: db_ver = ' + localStorage['db_ver'] + ', diff = ' + localStorage['diff']);
    zm.sql.db = false;
    try {
        zm.sql.db = openDatabase('zenmoney', '', 'zenmoney.ru local database', 1 * 1024 * 1024, function (db) {
            zm.console.log('core: openDatabase new');
            /*
             zm.sql.newdb(function(){ zm.prepare.init(callback); });
             localStorage['diff'] = 0;
             localStorage['db_ver'] = 1;
             */
        }, function () {
            zm.console.log('core: openDatabase old');

        });
    } catch (ex) {
        zm.sql.db = false;
    }
    if (zm.sql.db) {
        try {
            zm.console.log('core: sql.db = true');
            zm.sql.db.transaction(function (tx) {
                tx.executeSql('SELECT * FROM transactions LIMIT 1;', [], function () {

                    zm.sql.checkVersion(callback);
                }, function () {

                    zm.sql.newdb(function () {
                        zm.prepare.init(callback);
                    });
                    localStorage['diff'] = 0;
                    localStorage['db_ver'] = 1;
                });
            });
        } catch (ex) {

        }
        return true;
    } else {
        errorCallback('Невозможно подключиться к базе данных.');
        return false;
    }
}
zm.prepare = {};
zm.prepare.log = {
    user:false,
    account:false,
    category:false,
    instrument:false,
    tag:false
}
zm.prepare.init = function (callback) {
    zm.console.log('core: prepare.init');
    for (var i in zm.prepare.log) {
        zm.prepare.log[i] = false;
    }
    zm.sql.db.transaction(function (tx) {
        zm.user.init(tx, function () {
            zm.prepare.call('user', callback);
        });
        zm.account.init(tx, function () {
            zm.prepare.call('account', callback);
        });
        zm.category.init(tx, function () {
            zm.prepare.call('category', callback);
        });
        zm.instrument.init(tx, function () {
            zm.prepare.call('instrument', callback);
        });
        zm.tag.init(tx, function () {
            zm.prepare.call('tag', callback);
        });
    });
}

zm.prepare.call = function (type, callback) {
    zm.console.log('core: prepare.call ' + type);
    zm.prepare.log[type] = true;
    var done = true;
    for (var i in zm.prepare.log) {
        if (!zm.prepare.log[i]) done = false;
    }
    if (done) {
        zm.console.log('core: Ядро инициализировано');
        zm.alert.init();
        if (callback) callback();
    }
}

/*	Transaction
 *	id					(int)
 *	server_id			(int)
 *	
 *	country				(int)
 *	city				(int)
 *	currency			(int)
 *	login				(text)
 *	password			(text)
 *	created				(date)
 *	touch				(float) 20.4
 *	wizard				(float) 20.4
 *	partner				(int)
 *	start_page			(int)
 *	
 *	deleted				(float)
 *	edited				(float)
 */
zm.user = {};

/*	Transaction
 *	id					(int)
 *	server_id			(int)
 *	
 *	account_outcome		(int)
 *	account_income		(int)
 *	category			(int)
 *	comment				(text)
 *	payee				(text)
 *	date				(date)
 *	income				(float) 20.4
 *	outcome				(float) 20.4
 *	instrument_income	(int)
 *	instrument_outcome	(int)
 *	
 *	reminder			(int)
 *	deleted				(float)
 *	edited				(float)
 *	is_processed		(float)
 */
zm.transaction = {};

/*	Reminder (!!! ОБНОВИ !!!)
 CREATE TABLE reminder_new
 (
 id serial NOT NULL,
 "user" integer NOT NULL,
 date_start date NOT NULL DEFAULT now(),
 date_end date,
 "interval" date_interval NOT NULL DEFAULT 'day'::date_interval,
 chain_length integer NOT NULL DEFAULT 1,
 chain_bans integer[] NOT NULL DEFAULT '{}'::integer[],
 account_income integer NOT NULL,
 account_outcome integer NOT NULL,
 income numeric(20,4) NOT NULL DEFAULT 0,
 outcome numeric(20,4) NOT NULL DEFAULT 0,
 category integer NOT NULL DEFAULT 0,
 payee character varying(50),
 "comment" character varying(300),
 instrument_income integer NOT NULL,
 instrument_outcome integer NOT NULL,
 changed timestamp without time zone,
 CONSTRAINT reminder_new_id_pkey PRIMARY KEY (id)
 )
 *	id					(int)
 *	server_id			(int)
 *	
 *	account_outcome		(int)
 *	account_income		(int)
 *	category			(int)
 *	comment				(text)
 *	payee				(text)
 *	income				(float) 20.4
 *	outcome				(float) 20.4
 *	instrument_income	(int)
 *	instrument_outcome	(int)
 *	
 *	date_start			(date)
 *	date_end			(date)
 *	frequency			(ind) 0 - без повторений, 1 - ежедневно, 2 - еженедельно, 3 - ежемесячно, 4 - ежегодно 
 *	period				(ind) каждые N frequency
 *	endless				(bool) true - бесконечное
 *	weekday				(ind) 1 - понедельник, 7 - воскресение
 *	
 *	deleted				(float)
 *	edited				(float)
 */
zm.reminder = {};

/*	Category
 *	id					(int)
 *	server_id			(int)
 *	
 *	title				(text)
 *	type				(int) -1 - Расходная, 1 - Доходная
 *	transfer			(bool) true - Перевод
 *	
 *	deleted				(float)
 *	edited				(float)
 */
zm.category = {};

/*	Instrument
 *	id					(int)
 *	server_id			(int)
 *	
 *	title				(text)
 *	title_short			(int) -1 - Расходная, 1 - Доходная
 *	symbol				(text)
 *	value				(float) 10.4 курс по отношению к рублю * multiplier
 *	multiplier			(integer) рублей за 1 валюту
 *	type				(text) 'currency' - валюта, все остальное - пифы
 *	issuer				(integer) id компании выпускающей валюту
 *	converts			(integer) id валюты в которую конвертируются пифы
 *	
 *	deleted				(float)
 *	edited				(float)
 */
zm.instrument = {};


/*	User
 *	id					(int)
 *	server_id			(int)
 *	
 *	country				(int)
 *	city				(int)
 *	currency			(int)
 *	login				(text)
 *	password			(text)
 *	created				(date) дата регистрации
 *	touch				(date) дата последнего входа
 *	wizard				(bool) выводить ли на обзоре помощника
 *	partner				(text) ключ партнера
 *	start_page			(int) []
 *	
 *	deleted				(float)
 *	edited				(float)
 */

// Transactions core

zm.transaction.linkTagGroups = function (tx, tid, groups, onOk, onFail) {

    if (groups === null || groups.length == 0) {
        if (onOk) {
            onOk();
        }
        return;
    }
    sql = 'UPDATE transaction_tag SET deleted = 1, diff = strftime("%s") WHERE `transaction` = ' + tid + ' AND tag_group NOT IN (' + groups.join(',') + ');';

    tx.executeSql(sql, [], function () {
        sql = 'SELECT tag_group FROM transaction_tag WHERE coalesce(deleted, 0) = 0 AND `transaction` = ' + tid;

        tx.executeSql(sql, [], function (tx, result) {

            var existing = {};
            for (i = 0; i < result.rows.length; i++) {

                existing[result.rows.item(i).tag_group] = true;
            }
            sql = [];
            for (i = 0; i < groups.length; i++) {
                id = groups[i];

                if (existing[id]) continue;

                sql.push('INSERT INTO transaction_tag (`transaction`, tag_group, tag0, tag1, tag2, created, edited, `order`, diff) ' +
                    ' SELECT ' + tid + ', id, tag0, tag1, tag2, 1, 1, '+i+', strftime("%s") FROM tag_group WHERE id = ' + id);
            }

            if (sql.length) {

                var asyncCounter = sql.length;
                for (i = 0; i < sql.length; i++) {
                    tx.executeSql(sql[i], [], function (tx, tres) {
                        if ((--asyncCounter <= 0)) {
                            zenMoney.tag.init(tx, function () {
                                if (onOk) onOk();
                            });
                        }
                    }, function (tx, err) {

                        if (onFail) {
                            onFail();
                        }
                    });
                }
            } else {
                if (onOk) {
                    onOk();
                }
            }
        }, function (tx, err) {

            if (onFail) {
                onFail();
            }
        });
    })

}
zm.transaction.makeGroups = function (tx, tags, tranType, onOk, onFail) {
    income = tranType > 0;
    outcome = tranType < 0;
    asyncCounter = tags.length;
    var groups = [];
    if (!asyncCounter) {
        if (onOk)
            onOk(groups);
        return;
    }
    for (i = 0; i < tags.length; i++) {

        tag = tags[i];
        // searching for tag_group

        tx.executeSql('SELECT ' + i + ' as tagid, (SELECT id FROM tag_group WHERE tag0 = ? AND tag1 IS NULL AND tag2 IS NULL AND coalesce(deleted, 0) != 1) as id', [tag], function (tx, res) {
            if (res.rows.item(0).id) {
                groups.push(res.rows.item(0).id);
                if (--asyncCounter <= 0) {
                    onOk(groups);
                    return;
                }
            } else {
                var tagid = res.rows.item(0).tagid;
                var tag = tags[tagid];
                tx.executeSql('INSERT INTO tag_group (tag0, created, edited, diff, show_income, show_outcome) VALUES (?, 1, 1, strftime("%s"), ?, ?)', [tag, income, outcome], function (tx, res) {

                    groups.push(res.insertId);
                    if (--asyncCounter <= 0) {
                        onOk(groups);
                        return;
                    }
                }, function (tx, err) {

                    if (onFail) onFail(groups);
                    return;
                });
            }
        }, function (tx, err) {
            if (onFail)
                onFail();
            return;
        });
    }
}
zm.transaction.processNewTags = function (tx, tags, onOk, onFail) {
    ids = [];
    titles = [];
    var ret = [];
    if (!tags) return onOk(ret);
    for (l = 0; l < tags.length; l++) {
        if (tags[l] === null) continue;
        if (parseInt(tags[l]) == tags[l])
            ids.push(tags[l]);
        else
            titles.push(tags[l]);
    }


    tx.executeSql('SELECT title, tag.id, tag_group.id as `group` FROM tag LEFT JOIN tag_group ON tag_group.tag0 = tag.id AND tag1 IS NULL AND coalesce(tag_group.deleted, 0) != 1 ' +
        'WHERE title IN ("' + titles.join('", "') + '") OR tag.id IN (' + ids.join(',') + ') AND coalesce(tag.deleted, 0) != 1'
        , [], function (tx, res) {
            for (i = 0; i < res.rows.length; i++) {
                var obj = res.rows.item(i);
                ret.push(parseInt(obj.id));
                if (tags.indexOf(obj.id) > -1) tags[tags.indexOf(obj.id)] = null;
                if (tags.indexOf(obj.title) > -1) tags[tags.indexOf(obj.title)] = null;
            }
            // inserting new tags
            asyncCounter = tags.length;
            if (!asyncCounter) {
                if (onOk) return onOk(ret);
            }
            for (i = 0; i < tags.length; i++) {
                if (parseInt(tags[i]) == tags[i]) {
                    ret.push(tags[i]);
                    if (--asyncCounter <= 0) {
                        if (onOk)
                            onOk(ret);
                        return;
                    }
                    continue;
                }
                if (tags[i] === null) {
                    if (--asyncCounter <= 0) {
                        if (onOk)
                            onOk(ret);
                        return;
                    }
                    continue;
                }
                data = [tags[i]];
                tx.executeSql('INSERT INTO tag (title, created, edited, diff) VALUES (?, 1, 1, strftime("%s"))', data, function (tx, res) {
                    ret.push(res.insertId);
                    if (--asyncCounter <= 0) {
                        if (onOk)
                            onOk(ret);
                    }
                }, function (tx, error) {

                    if (onFail) onFail();
                })
            }
        }, function (tx, err) {

            if (onFail) onFail();
        });
}
// Add new transaction
zm.transaction.prepare = function (options) {
    var prepare_data = [];
    String(options.sum).replace(/[^\d\.,]/g, '').replace(/,/g, '.');
    options.sum = parseFloat(options.sum);
    String(options.sum_transfer).replace(/[^\d\.,]/g, '').replace(/,/g, '.');
    options.sum_transfer = parseFloat(options.sum_transfer);

    if (!isNaN(options.sum) && options.sum != 0) {
        switch (options.type) {
            case '-1':
            case -1:
                prepare_data[0] = options.account;  // account_outcome
                prepare_data[1] = options.account;	// account_income
                prepare_data[6] = 0;				// income
                prepare_data[7] = options.sum;		// outcome
                prepare_data[8] = zm.account.cache[options.account].instrument;				// instrument_income
                prepare_data[9] = zm.account.cache[options.account].instrument;				// instrument_outcome
                options.sum_transfer = 0;
                break;
            case '0':
            case 0:
                prepare_data[0] = options.account;	// account_outcome
                prepare_data[1] = options.account_transfer;	// account_income
                prepare_data[6] = options.sum_transfer;		// income
                prepare_data[7] = options.sum;		// outcome
                prepare_data[8] = zm.account.cache[options.account_transfer].instrument;		// instrument_income
                prepare_data[9] = zm.account.cache[options.account].instrument;				// instrument_outcome

                if (isNaN(options.sum_transfer) || options.sum_transfer == 0) {
                    return false;
                }
                if (( zm.account.cache[options.account].type == 'debt' || zm.account.cache[options.account_transfer].type == 'debt' ) && ( options.payee == '' )) {
                    return false;
                }
                break;
            case '1':
            case 1:
                prepare_data[0] = options.account;	// account_outcome
                prepare_data[1] = options.account;	// account_income
                prepare_data[6] = options.sum;		// income
                prepare_data[7] = 0;				// outcome
                prepare_data[8] = zm.account.cache[options.account].instrument;				// instrument_income
                prepare_data[9] = zm.account.cache[options.account].instrument;				// instrument_outcome
                options.sum_transfer = 0;
                break;
        }
        prepare_data[2] = (options.category) ? options.category : 0; // category
        prepare_data[3] = options.comment; // comment
        prepare_data[4] = options.payee; // payee
        prepare_data[5] = options.date.toFormat('%Y-%m-%d'); // date
        return prepare_data;
    } else {
        return false;
    }
}
zm.transaction.add = function (options, callback) {
    // Дата должна передаваться объектом JavaScript!
    var prepare_data = zm.transaction.prepare(options);
    if (prepare_data) {
        prepare_data.push(new Date().getTime()); // created
        zm.sql.db.transaction(function (tx) {
            tx.executeSql('INSERT INTO transactions (account_outcome, account_income, category, comment, payee, date, income, outcome, instrument_income, instrument_outcome, reminder, deleted, edited, is_processed, diff, created) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, 1, 0, strftime("%s"), ?);', prepare_data, function (tx, res) {
                options.id = insertId = res.insertId;
                /* Сброс балансов */
                zm.account.balances = {};
                /* Сброс балансов */
                /* Сохранение тегов */
                /* теги */
                zm.transaction.processNewTags(tx, options.tags.tags, function (tags) {
                    console.log('NEW TAGS PROCESSED');
                    zm.transaction.makeGroups(tx, tags, options.type, function (groups) {
                        console.log('GROUPS MAKED');
                        if (options.tags.tag_groups)
                            groups = $.unique(groups.concat(options.tags.tag_groups));

                        zm.transaction.linkTagGroups(tx, options.id, groups, function () {
                            console.log('GROUPS LINKED');
                            zm.transaction.orderTagGroups(tx, options.id, options.tags.tag_groups, function() {
                                console.log('GROUPS ORDERED');
                                options.result = true;
                                if (callback) callback(options);
                            })
                        }, function () {
                            console.log('GROUPS NOT ORDERED');
                            options.result = false;
                            if (callback) callback(options);
                        });
                    })
                })
                /* теги */
            }, function () {
                if (callback) {
                    console.log('NEW TAGS NOT PROCESSED');
                    callback({
                        result:false
                    });
                }
            });
        });
    } else {
        callback({
            result:false
        });
    }
}

zm.transaction.orderTagGroups = function(tx, id, groups, cb) {
    var asyncCounter = groups.length;
    if (groups.length == 0) {
        cb(); return;
    }
    for(var i=0;i<groups.length;i++) {
        console.log('Updating order:', i, id, groups[i]);
        tx.executeSql('UPDATE transaction_tag SET `order` = ?, diff = strftime("%s") WHERE `transaction` = ? AND tag_group = ?', [i, id, groups[i]], function() {
            if (--asyncCounter < 1)
                cb();
        });
    }
}

// Edit transaction
zm.transaction.edit = function (options, callback) {
    var prepare_data = zm.transaction.prepare(options);
    if (prepare_data) {
        prepare_data.push(options.id); // id
        zm.sql.db.transaction(function (tx) {
            tx.executeSql('UPDATE transactions SET account_outcome=?, account_income=?, category=?, comment=?, payee=?, date=?, income=?, outcome=?, instrument_income=?, instrument_outcome=?, reminder=0, deleted=0, edited=1, is_processed=0, diff=strftime("%s") WHERE id=?;', prepare_data, function (tx, res) {
                /* Сброс балансов */
                zm.account.balances = {};
                /* Сброс балансов */
                /* теги */
                sql = 'UPDATE transaction_tag SET deleted = 1, edited = 1, diff = strftime("%s") WHERE `transaction` = ' + options.id;
                if (options.tags.tag_groups.length > 0 && options.type);
                    sql += ' AND id NOT IN (' + options.tags.tag_groups.join(',') + ')';

                tx.executeSql(sql, [], function () {
                    if (!options.type) {
                        options.result=true;
                        if (callback) callback(options);
                    }
                    zm.transaction.processNewTags(tx, options.tags.tags, function (tags) {

                        zm.transaction.makeGroups(tx, tags, options.type, function (groups) {

                            if (options.tags.tag_groups)
                                groups = $.unique(groups.concat(options.tags.tag_groups));

                            zm.transaction.linkTagGroups(tx, options.id, groups, function () {
                                zm.transaction.orderTagGroups(tx, options.id, options.tags.tag_groups, function() {
                                    options.result = true;

                                    if (callback) callback(options);
                                });
                            }, function () {
                                options.result = false;
                                if (callback) callback(options);
                            });
                        })
                    })
                }, function () {

                    options.result = false;
                    if (callback) callback(options);
                });
                /* теги */
            }, function () {
                if (callback) {
                    callback({
                        result:false
                    });
                }
            });
        }, function () {
            if (callback) {
                callback({
                    result:false
                });
            }
        });
    } else {
        callback({
            result:false
        });
    }
}

// Саджест для тегов
/*
zm.transaction.getSuggestedTags = function (options) {
    zm.sql.db.transaction(function (tx) {
        var sql_out = '', sql_params = [];
        var sum_field = options.type == 1 ? 'income' : 'outcome';
        if (options.sum) {
            sql_out = 'SELECT tag_group, AVG(ABS(' + sum_field + ' - ?)) proximity FROM transactions '
                    + 'WHERE ' + sum_field + ' > ? OR ' + sum_field + ' < ? AND tag_group IS NOT NULL '
                    + 'ORDER BY proximity ASC LIMIT 5';
            sql_params.push(options.sum);
            sql_params.push(options.sum * .9);
            sql_params.push(options.sum * 1.1);
        } else {
            sql_out = 'SELECT tag_group, COUNT(tag_group) cnt FROM transactions '
                    + 'WHERE ' + sum_field + ' <> 0 AND tag_group IS NOT NULL '
                    + 'GROUP BY cnt ';
                    + 'ORDER BY cnt DESC LIMIT 5';
        }
        tx.executeSql(sql_out, sql_params, function (tx, result) {
            var output = [];
            for (var i = 0; i < result.length; i++) {
                var tmp = {
                    tag_group: result.row.item(i)['tag_group']
                };
                output = output.push(tmp);
            }
            if (callback) {
                callback(output);
            }
        });
    }, function () {
            if (callback) {
                callback(false);
            }
    });
}
*/
// Get transaction(s)
zm.transaction.get = {};
// Get one transaction by id
zm.transaction.get.one = function (options) {

}
// Get list transactions by date(from|to) by num(from|to)
zm.transaction.get.list = function (options, callback) {
    zm.sql.db.transaction(function (tx) {
        if (!options.skip) options.skip = 0;
        if (!options.limit) options.limit = 30;
        if (!options.account) options.account = zm.account.sort;
        var accs_left = ' AND ( ';
        var accs = '';
        var params_arr = [];
        var accs_right = ' )'
        for (var i = 0; i < options.account.length; i++) {
            accs += ' ( account_income = ? OR account_outcome = ? ) ';
            if (i != options.account.length - 1) {
                accs += 'OR';
            }
            params_arr.push(options.account[i]);
            params_arr.push(options.account[i]);
        }
        if (options.account.length != 0) {
            accs = accs_left + accs + accs_right;
        }
        var sql_out = 'SELECT *, coalesce((SElECT group_concat(tag_group) FROM (SELECT tag_group FROM transaction_tag WHERE `transaction` = transactions.id AND coalesce(transaction_tag.deleted, 0) != 1 ORDER BY transaction_tag.`order`) as d), "") as tag_groups FROM transactions ' +
            'WHERE deleted = 0' + accs + ' ORDER BY date DESC, id ASC LIMIT ' + options.skip + ', ' + options.limit;
        tx.executeSql(sql_out, params_arr, function (tx, result) {
            var output = [];
            for (var i = 0; i < result.rows.length; i++) {
                var id = result.rows.item(i)['id'];
                var tmp = {
                    id:id,
                    server_id:result.rows.item(i)['server_id'],
                    category:result.rows.item(i)['category'],
                    comment:result.rows.item(i)['comment'],
                    payee:result.rows.item(i)['payee'],
                    date:result.rows.item(i)['date'],
                    tag_groups:String(result.rows.item(i)['tag_groups']).split(',').map(function (e) {
                        return parseInt(e)
                    })
                };
                if (result.rows.item(i)['income'] == 0) {
                    tmp.type = -1;
                    tmp.account = result.rows.item(i)['account_outcome'];
                    tmp.sum = result.rows.item(i)['outcome'];
                    tmp.instrument = result.rows.item(i)['instrument_outcome'];
                } else {
                    if (result.rows.item(i)['outcome'] == 0) {
                        tmp.type = 1;
                        tmp.account = result.rows.item(i)['account_income'];
                        tmp.sum = result.rows.item(i)['income'];
                        tmp.instrument = result.rows.item(i)['instrument_income'];
                    } else {
                        tmp.type = 0;
                        tmp.sum = result.rows.item(i)['outcome'];
                        tmp.sum_transfer = result.rows.item(i)['income'];
                        tmp.account = result.rows.item(i)['account_outcome'];
                        tmp.account_transfer = result.rows.item(i)['account_income'];
                        tmp.instrument = result.rows.item(i)['instrument_outcome'];
                        tmp.instrument_transfer = result.rows.item(i)['instrument_income'];
                    }
                }

                output.push(tmp);
            }
            if (callback) {
                callback(output);
            }
        }, function () {
            console.error('trlist', arguments);
            if (callback) {
                callback(false);
            }
        });
    });
}

// Delete transaction
zm.transaction.del = function (options, callback) {
    if (options.id != '' && options.id != null) {
        var prepare_data = [];
        prepare_data.push(options.id);
        zm.sql.db.transaction(function (tx) {
            tx.executeSql('UPDATE transactions SET deleted=1, edited=1, diff=strftime("%s") WHERE id=?;', prepare_data, function (tx, res) {
                tx.executeSql('UPDATE transaction_tag SET deleted=1, edited=1, diff=strftime("%s") WHERE `transaction` = ?', prepare_data, function (tx, res) {
                    zm.account.balances = {};
                    if (callback) {
                        options.result = true;
                        callback(options);
                    }
                }, function () {
                    if (callback) {
                        callback({
                            result:false
                        });
                    }
                });
            }, function () {
                if (callback) {
                    callback({
                        result:false
                    });
                }
            });
        }, function () {
            if (callback) {
                callback({
                    result:false
                });
            }
        });
    } else {
        callback({
            result:false
        });
    }
}

// Reminders core
// Add new reminder, to DB added chain and all links
zm.reminder.add = function (options) {

}
// Get reminder data
zm.reminder.chain = {};
zm.reminder.link = {};

zm.reminder.chain.get = {};
// Get chain reminder by id and include all links
zm.reminder.chain.get.one = function (options) {

}
// Get list transactions by date(from|to) by num(from|to)
zm.reminder.chain.get.list = function (options) {

}

// Get object instrument
zm.instrument.cache = false;
zm.instrument.sort = [];
zm.instrument.init = function (tx, callback) {
    zm.instrument.cache = {};
    zm.instrument.cache = {};
    zm.instrument.sort = [];
    tx.executeSql('SELECT * FROM instruments;', [], function (tx, result) {
        for (var i = 0; i < result.rows.length; i++) {
            var id = result.rows.item(i)['id'];
            zm.instrument.sort.push(id);
            zm.instrument.cache[ id ] = {};
            zm.instrument.cache[ id ]['id'] = result.rows.item(i)['id'];
            zm.instrument.cache[ id ]['title'] = result.rows.item(i)['title'];
            zm.instrument.cache[ id ]['title_short'] = result.rows.item(i)['title_short'];
            zm.instrument.cache[ id ]['symbol'] = result.rows.item(i)['symbol'];
            zm.instrument.cache[ id ]['value'] = result.rows.item(i)['value'];
            zm.instrument.cache[ id ]['multiplier'] = result.rows.item(i)['multiplier'];
            zm.instrument.cache[ id ]['type'] = result.rows.item(i)['type'];
            zm.instrument.cache[ id ]['issuer'] = result.rows.item(i)['issuer'];
            zm.instrument.cache[ id ]['deleted'] = result.rows.item(i)['deleted'];
            zm.instrument.cache[ id ]['edited'] = result.rows.item(i)['edited'];
        }
        if (callback) callback();
    }, function () {
    }, function () {
        if (callback) callback();
    });
}
zm.instrument.get = function () {
    return zm.instrument.cache;
}

// Get object user
zm.user.cache = false;
zm.user.id = false;
zm.user.init = function (tx, callback) {
    tx.executeSql('SELECT * FROM users;', [], function (tx, result) {
        for (var i = 0; i < result.rows.length; i++) {
            zm.user.cache = {};
            var id = result.rows.item(i)['id'];
            zm.user.cache['id'] = result.rows.item(i)['id'];
            zm.user.cache['server_id'] = result.rows.item(i)['server_id'];
            zm.user.cache['country'] = result.rows.item(i)['country'];
            zm.user.cache['city'] = result.rows.item(i)['city'];
            zm.user.cache['currency'] = result.rows.item(i)['currency'];
            zm.user.cache['login'] = result.rows.item(i)['login'];
            zm.user.cache['password'] = result.rows.item(i)['password'];
            zm.user.cache['created'] = result.rows.item(i)['created'];
            zm.user.cache['touch'] = result.rows.item(i)['touch'];
            zm.user.cache['wizard'] = result.rows.item(i)['wizard'];
            zm.user.cache['partner'] = result.rows.item(i)['partner'];
            zm.user.cache['start_page'] = result.rows.item(i)['start_page'];
            zm.user.cache['deleted'] = result.rows.item(i)['deleted'];
            zm.user.cache['edited'] = result.rows.item(i)['edited'];
        }
        if (callback) callback();
    }, function () {
        if (callback) callback();
    });
    return true;
}
zm.user.add = function (options, callback) {
    options.type = 'cash';
    options.archive = 0;
    options.deleted = 0;
    options.edited = 1;
    options.diff = localStorage['diff'];
    options.created = new Date().getTime() + zm.timezone;
    options.static_id = 18;
    zm.sql.db.transaction(function (tx) {
        tx.executeSql('INSERT INTO users (country,city,currency,created,deleted,edited,diff) VALUES(?,?,?,?,?,?,strftime("%s"));', [options.country, options.city, options.currency, options.created, options.deleted, options.edited], null, null);
        tx.executeSql('INSERT INTO accounts (instrument,title,sum,type,created,archive,deleted,edited,diff,static_id) VALUES(?,?,?,?,?,?,?,?,strftime("%s"),?);', [options.currency, options.title, options.sum, options.type, options.created, options.archive, options.deleted, options.edited, options.static_id], null, null);
    }, function () {
    }, function () {
        zm.sql.db.transaction(function (tx) {
            zm.user.init(tx, function () {
                zm.account.init(tx, callback);
            });
        });
    });
    return true;
}
zm.category.edit = function (options, callback) {
    if (options.title == '' || options.id == '') {
        callback({
            result:false
        });
        return false;
    }

    var prepare_data = [options.title, options.id];
    if (prepare_data) {
        zm.sql.db.transaction(function (tx) {
            tx.executeSql('UPDATE categories SET title=?, diff=strftime("%s"), edited=1 WHERE id=?;', prepare_data, function (tx, res) {
                if (callback) {
                    options.result = true;
                    zm.category.init(function () {
                        callback(options);
                    });
                } else {
                    zm.category.init();
                }
            }, function () {
                if (callback) {
                    callback({
                        result:false
                    });
                }
            });
        });
    } else {
        if (callback) {
            callback({
                result:false
            });
        }
    }
}
zm.user.edit = function (options, callback) {
    if (options.id == '') {
        callback({
            result:false
        });
        return false;
    }

    var prepare_data = [options.country, options.city, options.currency, options.id];
    if (prepare_data) {
        zm.sql.db.transaction(function (tx) {
            tx.executeSql('UPDATE accounts SET instrument=?, edited=1,diff=strftime("%s") WHERE type=\'debt\';', [options.currency], function () {
                for (var i in zm.account.get()) {
                    if (zm.account.get(i)['type'] == 'debt') {
                        zm.account.get(i)['instrument'] = options.currency;
                        zm.account.get(i)['edited'] = 1;
                    }
                }
                tx.executeSql('UPDATE users SET country=?, city=?, currency=?, diff=strftime("%s"), edited=1 WHERE id=?;', prepare_data, function (tx, result) {
                    SINC.shadow();
                    zm.user.init(tx, callback);
                }, null);
            }, function () {
                alert('err');
            });
        }, function () {

        });
    } else {
        if (callback) {
            callback({
                result:false
            });
        }
    }
    return true;
}
zm.user.get = function () {
    return zm.user.cache;
}
zm.cacheupdate = function () {
    try {
        window.applicationCache.swapCache();
    } catch (ex) {

    } finally {

    }
    setTimeout(function () {
        window.location.reload(false);
    }, 100);
}