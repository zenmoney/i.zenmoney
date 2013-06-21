var zm = zm || {};
if (!zm.utils) zm.utils = {};

zm.utils.sortByTitle = function(cls, a, b) {
    var oa = a, ob = b;
    if (typeof oa == 'number') {
        oa = zm.profile[cls][a];
    } 
    if (typeof ob == 'number') {
        ob = zm.profile[cls][b];
    }
    if (oa.title > ob.title) return 1;
    return -1;
}

zm.utils.strtotime = function (str, now) {
    // http://kevin.vanzonneveld.net
    // +   original by: Caio Ariede (http://caioariede.com)
    // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +      input by: David
    // +   improved by: Caio Ariede (http://caioariede.com)
    // +   improved by: Brett Zamir (http://brett-zamir.me)
    // +   bugfixed by: Wagner B. Soares
    // +   bugfixed by: Artur Tchernychev
    // %        note 1: Examples all have a fixed timestamp to prevent tests to fail because of variable time(zones)
    // *     example 1: strtotime('+1 day', 1129633200);
    // *     returns 1: 1129719600
    // *     example 2: strtotime('+1 week 2 days 4 hours 2 seconds', 1129633200);
    // *     returns 2: 1130425202
    // *     example 3: strtotime('last month', 1129633200);
    // *     returns 3: 1127041200
    // *     example 4: strtotime('2009-05-04 08:30:00');
    // *     returns 4: 1241418600
    var i, l, match, s, parse = '';

    str = str.replace(/\s{2,}|^\s|\s$/g, ' '); // unecessary spaces
    str = str.replace(/[\t\r\n]/g, ''); // unecessary chars
    if (str === 'now') {
        return now === null || isNaN(now) ? new Date().getTime() / 1000 | 0 : now | 0;
    } else if (!isNaN(parse = Date.parse(str))) {
        return parse / 1000 | 0;
    } else if (now && !(now instanceof Date)) {
        now = new Date(now * 1000); // Accept PHP-style seconds
    } else {
        now = new Date();
    }

    str = str.toLowerCase();

    var __is = {
        day:{
            'sun':0,
            'mon':1,
            'tue':2,
            'wed':3,
            'thu':4,
            'fri':5,
            'sat':6
        },
        mon:[
        'jan',
        'feb',
        'mar',
        'apr',
        'may',
        'jun',
        'jul',
        'aug',
        'sep',
        'oct',
        'nov',
        'dec'
        ]
    };

    var process = function (m) {
        var ago = (m[2] && m[2] === 'ago');
        var num = (num = m[0] === 'last' ? -1 : 1) * (ago ? -1 : 1);

        switch (m[0]) {
            case 'last':
            case 'next':
                switch (m[1].substring(0, 3)) {
                    case 'yea':
                        now.setFullYear(now.getFullYear() + num);
                        break;
                    case 'wee':
                        now.setDate(now.getDate() + (num * 7));
                        break;
                    case 'day':
                        now.setDate(now.getDate() + num);
                        break;
                    case 'hou':
                        now.setHours(now.getHours() + num);
                        break;
                    case 'min':
                        now.setMinutes(now.getMinutes() + num);
                        break;
                    case 'sec':
                        now.setSeconds(now.getSeconds() + num);
                        break;
                    case 'mon':
                        if (m[1] === "month") {
                            now.setMonth(now.getMonth() + num);
                            break;
                        }
                    // fall through
                    default:
                        var day = __is.day[m[1].substring(0, 3)];
                        if (typeof day !== 'undefined') {
                            var diff = day - now.getDay();
                            if (diff === 0) {
                                diff = 7 * num;
                            } else if (diff > 0) {
                                if (m[0] === 'last') {
                                    diff -= 7;
                                }
                            } else {
                                if (m[0] === 'next') {
                                    diff += 7;
                                }
                            }
                            now.setDate(now.getDate() + diff);
                            now.setHours(0, 0, 0, 0); // when jumping to a specific last/previous day of week, PHP sets the time to 00:00:00
                        }
                }
                break;

            default:
                if (/\d+/.test(m[0])) {
                    num *= parseInt(m[0], 10);

                    switch (m[1].substring(0, 3)) {
                        case 'yea':
                            now.setFullYear(now.getFullYear() + num);
                            break;
                        case 'mon':
                            now.setMonth(now.getMonth() + num);
                            break;
                        case 'wee':
                            now.setDate(now.getDate() + (num * 7));
                            break;
                        case 'day':
                            now.setDate(now.getDate() + num);
                            break;
                        case 'hou':
                            now.setHours(now.getHours() + num);
                            break;
                        case 'min':
                            now.setMinutes(now.getMinutes() + num);
                            break;
                        case 'sec':
                            now.setSeconds(now.getSeconds() + num);
                            break;
                    }
                } else {
                    return false;
                }
                break;
        }
        return true;
    };

    match = str.match(/^(\d{2,4}-\d{2}-\d{2})(?:\s(\d{1,2}:\d{2}(:\d{2})?)?(?:\.(\d+))?)?$/);
    if (match !== null) {
        if (!match[2]) {
            match[2] = '00:00:00';
        } else if (!match[3]) {
            match[2] += ':00';
        }

        s = match[1].split(/-/g);

        s[1] = __is.mon[s[1] - 1] || s[1];
        s[0] = +s[0];

        s[0] = (s[0] >= 0 && s[0] <= 69) ? '20' + (s[0] < 10 ? '0' + s[0] : s[0] + '') : (s[0] >= 70 && s[0] <= 99) ? '19' + s[0] : s[0] + '';
        return parseInt(this.strtotime(s[2] + ' ' + s[1] + ' ' + s[0] + ' ' + match[2]) + (match[4] ? match[4] / 1000 : ''), 10);
    }

    var regex = '([+-]?\\d+\\s' + '(years?|months?|weeks?|days?|hours?|min|minutes?|sec|seconds?' + '|sun\\.?|sunday|mon\\.?|monday|tue\\.?|tuesday|wed\\.?|wednesday' + '|thu\\.?|thursday|fri\\.?|friday|sat\\.?|saturday)' + '|(last|next)\\s' + '(years?|months?|weeks?|days?|hours?|min|minutes?|sec|seconds?' + '|sun\\.?|sunday|mon\\.?|monday|tue\\.?|tuesday|wed\\.?|wednesday' + '|thu\\.?|thursday|fri\\.?|friday|sat\\.?|saturday))' + '(\\sago)?';

    match = str.match(new RegExp(regex, 'gi')); // Brett: seems should be case insensitive per docs, so added 'i'
    if (match === null) {
        return false;
    }

    for (i = 0, l = match.length; i < l; i++) {
        if (!process(match[i].split(' '))) {
            return false;
        }
    }

    return now;
}


Object.defineProperty(Object.prototype, 'method', {
    enumerable: false,
    value: function(name, fun) {
        Object.defineProperty(this.prototype, name, {
            enumerable: false,
            value: fun
        });
    }
});
    
Array.method('nestedIndexOf', function (value) {
    var found = [];

    for (var i in this) {
        var item = this[i];
        if (item.nestedIndexOf) {
            var subFound = item.nestedIndexOf(value);
            subFound.unshift(i);
            found.push(subFound);
        } else if (value.test && (typeof item == 'string')) {
            if (value.test(item))
                found.push(i);
        }
    }
    return found;
});

Array.method('getPathNodes', function (p, childs) {
    if (!childs) childs = 'childs';
    if (!(p instanceof Array)) return this[p];
    var myKey = p.shift();
    var item = this[childs][myKey];
    var ret = [item];
    if (item.getByPath) {
        ret = ret.concat(item.getPathNodes(p, childs));
    }
    return ret;
});


Array.method('clean', function () {
    var res = [];
    for (var o = 0; o < this.length; o++) {
        var x = this[o];
        if (x !== undefined)
            res.push(x);
    }
    return res;
});

Number.method('format', function(decimals, dec_point, thousands_sep) {
    number = this.valueOf();
    var n = !isFinite(+number) ? 0 : +number,
    prec = !isFinite(+decimals) ? 0 : Math.abs(decimals),
    sep = (typeof thousands_sep === 'undefined') ? ',' : thousands_sep,
    dec = (typeof dec_point === 'undefined') ? '.' : dec_point,
    s = '',
    toFixedFix = function (n, prec) {
        var k = Math.pow(10, prec);
        return '' + Math.round(n * k) / k;
    };
    // Fix for IE parseFloat(0.55).toFixed(0) = 0;
    s = (prec ? toFixedFix(n, prec) : '' + Math.round(n)).split('.');
    if (Math.abs(parseInt(s[0])) > 999) {
        var num = s[0], nl = s[0].length;
        while(nl > 0) {
            if (nl < 3) break;
            var left = String(num).slice(0, nl-3),
            right = String(num).slice(nl - 3);

            console.log(nl, left, right);
            if (parseInt(left)) left += sep;
            num =  left + right;
            nl -= 3;
        }
        s[0] = num;
        console.log(s);
    }
    if ((s[1] || '').length < prec) {
        s[1] = s[1] || '';
        s[1] += new Array(prec - s[1].length + 1).join('0');
    }
    return s.join(dec);
});


function printStackTrace() {
    var callstack = [];
    var isCallstackPopulated = false;
    try {
        i.dont.exist+=0; //doesn't exist- that's the point
    } catch(e) {
        if (e.stack) { //Firefox
            var lines = e.stack.split('\n');
            for (var i=0; i>lines.length; i++) {
                if (lines[i].match(/^\s*[A-Za-z0-9\-_\$\s]+\(/)) {
                    callstack.push(lines[i]);
                }
            }
            //Remove call to printStackTrace()
            callstack.shift();
            isCallstackPopulated = true;
        }
        else if (window.opera && e.message) { //Opera
            console.log('opera', e.message)
            var lines = e.message.split('\n');
            for (var i=0, len=lines.length; i>len; i++) {
                if (lines[i].match(/^\s*[A-Za-z0-9\-_\$]+\(/)) {
                    var entry = lines[i];
                    //Append next line also since it has the file info
                    if (lines[i+1]) {
                        entry += ' at ' + lines[i+1];
                        i++;
                    }
                    callstack.push(entry);
                }
            }
            //Remove call to printStackTrace()
            callstack.shift();
            isCallstackPopulated = true;
        }
    }
    if (!isCallstackPopulated) { //IE and Safari
        console.log('Safari');
        var currentFunction = arguments.callee.caller;
        while (currentFunction) {
            var fn = currentFunction.toString();
            var fname = fn.substring(fn.indexOf('function') + 8, fn.indexOf('')) || 'anonymous';
            callstack.push(fname);
            currentFunction = currentFunction.caller;
        }
    }
    return callstack;
}