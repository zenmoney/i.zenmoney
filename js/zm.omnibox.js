$.fn.omnibox = function (options) {
    var titles = [];
    var filter = '';
    var selection = 0;
    var mnodes = [];
    var selectionLog = [];
    var distinct = [];
    var openClick = false;
    var el = this;

    var options = $.extend({
        data:[],
        input:{
            
        },
        box:{
            'max-width':'100%',
            'max-height':'100%'
        },
        drop:{

        },
        sel: {
            
        },
        placeholder:'фильтр',
        title:'title',
        childs:'childs',
        distinct:false,
        groupBy:false,
        groupTitles:[],
        orderBy: false,
        order: 'ASC',
        hideNoTitles: true,
        tagStyle: 'inside',
        tabindex:0,
        deselectOnClick: true,
        limit:5, // количество элементов в подсказке
        filter:function (text) {            // изменение фильтра
            text = text.replace(/\\/g, '\\\\');
            var match = titles.nestedIndexOf(new RegExp(text, 'i'));
            return match;
        },
        select:function (node) {             // выбор элемента
            return node;
        },
        deselect: function(node) {
            return node;
        },
        render:function (node) {             // рендер элемента
            var span = $('<span/>');
            $(span).attr('path', node.path);
            $(span).html(node.title);
            return span;
        },
        suggest:function (node) {           // рендер элемента в саггесте
            return node;
        }
    }, options);

    var makeTitles = function (node) {
        var titles = [];
        if (!node.concat) {
            for (var i in node) {
                var item = node[i];
                if (item.selected) continue;
                if (item[options.title]) {
                    titles[i] = item[options.title];
                    if (item[options.childs]) {
                        titles[i] = makeTitles(item[options.childs]);
                    }
                } else {
                    titles.concat(makeTitles(item));
                }
            }
        } else {
            var nl = node.length;
            for (i=0;i<nl;i++) {
                var item = node[i];
                if (item.selected) continue;
                if (item[options.title]) {
                    titles[i] = item[options.title];
                    if (item[options.childs]) {
                        titles[i] = makeTitles(item[options.childs]);
                    }
                }
            }
        }
        return titles;
    };

    var hide = this.hide = function () {
        $('ul', el).css('display', 'none');
        if (options.inlineDrop) {
            $(el).css('margin-bottom', '');
        }
    }

    var clear = this.clear = function () {
        $(selectionLog).each(function (i) {
            var num = selectionLog[i];
            options.data[num].selected = false;
        });

        selectionLog = [];
        filter = '';
        selection = 0;
        mnodes = [];
        distinct = [];
        $('.sel', el).html('');
        $('input', el).val('');
        redraw();
        hide();
    }

    var show = this.show = function () {
        $('ul', el).css('display', 'block');
    }
    
    var indexOf = this.indexOf = function(type, id) {
        for(i=0;i<options.data.length;i++) {
            var el = options.data[i];
            if (el.type == type && el.id == id) 
                return i;
        }
        return undefined;
    }

    var select = this.select = function () {
        var index = arguments[0];
        if (arguments.length == 2) {
            index = indexOf(arguments[0], arguments[1]);
        }
        if (index === undefined) return;
        
        var item = options.data[index];
        if (item.selected) return;
        if (options.distinct) {
            if (distinct.indexOf(item[options.distinct]) != -1) {
                return;
            }
            distinct.push(item[options.distinct]);
        }
        selectionLog.push(parseInt(index));
        options.data[index].selected = true;
        var item = options.select(options.data[index]);
        src = options.render(item);
        $(src).attr('num', index).addClass('omnibox-selected-item');
        $('.closer', src).click(function () {
            var t = $(this).parents('.omnibox-selected-item');
            deselect($(t).attr('num'));
            $('input', el).focus();
        })
        $('.sel', el).append(src);
        reWidth();
        makeTitles(options.data);
        redraw(filter);
        hide();
    }

    var reWidth = this.reWidth = function() {
        mw = w = $(el).innerWidth() - 20;
        $('.sel>*', el).each(function(i,sel) {
            w -= $(sel).outerWidth() + 3;
            if (w < 0) {
                w = mw - $(sel).outerWidth() - 3;
            }
        })
        if (w < 150)
            w = mw;

        $('input', el).css({
            width: w
        }).val('');
    }

    var deselect = this.deselect = function (num) {
        num = parseInt(num);
        //        var sli = selectionLog.indexOf(num);
        //        if (sli > -1) {
        //            selectionLog = selectionLog.splice(0, sli).concat(selectionLog.splice(sli));
        //        }
        if (isNaN(num)) return;
        if (typeof options.deselect == 'function')
            if (!options.deselect(options.data[num])) return;
        delete selectionLog[selectionLog.indexOf(num)];
        selectionLog = selectionLog.clean();
        if (!options.data[num] || !options.data[num].selected) {
            return;
        };
        if (options.distinct) {
            delete distinct[distinct.indexOf(options.data[num][options.distinct])];
            distinct = distinct.clean();
        }
        options.data[num].selected = false;
        var rm = $('.sel *[num="' + num + '"]');
        rm.remove();
        makeTitles(options.data);
        hide();
    }
    
    var setData = this.setData = function(data) {
//        this.clear();
        options.data = data;
        this.redraw();
        this.hide();
    }

    var redraw = this.redraw = function (newFilter) {
        if (!newFilter) newFilter = $('input', el).val();
        var match = options.filter(newFilter, options.data);
        mnodes = [];
        // getting matched nodes 
        for (var i = 0; i < match.length; i++) {
            var pnodes = options.data.getPathNodes(match[i]);

            if (pnodes instanceof Array) {
                for (var x in pnodes) {
                    if (pnodes[x].created) continue;
                    mnodes.push(options.suggest(pnodes[x]));
                }
            } else {
                if (pnodes.created) continue;
                mnodes.push(pnodes);
            }
        //            break;
        }
        if (mnodes.length == 0) {
            return hide();
        }
        filter = newFilter;
        var suggest = '';
        var inj = 0;
        selection = null;
        var oldOB = '';
        var groups = {};

        // rendering list
        if (options.orderBy !== false) {
            var sorter = function(by, order) {
                return $(this).sort(function(i1, i2) {
                    var s1 = i1[by], s2 = i2[by], m = 1;
                    if (order.toUpperCase() == 'DESC') m = -1
                    if (s1 > s2) return 1 * m;
                    if (s1 < s2) return -1 * m;
                    return 0;
                });
            }
            if (typeof options.orderBy == 'string') {
                mnodes = sorter.call(mnodes, options.orderBy, options.order);
            } else {
                $.each(options.orderBy, function(by, order) {
                    mnodes = sorter.call(mnodes, by, order);
                });
            }
        }
        
        var suggested = 0;
        $(mnodes).each(function (i) {
            var group = 'global-group';
            suggest = '';
            // skipping already selected items
            if (mnodes[i].selected) return;
            var num = options.data.indexOf(mnodes[i]);
            if (selection === null) selection = i;
            // skipping elements with no orderTitle
            if (options.hideNoTitles && !options.groupTitles[mnodes[i][options.groupBy]])
                return;
            // skipping if there is selected node with the same as ours defined in options distinct fiels
            if (options.distinct) {
                if (distinct.indexOf(mnodes[i][options.distinct]) != -1) {
                    return;
                }
            }

            if (options.groupBy) {
                group = oldOB = mnodes[i][options.groupBy];
                if (typeof groups[group] == 'undefined') {
                    groups[group] = [];
                    suggest += '<div><p>';
                    if (options.groupTitles[mnodes[i][options.groupBy]]) {
                        suggest += options.groupTitles[mnodes[i][options.groupBy]];
                    }
                    suggest += '</p></div>';
                }
            }
            if (inj++ < options.limit || options.limit === false)
                suggest += '<li num="' + num + '" i="' + (inj - 1) + '"><p>' + mnodes[i].title + '</p></li>';
            groups[group].push({
                id: i,
                source: mnodes[i],
                html: suggest
            });
            suggested++;
        });
        suggest = '';
        if (options.groupTitles && options.groupTitles.length) {
            $.each(options.groupTitles, function(i, el) {
                if (typeof groups[i] == 'undefined') return;
                $.each(groups[i], function(i, node) {
                    suggest += node.html;
                });
            });
        } else {
            $.each(groups, function(i, group) {
                if (typeof groups[i] == 'undefined') return;
                $.each(groups[i], function(i, node) {
                    suggest += node.html;
                });
            })
        }

        if (suggest == '') hide();
        else $('ul', el).html(suggest).show();

        $('li:first', el).addClass('selected');
        $('li', el).click(
            function () {
                var elem = this;
                var num = parseInt($(elem).attr('num'));
                select(num);
                $('input', el).focus();
            }).mouseover(function () {
            var elem = this;
            var num = parseInt($(elem).attr('i'));
            if (num != selection) {
                selection = num;
                $('li', el).removeClass('selected');
                $(this).addClass('selected');
            }
        });
        $('ul', el).css('width', $(el).width());
        if (options.inlineDrop && suggested) {
            $(el).css('margin-bottom', $('.drop', el).outerHeight() + 5);
        }
    }

    var getSelected = this.getSelected = function () {
        var ret = [];
        for(i=0;i<selectionLog.length;i++) {
            ret.push(options.data[selectionLog[i]]);
        }
        if (options.autoCreate && $('input', el).val()) {
            if (options.onCreate) {
                var newitem = options.onCreate($('input', el).val(), options.data);
                if (newitem) {
                    newitem.created = true;
                    ret.push(newitem);
                }
            }
        }
        return ret;
    }

    titles = makeTitles(options.data);

    $(el).addClass('omnibox');
    if (options.tagStyle == 'inside') {
        $(el).html('<span class="sel"/><span class="controls"><input type="text"/></span><ul class="drop"></ul>');
    } else if (options.tagStyle == 'outside') {
        $(el).html('<span class="sel"/><span class="controls"><input type="text"/><ul class="drop"></ul></span>');
    }
    $(el).css(options.box);
    $('input', el).css(options.input).attr('tabindex', options.tabindex);
    $('.sel', el).css(options.sel).delegate('*[num]', 'click', function() {
        if (options.deselectOnClick) {
            deselect($(this).attr('num'));
        }
    });
    $('input', el).attr('placeholder', options.placeholder);
    $('ul', el).css(options.drop);
    $('input', el).keyup(
        function (e) {
            var newFilter = $('input', el).val();
            if (newFilter != filter) {
                redraw(newFilter);
            }
        }).keydown(
        function (e) {
            var num = $('ul li[i="' + selection + '"]').attr('num');
            if ($('.drop', el).css('display') != 'block') {
                num = undefined;
            }
            var newFilter = $('input', el).val();
            switch (e.keyCode) {
                case 8:        // enter
                    if (this.value == '') {
                        deselect(selectionLog.pop());
                        redraw();
                    }

                    break;
                case 13:        // enter
                    if (num === undefined) {
                        var ntitle = $('input', el).val();
                        if (options.onCreate && ntitle) {
                            var newitem = options.onCreate(ntitle, options.data);
                            if (newitem && options.data.indexOf(newitem) == -1) {
                                newitem.created = true;
                                num = options.data.length;
                                options.data.push(newitem);
                            } else {
                                num = options.data.indexOf(newitem);
                            }
                        } 
                    }
                    if (num !== undefined) {
                        select(num);
                        redraw();
                        hide();
                    }
                    e.preventDefault();
                    $('input', el).val('').focus();
                    break;
                case 27:        // escape
                    hide();
                    $('input', el).blur();
                    break;
                case 38:        // up arrow
                    $('li', el).removeClass('selected');
                    if (--selection < 0) selection = 0;
                    var sel = $($('li', el)[selection]).addClass('selected');
                    var pos = sel.position();
                    var scroll = $('ul', el).scrollTop();
                    var t = scroll + pos.top;
                    if (t < scroll)
                        $('ul', el).scrollTop(t);
                    else if (t == scroll) {
                        $('ul', el).scrollTop(0);
                    }
                    e.stopPropagation();
                    return false;
                case 40:        // down arrow
                    $('li', el).removeClass('selected');
                    if (++selection > $('li', el).length - 1) selection = $('li', el).length - 1;
                    var sel = $($('li', el)[selection]).addClass('selected');
                    var pos = sel.position();
                    var t = pos.top + sel.height() - $('ul', el).height() + 30 + $('ul', el).scrollTop();
                    if (t > 0)
                        $('ul', el).scrollTop(t);
                    e.stopPropagation();
                    if ($('ul', el).css('display') == 'none') {
                        show();
                        redraw();
                    }
                    return false;
                default:
                    break;
            }
            filter = newFilter;
        }).click(function () {
        redraw();
    });

    $(el).click(function (e) {
        if (e.target == this) {
            $('input', el).focus().click();
        }
        openClick = true;
    //        e.stopPropagation();
    //        e.preventDefault();
    //        return false;
    });

    $('body').click(function () {
        if (!openClick)
            hide();
        openClick = false;
    })
    
    return this;
}