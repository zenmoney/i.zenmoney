Browse = {
    main:{
        render:false,
        data:{},
        init:function (layer) {
            var there = Browse.main;
            there.data.layer = layer;
            if (!there.render) {
                there.render = true;
                there.create(layer);
            } else {
                there.update();
            }
        }
    },
    accounts:{
        render:false,
        data:{},
        init:function (layer) {
            var there = Browse.accounts;
            there.data.layer = layer;
            if (!there.render) {
                there.render = true;
                there.create(layer);
            } else {
                there.update();
            }
        }
    },
    budget:{
        render:false,
        data:{},
        init:function (layer) {
            var there = Browse.budget;
            there.data.layer = layer;
            if (!there.render) {
                there.render = true;
                there.create(layer);
            } else {
                there.update();
            }
        }
    },
    categories:{
        render:false,
        data:{},
        init:function (layer) {
            var there = Browse.categories;
            there.data.layer = layer;
            if (!there.render) {
                there.render = true;
                there.create(layer);
            } else {
                there.update();
            }
        }
    },
    sync:{
        render:false,
        data:{},
        init:function (layer) {
            var there = Browse.sync;
            there.data.layer = layer;
            if (!there.render) {
                there.render = true;
                there.create(layer);
            } else {
                there.update();
            }
        }
    },
    transaction:{
        render:false,
        data:{},
        init:function (layer) {
            var there = Browse.sync;
            there.data.layer = layer;
            if (!there.render) {
                there.render = true;
                there.create(layer);
            } else {
                there.update();
            }
        }
    }
}
Browse.main.create = function (layer) {
    var there = Browse.main;
    there.data.parent = document.createElement('div');
    there.data.parent.setAttribute('id', 'LayerBrowse');
    there.data.parent.innerHTML = '<div class="transactions"><h2>Транзакции <span class="more">›</span></h2></div><div class="addTransaction"><img src="images/buttons/btn1.png" alt="Добавить транзакцию" width="192" height="31"></div><div class="accounts"><h2>Счета <span class="more">›</span></h2><ul></ul></div><!-- div id="BrowseBudget" class="colorCols"><div class="title"><strong>Бюджет</strong> <em></em> <span class="more">›</span></div><table class="cols"><tbody><tr><!--td style="width:44.6875%; background:#5ce04f;"></td><td style="width:7.5%; background:#ff9523;"></td--><td></td></tr></tbody></table></div --><div id="BrowseCategory" class="colorCols"><div class="title"><strong>Категории</strong> <em></em> <span class="more">›</span></div><table class="cols"><tbody><tr><!--td style="width:25%; background:#d257f4;"></td><td style="width:10.625%; background:#5758f4;"></td><td style="width:29,0625%; background:#f4c857;"></td><td style="width:28,125%; background:#c3f457;"></td><td style="background:#57f466;"></td--><td></td></tr></tbody></table></div><div class="syncInfo"><div class="more">›</div><div class="info"></div></div>';
    layer.data.content.appendChild(there.data.parent);

    // Элементы на странице
    there.els = {};

    there.els.trans = {};
    there.els.trans.block = there.data.parent.querySelector('.transactions');
    ;
    there.els.trans.add = there.data.parent.querySelector('.addTransaction');
    ;
    zenEvents.ontap(there.els.trans.add, function () {
        zForm.refill();
        zForm.parent.style.display = 'block';
        DOC.page.className = 'mini';
        wps.browse.show(6);
    });
    zenEvents.ontap(there.els.trans.block, function () {
        wps.browse.show(7, {account:-1});
    });

    there.els.acc = {}
    there.els.acc.block = there.data.parent.querySelector('.accounts');
    there.els.acc.list = there.els.acc.block.querySelector('ul');
    zenEvents.ontap(there.els.acc.block, function () {
        wps.browse.show(1);
    });
    /*
     there.els.budget = {};
     there.els.budget.block = there.data.parent.querySelector('#BrowseBudget');
     there.els.budget.month = there.els.budget.block.querySelector('em');
     there.els.budget.tbl = there.els.budget.block.querySelector('table tbody tr');
     */
    /*
     zenEvents.ontap(there.els.budget.block, function(){
     wps.browse.show(2);
     });
     */

    there.els.cat = {};
    there.els.cat.block = there.data.parent.querySelector('#BrowseCategory');
    there.els.cat.month = there.els.cat.block.querySelector('em');
    there.els.cat.tbl = there.els.cat.block.querySelector('table tbody tr');

    zenEvents.ontap(there.els.cat.block, function () {
        wps.browse.show(3);
    });

    there.els.sync = {};
    there.els.sync.block = there.data.parent.querySelector('.syncInfo');
    zenEvents.ontap(there.els.sync.block, function () {
        try {
            window.applicationCache.swapCache();
        } catch (ex) {
        }
        oauth();
    });
    there.els.sync.info = there.els.sync.block.querySelector('.info');

    //		Бюджет
    //there.els.budget.month.innerHTML = 'на '+(new Date()).toFormat('%Fmr0');

    //		Категории
    there.els.cat.month.innerHTML = 'за ' + (new Date()).toFormat('%Fmr0');

    Browse.main.update();
}
Browse.main.update = function () {
    var there = Browse.main;

    //		Счета
    var usr = zenMoney.user.get();
    var accs = zenMoney.account.get();
    var cats = zenMoney.category.get();
    var cats_sort = zenMoney.category.sort;
    var insts = zenMoney.instrument.get();

    // Заполняем данными
    //		Счета
    var accs = zenMoney.account.get();
    var accs_sort = zenMoney.account.sort;
    var lis = '';
    there.els.acc.lis = [];
    there.els.acc.list.innerHTML = '';
    for (var i = 0; i < accs_sort.length; i++) {
        var li = document.createElement('li');
        var id = accs_sort[i];
        var bal = '';
        var symbol = '';
        if (typeof insts[accs[id].instrument] != 'undefined') {
            symbol = insts[accs[id].instrument].symbol;
        }
        if (typeof zenMoney.account.balances[ id ] != 'undefined') {
            var sum = zenMoney.account.balances[ id ];
            bal = '<span class="value">' + costToString(sum, 2) + '</span><span class="cur">' + symbol + '</span>';
        }
        var id = accs_sort[i];
        li.innerHTML = '<span class="title">' + String(accs[accs_sort[i]].title).safeText() + '</span><span rel="' + accs_sort[i] + '" class="status">' + bal + '</span>';
        there.els.acc.lis.push({
            id:accs_sort[i],
            li:li,
            status:li.querySelector('.status')
        });
        there.els.acc.list.appendChild(li);
    }

    var acc_list = [];
    var debt_acc = false;
    for (var i = 0; i < there.els.acc.lis.length; i++) {
        var id = there.els.acc.lis[i].id;
        if (accs[id].type != 'debt') {
            acc_list.push(id);
        } else {
            debt_acc = id;
        }
    }
    zenMoney.account.balance(acc_list, function (sum) {
        for (var id in sum) {
            var el = there.els.acc.list.querySelector('span[rel="' + id + '"]');
            var symbol = '';
            if (typeof insts[accs[id].instrument] != 'undefined') {
                symbol = insts[accs[id].instrument].symbol;
            }
            el.innerHTML = '<span class="value">' + costToString(sum[id], 2) + '</span><span class="cur">' + symbol + '</span>';
        }
    });
    if (debt_acc) {
        zenMoney.account.balance(debt_acc, function (sum) {
            var id = debt_acc;
            var el = there.els.acc.list.querySelector('span[rel="' + id + '"]');
            var symbol = '?';
            if (typeof insts[accs[id].instrument] != 'undefined') {
                symbol = insts[accs[id].instrument].symbol;
            }
            el.innerHTML = '<span class="value">' + costToString(sum, 2) + '</span><span class="cur">' + symbol + '</span>';
        })
    }

    //		Категории
    var sum_by_cat = {
        '-1': {income: 0, outcome: 0, show_income: 1, show_outcome: 1}
    };
    zenMoney.sql.db.transaction(function (tx) {
        var from = toStartMonth(new Date()).toFormat('%Y-%m-%d');
        var to = new Date(from + zenMoney.timezone);
        to.setMonth(to.getMonth() + 1);
        to = to.toFormat('%Y-%m-%d');
        var sql = 'SELECT coalesce(tg.tag0, "cat_"||t.category) as id, tg.show_income, tg.show_outcome, SUM(t.income) as income, '+
            'SUM(t.outcome) as outcome, t.instrument_income, t.instrument_outcome '+
            'FROM transactions as t LEFT JOIN transaction_tag as tt ON ' +
            't.id = tt.`transaction` LEFT JOIN tag_group as tg ON tt.tag_group = tg.id WHERE (income = 0 or outcome = 0) AND coalesce(t.deleted, 0) != 1 AND ' +
            'coalesce(tg.deleted, 0) != 1 AND coalesce(tt.deleted, 0) != 1 AND t.date >= ? AND t.date <= ? AND '+
            'coalesce(tt.`order`, 0) = 0 GROUP BY '+
            'coalesce(tg.tag0, "cat_"||t.category), tg.show_income, t.account_outcome, t.instrument_income, t.instrument_outcome';
        console.log('SQL', sql, from, to);
        tx.executeSql(sql, [from, to], function (tx, res) {
                var rl = res.rows.length;
                var ui = zenMoney.user.cache.currency;
                for (var i=0;i<rl;i++) {
                    var row = res.rows.item(i);
                    console.log('row', row);
                    if (sum_by_cat[row.id] === undefined) sum_by_cat[row.id] = {income: 0, outcome: 0};
                    sum_by_cat[row.id].income += row.income * (insts[row.instrument_income].value / insts[row.instrument_income].multiplier) / (insts[ui].value / insts[ui].multiplier);
                    sum_by_cat[row.id].outcome += row.outcome * (insts[row.instrument_outcome].value / insts[row.instrument_outcome].multiplier) / (insts[ui].value / insts[ui].multiplier);
                    sum_by_cat[row.id].show_income = row.show_income;
                    sum_by_cat[row.id].show_outcome = row.show_outcome;
                    sum_by_cat[-1].income += row.income * (insts[row.instrument_income].value / insts[row.instrument_income].multiplier) / (insts[ui].value / insts[ui].multiplier);
                    sum_by_cat[-1].outcome += row.outcome * (insts[row.instrument_outcome].value / insts[row.instrument_outcome].multiplier) / (insts[ui].value / insts[ui].multiplier);
                }
                console.log('sum_by_cat', sum_by_cat);
            })
    }, function () {
    }, function () {
        var sum = sum_by_cat[-1].outcome;
        var key = 'outcome';

        var colors = ['d257f4', '5758f4', 'f4c857', 'c3f457', '57f466', '5ce04f', 'ff9523'];
        var color = 0;
        var i = 0;
        var catSort = [];
        for(var x in sum_by_cat) {
            if ((x == 'cat_0' || sum_by_cat[x]['show_'+key]) && sum_by_cat[x][key])
                catSort.push({id:x,sum:sum_by_cat[x][key]});
        }
        catSort = catSort.sort(function(e1, e2) {
            rate = function(e) {
                var r = 0;
                if (e.id == -1) r+=100;
//                if (e.id == 'cat_0') r+= 50;
                if (e.id == 'cat_2' || e.id == 'cat_1') r+= 10;
                return r;
            }
            var r1 = rate(e1), r2 = rate(e2);
            if (r1 > r2) return -1;
            else if (r1 < r2) return 1;
            if (e1.sum > e2.sum) return -1;
            else if (e1.sum < e2.sum) return 1;
            if (zenMoney.tag.byId[e1.id].title.toLowerCase() < zenMoney.tag.byId[e2.id].title.toLowerCase()) return -1;
            return 1;
        });

        console.log('catSort', catSort);
        var td_c = 0;
        there.els.cat.tbl.innerHTML = '';
        if (catSort.length > 0) {
//            var sum = sum_by_cat[-1][key];
            for (var m = 0; m < catSort.length; m++) {
                var tmp = catSort[m];
                if (tmp.id == -1) continue;

                var f_sum = parseFloat(tmp.sum);
                if (!isNaN(f_sum) && f_sum) {
                    var td = document.createElement('td');
                    td.style.width = ( 100 / sum * f_sum ) + '%';
                    td.style.background = '#' + colors[color];
                    td.id = tmp.id;
                    there.els.cat.tbl.appendChild(td);
                    td_c++;
                }
                color++;
                if (color >= colors.length) {
                    color = 0;
                }
            }
        }
        if (td_c == 0) {
            var td = document.createElement('td');
            there.els.cat.tbl.appendChild(td);
        }
    });

    // Последняя синхронизация
    if (!localStorage['diff']) localStorage['diff'] = 0;
    var lastDiff = localStorage['diff'];
    if (lastDiff != '0') {
        var outDiff = '<div class="h">Синхронизация с zenmoney.ru</div><div class="b">Последняя синхронизация<br>была ';
        var d = new Date(parseInt(lastDiff) * 1000);
        var hrs = d.getHours() < 10 ? '0' + d.getHours() : d.getHours();
        var min = d.getMinutes() < 10 ? '0' + d.getMinutes() : d.getMinutes();
        outDiff += d.toFormat('%j %Fmr %Y в ') + hrs + ':' + min;
        outDiff += '</div>';
    } else {
        var outDiff = '<div class="h">Синхронизация с zenmoney.ru</div><!-- div class="b">Вы еще не синхронизировались!</div -->';
    }
    there.els.sync.info.innerHTML = outDiff;
    there.data.layer.data.scroll.refresh();
}

// Счета
Browse.accounts.create = function (layer) {
    var there = Browse.accounts;
    there.data.parent = document.createElement('div');
    there.data.parent.setAttribute('id', 'LayerBrowseAccounts');
    var parent = there.data.parent;

    /*
     var add = document.createElement('div');
     add.className = 'add_block';
     add.innerHTML = '<span class="icon"></span><span class="text">Добавить счет</span>';
     zenEvents.ontap(add, function(){
     // Создание нового счета
     edit_account_form.add();
     });
     */

    var balance = document.createElement('div');
    balance.className = 'balance_block';
    balance.innerHTML = '<span class="value"><span class="val">...</span><span class="cur"></span></span><span class="title">Баланс</span>';

    var accounts_list = document.createElement('div');
    accounts_list.className = 'accounts_list';

    var edit_accounts_list = document.createElement('div');
    edit_accounts_list.className = 'edit_accounts_list';

    parent.appendChild(balance);
    parent.appendChild(accounts_list);
    parent.appendChild(edit_accounts_list);

    layer.data.content.appendChild(there.data.parent);

    Browse.accounts.update();
}
Browse.accounts.del = function (id) {
    var accs = zenMoney.account.get();
    var accs_sort = zenMoney.account.sort;
    if (typeof accs[id] != 'undefined') {
        if (accs_sort.length > 1) {
            if (confirm('Будут удалены все транзакции по этому счету «' + accs[id].title + '»')) {
                zenMoney.account.del({id:id}, function () {
                    Browse.accounts.update();
                });
            }
        }
    }
}
Browse.accounts.update = function () {
    var there = Browse.accounts;
    var content = there.data.layer.data.content;
    var parent = content.querySelector('#LayerBrowseAccounts');

    var balance = parent.querySelector('.balance_block');
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
    var show_balance = function () {
        accs_count--;
        if (accs_count == 0) {
            var bal = 0;
            for (var i = 0; i < accs_sort.length; i++) {
                var tbal = 0;
                if (typeof insts[ accs[ accs_sort[i] ].instrument ] != 'undefined') {
                    bal += accs[ accs_sort[i] ].bal * (insts[ accs[ accs_sort[i] ].instrument ].value / insts[ accs[ accs_sort[i] ].instrument ].multiplier) / (insts[ usr['currency'] ].value / insts[ usr['currency'] ].multiplier);
                }
            }
            var val = balance.querySelector('.val');
            var cur = balance.querySelector('.cur');
            val.innerHTML = costToString(bal, 2);
            cur.innerHTML = insts[usr['currency']].symbol;
        }
    }

    var generateLiElement = function (obj) {
        var li = document.createElement('li');
        var symbol = '';
        try {
            symbol = insts[obj.instrument].symbol;
        } catch (exception) {
        } finally {
        }
        var sum = zenMoney.account.balances[obj.id];
        var bal = '<span class="value"><span class="val">' + costToString(sum, 2) + '</span><span class="cur">' + symbol + '</span></span>';

        var tpl = '<span class="row"><span class="title"><strong>' + String(obj.title).safeText() + '</strong></span><span class="status"><span class="bal">' + bal + '</span><span class="rightArrow"></span></span></span>';
        li.innerHTML = tpl;

        (function (li, obj) {
            zenMoney.account.balance(obj.id, function (sum) {
                var out = li.querySelector('.bal');
                var symbol = '';
                try {
                    symbol = insts[obj.instrument].symbol;
                } catch (exception) {
                } finally {
                }
                out.innerHTML = '<span class="value"><span class="val">' + costToString(sum, 2) + '</span><span class="cur">' + symbol + '</span></span>';
                accs[obj.id].bal = sum;
                show_balance();
            });
            zenEvents.ontap(li, function (el) {
                wps.browse.show(7, {account:obj.id});
            });
        })(li, obj)

        return li;
    }

    var generateLiElementEdit = function (obj) {
        var li = document.createElement('div');
        li.className = "li";
        var delBtn = '';
        if (accs_sort.length > 1) {
            delBtn = '<span class="del" onclick="Browse.accounts.del(' + obj.id + ');"></span>';
        }
        var tpl = '<span class="row">' + delBtn + '<span class="title">' + String(obj.title).safeText() + '</span></span>';
        li.innerHTML = tpl;

        return li;
    }

    for (var i = 0; i < accs_sort.length; i++) {
        var acc = accs[accs_sort[i]];
        if (typeof accs_by_type[ accs[accs_sort[i]].type ] == 'undefined') {
            accs_by_type[ acc.type ] = {};
            accs_by_type[ acc.type ].h = document.createElement('h3');
            var title = zenMoney.types(acc.type);

            accs_by_type[ acc.type ].h.innerHTML = String(title).safeText();
            accs_by_type[ acc.type ].ul = document.createElement('ul');
            accs_by_type[ acc.type ].ul.className = 'iList';
            accounts.appendChild(accs_by_type[ acc.type ].h);
            accounts.appendChild(accs_by_type[ acc.type ].ul);
        }
        var li = generateLiElement(acc);
        accs_by_type[ acc.type ].ul.appendChild(li);
    }
    there.data.layer.data.scroll.refresh();
}

// Бюджет
Browse.budget.create = function (layer) {
    var there = Browse.budget;
    there.data.parent = document.createElement('div');
    there.data.parent.setAttribute('id', 'LayerBrowseBudget');
    there.data.parent.innerHTML = '<h2>Здесь будет что-то очень крутое!</h2>';
    layer.data.content.appendChild(there.data.parent);
}
Browse.budget.update = function () {

}

// Категории
Browse.categories.create = function (layer) {
    var there = Browse.categories;
    there.data.parent = document.createElement('div');
    there.data.parent.setAttribute('id', 'LayerBrowseCategories');
    there.data.parent.innerHTML = '<div class="typeMenu"><div class="row"><div class="outcome active">Расход</div><div class="income">Доход</div></div></div><div class="periodChooser"><div class="mc-wrap"><div class="leftIcon"></div><div class="current"></div><div class="rightIcon"></div></div></div><div class="columnsBlock"></div>';
    layer.data.content.appendChild(there.data.parent);
    there.els = {};
    there.els.type = {};
    there.els.type.parent = there.data.parent.querySelector('.typeMenu');
    there.els.type.income = there.data.parent.querySelector('.typeMenu .income');
    there.els.type.outcome = there.data.parent.querySelector('.typeMenu .outcome');
    there.els.type.value = -1;
    there.els.chooser = {};
    there.els.chooser.parent = there.data.parent.querySelector('.periodChooser');
    there.els.chooser.left = there.data.parent.querySelector('.periodChooser .leftIcon');
    there.els.chooser.right = there.data.parent.querySelector('.periodChooser .rightIcon');
    there.els.chooser.current = there.data.parent.querySelector('.periodChooser .current');
    there.els.chooser.value = new Date().toFormat('01.%m.%Y');
    there.els.chooser.current.innerHTML = new Date().toFormat('%Fr, %Y');
    there.els.columns = {};
    there.els.columns.parent = there.data.parent.querySelector('.columnsBlock');

    /* Events */
    zenEvents.ontap(there.els.type.income, function () {
        if (there.els.type.value != 1) {
            there.els.type.value = 1;
            there.els.type.income.className = 'income active';
            there.els.type.outcome.className = 'outcome';
            Browse.categories.update();
        }
    });
    zenEvents.ontap(there.els.type.outcome, function () {
        if (there.els.type.value != -1) {
            there.els.type.value = -1;
            there.els.type.income.className = 'income';
            there.els.type.outcome.className = 'outcome active';
            Browse.categories.update();
        }
    });
    zenEvents.ontap(there.els.chooser.left, function () {
        var date = parseDate(there.els.chooser.value);
        date.setMonth(date.getMonth() - 1);
        there.els.chooser.value = date.toFormat('01.%m.%Y');
        there.els.chooser.current.innerHTML = date.toFormat('%Fr, %Y');
        Browse.categories.update();
    });
    zenEvents.ontap(there.els.chooser.right, function () {
        var date = parseDate(there.els.chooser.value);
        date.setMonth(date.getMonth() + 1);
        there.els.chooser.value = date.toFormat('01.%m.%Y');
        there.els.chooser.current.innerHTML = date.toFormat('%Fr, %Y');
        Browse.categories.update();
    });
    /* Events */

    Browse.categories.update();
}
Browse.categories.update = function () {
    var there = Browse.categories;
    //		Счета
    var usr = zenMoney.user.get();
    var accs = zenMoney.account.get();
    var cats = zenMoney.category.get();
    var insts = zenMoney.instrument.get();

    //		Категории
    var sum_by_cat = {
        '-1': {income: 0, outcome: 0, show_income: 1, show_outcome: 1}
    };
    var totalIncome = 0;
    var totalOutcome = 0;
    zenMoney.sql.db.transaction(function (tx) {
        var from = parseDate(there.els.chooser.value).toFormat('%Y-%m-%d');
        var to = new Date(from);
        to.setMonth(to.getMonth() + 1);
        to = to.toFormat('%Y-%m-%d');
        tx.executeSql('SELECT coalesce(tg.tag0, "cat_"||t.category) as id, tg.show_income, tg.show_outcome, SUM(t.income) as income, '+
            'SUM(t.outcome) as outcome, t.instrument_income, t.instrument_outcome '+
            'FROM transactions as t LEFT JOIN transaction_tag as tt ON ' +
            't.id = tt.`transaction` LEFT JOIN tag_group as tg ON tt.tag_group = tg.id WHERE (income = 0 or outcome = 0) AND coalesce(t.deleted, 0) != 1 AND ' +
            'coalesce(tg.deleted, 0) != 1 AND coalesce(tt.deleted, 0) != 1 AND t.date >= ? AND t.date < ? AND '+
            'coalesce(tt.`order`, 0) = 0 GROUP BY '+
            'coalesce(tg.tag0, t.category), tg.show_income, t.account_outcome, t.instrument_income, t.instrument_outcome'
            , [from, to], function (tx, res) {
                var rl = res.rows.length;
                var ui = zenMoney.user.cache.currency;
                for (var i=0;i<rl;i++) {
                    var row = res.rows.item(i);
                    if (sum_by_cat[row.id] === undefined) sum_by_cat[row.id] = {income: 0, outcome: 0};
                    sum_by_cat[row.id].income += row.income * (insts[row.instrument_income].value / insts[row.instrument_income].multiplier) / (insts[ui].value / insts[ui].multiplier);
                    sum_by_cat[row.id].outcome += row.outcome * (insts[row.instrument_outcome].value / insts[row.instrument_outcome].multiplier) / (insts[ui].value / insts[ui].multiplier);
                    sum_by_cat[row.id].show_income = row.show_income;
                    sum_by_cat[row.id].show_outcome = row.show_outcome;
                    sum_by_cat[-1].income += row.income * (insts[row.instrument_income].value / insts[row.instrument_income].multiplier) / (insts[ui].value / insts[ui].multiplier);
                    sum_by_cat[-1].outcome += row.outcome * (insts[row.instrument_outcome].value / insts[row.instrument_outcome].multiplier) / (insts[ui].value / insts[ui].multiplier);
                }
                console.log('sum_by_cat', sum_by_cat);
            })
    }, function () {
        console.error("Ошибка получения сумм:", arguments[0]);
    }, function () {
        var sum = totalOutcome;
        var key = 'outcome';
        if (there.els.type.value > 0) {
            sum = totalIncome;
            key = 'income';
        }

        var colors = ['d257f4', '5758f4', 'f4c857', 'c3f457', '57f466', '5ce04f', 'ff9523'];
        var color = 0;
        there.els.columns.parent.innerHTML = '';
        var i = 0;
        var catSort = [];
        for(var x in sum_by_cat) {
            if ((x == 'cat_0' || sum_by_cat[x]['show_'+key]) && sum_by_cat[x][key])
                catSort.push({id:x,sum:sum_by_cat[x][key]});
        }
        catSort = catSort.sort(function(e1, e2) {
            rate = function(e) {
                var r = 0;
                if (e.id == -1) r+=100;
//                if (e.id == 'cat_0') r+= 50;
                if (e.id == 'cat_2' || e.id == 'cat_1') r+= 10;
                return r;
            }
            var r1 = rate(e1), r2 = rate(e2);
            if (r1 > r2) return -1;
            else if (r1 < r2) return 1;
            if (e1.sum > e2.sum) return -1;
            else if (e1.sum < e2.sum) return 1;
            if (zenMoney.tag.byId[e1.id].title.toLowerCase() < zenMoney.tag.byId[e2.id].title.toLowerCase()) return -1;
            return 1;
        });

        console.log('catSort', catSort);
        if (catSort.length > 0) {
            var sum = sum_by_cat[-1][key];
            for (var m = 0; m < catSort.length; m++) {
                var tmp = catSort[m];

                var f_sum = parseFloat(tmp.sum);
                if (!isNaN(f_sum) && f_sum) {
                    var title = '';
                    if (tmp.id == -1) title = (key == 'income') ? 'Доход' : 'Расход';
                    else if (tmp.id == 'cat_0') title = 'Без категории';
                    else if (tmp.id == 'cat_2' || tmp.id == 'cat_1') title = 'Перевод';
                    else title = zenMoney.tag.byId[tmp.id].title;

                    var row = document.createElement('div');
                    row.className = 'row';

                    var width = ( 100 / sum * f_sum ) + '%';
                    var background = '#' + colors[color];
                    var cost_sum = costToString(f_sum, false);
                    row.innerHTML = '<div class="line" style="width:' + width + '; background:' + background + ';"></div>'+
                        '<div class="title" style="margin-right:' + (cost_sum.length + 2) + 'ex;">' +
                            String(title).safeText() +
                        '</div><div class="value">' + cost_sum + '</div>';
                    there.els.columns.parent.appendChild(row);
                }
                color++;
                if (color >= colors.length) {
                    color = 0;
                }
            }
        } else {
            there.els.columns.parent.innerHTML = '<div class="finalLoad">Нет данных за выбранный период</div>';
        }

        there.data.layer.data.scroll.refresh();
    });
}

// Синхронизация
Browse.sync.create = function (layer) {
    var there = Browse.sync;
    there.data.parent = document.createElement('div');
    there.data.parent.setAttribute('id', 'LayerBrowseCategories');
    there.data.parent.innerHTML = '<h2>Здесь будет что-то очень крутое!</h2>';
    layer.data.content.appendChild(there.data.parent);
}
Browse.sync.update = function () {

}