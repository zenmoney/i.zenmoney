zenform = function (options) {
//    console.error('zfinit');
    var there = this;
    this.form = document.createDocumentFragment();
    this.els = {}; // Элементы
    this.parent = options.parent;
    this.insts = zenMoney.instrument.get();
    this.cats = zenMoney.category.get();
    this.cats_sort = zenMoney.category.sort;
    this.accs = zenMoney.account.get();
    this.accs_sort = zenMoney.account.sort;
    this.callback = options.callback;
    this.cancel = options.cancel;
    this.del = options.del;
    this.id = 'new';

    var baseForm = document.createElement('div');
    baseForm.className = 'zenForm open';
    var bTp = '';
    bTp += '	<form class="zf-form">';
    bTp += '		<div class="zf-f-type-hidder">';
    bTp += '			<div class="zf-f-type">';
    bTp += '				<div class="zf-f-t-wrap">';
    bTp += '					<label class="zf-f-t-expense"><input type="radio" name="type" value="-1" data-role="none"><span class="zf-f-t-text">Расход</span></label>';
    bTp += '					<label class="zf-f-t-income"><input type="radio" name="type" value="1" data-role="none"><span class="zf-f-t-text">Доход</span></label>';
    bTp += '					<label class="zf-f-t-transfer"><input type="radio" name="type" value="0" data-role="none"><span class="zf-f-t-text">Перевод</span></label>';
    bTp += '				</div>';
    bTp += '			</div>';
    bTp += '		</div>';
    bTp += '		<div class="zf-f-alert">Транзакция добавлена</div>';
    bTp += '		<div class="zf-f-sum-table">';
    bTp += '			<div class="zf-f-row">';
    bTp += '				<div class="zf-f-sum">';
    bTp += '					<div class="row">';
    bTp += '						<span class="sign">-</span><input type="number" name="sum" placeholder="Сумма" data-role="none" autocomplete="off"><span class="currency"></span>';
    bTp += '					</div>';
    bTp += '				</div>';
    bTp += '				<div class="zf-f-arrow">&rarr;</div>';
    bTp += '				<div class="zf-f-sum_transfer">';
    bTp += '					<div class="row">';
    bTp += '						<span class="sign">+</span><input type="number" name="sum_transfer" placeholder="Сумма" data-role="none" autocomplete="off"><span class="currency"></span>';
    bTp += '					</div>';
    bTp += '				</div>';
    bTp += '			</div>';
    bTp += '		</div>';
    bTp += '        <div class="zf-f-tagSelect">';
    bTp += '            <table width="100%" cellpadding="0" cellspacing="0">';
    bTp += '                <tr>';
    bTp += '                    <td>';
    bTp += '                        <select class="zf-f-tagList"><option>Без категории</option></select>';
    bTp += '                    </td>';
    bTp += '                    <td width="1">';
    bTp += '                        <a class="zf-f-tagAddBtn" href="javascript:void(0)"></a>';
    bTp += '                    </td>';
    bTp += '                </tr>';
    bTp += '            </table>';
    bTp += '        </div>';
    bTp += '        <div class="zf-f-tags"></div>';
    bTp += '		<div class="zf-f-category_expense hidden">';
    bTp += '			<select name="category_expense" data-role="none"></select>';
    bTp += '		</div>';
    bTp += '		<div class="zf-f-category_income hidden">';
    bTp += '			<select name="category_income" data-role="none"></select>';
    bTp += '		</div>';
    bTp += '		<div class="zf-f-account">';
    bTp += '			<div class="zf-f-account_title">Со счета</div>';
    bTp += '			<select name="account" data-role="none"></select>';
    bTp += '		</div>';
    bTp += '		<div class="zf-f-account_transfer">';
    bTp += '			<div class="zf-f-account_title">На счет</div>';
    bTp += '			<select name="account_transfer" data-role="none"></select>';
    bTp += '		</div>';
    bTp += '		<div class="zf-f-date"></div>';
    bTp += '		<div class="zf-f-payee">';
    bTp += '			<input type="text" name="payee" placeholder="Получатель" data-role="none">';
    bTp += '		</div>';
    bTp += '		<div class="zf-f-comment">';
    bTp += '			<input type="text" name="comment" placeholder="Комментарий" data-role="none">';
    bTp += '		</div>';
    bTp += '		<div class="zf-f-submit">';
    bTp += '			<input type="image" src="images/buttons/btn3.png" alt="Добавить" width="102" height="31" data-role="none"> <span class="zf-f-delete">Удалить</span><span class="zf-f-cancel"></span>';
    bTp += '		</div>';
    bTp += '	</form>';
    baseForm.innerHTML = bTp;
    this.form.appendChild(baseForm);

    this.els.header = this.form.querySelector('.zf-header');
    this.els.form = this.form.querySelector('.zf-form');
    this.els.form.onsubmit = function () {
        there.get(there);
        return false;
    }
    this.alertShow = false;
    this.alert = function (text, type) {
        if (there.alertShow) {
            there.els.alert.innerHTML = text;
        } else {
            there.alertShow = true;
            there.els.alert.innerHTML = text;
            there.els.alert.style.display = 'block';
            there.els.alert.style.opacity = 1;
            setTimeout(function () {
                there.els.alert.style.opacity = 0;
                setTimeout(function () {
                    there.els.alert.style.display = 'none';
                    there.alertShow = false;
                }, 300);
            }, 3000);
        }
    }
    this.els.alert = this.form.querySelector('.zf-f-alert');
    // Тип
    this.els.type = {};
    this.els.type.wrap;
    this.els.type.value = -1;
    this.els.type.val = function () {
        if (typeof arguments[0] == 'undefined') {
            return there.els.type.value;
        } else {
            var type = arguments[0];
            switch (type) {
                case '-1':
                case -1:
                    there.els.type.expense.input.checked = true;
                    there.els.type.expense.change();
                    break;
                case '0':
                case 0:
                    there.els.type.transfer.input.checked = true;
                    there.els.type.transfer.change();
                    break;
                case '1':
                case 1:
                    there.els.type.income.input.checked = true;
                    there.els.type.income.change();
                    break;
            }
            return there.els.type.value;
        }
    }
    this.els.type.expense = {};
    this.els.type.expense.parent = this.form.querySelector('.zf-f-t-expense');
    this.els.type.expense.input = this.els.type.expense.parent.querySelector('input');
    this.els.type.expense.parent.addEventListener(EVENTS.touchstart, function () {
        there.els.type.val(-1);
    }, false);
    this.els.type.income = {};
    this.els.type.income.parent = this.form.querySelector('.zf-f-t-income');
    this.els.type.income.input = this.els.type.income.parent.querySelector('input');
    this.els.type.income.parent.addEventListener(EVENTS.touchstart, function () {
        there.els.type.val(1);
    }, false);
    this.els.type.transfer = {};
    this.els.type.transfer.parent = this.form.querySelector('.zf-f-t-transfer');
    this.els.type.transfer.input = this.els.type.transfer.parent.querySelector('input');
    this.els.type.transfer.parent.addEventListener(EVENTS.touchstart, function () {
        there.els.type.val(0);
    }, false);

    this.els.type.expense.change = function () {
        there.els.account.input.innerHTML = there.els.acc_without_debt;
        there.els.sum.wrap.style.display = 'block';
        there.els.sum.wrap.style.width = 'auto';
        there.els.sum.wrap.querySelector('.sign').innerHTML = '&minus;';
        there.els.arrow.style.display = 'none';
//        there.els.category_expense.wrap.style.display = 'block';
//        there.els.category_income.wrap.style.display = 'none';
        there.els.account.wrap.style.display = 'block';
        there.els.account.title.style.display = 'none';
        there.els.account_transfer.wrap.style.display = 'none';
        there.els.sum_transfer.wrap.style.display = 'none';
        there.els.type.value = -1;
        there.fillTags();
        if (there.omni) $(there.els.tags).removeClass('hidden');
        else $(there.els.tagListContainer).removeClass('hidden');
    }
    this.els.type.expense.input.addEventListener('change', there.els.type.expense.change, false);

    this.els.type.income.change = function () {
        there.els.account.input.innerHTML = there.els.acc_without_debt;
        there.els.sum.wrap.style.display = 'block';
        there.els.sum.wrap.style.width = 'auto';
        there.els.sum.wrap.querySelector('.sign').innerHTML = '+';
        there.els.arrow.style.display = 'none';
//        there.els.category_expense.wrap.style.display = 'none';
//        there.els.category_income.wrap.style.display = 'block';
        there.els.account.wrap.style.display = 'block';
        there.els.account.title.style.display = 'none';
        there.els.account_transfer.wrap.style.display = 'none';
        there.els.sum_transfer.wrap.style.display = 'none';
        there.els.type.value = 1;
        there.fillTags();
        if (there.omni) $(there.els.tags).removeClass('hidden');
        else $(there.els.tagListContainer).removeClass('hidden');
    }
    this.els.type.income.input.addEventListener('change', there.els.type.income.change, false);

    this.els.type.transfer.change = function () {
        there.els.account.input.innerHTML = there.els.acc_with_debt;
        there.els.sum.wrap.style.display = 'table-cell';
        there.els.sum.wrap.style.width = '45%';
        there.els.sum.wrap.querySelector('.sign').innerHTML = '&minus;';
        there.els.arrow.style.display = 'table-cell';
//        there.els.category_expense.wrap.style.display = 'none';
//        there.els.category_income.wrap.style.display = 'none';
        there.els.account.wrap.style.display = 'block';
        there.els.account.title.style.display = 'block';
        there.els.account_transfer.wrap.style.display = 'block';
        there.els.sum_transfer.wrap.style.display = 'table-cell';
        there.els.type.value = 0;
        $(there.els.tags).addClass('hidden');
        $(there.els.tagListContainer).addClass('hidden');
    }
    this.els.type.transfer.input.addEventListener('change', there.els.type.transfer.change, false);

    // Стрелка в переводе
    this.els.arrow = this.form.querySelector('.zf-f-arrow');
    // Сумма
    this.els.sum = {};
    this.els.sum.wrap = this.form.querySelector('.zf-f-sum');
    this.els.sum.input = this.form.querySelector('input[name="sum"]');
    this.els.sum.cur = this.els.sum.wrap.querySelector('.currency');
    this.els.sum.val = function () {
        var val = there.els.sum.input.value;
        if (typeof arguments[0] != 'undefined') {
            there.els.sum.input.value = arguments[0];
            val = arguments[0];
        }
        val = String(val).replace(/[^\d\,\.]*/g, '').replace(/\,/g, '.');
        val = parseFloat(val, 10);
        if (isNaN(val)) {
            val = 0;
        }
        return val;
    }
    // Расходные категории
    this.els.category_expense = {};
    this.els.category_expense.wrap = this.form.querySelector('.zf-f-category_expense');
    this.els.category_expense.input = this.form.querySelector('select[name="category_expense"]');
    this.els.category_expense.val = function () {
        if (typeof arguments[0] == 'undefined') {
            return parseInt(there.els.category_expense.input.value);
        } else {
            there.els.category_expense.input.value = arguments[0];
            return parseInt(there.els.category_expense.input.value);
        }
    }
    // Доходные категории
    this.els.category_income = {};
    this.els.category_income.wrap = this.form.querySelector('.zf-f-category_income');
    this.els.category_income.input = this.form.querySelector('select[name="category_income"]');
    this.els.category_income.val = function () {
        if (typeof arguments[0] == 'undefined') {
            return parseInt(there.els.category_income.input.value);
        } else {
            there.els.category_income.input.value = arguments[0];
            return parseInt(there.els.category_income.input.value);
        }
    }
    // Счета
    this.els.account = {};
    this.els.account.wrap = this.form.querySelector('.zf-f-account');
    this.els.account.title = this.form.querySelector('.zf-f-account .zf-f-account_title');
    this.els.account.input = this.form.querySelector('select[name="account"]');
    this.els.account.val = function () {
        var val = undefined;
        if (typeof arguments[0] != 'undefined') {
            there.els.account.input.value = arguments[0];
            there.els.account.input.onchange();
        }
        val = parseInt(there.els.account.input.value);
        if (typeof there.accs[val] != 'object') {
            val = there.accs_sort[0];
        }
        return val;
    }
    this.els.account.input.onchange = function () {
        try {
            var val = there.els.account.input.value;
            var cur = there.els.sum.cur;
            var inst = there.accs[ val ].instrument;
            cur.innerHTML = there.insts[inst]['symbol'];

            var opts = '';
            for (var i = 0; i < there.accs_sort.length; i++) {
                var el = there.els.account_transfer.input.querySelector('option[value="' + there.accs_sort[i] + '"]');
                if (val != there.accs_sort[i]) {
                    el.removeAttribute('disabled');
                } else {
                    var tVal = there.els.account_transfer.input.value;
                    if (tVal == val) {
                        var j = 0;
                        while (there.accs_sort[j] == tVal && j < there.accs_sort.length) {
                            ++j;
                        }
                        if (j < there.accs_sort.length) {
                            there.els.account_transfer.input.value = there.accs_sort[j];
                        }
                    }
                    el.setAttribute('disabled', 'disabled');
                }
            }
            there.els.account_transfer.input.onchange();
        } catch (ex) {

        } finally {

        }
    }
    // Переводные счета
    this.els.account_transfer = {};
    this.els.account_transfer.wrap = this.form.querySelector('.zf-f-account_transfer');
    this.els.account_transfer.title = this.form.querySelector('.zf-f-account_transfer .zf-f-account_title');
    this.els.account_transfer.input = this.form.querySelector('select[name="account_transfer"]');
    this.els.account_transfer.val = function () {
        var val = undefined;
        if (typeof arguments[0] != 'undefined') {
            there.els.account_transfer.input.value = arguments[0];
            there.els.account_transfer.input.onchange();
        }
        val = parseInt(there.els.account_transfer.input.value);
        if (typeof there.accs[val] != 'object') {
            val = there.accs_sort[0];
        }
        return val;
    }
    this.els.account_transfer.input.onchange = function () {
        var val = there.els.account_transfer.input.value;
        if (!isNaN(parseInt(val))) {
            var cur = there.els.sum_transfer.cur;
            var inst = there.accs[ val ].instrument;
            cur.innerHTML = there.insts[inst]['symbol'];
        }
    }
    // Переводная сумма
    this.els.sum_transfer = {};
    this.els.sum_transfer.wrap = this.form.querySelector('.zf-f-sum_transfer');
    this.els.sum_transfer.input = this.form.querySelector('input[name="sum_transfer"]');
    this.els.sum_transfer.cur = this.els.sum_transfer.wrap.querySelector('.currency');
    this.els.sum_transfer.val = function () {
        if (typeof arguments[0] == 'undefined') {
            return there.els.sum_transfer.input.value;
        } else {
            there.els.sum_transfer.input.value = arguments[0];
            return there.els.sum_transfer.input.value;
        }
    }
    // Дата
    this.els.date = {};
    this.els.date.active = new Date();
    this.els.date.wrap = this.form.querySelector('.zf-f-date');
    this.els.date.calendar = new zencalendar({
        parent:this.els.date.wrap
    });
    this.els.date.val = function () {
        // Возращает дату в формате JavaScript Date, принимает JavaScript Date или дату в формате dd.mm.yyyy
        var date = undefined;
        var today = new Date();
        today.setHours(0);
        today.setMinutes(0);
        today.setSeconds(0);
        today.setMilliseconds(0);
        if (typeof arguments[0] == 'undefined') {
            return there.els.date.active;
        } else {
            var newD = parseDate(arguments[0]);
            if (( typeof newD == 'object' ) && ( newD instanceof Date )) {
                there.els.date.active = newD;
                there.els.date.calendar.set(newD.toFormat('%d.%m.%Y'));
                return newD;
            } else {
                return false;
            }
        }
    }

    this.els.payee = {};
    this.els.payee.wrap = this.form.querySelector('.zf-f-payee');
    this.els.payee.input = this.els.payee.wrap.querySelector('input');
    this.els.payee.val = function () {
        if (typeof arguments[0] == 'undefined') {
            return there.els.payee.input.value;
        } else {
            there.els.payee.input.value = arguments[0];
            return there.els.payee.input.value;
        }
    }
    // Комментарий
    this.els.comment = {};
    this.els.comment.wrap = this.form.querySelector('.zf-f-comment');
    this.els.comment.input = this.els.comment.wrap.querySelector('input');
    this.els.comment.val = function () {
        if (typeof arguments[0] == 'undefined') {
            return there.els.comment.input.value;
        } else {
            there.els.comment.input.value = arguments[0];
            return there.els.comment.input.value;
        }
    }

    // Кнопка
    this.els.submit = {};
    this.els.submit.wrap = this.form.querySelector('.zf-f-submit');
    this.els.submit.input = this.els.submit.wrap.querySelector('input[type="image"]');
    // Удалялка
    this.els.del = {};
    this.els.del.wrap = this.form.querySelector('.zf-f-delete');
    this.els.del.input = this.els.del.wrap;
    zenEvents.ontap(this.els.del.input, function () {
        there.del(there.id);
    });
    // Отменить
    this.els.cancel = {};
    this.els.cancel.wrap = this.form.querySelector('.zf-f-submit');
    this.els.cancel.input = this.els.cancel.wrap.querySelector('.zf-f-cancel');
    this.els.cancel.input.addEventListener(EVENTS.touchend, function () {
        there.cancel(there);
    }, false);

    // tags
    this.els.tagListContainer = this.form.querySelector('.zf-f-tagSelect');
    this.els.tagList = this.form.querySelector('.zf-f-tagList');
    this.els.tagAddBtn = this.form.querySelector('.zf-f-tagAddBtn');


    this.els.tags = this.form.querySelector('.zf-f-tags');
    this.omni = false
    this.els.tagbox = $(this.els.tags).omnibox({
        data:zenMoney.tag.suggest,
        placeholder:'Категория',
        distinct:false,
        limit:3,
        groupBy:'type',
        orderBy:'popularity',
        order:'desc',
        tagStyle:'inside',
        hideNoTitles:false,
        inlineDrop:true,
        autoCreate:true,
        onCreate:function (title, groups) {
            // searching for duplicates
            for (i = 0; i < groups.length; i++) {
                if (groups[i].title.toLowerCase() == title.toLowerCase())
                    return groups[i];
            }
            return {
                id:null,
                title:title,
                type:'tag'
            }
        },
        filter:function (text, groups) {
            var matched = [];
            text = text.toLowerCase();

            for (i = 0; i < groups.length; i++) {
                var dir = there.els.type.val();
                if (!text) {
                    if ((dir == -1 && !groups[i].show_outcome) || (dir == 1 && !groups[i].show_income)) {
                        continue;
                    }
                    matched.push(i);
                    continue;
                }
                if (groups[i].title.toLowerCase().match(text)) {
                    matched.push(i);

                }
            }

            return matched;
        }
    });

    this.refill();
    this.events();

    this.parent.appendChild(this.form);
    return this;
}

zenform.prototype.fillTags = function () {
    var groups = zenMoney.tag.group.slice().sort(function (g1, g2) {
        try {
            var t1 = zenMoney.tag.byId[g1.tag0].title, t2 = zenMoney.tag.byId[g2.tag0].title;
            if (t1 == t2) {
                if (!g1.tag1) return -1;
                if (!g2.tag1) return 1;
                if (zenMoney.tag.byId[g1.tag1].title < zenMoney.tag.byId[g2.tag1].title) return -1;
                else return 1;
            }
            if (t1 < t2) return -1;
            return 1;
        } catch (e) {
            return 0;
        }
    });
    var gl = groups.length;
    var selid = $(this.els.tagList).val();
    $(this.els.tagList).html('<option value="0">Без категории</option>');
    for (var i = 0; i < gl; i++) {
        var tg = groups[i];
        var selected = false;
        if (tg.id == selid) {
            selected = true;
        }
        if (this.els.type.value == 1 && (tg.show_income == "false" || !tg.show_income) && !selected) continue;
        if (this.els.type.value == -1 && (tg.show_outcome == "false" || !tg.show_outcome) && !selected) continue;
        try {
            var title = zenMoney.tag.byId[tg.tag0].title;
        } catch (e) {
            console.error('Invalid tag_group', tg);
            continue;
        }
        if (tg.tag1) {
            title += ' / ' + zenMoney.tag.byId[tg.tag1].title;
        }
        $(this.els.tagList).append('<option value="' + tg.id + '" ' + ((selected) ? 'selected="selected"' : '') + '>' + title + '</option>');
    }
}
zenform.prototype.refill = function () {
    var there = this;
    there.id = 'new';
    there.els.del.wrap.style.display = 'none';
    there.els.submit.input.setAttribute('src', 'images/buttons/btn3.png');
    there.els.submit.input.setAttribute('alt', 'Добавить');

    there.insts = zenMoney.instrument.get();
    there.cats = zenMoney.category.get();
    there.cats_sort = zenMoney.category.sort;
    there.accs = zenMoney.account.get();
    there.accs_sort = zenMoney.account.sort;
    there.els.tagbox.clear();
    $(there.els.tagList).val(0);
    $(there.els.tagListContainer).removeClass('hidden');
    $(there.els.tagbox).addClass('hidden');
    this.omni = false;

    // заполняем теги
    there.fillTags();

//    var opts = '';
//    for (var i = 0; i < there.cats_sort['-1'].length; i++) {
//        opts += '<option value="' + there.cats_sort['-1'][i] + '">' + String(there.cats['-1'][ there.cats_sort['-1'][i] ].title).safeText() + '</option>';
//    }
//    there.els.category_expense.input.innerHTML = opts;
//
//    opts = '';
//    for (var i = 0; i < there.cats_sort['1'].length; i++) {
//        opts += '<option value="' + there.cats_sort['1'][i] + '">' + String(there.cats['1'][ there.cats_sort['1'][i] ].title).safeText() + '</option>';
//    }
//    there.els.category_income.input.innerHTML = opts;

/*
    opts = '';
    for (var i = 0; i < there.accs_sort.length; i++) {
        var selected = '';
        if (zenMoney.account.activity() == there.accs_sort[i]) {
            selected = ' selected="selected" ';
        }
        if (there.accs[ there.accs_sort[i] ].type.substr(0, 4) != 'uit_') {
            opts += '<option ' + selected + ' value="' + there.accs_sort[i] + '">' + String(there.accs[ there.accs_sort[i] ].title).safeText() + '</option>';
        }
    }
    there.els.acc_without_debt = opts;
*/

    var activity = zenMoney.account.activity();
    there.els.acc_with_debt = '';
    there.els.acc_without_debt = '';
    for (var i = 0; i < there.accs_sort.length; i++) {
        var selected = '';
        if (activity == there.accs_sort[i]) {
            selected = ' selected="selected" ';
        }
        if (there.accs[ there.accs_sort[i] ].type.substr(0, 4) != 'uit_') {
            var s = '<option ' + selected + ' value="' + there.accs_sort[i] + '">' + String(there.accs[ there.accs_sort[i] ].title).safeText() + '</option>';
            if (there.accs[ there.accs_sort[i] ].type != 'debt') {
                there.els.acc_without_debt += s;
            }
            there.els.acc_with_debt += s;
        }
    }

    there.els.account.input.innerHTML = there.els.acc_with_debt;
    there.els.account_transfer.input.innerHTML = there.els.acc_with_debt;

    there.els.account.input.onchange();

    there.els.date.val(new Date().toFormat('%d.%m.%Y'));
    there.els.type.val(-1);
    there.els.sum.val(null);
    there.els.sum_transfer.val(null);
    there.els.payee.val('');
    there.els.comment.val('');
    there.els.tagbox.clear();
    there.last_params = undefined;
}
zenform.prototype.fill = function (params) {
    console.error('fill');
    var there = this;
    if (typeof params == 'undefined') {
        params = there.last_params;
        if (typeof params == 'undefined')
            return;
    }
    if (typeof params.id == 'undefined' || params.id == 'new') {
        params.id = 'new';
    } else {
        params.id = parseInt(params.id);
        if (isNaN(params.id)) params.id = 'new';
    }
    if (params.id == 'new') {
        this.els.submit.input.setAttribute('src', 'images/buttons/btn3.png');
        this.els.submit.input.setAttribute('alt', 'Добавить');
        this.els.del.wrap.style.display = 'none';
    } else {
        this.els.submit.input.setAttribute('src', 'images/buttons/btn2.png');
        this.els.submit.input.setAttribute('alt', 'Сохранить');
        this.els.del.wrap.style.display = 'block';
    }
    there.id = params.id;
    there.els.date.val(params.date);
    console.log('params', params);
    switch (params.type) {
        case '-1':
        case -1:
            there.els.type.val(-1);
            there.els.sum.val(params.sum);
            there.els.sum_transfer.val(null);
//            there.els.category_income.val(0);
//            there.els.category_expense.val(params.category);
            there.els.account.val(params.account);
            break;
        case '0':
        case 0:
            there.els.type.val(0);
            there.els.sum.val(params.sum);
            there.els.sum_transfer.val(params.sum_transfer);
//            there.els.category_income.val(0);
//            there.els.category_expense.val(0);
            there.els.account.val(params.account);
            there.els.account_transfer.val(params.account_transfer);
            break;
        case '1':
        case 1:
            there.els.type.val(1);
            there.els.sum.val(params.sum);
            there.els.sum_transfer.val(null);
//            there.els.category_income.val(params.category);
//            there.els.category_expense.val(0);
            there.els.account.val(params.account);
            break;
    }
    there.els.payee.val(params.payee);
    there.els.comment.val(params.comment);
    there.last_params = params;
    // tags
    if (params.type != 0) {
        zenMoney.sql.db.transaction(function (tx) {
            there.els.tagbox.clear();
            tx.executeSql('SELECT tag_group FROM transaction_tag WHERE `transaction` = ? AND coalesce(deleted, 0) != 1 ORDER BY `order`', [params.id], function (tx, result) {
                if (result.rows.length > 1) {
                    there.omni = true;
                    $(there.els.tagListContainer).addClass('hidden');
                    $(there.els.tagbox).removeClass('hidden');
                } else {
                    there.omni = false;
                    $(there.els.tagListContainer).removeClass('hidden');
                    $(there.els.tagbox).addClass('hidden');
                }
                for (var i = 0; i < result.rows.length; i++) {
                    tg = result.rows.item(i).tag_group;
                    there.els.tagbox.select('tag_group', tg);
                    if (i == 0) {
                        $(there.els.tagList).val(tg);
                    }
                }
            })
        })
    }

}
zenform.prototype.events = function () {
    var there = this;
    var form = this.form.querySelector('.zenForm');
    var header = this.els.header;
    var me = this;
    $(this.els.tagAddBtn).click(function () {
        $(me.els.tagbox).removeClass('hidden');
        $(me.els.tagListContainer).addClass('hidden');
        me.omni = true;
        me.els.tagbox.reWidth();
    });
    $(this.els.tagList).change(function () {
        me.els.tagbox.clear();
        me.els.tagbox.select('tag_group', $(me.els.tagList).val());
    });
}
zenform.prototype.get = function (there) {
    var fData = {};
    fData.id = there.id;
    fData.type = there.els.type.val();
    fData.sum = there.els.sum.val();
    fData.date = parseDate(zForm.els.date.calendar.get());
    fData.comment = there.els.comment.val();
    fData.tags = {
        tags:[],
        tag_groups:[]
    }

    switch (fData.type) {
        case -1:
        case '-1':
            fData.category = there.els.category_expense.val();
            fData.account = there.els.account.val();
            fData.payee = there.els.payee.val();
            // теги
            var sel = there.els.tagbox.getSelected();

            for (x = 0; x < sel.length; x++) {
                if (sel[x].created) {
                    fData.tags.tags.push(sel[x].title);
                } else {
                    fData.tags.tag_groups.push(sel[x].id);
                }
            }
            break;
        case 0:
        case '0':
            fData.sum_transfer = there.els.sum_transfer.val();
            fData.account = there.els.account.val();
            fData.account_transfer = there.els.account_transfer.val();
            fData.payee = there.els.payee.val();
            fData.category = 0;
            break;
        case 1:
        case '1':
            fData.category = there.els.category_income.val();
            fData.account = there.els.account.val();
            fData.payee = there.els.payee.val();
            // теги
            var sel = there.els.tagbox.getSelected();

            for (x = 0; x < sel.length; x++) {
                if (sel[x].created) {
                    fData.tags.tags.push(sel[x].title);
                } else {
                    fData.tags.tag_groups.push(sel[x].id);
                }
            }
            break;
    }

    if (fData.type == 0) {
        if (( zenMoney.account.get(fData.account).type == 'debt' ) || ( ( zenMoney.account.get(fData.account_transfer).type == 'debt' ) )) {
            if (fData.payee == '' || fData.payee == undefined) {
                if (zenMoney.account.get(fData.account).type == 'debt') {
                    alert('Укажите в получателе у кого берете в долг или кто вам вернул долг');
                } else {
                    alert('Укажите в получателе кому даете в долг или кому возвращаете долг');
                }
                there.els.payee.input.focus();
                return false;
            }
        }
    }
    there.callback(fData);
}