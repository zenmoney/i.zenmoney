/*
 /*
 *	Использует для работы
 *	google/chrome_ex_oauthsimple.js
 *	google/chrome_ex_oauth.js
 */
SINC = {};
if (window.location.host != 'i.zenmoney.ru') {
    if (window.location.host != 'i.zenmoney')
        SINC.server = 'dev.api.zenmoney.ru';
    else
        SINC.server = 'api.zenmoney';
} else {
    SINC.server = 'api.zenmoney.ru';
}
SINC.callback = window.location.host;
SINC.params = {
    consumerKey:'7c63d85c07f0b34bed0044dd1cb134',
    consumerSecret:'52d7db060e',
    serviceProvider:{
        signatureMethod:'HMAC-SHA1',
        requestTokenURL:'http://' + SINC.server + '/oauth/request_token/',
        userAuthorizationURL:'http://' + SINC.server + '/access/',
        accessTokenURL:'http://' + SINC.server + '/oauth/access_token/',
        echoURL:'http://' + SINC.callback + '/'
    }
}
/*
 * -1  - Свободен
 * 0   - Идет синхронизация, больше запросов небыло
 * 1   - Идет синхронизация, был запрос после начала синхронизации
 */
SINC.process = -1;

SINC.oauth = {};
SINC.oauth.hasToken = function () {
    if (localStorage['oauth_token' + SINC.params.serviceProvider.echoURL] == 'null' || localStorage['oauth_token' + SINC.params.serviceProvider.echoURL] == 'undefined') {
        delete localStorage['oauth_token' + SINC.params.serviceProvider.echoURL];
    }
    if (localStorage['oauth_token_secret' + SINC.params.serviceProvider.echoURL] == 'null' || localStorage['oauth_token_secret' + SINC.params.serviceProvider.echoURL] == 'undefined') {
        delete localStorage['oauth_token_secret' + SINC.params.serviceProvider.echoURL];
    }
    if (localStorage['oauth_token' + SINC.params.serviceProvider.echoURL] && localStorage['oauth_token_secret' + SINC.params.serviceProvider.echoURL]) {
        return true;
    } else {
        return false;
    }
}
SINC.oauth.authorize = function () {
    var accessor = SINC.params;
    var message = {
        method:"post",
        action:accessor.serviceProvider.requestTokenURL,
        parameters:[
            ["scope", 'http://' + SINC.callback + '/']
        ]
    };
    var requestBody = OAuth.formEncode(message.parameters);
    OAuth.completeRequest(message, accessor);
    var authorizationHeader = OAuth.getAuthorizationHeader("", message.parameters);
    var requestToken = new XMLHttpRequest();
    requestToken.onreadystatechange = function receiveRequestToken() {
        if (requestToken.readyState == 4) {
            var results = OAuth.decodeForm(requestToken.responseText);
            localStorage['oauth_token_secret' + SINC.params.serviceProvider.echoURL] = OAuth.getParameter(results, "oauth_token_secret");
            if (OAuth.getParameter(results, "login_url")) {
                window.location.href = OAuth.getParameter(results, "login_url") + '?oauth_token=' + OAuth.getParameter(results, "oauth_token") + '&oauth_callback=' + SINC.params.serviceProvider.echoURL + '&mobile';
            }
        }
    };
    requestToken.open(message.method, message.action, true);
    requestToken.setRequestHeader("Authorization", authorizationHeader);
    requestToken.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    requestToken.send(requestBody);
}
SINC.oauth.complete = function (oauth_token, oauth_verifier) {
    var accessor = SINC.params;
    var message = {
        method:"post",
        action:accessor.serviceProvider.accessTokenURL,
        parameters:{
            oauth_token:oauth_token,
            oauth_verifier:oauth_verifier
        }
    };
    OAuth.completeRequest(message,
        {
            consumerKey:accessor.consumerKey,
            consumerSecret:accessor.consumerSecret,
            tokenSecret:localStorage['oauth_token_secret' + SINC.params.serviceProvider.echoURL]
        });

    var requestAccess = new XMLHttpRequest();
    requestAccess.onreadystatechange = function receiveAccessToken() {
        if (requestAccess.readyState == 4) {
            var results = OAuth.decodeForm(requestAccess.responseText);
            localStorage['oauth_token' + SINC.params.serviceProvider.echoURL] = OAuth.getParameter(results, "oauth_token");
            localStorage['oauth_token_secret' + SINC.params.serviceProvider.echoURL] = OAuth.getParameter(results, "oauth_token_secret");
            if (localStorage['oauth_token' + SINC.params.serviceProvider.echoURL] && localStorage['oauth_token_secret' + SINC.params.serviceProvider.echoURL]) {
                window.location.search = 'firstrun';
                //documentReadyInit();
            } else {
                delete localStorage['oauth_token' + SINC.params.serviceProvider.echoURL];
                delete localStorage['oauth_token_secret' + SINC.params.serviceProvider.echoURL];
                window.location.search = '';
            }
        }
    };
    requestAccess.open(message.method, message.action, true);
    requestAccess.setRequestHeader("Authorization", OAuth.getAuthorizationHeader("", message.parameters));
    requestAccess.send();
}

SINC.vanyasTables = {
    account:'accounts',
    category:'categories',
    city:'citys',
    country:'countries',
    instrument:'instruments',
    transaction:'transactions',
    user:'users'
};


SINC.oauth.sendSignedRequest = function (url, callback, request) {
    var accessor = {
        consumerKey:SINC.params.consumerKey,
        consumerSecret:SINC.params.consumerSecret,
        token:localStorage['oauth_token' + SINC.params.serviceProvider.echoURL],
        tokenSecret:localStorage['oauth_token_secret' + SINC.params.serviceProvider.echoURL]
    };
    var message = {
        action:url,
        method:request.method
    };
    OAuth.completeRequest(message, accessor);
    OAuth.SignatureMethod.sign(message, accessor);

    var requestAccess = new XMLHttpRequest();
    requestAccess.onreadystatechange = function receiveAccessToken() {
        if (requestAccess.readyState == 4) {
            callback(requestAccess.responseText, requestAccess);
        }
    };
    //alert(OAuth.getAuthorizationHeader("", message.parameters));
    requestAccess.open(request.method, url, true);
    requestAccess.setRequestHeader("Authorization", OAuth.getAuthorizationHeader("", message.parameters));
    requestAccess.send(request.body);
}


SINC.accounts = function (diff, tx, callback) {
    if (diff.account.length) {
        /* Синхронизируем счета */
        var accs = diff.account;
        /*
         id INTEGER PRIMARY KEY AUTOINCREMENT,
         server_id INTEGER,
         static_id INTEGER,
         instrument INTEGER,
         title TEXT,
         sum FLOAT,
         type TEXT,
         created INTEGER,
         date_limit INTEGER,
         percent FLOAT,
         payoff_period REAL,
         capitalization REAL,
         date_limit_interval REAL,
         payoff_type REAL,
         email TEXT,
         bank REAL,
         card_system REAL,
         archive BOOLEAN,
         deleted BOOLEAN,
         edited BOOLEAN,
         diff INTEGER
         */
        var accs_by_server = {};
        var accs_by_client = zenMoney.account.get();
        /*

         */
        for (var i in accs_by_client) {
            if (accs_by_client[i].server_id) {
                accs_by_server[ accs_by_client[i].server_id ] = i;
            }
        }
        var prepare_data_a = [];
        for (var i = 0; i < accs.length; i++) {
            var created = undefined;
            try {
                created = parseDate(accs[i].created).getTime();
            } catch (ex) {
                created = 0;
            }
            prepare_data_a[i] = [];
            prepare_data_a[i].push(accs[i].id); 			// 0
            prepare_data_a[i].push(accs[i].static_id);		// 1
            prepare_data_a[i].push(accs[i].instrument);		// 2
            prepare_data_a[i].push(accs[i].title);			// 3
            prepare_data_a[i].push(accs[i].sum);			// 4
            prepare_data_a[i].push(accs[i].type);			// 5
            prepare_data_a[i].push(created);				// 6
            prepare_data_a[i].push(accs[i].date_limit);		// 7
            prepare_data_a[i].push(accs[i].payoff_type);	// 8
            prepare_data_a[i].push(accs[i].email);			// 9
            prepare_data_a[i].push(accs[i].bank);			// 10
            prepare_data_a[i].push(accs[i].card_system);	// 11
            prepare_data_a[i].push(accs[i].archive);		// 12
            prepare_data_a[i].push(0);	// 13
            if (accs[i].client_id) {
                if (typeof accs_by_client[ accs[i].client_id ] != 'undefined') {
                    prepare_data_a[i].push(accs[i].client_id);	// 14
                }
            }
        }
        var asyncCounter = accs.length;
        for (var i = 0; i < accs.length; i++) {
            if (!accs_by_server[accs[i].id]) {
                if (zenMoney.account.cache[ accs[i].client_id ]) {
                    tx.executeSql('UPDATE accounts SET server_id=?, static_id=?, instrument=?, title=?, sum=?, type=?, created=?, date_limit=?, payoff_type=?, email=?, bank=?, card_system=?, archive=?, deleted=0, edited=0, diff=? WHERE id=?;', prepare_data_a[i], function () {
                        asyncCounter--;
                        if (asyncCounter <= 0) zenMoney.account.init(tx, callback);
                    }, function () {
                    });
                } else {
                    tx.executeSql('INSERT INTO accounts (server_id, static_id, instrument, title, sum, type, created, date_limit, payoff_type, email, bank, card_system, archive, deleted, edited, diff) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, ?);', prepare_data_a[i], function () {
                        asyncCounter--;
                        if (asyncCounter <= 0) zenMoney.account.init(tx, callback);
                    }, function () {
                    });
                }
            } else {
                prepare_data_a[i][14] = accs[i].id;
                tx.executeSql('UPDATE accounts SET server_id=?, static_id=?, instrument=?, title=?, sum=?, type=?, created=?, date_limit=?, payoff_type=?, email=?, bank=?, card_system=?, archive=?, deleted=0, edited=0, diff=? WHERE server_id=?;', prepare_data_a[i], function () {
                    asyncCounter--;
                    if (asyncCounter <= 0) zenMoney.account.init(tx, callback);
                }, function () {
                });
            }
        }

    } else if (callback) {
        callback();
    }
}
SINC.categorys = function (diff, tx, callback) {
    if (diff.category.length) {
        zenMoney.account.links = {};
        var accs = zenMoney.account.get();
        for (var i in accs) {
            zenMoney.account.links[accs[i]['server_id']] = i;
        }
        /* Синхронизируем категории */
        var cats = diff.category;
        /*
         server_id INTEGER,
         static_id INTEGER,
         title TEXT,
         type INTEGER,
         transfer BOOLEAN,
         deleted BOOLEAN,
         edited BOOLEAN,
         created INTEGER,
         diff
         */
        var cats_by_server = {};
        var cats_by_client = zenMoney.category.get();
        for (var i in cats_by_client[1]) {
            if (cats_by_client[1][i].server_id) {
                cats_by_server[ cats_by_client[1][i].server_id ] = i;
            }
        }
        for (var i in cats_by_client[-1]) {
            if (cats_by_client[-1][i].server_id) {
                cats_by_server[ cats_by_client[-1][i].server_id ] = i;
            }
        }
        var prepare_data_c = [];
        for (var i = 0; i < cats.length; i++) {
            var created = undefined;
            try {
                created = parseDate(cats[i].created).getTime();
            } catch (ex) {
                created = 0;
            }
            prepare_data_c[i] = [];
            prepare_data_c[i].push(cats[i].id); 			// 0
            prepare_data_c[i].push(cats[i].static_id);		// 1
            prepare_data_c[i].push(cats[i].title);			// 2
            prepare_data_c[i].push(cats[i].type);			// 3
            prepare_data_c[i].push(cats[i].transfer);		// 4
            prepare_data_c[i].push(created);		// 5
            prepare_data_c[i].push(0);	// 6
            if (cats[i].client_id) {
                prepare_data_c[i].push(cats[i].client_id);	// 7
            }
        }
        
        var asyncCounter = cats.length;
        for (var i = 0; i < cats.length; i++) {
            if (!cats_by_server[cats[i].id]) {
                if (cats[i].client_id) {
                    tx.executeSql('UPDATE categories SET server_id=?, static_id=?, title=?, type=?, transfer=?, deleted=0, edited=0, created=?, diff=? WHERE id=?;', prepare_data_c[i], function () {
                        asyncCounter--;
                        if (asyncCounter <= 0) {
                            zenMoney.category.init(tx, callback);
                        }
                    }, function () {
                    });
                } else {
                    tx.executeSql('INSERT INTO categories (server_id, static_id, title, type, transfer, deleted, edited, created, diff) VALUES (?, ?, ?, ?, ?, 0, 0, ?, ?);', prepare_data_c[i], function () {
                        asyncCounter--;
                        if (asyncCounter <= 0) zenMoney.category.init(tx, callback);
                    }, function () {
                    });
                }
            } else {
                prepare_data_c[i][7] = cats[i].id;
                tx.executeSql('UPDATE categories SET server_id=?, static_id=?, title=?, type=?, transfer=?, deleted=0, edited=0, created=?, diff=? WHERE server_id=?;', prepare_data_c[i], function () {
                    asyncCounter--;
                    if (asyncCounter <= 0) zenMoney.category.init(tx, callback);
                }, function () {
                });
            }
        }
    } else if (callback) {
        callback();
    }
}

SINC.transactions = function (diff, tx, callback) {
    if (diff.transaction.length) {
        zenMoney.category.links = {};
        var cats = zenMoney.category.get();
        zenMoney.category.links[0] = 0;
        zenMoney.category.links[1] = 1;
        zenMoney.category.links[2] = 2;
        for (var i in cats[-1]) {
            if (i != 0 && i != 1 && i != 2) {
                zenMoney.category.links[cats[-1][i]['server_id']] = i;
            }
        }
        for (var i in cats[1]) {
            if (i != 0 && i != 1 && i != 2) {
                zenMoney.category.links[cats[1][i]['server_id']] = i;
            }
        }
        zenMoney.account.links = {};
        var accs = zenMoney.account.get();
        for (var i in accs) {
            zenMoney.account.links[accs[i]['server_id']] = i;
        }
        var trans = diff.transaction;
        var prepare_data_t = [];
        for (var i = 0; i < trans.length; i++) {
            prepare_data_t[i] = [];
            prepare_data_t[i].push(trans[i].id); // 0
            prepare_data_t[i].push(zenMoney.account.links[trans[i].account_outcome]); // 1
            prepare_data_t[i].push(zenMoney.account.links[trans[i].account_income]); // 2
            var cat = zenMoney.category.links[(isNaN(parseInt(trans[i].category))) ? 0 : trans[i].category];
            cat = isNaN(parseInt(cat)) ? 0 : cat;
            cat = (cat == 1 || cat == 2) ? 0 : cat;
            prepare_data_t[i].push(cat); // 3
            prepare_data_t[i].push((trans[i].comment) ? (trans[i].comment) : ''); // 4
            prepare_data_t[i].push((trans[i].payee) ? (trans[i].payee) : ''); // 5
            prepare_data_t[i].push(trans[i].date); // 6
            prepare_data_t[i].push(trans[i].income); // 7
            prepare_data_t[i].push(trans[i].outcome); // 8
            prepare_data_t[i].push(trans[i].instrument_income); // 9
            prepare_data_t[i].push(trans[i].instrument_outcome); // 10
            prepare_data_t[i].push((trans[i].reminder) ? (trans[i].reminder) : null); // 11
            prepare_data_t[i].push((trans[i].is_processed) ? (trans[i].is_processed) : null); // 12
            prepare_data_t[i].push(parseDate(trans[i].changed).getTime()); // 13
            prepare_data_t[i].push(0); // 14
            if (trans[i].client_id) {
                prepare_data_t[i].push(trans[i].client_id); // 15
            }
        }
        /*
         id INTEGER PRIMARY KEY AUTOINCREMENT,
         server_id INTEGER,
         account_outcome INTEGER,
         account_income INTEGER,
         category INTEGER,
         comment TEXT,
         payee TEXT,
         date INTEGER,
         income FLOAT,
         outcome FLOAT,
         instrument_income INTEGER,
         instrument_outcome INTEGER,
         reminder INTEGER,
         deleted BOOLEAN,
         edited BOOLEAN,
         is_processed BOOLEAN,
         created INTEGER,
         diff INTEGER
         */
        var asyncCounter = trans.length;
        for (var i = 0; i < trans.length; i++) {
            if (trans[i].client_id) {
                tx.executeSql('UPDATE transactions SET server_id=?, account_outcome=?, account_income=?, category=?, comment=?, payee=?, date=?, income=?, outcome=?, instrument_income=?, instrument_outcome=?, reminder=?, deleted=0, edited=0, is_processed=?, created=?, diff=? WHERE id=?;', prepare_data_t[i], function () {
                    asyncCounter--;
                    if (asyncCounter == 0) {
                        /* Сброс балансов */
                        zenMoney.account.balances = {};
                        /* Сброс балансов */
                        if (callback) {
                            callback();
                        }
                    }
                }, function () {
                });
            } else {
                (function (i, prepare_data_t) {
                    tx.executeSql('SELECT id FROM transactions WHERE server_id = ?;', [trans[i].id], function (tx, res) {
                        if (res.rows.length == 0) {
                            tx.executeSql('INSERT INTO transactions (server_id, account_outcome, account_income, category, comment, payee, date, income, outcome, instrument_income, instrument_outcome, reminder, deleted, edited, is_processed, created, diff) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, ?, ?, ?);', prepare_data_t[i], function () {
                                asyncCounter--;
                                if (asyncCounter == 0) {
                                    /* Сброс балансов */
                                    zenMoney.account.balances = {};
                                    /* Сброс балансов */
                                    if (callback) {
                                        callback();
                                    }
                                }
                            }, function () {
                            });
                        } else {
                            prepare_data_t[i][15] = trans[i].id;
                            tx.executeSql('UPDATE transactions SET server_id=?, account_outcome=?, account_income=?, category=?, comment=?, payee=?, date=?, income=?, outcome=?, instrument_income=?, instrument_outcome=?, reminder=?, deleted=0, edited=0, is_processed=?, created=?, diff=? WHERE server_id=?;', prepare_data_t[i], function () {
                                asyncCounter--;
                                if (asyncCounter == 0) {
                                    /* Сброс балансов */
                                    zenMoney.account.balances = {};
                                    /* Сброс балансов */
                                    if (callback) {
                                        callback();
                                    }
                                }
                            }, function () {
                            });
                        }
                    }, function () {
                    });
                })(i, prepare_data_t)
            }
        }
    } else {
        if (callback) {
            callback();
        }
    }
}
SINC.deletion = function (diff, tx, callback) {
    if (diff.deletion === undefined) {
        return callback();
    }
    if (diff['deletion'].length) {
        var asyncCounter = diff['deletion'].length;
        for (var i = 0; i < diff['deletion'].length; i++) {
            switch (diff['deletion'][i]['object']) {
                case 'transaction':
                    tx.executeSql('UPDATE transactions SET deleted=1, diff=0 WHERE server_id=?;', [diff['deletion'][i]['object_id']], function () {
                        asyncCounter--;
                        if (asyncCounter == 0) {
                            if (callback) callback();
                        }
                    }, function () {
                    });
                    break;
                case 'account':
                    tx.executeSql('UPDATE transactions SET outcome=0, account_outcome=account_income, instrument_outcome=instrument_income WHERE account_outcome=(SELECT id FROM accounts WHERE server_id=?);', [diff['deletion'][i]['object_id']], null, null);
                    tx.executeSql('UPDATE transactions SET income=0, account_income=account_outcome, instrument_income=instrument_outcome WHERE account_income=(SELECT id FROM accounts WHERE server_id=?);', [diff['deletion'][i]['object_id']], null, null);
                    tx.executeSql('UPDATE transactions SET deleted=1, diff=0 WHERE income=0 AND outcome=0;', [], null, null);
                    tx.executeSql('UPDATE accounts SET deleted=1, diff=0 WHERE server_id=?;', [diff['deletion'][i]['object_id']], function () {
                        asyncCounter--;
                        if (asyncCounter == 0) {
                            if (callback) callback();
                        }
                    }, function () {
                    });
                    break;
                case 'category':
                    tx.executeSql('UPDATE transactions SET category=0 WHERE category=(SELECT id FROM categories WHERE server_id=?);', [diff['deletion'][i]['object_id']], null, null);
                    tx.executeSql('UPDATE categories SET deleted=1, diff=0 WHERE server_id=?;', [localStorage['diff'], diff['deletion'][i]['object_id']], function () {
                        asyncCounter--;
                        if (asyncCounter == 0) {
                            if (callback) callback();
                        }
                    }, function () {
                    });
                    break;
                case 'tag' :
                    tx.executeSql('DELETE FROM tag WHERE server_id=?;', [diff['deletion'][i]['object_id']], function () {
                        asyncCounter--;
                        if (asyncCounter == 0) {
                            if (callback) callback();
                        }
                    }, function () {
                        console.log(arguments);
                    });
                    break;
                case 'tag_group':
                    tx.executeSql('SELECT id FROM tag_group WHERE server_id=?', [diff['deletion'][i]['object_id']], function(tx, result) {
                        if (result.rows.length) {
                            tx.executeSql('DELETE FROM transaction_tag WHERE tag_group = ?;', [result.rows.item(0)['id']], null, null);
                        }
                    }, null);
                    tx.executeSql('DELETE FROM tag_group WHERE server_id=?;', [diff['deletion'][i]['object_id']], function () {
                        asyncCounter--;
                        if (asyncCounter == 0) {
                            if (callback) callback();
                        }
                    }, function () {
                        console.log(arguments);
                    });
                    break;
                case 'transaction_tag':
                    tx.executeSql('DELETE FROM transaction_tag WHERE server_id=?;', [diff['deletion'][i]['object_id']], function () {
                        asyncCounter--;
                        if (asyncCounter == 0) {
                            if (callback) callback();
                        }
                    }, function () {
                        console.log(arguments);
                    });
                    break;
                default:
                    asyncCounter--;
                    if (asyncCounter == 0) {
                        if (callback) callback();
                    }
            }
        }
    } else {
        if (callback) {
            callback();
        }
    }
}
SINC.instruments = function (diff, tx, callback) {
    if (diff.instrument_rate.length > 0) {
        for (var i = 0; i < diff.instrument_rate.length; ++i) {
            var instr = diff.instrument_rate[i];
            tx.executeSql('UPDATE instruments SET value=? WHERE id=?;', [instr.rate, instr.source]);
        }
    }
    if (callback) callback();
}

SINC.rowPreprocess = function (obj, ts) {

    var keys = [];
    var res = {};
    var insertRow = [];
    if (keys.length == 0) {
        for (var k in obj) {
            if (k == 'user') continue;
            if (k == 'id') k = 'server_id';
            if (k == 'client_id') continue;
            if (k == 'changed') k = 'diff';
            keys.push(k);
        }
    }

    for (j = 0; j < keys.length; j++) {
        var k = keys[j];
        if (k == 'id')
            k = 'client_id';
        if (k == 'server_id')
            k = 'id';
        if (k == 'diff')
            k = 'changed';

        var v = obj[k];

        if (v === null) {
            v = 'null';
        } else if (typeof v == 'undefined') {
            v = 'null';
        } else if (parseFloat(v) == v) {
            v = parseFloat(v);
        } else {
            v = String(v);
        }
        insertRow.push(v);
        res[k] = v;
    }
    keys.push('deleted', 'edited', 'created', 'diff');
    insertRow.push(0, 0, 0, 0);
    res.deleted = 0;
    res.edited = 0;
    res.created = 0;
    res.diff = 0;
    return {
        keys:keys,
        values:insertRow,
        obj:res
    }
}
SINC.processType = function (type, diff, cb, tx) {
    if (diff[type].length > 0) {

        var src = diff[type];
        var timestamp = diff.diff_timestamp;
        var asyncCounter = src.length;
        for (i = 0; i < src.length; i++) {
            obj = src[i];
            var table = SINC.vanyasTables[type];
            if (!table) table = type;

            // пытаемся найти объект
            searchSQL = 'SELECT ' + i + ' as i, (SELECT id FROM `' + table + '` WHERE ';
            searchSQL += ' server_id = ' + obj.id;
            if (obj.static_id) searchSQL += ' OR static_id = ' + obj.static_id;
            if (obj.client_id) searchSQL += ' OR id = ' + obj.client_id;
            searchSQL += ' LIMIT 1) as id';


            tx.executeSql(searchSQL, [],
                function (tx, result) {
                    var item = result.rows.item(0);

                    var obj = SINC.rowPreprocess(src[item.i], timestamp);
                    if (!item.id) {
                        // не нашли
                        questions = [];
                        for (i = 0; i < obj.values.length; i++) {
                            questions.push('?');
                        }
                        sql = 'INSERT INTO `' + table + '` (`' + obj.keys.join('`, `') + '`) VALUES (' + questions.join(',') + ');';

                        tx.executeSql(sql, obj.values, function insertionOk() {
                            if (--asyncCounter <= 0) {
                                if (cb) cb();
                            }

                        }, function insertionFail(tx, err) {
                            throw [sql, err];
                        });
                    } else {
                        // нашли
                        sql = 'UPDATE `' + table + '` SET ';
                        sets = [];
                        setvals = [];
                        for (x in obj.obj) {
                            if (x == 'client_id' || x == 'server_id' || x == 'static_id') {
                                continue;
                            }

                            if (x == 'changed') {
                                sets.push('`diff` = ?');
                                setvals.push(0);
                                continue;
                            }

                            if (x == 'id') {
                                sets.push('`server_id` = ?');
                                setvals.push(obj.obj.id);
                            } else {
                                sets.push('`' + x + '` = ?');
                                setvals.push(obj.obj[x]);
                            }
                        }
                        sql = sql + sets.join(',') + ' WHERE id = ' + item.id;
                        tx.executeSql(sql, setvals, function updationOk() {
                            if (--asyncCounter <= 0) {
                                if (cb) cb();
                            }
                        }, function updationFail(tx, err) {
                            throw [sql, err];
                        });
                    }
                }, function (err) {

                });
        }
    } else {
        if (cb) cb();
    }
}
SINC.tag = function (diff, tx, cb) {
    if (diff.tag.length > 0) {
        SINC.processType('tag', diff, cb, tx);
    } else {
        if (cb) cb();
    }
}

SINC.tag_group = function (diff, tx, cb) {
    if (diff.tag_group && diff.tag_group.length > 0) {
        SINC.processType('tag_group', diff, function () {
            var tgl = diff.tag_group.length;
            var sids = [];
            for (var i=0; i<tgl; i++) {
                sids.push(diff.tag_group[i].id);
            }
            sql = 'UPDATE tag_group SET tag0 = (SELECT id FROM tag WHERE server_id = tag_group.tag0), ' +
                'tag1 = (SELECT id FROM tag WHERE server_id = tag_group.tag1), ' +
                'tag2 = (SELECT id FROM tag WHERE server_id = tag_group.tag2) WHERE server_id IN ('+
                sids.join(', ') + ')';
            tx.executeSql(sql, [], function () {
                if (cb) cb();
            }, function (tx, err) {
                throw [sql, err];
            });
        }, tx);
    } else {
        if (cb) cb();
    }
}

SINC.transaction_tag = function (diff, tx, cb) {
    if (diff.transaction_tag.length > 0) {
        SINC.processType('transaction_tag', diff, function () {
            var ttl = diff.transaction_tag.length;
            var sids = [];
            for (var i=0; i<ttl; i++) {
                sids.push(diff.transaction_tag[i].id);
            }
            sql = 'update transaction_tag SET ' +
                '`transaction` = (SELECT id FROM transactions WHERE server_id = `transaction` LIMIT 1), ' +
                'tag_group = (SELECT id FROM tag_group WHERE server_id = transaction_tag.tag_group LIMIT 1), ' +
                'tag0 = (SELECT id FROM tag WHERE server_id = transaction_tag.tag0 LIMIT 1), ' +
                'tag1 = (SELECT id FROM tag WHERE server_id = transaction_tag.tag1 LIMIT 1), ' +
                'tag2 = (SELECT id FROM tag WHERE server_id = transaction_tag.tag2 LIMIT 1) WHERE server_id IN ('+
                sids.join(', ') + ')';
            tx.executeSql(sql, [], cb, function (tx, err) {
                throw [sql, err];
            });
        }, tx);
    } else {
        if (cb) cb();
    }
}

SINC.user = function (diff, tx, cb) {
    if (diff.user.length == 0) {
        if (cb) cb();
        return;
    }
    var user = diff.user[0];
    query = 'UPDATE "users" SET server_id = ?, country = ?, city = ?, currency = ?';
    data = [user.id, user.country, user.city, user.currency];
    tx.executeSql(query, data, cb, function (tx, err) {
        throw [query, err];
    });
}

SINC.applyDiff = function (diff, startTs, tx, callback) {
    SINC.accounts(diff, tx, function () {
        console.log('accounts ok');
        SINC.transactions(diff, tx, function () {
            console.log('transactions ok');
            SINC.deletion(diff, tx, function () {
                console.log('deletions ok');
                SINC.instruments(diff, tx, function () {
                    console.log('instruments ok');
                    SINC.tag(diff, tx, function () {
                        console.log('tags ok');
                        SINC.tag_group(diff, tx, function () {
                            console.log('tag_groups ok');
                            SINC.transaction_tag(diff, tx, function () {
                                console.log('transaction_tags ok');
                                SINC.user(diff, tx, function () {
                                    console.log('user ok');
                                    localStorage['diff'] = diff.diff_timestamp;
                                    localStorage['local_revision'] = startTs;
                                    zenMoney.sql.connect(function () {
                                        if (window.location.search == '?firstrun') {
                                            window.location = '/';
                                        }

/*
                                        if (SINC.process == 1) {
                                            var parent = document.getElementById('diff');
                                            parent.style.display = 'none';
                                            SINC.process = -1;
                                            SINC.shadow();
                                        } else {
                                            SINC.process = -1;
                                        }
                                        */
                                        console.log('diff ok');
                                        if (callback) callback();
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    });
}
SINC.getDiff = function (callback) {
    if (SINC.process == -1) {
        SINC.process = 0;
        var diffObj = {};
        diffObj.diff_timestamp = localStorage['diff'];
        if (localStorage['local_revision'] === undefined) {
            if (diffObj.diff_timestamp > 0) {
                // TIMEZONE FIX
                localStorage['local_revision'] = localStorage['diff'] - 43200;
            }
        }
        diffObj.account = [];
        var accs = zenMoney.account.get();
        var startTs = Math.round((new Date()).getTime() / 1000);
        for (var i in accs) {
            if (parseInt(accs[i].edited) == 1) {
                var accs_tmp = clone(accs[i]);
                accs_tmp['client_id'] = accs[i]['id'];
                accs_tmp['id'] = accs[i]['server_id'];
                accs_tmp['created'] = new Date(parseInt(accs[i]['created'])).toFormat('%Y-%m-%d');
                accs_tmp['changed'] = accs[i]['diff'];
                diffObj.account.push(accs_tmp);
            }
        }
        diffObj.category = [];
        var cats = zenMoney.category.get();
        for (i in cats[-1]) {
            if (i != 0 && i != 1 && i != 2) {
                if (parseInt(cats[-1][i].edited) == 1) {
                    var cat_tmp = clone(cats[-1][i]);
                    cat_tmp['client_id'] = cats[-1][i]['id'];
                    cat_tmp['id'] = cats[-1][i]['server_id'];
                    cat_tmp['changed'] = cats[-1][i]['diff'];
                    diffObj.category.push(cat_tmp);
                }
            }
        }
        for (i in cats[1]) {
            if (i != 0 && i != 1 && i != 2) {
                if (parseInt(cats[1][i].edited) == 1) {
                    var cat_tmp = clone(cats[1][i]);
                    cat_tmp['client_id'] = cats[1][i]['id'];
                    cat_tmp['id'] = cats[1][i]['server_id'];
                    cat_tmp['changed'] = cats[1][i]['diff'];
                    diffObj.category.push(cat_tmp);
                }
            }
        }
        zenMoney.sql.db.transaction(function (tx) {
            tx.executeSql('SELECT * FROM transactions WHERE ( ( server_id IS null ) OR ( diff > ? ) ) AND ( coalesce(deleted, 0) = 0 );', [ localStorage['local_revision'] ], function (tx, result) {
                diffObj.transaction = [];
                for (var i = 0; i < result.rows.length; i++) {
                    var id = result.rows.item(i)['id'];
                    diffObj.transaction.push(clone(result.rows.item(i)));
                    diffObj.transaction[i]['client_id'] = id;
                    diffObj.transaction[i]['id'] = diffObj.transaction[i]['server_id'];
                    diffObj.transaction[i]['date'] = diffObj.transaction[i]['date'];
                    diffObj.transaction[i]['changed'] = diffObj.transaction[i]['diff'];
                    diffObj.transaction[i]['created'] = new Date(parseInt(diffObj.transaction[i]['created'])).toFormat('%Y-%m-%d');
                    if (accs[ diffObj.transaction[i]['account_outcome'] ]['server_id']) {
                        diffObj.transaction[i]['account_outcome'] = accs[ diffObj.transaction[i]['account_outcome'] ]['server_id'];
                    } else {
                        diffObj.transaction[i]['account_outcome'] = parseInt(diffObj.transaction[i]['account_outcome']);
                    }
                    if (accs[ diffObj.transaction[i]['account_income'] ]['server_id']) {
                        diffObj.transaction[i]['account_income'] = accs[ diffObj.transaction[i]['account_income'] ]['server_id'];
                    } else {
                        diffObj.transaction[i]['account_outcome'] = parseInt(diffObj.transaction[i]['account_outcome']);
                    }
                    var category = diffObj.transaction[i]['category'];
                    if (category > 2) {
                        if (typeof zenMoney.category.get(1)[category] != 'undefined') {
                            if (zenMoney.category.get(1)[category].server_id != null) {
                                diffObj.transaction[i]['category'] = zenMoney.category.get(1)[category].server_id;
                            }
                        } else {
                            if (typeof zenMoney.category.get(-1)[category] != 'undefined') {
                                if (zenMoney.category.get(-1)[category].server_id != null) {
                                    diffObj.transaction[i]['category'] = zenMoney.category.get(-1)[category].server_id;
                                }
                            }
                        }
                    }
                }
                tx.executeSql('SELECT * FROM "users" WHERE diff > ?', [localStorage['local_revision']], function (tx, res) {
                    if (res.rows.length > 0) {
                        var user = res.rows.item(0);
                        diffObj.user = [
                            {
                                currency:user.currency,
                                country:user.country,
                                changed:user.diff,
                                city:user.city
                            }
                        ];
                    }

                    diffObj.deletion = [];
                    tx.executeSql('SELECT server_id, diff FROM transactions WHERE ( server_id IS NOT null ) AND ( deleted = 1 ) AND ( diff > ? );', [localStorage['local_revision']], function (tx, result) {
                        for (var i = 0; i < result.rows.length; i++) {
                            diffObj.deletion.push({
                                id:null,
                                object:'transaction',
                                object_id:result.rows.item(i)['server_id'],
                                stamp:result.rows.item(i)['diff']
                            });
                        }
                        tx.executeSql('SELECT server_id, diff FROM accounts WHERE ( server_id IS NOT null ) AND ( deleted = 1 ) AND ( diff > ? );', [localStorage['local_revision']], function (tx, result) {
                            for (var i = 0; i < result.rows.length; i++) {
                                diffObj.deletion.push({
                                    id:null,
                                    object:'account',
                                    object_id:result.rows.item(i)['server_id'],
                                    stamp:result.rows.item(i)['diff']
                                });
                            }
                            tx.executeSql('SELECT server_id, diff FROM categories WHERE ( server_id IS NOT null ) AND ( deleted = 1 ) AND ( diff > ? );', [localStorage['local_revision']], function (tx, result) {
                                for (var i = 0; i < result.rows.length; i++) {
                                    diffObj.deletion.push({
                                        id:null,
                                        object:'category',
                                        object_id:result.rows.item(i)['server_id'],
                                        stamp:result.rows.item(i)['diff']
                                    });
                                }
                                SINC.getTagDiff(tx, diffObj, function (diffObj) {
                                    tx.executeSql('SELECT strftime("%s") as time', [], function (tx, result) {
                                        diffObj.client_timestamp = result.rows.item(0)['time'];
                                        diffObj.client_version = localStorage['appHash'];
                                        diffObj.api_version = 2;
                                        callback(diffObj, startTs);
                                    })
                                });
                            }, null);
                        }, null);
                    }, null);
                }, null);
            }, null);
        });
    } else {
        SINC.process = 1;
    }
}

SINC.getTagDiff = function (tx, diff, cb) {
    diff.tag = [];
    diff.tag_group = [];
    diff.transaction_tag = [];
    tx.executeSql('SELECT * FROM tag WHERE diff > ? and (edited > 0 OR created > 0 OR deleted > 0)', [localStorage['local_revision']], function (tx, res) {
        for (i = 0; i < res.rows.length; i++) {
            tag = res.rows.item(i);
            if (tag.deleted) {
                if (!tag.server_id)
                    continue;
                diff.deletion.push({
                    id:null,
                    object:'tag',
                    object_id:tag.server_id,
                    stamp:tag.diff
                });
            } else {
                diff.tag.push({
                    id:tag.server_id,
                    server_id:tag.server_id,
                    client_id:tag.id,
                    static_id:tag.static_id,
                    title:tag.title,
                    changed:tag.diff
                });
            }
        }
        ;
        tx.executeSql('SELECT ' +
            'server_id as id, ' +
            'id as client_id, ' +
            'server_id, ' +
            'static_id, ' +
            'deleted, ' +
            '(select coalesce(server_id, id) from tag where tag.id = tag0) as tag0, ' +
            '(select coalesce(server_id, id) from tag where tag.id = tag1) as tag1, ' +
            '(select coalesce(server_id, id) from tag where tag.id = tag2) as tag1, ' +
            'show_income, show_outcome, diff as changed ' +
            'FROM tag_group WHERE diff > ? AND (edited > 0 OR created > 0 OR deleted > 0)', [localStorage['local_revision']], function (tx, res) {
            for (i = 0; i < res.rows.length; i++) {
                tg = res.rows.item(i);
                if (tg.deleted) {
                    if (!tg.server_id) continue;
                    diff.deletion.push({
                        id:null,
                        object:'tag_group',
                        object_id:tg.server_id,
                        stamp:tg.changed
                    });
                } else {
                    delete tg['deleted'];
                    diff.tag_group.push(tg);
                }
            }
            tx.executeSql('SELECT ' +
                'server_id as id, ' +
                'server_id, ' +
                'id as client_id, ' +
                'static_id, ' +
                'deleted, ' +
                '(select coalesce(server_id, id) from `transactions` where `transactions`.id = transaction_tag.`transaction`) as `transaction`, ' +
                '(select coalesce(server_id, id) from tag_group where tag_group.id = tag_group) as tag_group, ' +
                '(select coalesce(server_id, id) from tag where tag.id = tag0) as tag0, ' +
                '(select coalesce(server_id, id) from tag where tag.id = tag1) as tag1, ' +
                '(select coalesce(server_id, id) from tag where tag.id = tag2) as tag2, ' +
                '`order`, diff as changed ' +
                'FROM transaction_tag WHERE diff > ? AND (edited > 0 OR created > 0 OR deleted > 0) AND ' +
                '`transaction` IS NOT NULL AND tag_group IS NOT NULL', [localStorage['local_revision']], function (tx, res) {
                for (i = 0; i < res.rows.length; i++) {
                    tt = res.rows.item(i);
                    if (tt.deleted) {
                        if (!tt.server_id) continue;
                        diff.deletion.push({
                            id:null,
                            object:'transaction_tag',
                            object_id:tt.server_id,
                            stamp:tt.changed
                        });
                        continue;
                    } else {
                        delete tt.deleted;
                        if (!tt.transaction) continue;
                        if (!tt.tag_group) continue;
                        diff.transaction_tag.push(tt);
                    }
                }

                if (cb) cb(diff);
            }, function (tx, err) {

            });
        }, function (tx, err) {

        });
    }, function (tx, err) {

    });
}

SINC.authorization = function () {
    SINC.oauth.authorize(function () {
        SINC.checkOauthState();
    });
};
SINC.checkOauthState = function () {
    if (SINC.oauth.hasToken()) {
        return true;
    } else {
        return false;
    }
}
SINC.logout = function () {
    SINC.oauth.clearTokens();
}
SINC.oauth.clearTokens = function () {
    localStorage['diff'] = 0;
    delete localStorage['oauth_token' + SINC.params.serviceProvider.echoURL];
    delete localStorage['oauth_token_secret' + SINC.params.serviceProvider.echoURL];
}
SINC.clearQuestion = function (callback) {
    if (confirm('Загрузить данные с zenmoney.ru и перезаписать данные в ай-версии?\n\nОК — перезаписать данные.\nОтменить — оставить данные и синхронизировать их с zenmoney.ru')) {
        zenMoney.sql.db.transaction(function (tx) {
            tx.executeSql('DROP TABLE accounts;', []);
            tx.executeSql('DROP TABLE categories;', []);
            tx.executeSql('DROP TABLE citys;', []);
            tx.executeSql('DROP TABLE countries;', []);
            tx.executeSql('DROP TABLE instruments;', []);
            tx.executeSql('DROP TABLE reminders;', []);
            tx.executeSql('DROP TABLE transactions;', []);
            tx.executeSql('DROP TABLE users;', []);
        }, function () {
            alert('Ошибка');
        }, function () {
            zenMoney.sql.newdb(function () {
                zenMoney.user.add({
                    country:1,
                    city:1,
                    currency:2,
                    sum:0,
                    title:'Наличные',
                    pin:false
                }, function () {
                    zenMoney.sql.db.transaction(function (tx) {
                        tx.executeSql('DELETE FROM accounts;');
                        tx.executeSql('DELETE FROM categories WHERE id > 2;');
                        tx.executeSql('DELETE FROM transactions;');
                        tx.executeSql('DELETE FROM accounts;');
                        tx.executeSql('DELETE FROM tag;');
                        tx.executeSql('DELETE FROM tag_group;');
                        tx.executeSql('DELETE FROM transaction_tag;');
                        tx.executeSql('DELETE FROM reminder_tag;');
                        zenMoney.account.cache = {};
                        zenMoney.account.sort = [];
                        zenMoney.category.init(tx, function () {
                            callback();
                        });
                    }, function () {
                    }, function () {
                    });
                });

            });
            localStorage['diff'] = 0;
        });
    } else {
        callback();
    }
}
SINC.shadow_step2 = function (diff, startTs) {
    try {
        var sDiff = JSON.stringify(diff);
    } catch (err) {
        zm.alert.show({
            title:'Ошибка синхронизации :(',
            body:'Свяжитесь пожалуйста со службой поддержки по адресу <a href="http://answers.zenmoney.ru/">http://answers.zenmoney.ru/</a>',
            report:'mailto:support@zenmoney.ru?subject=iVersion sync error&body=JSON stringify error: ' + diff
        });
        return false;
    } finally {

    }
    SINC.data_send(sDiff, startTs, 'shadow');
}
SINC.shadow = function () {
    if (localStorage['diff'] != 0 && navigator.onLine) {
        SINC.getDiff(SINC.shadow_step2);
    }
}
var f = false;
SINC.data_send = function (sDiff, startTs, type) {
    if (!type) throw "Invalid type.";
    var parent = document.getElementById('diff');
    var content = parent.querySelector('.content');
    var el = document.getElementById('shadow_sinc');
    var url = 'http://' + SINC.server + '/v2/diff/' + localStorage['diff'] + '/';
    var request = {
        'method':'post',
        'body':sDiff
    };
    SINC.oauth.sendSignedRequest(url, function (text, xhr) {
        var sDiff = false;
        try {
            sDiff = JSON.parse(text);
        } catch (err) {
            sDiff = false;
        } finally {

        }
        SINC.process = -1;
        if (type == 'manual') {
            parent.style.display = 'none';
        }
        if (xhr.status == 200) {
            if (sDiff && sDiff.result != 'error') {
                zm.sql.db.transaction(function (tx) {
                    SINC.applyDiff(sDiff, startTs, tx, function () {
                        if (type == 'manual') {
                            zenMoney.account.balances = {};
                            wps.browse.show(0);
                        }
                    });
                });
                if (sDiff.debug) {
                    zm.sql.db.transaction(function (tx) {
                        SINC.sendDebug(tx);
                    }, function (err) {
                        console.log(err);
                    })
                }
            } else {
                if (sDiff) {
                    zm.alert.show({
                        title:'Во время синхронизации возникли следующие ошибки:',
                        body:sDiff.message,
                        report:'mailto:support@zenmoney.ru?subject=iVersion sync error&body=JSON error: ' + text
                    });
                } else {
                    try {

                    } catch (err) {

                    } finally {
                        zm.alert.show({
                            title:'Во время синхронизации возникла ошибка.',
                            body:'Отправьте отчет с данными, которые привели к этой ошибке, и мы постараемся ее исправить.',
                            report:'mailto:support@zenmoney.ru?subject=iVersion sync error&body=JSON stringify error: ' + text
                        });
                    }
                }
            }
        } else {
            if (xhr.status == 400) {
//                zm.alert.show({
//                    title:'Во время синхронизации возникли следующие ошибки:',
//                    body:sDiff,
//                    button:'OK'
//                });
                zenMoney.sql.db.transaction(function(tx) {
                    SINC.sendDebug(tx, sDiff);
                });
            } else {
                if (xhr.status != 0) {
                    zm.alert.show({
                        title:'Во время синхронизации возникла ошибка.',
                        body:'Отправьте отчет с данными, которые привели к этой ошибке, и мы постараемся ее исправить.',
                        report:'mailto:support@zenmoney.ru?subject=iVersion sync error&body=Response header ' + xhr.status + ', body: ' + text
                    });
                }
            }
            return false;
        }
    }, request);
}

SINC.sendDebug = function (tx, report) {
    if (report) {
        alert(report);
        return;
        /*
        if (!confirm(report + '\n\n'+
            'Для ускорения решения проблемы вы можете отправить копию данных приложения.\n'+
            'Обратите внимание: копия может иметь большой размер и рекомендуется не отправлять её через мобильные сети.')) {
            return;
        }
        */
    } else {
        if (!confirm('Для решения проблем с синхронизацией, разработчики запросили отправить копию '+
            'данных приложения. Нажмите "ОК", чтобы отправить данные. В противном случае "Отмена".')) {
            return;
        }
    }

    var url = 'http://' + SINC.server + '/v2/debug/';
    var dump = {};
    tx.executeSql('SELECT name from sqlite_sequence', [], function (tx, res) {
        asyncCount = res.rows.length;
        for (var i = 0; i < res.rows.length; i++) {
            var table = res.rows.item(i).name;
            dump[table] = [];
            tx.executeSql('SELECT *, "' + table + '" as _name FROM `' + table + '`', [], function (tx, res) {
                for (var i = 0; i < res.rows.length; i++) {
                    var row = res.rows.item(i);
                    var table = row._name;
                    delete row['_name'];
                    dump[table].push(row);
                }
                if (--asyncCount <= 0) {
                    var request = {
                        'method':'post',
                        'body':JSON.stringify(dump)
                    };
                    SINC.oauth.sendSignedRequest(url, function () {
                    }, request);
                }
            });
        }
    })
}

Layer_sync_send = function (diff, startTs) {
    var parent = document.getElementById('diff');
    var content = parent.querySelector('.content');
    try {
        var sDiff = JSON.stringify(diff);
        //sDiff = '{"diff_timestamp":0}';
    } catch (err) {
        zm.alert.show({
            title:'Ошибка синхронизации :(',
            body:'Свяжитесь пожалуйста со службой поддержки по адресу <a href="http://answers.zenmoney.ru/">http://answers.zenmoney.ru/</a>',
            report:'mailto:support@zenmoney.ru?subject=iVersion sync error&body=JSON parse error: ' + text
        });
        return false;
    } finally {

    }
    SINC.data_send(sDiff, startTs, 'manual');
}
