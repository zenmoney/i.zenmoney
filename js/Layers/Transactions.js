Transactions = {
    list:{
        render:false,
        data:{},
        init:function (layer, params) {
            var there = Transactions.list;
            there.data.layer = layer;
            if (!there.render) {
                there.render = true;
                there.create(layer, params);
            } else {
                there.update(params);
            }
        }
    }
}
Transactions.list.cache = {};
Transactions.list.create = function (layer, params) {
    var there = Transactions.list;

    there.data.parent = document.createElement('div');
    there.data.parent.setAttribute('id', 'LayerTransaction');
    there.data.accs = {};
    there.data.accs.parent = document.createElement('div');
    there.data.accs.parent.className = "accountsList";
    there.data.accs.active = -1;

    there.data.trans = {};
    there.data.trans.parent = document.createElement('div');
    there.data.trans.parent.className = "transactions";

    var getTransactionId = function (el) {
        var id = el.getAttribute('rel');
        if (id !== false) {
            var className = String(' ' + el.className + ' ');
            if (className.indexOf('transactions') === -1) {
                if (className.indexOf('transaction') === -1) {
                    return getTransactionId(el.parentNode);
                } else {
                    return id;
                }
            } else {
                return false;
            }
        } else {
            return false;
        }
    }
    zenEvents.ontap(there.data.trans.parent, function (el, e) {
        var id = getTransactionId(e.target);
        if (id) {
            var res = Transactions.list.cache[id];
            if (typeof res != 'undefined') {
                if (res.type != 'emoney') {
                    zForm.fill(res);
                    zForm.parent.style.display = 'block';
                    DOC.page.className = 'mini';
                    wps.browse.show(8);
                }
            }
        }
    });

    there.data.parent.appendChild(there.data.accs.parent);
    there.data.parent.appendChild(there.data.trans.parent);
    layer.data.content.appendChild(there.data.parent);

    Transactions.list.update(params);
}
Transactions.list.update = function (params) {

    var there = Transactions.list;
    Transactions.list.cache = {};
    var content = there.data.trans.parent;
    var cats = {};
    var accs = {};
    var inst = zenMoney.instrument.get();
    if (typeof params == 'object') {
        if (typeof params.account != 'undefined') {
            there.data.accs.active = parseInt(params.account);
        }
    }
    var generateLiElement = function (res) {
        var li = document.createElement('li');
        Transactions.list.cache[res.id] = res;
        var tpl = '';
        tpl += '<div class="transaction" rel="' + res.id + '">';
        if (accs[res.account].type != 'emoney') {
            if (typeof accs[res.account_transfer] != 'undefined') {
                if (accs[res.account_transfer].type != 'emoney') {
                    tpl += '	<div class="more"></div>';
                }
            } else {
                tpl += '	<div class="more"></div>';
            }
        }
        tpl += '	<div class="h">';
        if (res.type != 0) {
            tags = [];
            for (j = 0; j < res.tag_groups.length; j++) {
                if ((!res.tag_groups[j]) || res.tag_groups[j] == 'null') continue;
                tg = zenMoney.tag.groupById[res.tag_groups[j]];
                tag = String(zenMoney.tag.byId[tg.tag0].title).safeText();
                if (tg.tag1) {
                    tag += '&nbsp;/&nbsp;' + String(zenMoney.tag.byId[tg.tag1].title).safeText();
                }
                tags.push(tag);
            }
            catags = tags.join(', ');
            if (!catags) {
                catags = 'Без категории';
            }
            res.category = (isNaN(parseInt(res.category)) ? 0 : res.category);
            tpl += '		<div class="t">' + catags + '</div>';
            if (res.type == -1) {
                if (inst[res.instrument]) {
                    tpl += '		<div class="s">&minus;' + costToString(res.sum, 2) + ' ' + inst[res.instrument].symbol + '</div>';
                } else {
                    tpl += '		<div class="s">&minus;' + costToString(res.sum, 2) + ' ?</div>';
                }
            } else {
                tpl += '		<div class="s">+' + costToString(res.sum, 2) + ' ' + inst[res.instrument].symbol + '</div>';
            }
        } else {
            tpl += '		<div class="t"><span class="t_i"></span></div>';
            if (( res.sum == res.sum_transfer ) && ( res.instrument == res.instrument_transfer )) {
                tpl += '		<div class="s">' + costToString(res.sum, 2) + ' ' + inst[res.instrument].symbol + '</div>';
            } else {
                tpl += '		<div class="s">' + costToString(res.sum, 2) + ' ' + inst[res.instrument].symbol + ' &rarr; ' + costToString(res.sum_transfer, 2) + ' ' + inst[res.instrument_transfer].symbol + '</div>';
            }
        }

        tpl += '	</div>';
        tpl += '	<div class="b">';
        if (res.type != 0) {
            tpl += '		<div class="a">' + String(accs[res.account].title).safeText() + '</div>';
        } else {
            tpl += '		<div class="a">' + String(accs[res.account].title).safeText() + ' &rarr; ' + String(accs[res.account_transfer].title).safeText() + '</div>';
        }
        if (res.payee != '') {
            tpl += '		<div class="p">' + String(res.payee).safeText() + '</div>';
        }
        if (res.comment != '') {
            tpl += '		<div class="c">' + String(res.comment).safeText() + '</div>';
        }
        tpl += '	</div>';
        //tpl += '	<div class="delete"><div class="btn-wrap"><span class="button">Удалить</span></div></div>';
        tpl += '</div>';

        li.innerHTML = tpl;
        if (accs[res.account].type != 'emoney') {
            if (typeof res.account_transfer != 'undefined') {
                if (accs[res.account_transfer].type != 'emoney') {
                    /*
                     (function(li, res){
                     zenEvents.ontap(li, function(el){
                     zForm.fill(res);
                     zForm.parent.style.display = 'block';
                     DOC.page.className = 'mini';
                     wps.browse.show(8);
                     });
                     })(li, res)
                     */
                }
            } else {
                /*
                 (function(li, res){
                 zenEvents.ontap(li, function(el){
                 zForm.fill(res);
                 zForm.parent.style.display = 'block';
                 DOC.page.className = 'mini';
                 wps.browse.show(8);
                 });
                 })(li, res)
                 */
            }
        }

        return li;
    }

    var skip = 0;

    var draw_transactions = function (trans, newLoad) {

        var frag = document.createDocumentFragment();
        var ul = undefined;
        var dh, dt = undefined;
        if (newLoad == 1) {
            content.innerHTML = '';
        }
        var last_date = undefined;
        for (var i = 0; i < trans.length; i++) {
            var trans_date = trans[i].date;
            if (last_date != trans_date) {
                last_date = trans_date;
                dh = document.createElement('h3');
                dt = document.createTextNode(parseDate(trans_date).toFormat('%j %Fmr %Y'));
                dh.appendChild(dt);
                frag.appendChild(dh);
                ul = document.createElement('ul');
                frag.appendChild(ul);
            }
            ul.insertBefore(generateLiElement(trans[i]), ul.firstChild);
        }

        if (trans.length != 30) {
            if (zm.fixed) {
                window.onscroll = undefined;
            } else {
                scroll.onScrollEnd = function () {
                }
            }
            dh = document.createElement('div');
            dh.className = 'finalLoad';
            if (trans.length != 0) {
                dt = document.createTextNode('Больше транзакций нет');
            } else {
                dt = document.createTextNode('Нет транзакций');
            }
            dh.appendChild(dt);
            frag.appendChild(dh);
        }

        content.appendChild(frag);
        skip += 30;

        there.data.layer.data.scroll.refresh();
    }

    function bindScroller() {
        var scroll = there.data.layer.data.scroll;
        if (zm.fixed) {
            window.onscroll = function () {

                if (document.body.scrollHeight - window.innerHeight - document.body.scrollTop < 300) {
                    if (there.data.accs.active == '-1') {
                        zenMoney.transaction.get.list({
                            skip:skip,
                            limit:30
                        }, function (trans) {
                            draw_transactions(trans, 0);
                        });
                    } else {
                        zenMoney.transaction.get.list({
                            skip:skip,
                            limit:30,
                            account:[there.data.accs.active]
                        }, function (trans) {
                            draw_transactions(trans, 0);
                        });
                    }
                }
            };
        } else {
            scroll.onScrollEnd = function () {

                if (document.body.scrollHeight - document.body.scrollTop > scroll.y - 300) {
                    if (there.data.accs.active == '-1') {
                        zenMoney.transaction.get.list({
                            skip:skip,
                            limit:30
                        }, function (trans) {
                            draw_transactions(trans, 0);
                        });
                    } else {
                        zenMoney.transaction.get.list({
                            skip:skip,
                            limit:30,
                            account:[there.data.accs.active]
                        }, function (trans) {
                            draw_transactions(trans, 0);
                        });
                    }
                }
            };
        }
    }

    cats = zenMoney.category.get();
    accs = zenMoney.account.get();
    accs_sort = zenMoney.account.sort;

    var accsListTpl = '<select data-role="none">';
    accsListTpl += '<option value="-1">Все счета</option>';
    for (var i = 0; i < accs_sort.length; ++i) {
        var id = accs_sort[i];
        var selected = '';
        if (id == there.data.accs.active) {
            selected = 'selected="selected"';
        }
        accsListTpl += '<option value="' + accs_sort[i] + '" ' + selected + '>' + String(accs[id].title).safeText() + '</option>';
    }
    accsListTpl += '</select>';
    if (accs_sort.length > 1) {
        there.data.accs.parent.innerHTML = accsListTpl;
        var select = there.data.accs.parent.querySelector('select');
        select.onchange = function () {
            there.data.accs.active = select.value;
            Transactions.list.update();
        }
    }
    if (there.data.accs.active == -1) {
        zenMoney.transaction.get.list({
            skip:skip,
            limit:30
        }, function (trans) {
            bindScroller();
            draw_transactions(trans, 1);
        });
    } else {
        zenMoney.transaction.get.list({
            skip:skip,
            limit:30,
            account:[there.data.accs.active]
        }, function (trans) {
            bindScroller();
            draw_transactions(trans, 1);
        });
    }


}