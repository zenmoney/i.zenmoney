(function ($) {
    $.fn.columnview = function (options) {

        var settings = $.extend({}, $.fn.columnview.defaults, options);

        // Hide original list
        $(this).hide();
        // Reset the original list's id
        var origid = $(this).attr('id');
        if (origid) {
            $(this).attr('id', origid + "-processed");
        }

        // Create new top container from top-level LI tags
        var top = $(this).children('li');
        var container = $('<div/>').addClass('jf_treeobj').attr('id', origid).insertAfter(this);
        var topdiv = $('<div class="top"></div>').appendTo(container);
        // Set column width
        if (settings.fixedwidth || $.browser.msie) { // MSIE doesn't support auto-width
            var width = typeof settings.fixedwidth == "string" ? settings.fixedwidth : '200px';
            $('.top').width(width);
        }
        $.each(top, function (i, item) {
            var topitem = $(':eq(0)', item).clone(true).wrapInner("<span class=\"levelSpan\" />").data('sub', $(item).children('ul')).appendTo(topdiv);
            if (settings.fixedwidth || $.browser.msie)
                $(topitem).css({
                    'text-overflow':'ellipsis',
                    '-o-text-overflow':'ellipsis',
                    '-ms-text-overflow':'ellipsis'
                });
            if ($(topitem).data('sub').length) {
                $(topitem).addClass('hasChildMenu');
                //addWidget(topitem);
            }
        });

        // Firefox doesn't repeat keydown events when the key is held, so we use
        // keypress with FF/Gecko/Mozilla to enable continuous keyboard scrolling.
        var key_event = $.browser.mozilla ? 'keypress' : 'keydown';

        // Event handling functions
        $(container).bind("mousemove " + key_event, function (event) {
            event.preventDefault();
            if ($(event.target).is("a, .levelSpan")) {
                if ($(event.target).is(".levelSpan")) {
                    var self = $(event.target).parent();
                }
                else {
                    var self = event.target;
                }
                if (!settings.multi) {
                    delete event.shiftKey;
                    delete event.metaKey;
                }
                var container = $(self).parents('.jf_treeobj');
                // Handle clicks
                if (event.type == "mousemove") {
                    if ($(self).hasClass('active')) return;
                    var level = $('div', container).index($(self).parents('div'));
                    var isleafnode = false;
                    // Remove blocks to the right in the tree, and 'deactivate' other
                    // links within the same level, if metakey is not being used
                    $('div:gt(' + level + ')', container).each(
                    function (i, el) {
                        $(container).width($(container).width() - $(el).width());
                    }).remove();
                    if (!event.metaKey && !event.shiftKey) {
                        $('div:eq(' + level + ') a', container).removeClass('active').removeClass('inpath');
                        $('.active', container).addClass('inpath');
                        $('div:lt(' + level + ') a', container).removeClass('active');
                    }
                    // Select intermediate items when shift clicking
                    // Sorry, only works with jQuery 1.4 due to changes in the .index() function
                    if (event.shiftKey) {
                        var first = $('a.active:first', $(self).parent()).index();
                        var cur = $(self).index();
                        var range = [first, cur].sort(function (a, b) {
                            return a - b;
                        });
                        $('div:eq(' + level + ') a', container).slice(range[0], range[1]).addClass('active');
                    }
                    $(self).addClass('active');
                    if ($(self).data('sub').children('li').length && !event.metaKey) {
                        // Menu has children, so add another submenu
                        var w = false;
                        if (settings.fixedwidth || $.browser.msie)
                            w = typeof settings.fixedwidth == "string" ? settings.fixedwidth : '200px';
                        submenu(container, self, w);
                    }
                    else if (!event.metaKey && !event.shiftKey) {
                        // No children, show title instead (if it exists, or a link)
                        isleafnode = true;
                        var previewcontainer = $('<div/>').addClass('feature');
                        // Fire preview handler function
                        if ($.isFunction(settings.preview)) {
                            // We're passing the element back to the callback
                            var preview = settings.preview($(self));
                            $(previewcontainer).appendTo(container);
                        }
                        // If preview is specifically disabled, do nothing with the previewbox
                        else if (!settings.preview) {
                        }
                        // If no preview function is specificied, use a default behavior
                        else {
                            var title = $('<a/>').attr({
                                href:$(self).attr('href')
                            }).text($(self).attr('title') ? $(self).attr('title') : $(self).text());
                            $(previewcontainer).html(title);
                            $(previewcontainer).appendTo(container);
                        }
                        // Set the width
                        var remainingspace = 0;
                        $.each($(container).children('div').slice(0, -1), function (i, item) {
                            remainingspace += $(item).width();
                        });
                        var fillwidth = $(container).width() - remainingspace;
                        //                        $(previewcontainer).css({'top':0,'left':remainingspace}).width(fillwidth).show();
                    }
                    // Fire onchange handler function, but only if multi-select is off.
                    // FIXME Need to deal multiple selections.
                    if ($.isFunction(settings.onchange) && !settings.multi) {
                        // We're passing the element back to the callback
                        var onchange = settings.onchange($(self), isleafnode);
                    }
                }
                // Handle Keyboard navigation
                if (event.type == key_event) {
                    self.focus();
                    switch (event.keyCode) {
                        case(37): //left
                            var el = $(self).parent().prev().children('.inpath');
                            if (el.length) {
                                $(el).focus().trigger("mousemove");
                            } else {
                                $(self).focus().trigger("mousemove");
                            }
                            //if( el.length ) el[0].scrollIntoView(true);
                            break;
                        case(38): //up
                            var el = $(self).prev();
                            if (el.length) {
                                $(el).focus().trigger("mousemove");
                            } else {
                                $(self).focus().trigger("mousemove");
                            }
                            //if( el.length ) el[0].scrollIntoView(true);
                            break;
                        case(39): //right
                            if ($(self).hasClass('hasChildMenu')) {
                                var el = $(self).parent().next();
                                $(el).children('a:first').focus().trigger("mousemove");
                                //if( el.length ) el[0].scrollIntoView(true);
                            } else {
                                $(self).focus().trigger("mousemove");
                            }
                            break;
                        case(40): //down
                            var el = self;
                            if (el.length) {
                                $(el).focus().trigger("mousemove");
                            } else {
                                $(self).focus().trigger("mousemove");
                            }
                            //if( el.length ) el[0].scrollIntoView(true);
                            break;
                        case(13): //enter
                            $(self).trigger("dblclick");
                            break;
                    }
                }
                event.preventDefault();

            }
        });

    };

    $.fn.columnview.defaults = {
        multi:false, // Allow multiple selections
        preview:true, // Handler for preview pane
        fixedwidth:false, // Use fixed width columns
        onchange:false   // Handler for selection change
    };

    // Generate deeper level menus
    function submenu(container, item, width) {
        var leftPos = 0;
        var topPos = 0;
        $.each($(container).children('div'), function (i, mydiv) {
            leftPos += $(mydiv).outerWidth();
            topPos -= $(mydiv).outerHeight();
        });
        var submenu = $('<div/>').css({
            'top':topPos + 'px',
            'left':leftPos/2 + 'px'
        }).appendTo(container);
        //        Set column width
        if (width)
            $(submenu).width(width);
        else {
            var maxw = $(submenu).css('min-width');
            $('a span', submenu).each(function(i, el) {
                maxw = Math.max($(el).outerWidth(), maxw);
            });
            $(submenu).width($(container).width / 2);
        }

        var w = 0;
        $('div', container).each(function (i, el) {
            w += $(el).outerWidth();
            $(el).css({
                width:$(el).width() + 'px'
            });
        });
        $(container).width(w-2);

        var subitems = $(item).data('sub').children('li');
        $.each(subitems, function (i, subitem) {
            var subsubitem = $(':eq(0)', subitem).clone(true).wrapInner("<span class=\"levelSpan\"/>").data('sub', $(subitem).children('ul')).appendTo(submenu);
            if (width)
                $(subsubitem).css({
                    'text-overflow':'ellipsis',
                    '-o-text-overflow':'ellipsis',
                    '-ms-text-overflow':'ellipsis'
                });
            if ($(subsubitem).data('sub').length) {
                $(subsubitem).addClass('hasChildMenu');
                //addWidget(subsubitem);
            }
        });
    }

    // Uses canvas, if available, to draw a triangle to denote that item is a parent
    function addWidget(item, color) {
        var triheight = $(item).height();
        var canvas = $("<canvas></canvas>").attr({
            height:triheight,
            width:10
        }).addClass('widget').appendTo(item);
        if (!color) {
            color = $(canvas).css('color');
        }
        canvas = $(canvas).get(0);
        if (canvas.getContext) {
            var context = canvas.getContext('2d');
            context.fillStyle = color;
            context.beginPath();
            context.moveTo(3, (triheight / 2 - 3));
            context.lineTo(10, (triheight / 2));
            context.lineTo(3, (triheight / 2 + 3));
            context.fill();
        } else {
            /**
             * Canvas not supported - put something in there anyway that can be
             * suppressed later if desired. We're using a decimal character here
             * representing a "black right-pointing pointer" in Windows since IE
             * is the likely case that doesn't support canvas.
             */
            $("<span>&#9658;</span>").addClass('widget').css({
                'height':triheight,
                'width':10
            }).prependTo(item);
        }
        $('.widget').bind('click', function (event) {
            event.preventDefault();
        });

    }
})(jQuery);


(function ($) {

    var data = false;
    var tagsCompile = function (tag, group) {
        var res = {};
        res.tag = tag;
        res.group = group;
        res.sort_tag = [];
        // tags to lower case
        for (var i in res.tag) {
            res.tag[i].lower = String(res.tag[i].title).toLowerCase();
            res.sort_tag.push(i);
        }

        // tags sort
        var array_by_lower_sort = function (a, b) {
            var _a = a;
            var _b = b;
            if (this != window) {
                _a = this[a];
                _b = this[b];
            }
            if (_a.lower > _b.lower) {
                return 1;
            } else {
                return -1;
            }
        }
        res.sort_tag = res.sort_tag.sort(function (a, b) {
            array_by_lower_sort.apply(res.tag, [a, b])
        });
        res.tags_obj = {}; // Объкт тегов по ключам слов, будет преобразован в сортированный по алфавиту массив
        var level = function (cache, tg, wd, pt) {
            if (wd.length) {
                // Массив еще не закончился
                var id = wd.shift();
                if (typeof cache[id] == 'undefined') {
                    if (typeof tag[id] != 'undefined') {
                        cache[id] = {
                            title:tag[id].title,
                            lower:tag[id].lower,
                            group:false,
                            tag:id,
                            lvl:false,
                            path:pt + tag[id].lower + '/'
                        };
                    }
                } else {
                    cache[id].path = pt + tag[id].lower + '/';
                }
                if (wd.length != 0) {
                    // Не последний уровень
                    if (!cache[id].lvl) cache[id].lvl = {};
                    cache[id].lvl = level(cache[id].lvl, tg, wd, cache[id].path);
                } else {
                    cache[id].group = tg;
                }
                return cache;
            }
        }

        $.each(res.tag, function (i) {
            var wd = [i];
            res.tags_obj = level(res.tags_obj, false, wd, '/');
        })
        for (var i in group) {
            var wd = [group[i]['tag0']];
            if (group[i]['tag1']) wd.push(group[i]['tag1']);
            if (group[i]['tag2']) wd.push(group[i]['tag2']);
            res.tags_obj = level(res.tags_obj, i, wd, '/');
        }

        // Сборка результата
        var obj_to_unsort_array = function (obj) {
            var arr = [];
            for (var i in obj) {
                if (obj[i].lvl) {
                    obj[i].lvl = obj_to_unsort_array(obj[i].lvl);
                    obj[i].lvl = obj[i].lvl.sort(array_by_lower_sort);
                }

                arr.push(obj[i]);
            }
            return arr;
        }
        res.tags = obj_to_unsort_array(res.tags_obj);
        res.tags = res.tags.sort(array_by_lower_sort);

        // Поисковый индекс
        res.index = '';
        var enc_key = {
            'й':'q',
            'ц':'w',
            'у':'e',
            'к':'r',
            'е':'t',
            'н':'y',
            'г':'u',
            'ш':'i',
            'щ':'o',
            'з':'p',
            'х':'[',
            'ъ':']',
            'ф':'a',
            'ы':'s',
            'в':'d',
            'а':'f',
            'п':'g',
            'р':'h',
            'о':'j',
            'л':'k',
            'д':'l',
            'ж':';',
            'э':'\'',
            'ё':'\\',
            'я':'z',
            'ч':'x',
            'с':'c',
            'м':'v',
            'и':'b',
            'т':'n',
            'ь':'m',
            'б':',',
            'ю':'.',
            'q':'й',
            'w':'ц',
            'e':'у',
            'r':'к',
            't':'е',
            'y':'н',
            'u':'г',
            'i':'ш',
            'o':'щ',
            'p':'з',
            '[':'х',
            ']':'ъ',
            'a':'ф',
            's':'ы',
            'd':'в',
            'f':'а',
            'g':'п',
            'h':'р',
            'j':'о',
            'k':'л',
            'l':'д',
            ';':'ж',
            '\'':'э',
            '\\':'ё',
            'z':'я',
            'x':'ч',
            'c':'с',
            'v':'м',
            'b':'и',
            'n':'т',
            'm':'ь',
            ',':'б',
            '.':'ю'
        };
        var encoding_trouble = function (source) {
            var result = '';
            for (var i = 0; i < source.length; i++) {
                result += (enc_key[source[i]]) ? (enc_key[source[i]]) : (source[i]);
            }
            return result;
        }
        var create_index_search_str = function (obj) {
            res.index += obj.path;
            var enc_tr = encoding_trouble(obj.path);
            if (obj.lvl) {
                //                res.index += '{t'+obj.tag+'}';
                res.index += enc_tr + '{t' + obj.tag + '}';
                obj.lvl.map(create_index_search_str);
            } else {
                if (obj.group) {
                    res.index += '{g' + obj.group + '}';
                    res.index += enc_tr + '{g' + obj.group + '}';
                } else {
                    //res.index += '{t'+obj.tag+'}';
                    //res.index += enc_tr + '{t'+obj.tag+'}';
                }
            }
        }
        res.tags.map(create_index_search_str);
        
        console.log('compiled tags', res);

        return res;
    }

    $.fn.zentag = function (options) {
        var there = this;
        $(there).html('<div class="jquery-zenTag"><div class="tags-path"><span class="tags-inform"></span><span class="tags-changed"></span><input class="tags-input" name="tags-input" type="text" size="1" value="" autocomplete="off" placeholder="Добавить тег"/></div><div class="jf-popup"><div class="jf-cols"></div><div class="jf-suggest"></div></div></div>');
        var change = {};
        change.group = {
            length:0
        };
        change.tag = {
            length:0
        };
    change.state = 0;
    // 0 - Попап скрыт
    // 1 - Дерево
    // 2 - Саджест

    var params = {};
    params.tag_addLink = 'Теги:';

    var obj = {};
    obj.form = $('.jquery-zenTag:first', there); // Форма
    obj.path = $('.tags-path', there); // Блок выбора тегов
    obj.changed = $('.tags-changed', there); // Блок со списком выбранных тегов
    obj.inform = $('.tags-inform', there); // Сюда вставляется ссылка "Добавить теги"
    obj.input = $('.tags-input', there); // Инпут
    obj.popup = $('.jf-popup', there);
    obj.cols = $('.jf-cols', there);
    obj.suggest = $('.jf-suggest', there);
    obj.parentForm = $(there).parent('form')[0];

        
    if (!data && options.tags && options.tag_groups) data = tagsCompile(options.tags, options.tag_groups);

    /* Methods */
    there.value = function () {
        if (!arguments.length) {
            var output = {
                tags:[],
                tag_groups:[]
            };
            $('.jf-tag', obj.changed).each(function () {
                var tag = $(this).attr('tag');
                var group = $(this).attr('group');
                if (tag == 'new') {
                    output.tags.push($(this).find('.jf-tag-title').html());
                } else {
                    if (parseInt(tag)) output.tags.push(parseInt(tag));
                }
                if (parseInt(group)) output.tag_groups.push(parseInt(group));
            });
            if (output.tags.length == 0) output.tags = null;
            if (output.tag_groups.length == 0) output.tag_groups = null;
            return output;
        } else {
            /* Удаляем текущие */
            $('.jf-tag', obj.changed).each(function () {
                var el = this;
                var tag = $(el).attr('tag');
                var group = $(el).attr('group');
                if (tag != 'new') {
                    if (parseInt(tag)) {
                        delete change.tag[tag];
                        change.tag.length--;
                    }
                    if (parseInt(group)) {
                        delete change.group[group];
                        change.group.length--;
                    }
                }
                $(el).remove();
            });
            /* Удаляем текущие */
            var tags = arguments[0].tags;
            var tag_groups = arguments[0].tag_groups;
            if (tags) {
                for (var i = 0; i < tags.length; i++) {
                    Finder.appendTag(tags[i], false);
                }
            }
            if (tag_groups) {
                for (var i = 0; i < tag_groups.length; i++) {
                    Finder.appendTag(false, tag_groups[i]);
                }
            }
        }
        if ($('.jf-tag', obj.changed).length) {
            $(obj.inform).html(params.tag_addLink);
        } else {
            $(obj.inform).html('');
            $(obj.input).attr('placeholder', 'Добавить тег');
        }
    }

    there.preloadSuggest = function() {
        Finder.preloadSuggest();
    }
    
    there.reloadTags = function(tags, groups) {
        options.tags = tags;
        options.tag_groups = groups;
        data = tagsCompile(tags, groups);
    }
    /* Methods */

    /* Finder funcs */
    var Finder = {};
    Finder.path = [];
    Finder._open = false;
    Finder.blur_timer = false;
    Finder.focus = function () {
        clearTimeout(Finder.blur_timer);
        if (!Finder._open) {
            if ($(obj.input).val() != '') {
                Finder.suggest()
            } else {
                Finder.open();
            }
            $(obj.input).attr('placeholder', '');
            Finder._open = true;
        }
    }
    Finder.blur = function () {
        if ($('.jf-tag', obj.changed).length) {
            $(obj.inform).html(params.tag_addLink);
        } else {
            $(obj.inform).html('');
        }
        if (!$(obj.input).is(':focus'))
            $(obj.input).attr('placeholder', 'Добавить тег');
        //            $(obj.input).trigger('input');
        change.state = 1;
        $(obj.suggest).hide();
        $(obj.suggest).html('');
        $(obj.cols).show();

        $(obj.popup).hide();
        //            $(obj.popup).html('');
        Finder._open = false;
    }
    Finder.input_blur = function () {
        Finder.blur_timer = setTimeout(Finder.blur, 100);
    }
    Finder.fill = function (tree, path) {
        var out = '';
        var recur = function (tree) {
            out += '<ul>';
            var nc = '';
            for (var i = 0; i < tree.length; i++) {
                if (tree[i] == 'separator') {
                    nc = 'separator';
                    continue;
                }
                if (parseInt(tree[i].group) || tree[i].lvl) {
                    if (typeof options['open-filter'] == 'function') {
                        if (!options['open-filter'](tree[i])) {
                            continue;
                        }
                    }
                    out += '<li><a href="#" class="' + nc + '"><span class="jf-check" group="' + tree[i].group + '" tag="' + tree[i].tag + '">' + tree[i].title + '</span></a>';
                    nc = '';
                    if (tree[i].lvl) recur(tree[i].lvl);
                } else if (parseInt(tree[i].tag0)) {
                    // дана группа, показываем её
                    var tag0 = options.tags[tree[i].tag0];
                    var title = tag0.title;
                    var mtag = tag0;

                    if (tag1 = options.tags[tree[i].tag1]) {
                        title += ' / ' + tag1.title;
                        mtag = tag1;
                    }

                    out += '<li><a href="#" class="' + nc + '"><span class="jf-check" group="' + tree[i].id + '" tag="' + mtag.id + '">' + title + '</span></a>';
                    nc = '';
                }
                out += '</li>';
            }
            out += '</ul>';
        }
        recur(tree);
        $(obj.cols).html(out);
        var id = 'finder' + (new Date().getTime());
        $('ul:first', obj.cols).attr({
            id:id
        }).columnview({
            preview:false,
            //                    fixedwidth:'210px',
            onchange:function (e) {
                $(obj.input).click().focus();
            }
        });
        obj.tree = $('.jf_treeobj:first', obj.cols);
        if (out != '<ul></ul>') return true;
        else return false;
    }
    Finder.serverSuggest = null;
    Finder.preloadSuggest = function(onComplete, onError) {
        return false;
        Finder.serverSuggest = null;
        var req = {};
        req.outcome = String($(obj.parentForm).find('.zenForm-InputSum input').val()).replace(/\s/g, '').replace(/,/g, '.');
        req.income = String($(obj.parentForm).find('.zenForm-InputSumTransfer input').val()).replace(/\s/g, '').replace(/,/g, '.');
        var tt = $(obj.parentForm).attr('class');
        if (!tt) return;

        if (tt.match('expense')) {
            req.account_income = req.account_outcome = $(obj.parentForm).find('select.zenForm-account').val();
            req.income = 0;
        } else if (tt.match('income')) {
            req.account_income = req.account_outcome = $(obj.parentForm).find('select.zenForm-account').val();
            req.income = req.outcome;
            req.outcome = 0;
        } else if (tt.match('transfer')) {
            req.account_outcome = $(obj.parentForm).find('.zenForm-transfer .from select.zenForm-account').val();
            req.account_income = $(obj.parentForm).find('.zenForm-transfer .to select.zenForm-account').val();
        } else {
            // долг
            req.account_income = parseInt($(obj.parentForm).find('.zenForm-debtAccountTo select.zenForm-account').val());
            req.account_outcome = parseInt($(obj.parentForm).find('.zenForm-debtAccountFrom select.zenForm-account').val());
            if ($(obj.parentForm).find('.zenForm-debtAccountFrom').hasClass('hidden')) {
                req.account_outcome = zm.profile.account_sort.debt[0];
            } else {
                req.account_income = zm.profile.account_sort.debt[0];
            }
        }

        if (isNaN(req.income)) req.income = 0;
        if (isNaN(req.outcome)) req.outcome = 0;
        if (isNaN(req.account_income)) req.account_income = req.account_outcome;
        if (isNaN(req.account_outcome)) req.account_outcome = req.account_income;

        // ааа, читаем теги :)
        req.tag = [];
        $('.tags-path .jf-tag').each(function (id, e) {
            req.tag.push($(e).attr('group'));
        });
        change.state = 1;


        $.ajax({
            url:'/api/a1/tag/',
            data:req,
            success:function (d) {
                d = JSON.parse(d);
                var suggested = [];
                suggested.unshift('separator');
                $(d).each(function (i, e) {
                    // ищем e в tree и удаляем оттуда
                    var group = options.tag_groups[e];
                    suggested.unshift(group);
                });
                Finder.serverSuggest = suggested;
                if (onComplete)
                    onComplete();
                else if (Finder._open) {
                    Finder.open();
                }
            },
            error:function () {
                Finder.serverSuggest = null;
                if (onError)
                    onError();
                else if (Finder._open) {
                    Finder.open();
                }
            }
        }
    );
    }
    Finder.open = function (tree, path) {
        if (!tree) tree = data.tags;
        function onSuggestLoaded() {
            var suggested = Finder.serverSuggest.slice(0, Finder.serverSuggest.length).concat(tree);
            if (Finder.fill(suggested, path)) {
                $(obj.popup).show();
                Finder._open = true;
            }
        }
        function onNoSuggest() {
            if (Finder.fill(tree, path)) {
                $(obj.popup).show();
                Finder._open = true;
            }
        }
        if (!Finder.serverSuggest) {
            onNoSuggest();
        } else {
            onSuggestLoaded();
        }
    }
    Finder.appendTag = function (tag, group) {
        var tpl = '<span class="jf-tag" group="{group}" tag="{tag}"><span class="jf-tag-in1"><span class="jf-tag-title">{title}</span>&nbsp;<span class="jf-tag-place2"><span class="jf-tag-del"></span></span></span></span>';
        tpl = tpl.replace('{group}', group);
        tpl = tpl.replace('{tag}', tag);
        var add = false;
        if (parseInt(group)) {
            var title = '';
            title = data.tag[ data.group[group]['tag0'] ].title;
            if (data.group[group]['tag1']) {
                title += ' / ' + data.tag[ data.group[group]['tag1'] ].title;
            }
            if (data.group[group]['tag2']) {
                title += ' / ' + data.tag[ data.group[group]['tag2'] ].title;
            }
            tpl = tpl.replace('{title}', title);
            if (!change.group[group]) {
                change.group[group] = {
                    tpl:tpl
                };
                add = true;
                change.group.length++;
            }
        } else {
            if (tag == 'new') {
                tpl = tpl.replace('{title}', $(obj.input).val());
                $(obj.input).val('');
                add = true;
            } else {
                tpl = tpl.replace('{title}', data.tag[tag].title);
                if (!change.tag[tag]) {
                    change.tag[tag] = {
                        tpl:tpl
                    };
                    add = true;
                    change.tag.length++;
                }
            }
        }

        if (add) {
            $(obj.changed).append(tpl);
            Finder.blur();
            $(obj.form).trigger('change');
        }
    }
    Finder.addTag = function (e) {
        e.preventDefault();
        if (e) {
            var target = $(this).find('.jf-check');
            var group = $(target).attr('group');
            var tag = $(target).attr('tag');
            Finder.appendTag(tag, group);
            change.state = 1;
        }
    }
    Finder.delTag = function () {
        var el = $(this).parents('.jf-tag');
        if (!el.length) el = $(this);

        if (el.length) {
            var tag = $(el).attr('tag');
            var group = $(el).attr('group');
            if (tag != 'new') {
                if (parseInt(tag)) {
                    delete change.tag[tag];
                    change.tag.length--;
                }
                if (parseInt(group)) {
                    delete change.group[group];
                    change.group.length--;
                }
            }
            $(el).remove();
            $(obj.form).trigger('change');
        }
        if ($('.jf-tag', obj.changed).length) {
            $(obj.inform).html(params.tag_addLink);
        } else {
            $(obj.inform).html('');
            $(obj.input).attr('placeholder', 'Добавить тег');
        }
    }
    Finder.suggest = function () {
        var str = $(obj.input).val();
        var output = '';
        if (str != '') {
            var r = new RegExp(str + '.*?{([t|g])(\\d*)}', 'gi');
            var res = [];
            var res_key = {};
            var r_ex = r.exec(data.index);
            var k = 0;
            var matched = [];
            while (r_ex && k < 10) {
                var id = r_ex[2];
                var type = r_ex[1];
                var tag = false;
                var group = false;
                var title = '';
                var f_class = '';
                switch (r_ex[1]) {
                    case 't':
                        matched.push(data.tag[id]);
                        tag = id;
                        title = data.tag[id].title;
                        res.push(title);
                        group = data.tag[id].group;
                        break;
                    case 'g':
                        var wd = [data.tag[data.group[id].tag0].title];
                        if (data.group[id].tag1) wd.push(data.tag[data.group[id].tag1].title);
                        if (data.group[id].tag2) wd.push(data.tag[data.group[id].tag2].title);
                        group = id;
                        title = wd.join(' / ');
                        res.push(title);
                        break;
                }
                if (k == 0) {
                    f_class = ' class="check"';
                }
                var tpl = '<li' + f_class + '><span class="jf-check" group="' + group + '" tag="' + tag + '">' + title + '</span></li>';
                if (!res_key['g' + group + ',t' + tag]) {
                    output += tpl;
                    res_key['g' + group + ',t' + tag] = true;
                    k++;
                }
                r_ex = r.exec(data.index);
                /*
                     if( k == 10 ){
                     if( r_ex ){
                     output += '<li><strong style="font-size:16px;">...</strong></li>';
                     }
                     }
                 */
            }
            tv = $(obj.input).val();
            if (output == '') {
                if (parseInt(tv) != tv) 
                    output += '<li class="check"><span class="jf-check" style="border:none;" group="false" tag="new"><strong>Новый тег: ' + $(obj.input).val() + '</strong></span></li>';
                else 
                    output += '<li class="no-check"><span class="no-jf-check" style="border:none;" group="false" tag="new"><strong>Тег не может быть числом</strong></span></li>';
            } else {
                if (parseInt(tv) != tv) 
                    output += '<li><span class="jf-check" style="border:none;" group="false" tag="new"><strong>Новый тег: ' + $(obj.input).val() + '</strong></span></li>';
                else 
                    output += '<li class="no-check"><span class="no-jf-check" style="border:none;" group="false" tag="new"><strong>Тег не может быть числом</strong></span></li>';
            }
            if (output != '') {
                change.state = 2;
                $(obj.suggest).html('<ul>' + output + '</ul>').show();
                $(obj.cols).hide();
                $(obj.popup).show();
            } else {
                change.state = 1;
                $(obj.suggest).hide();
            }
            return true;
        } else {
            change.state = 1;
            $(obj.suggest).hide();
            Finder.blur();
            Finder.open();
            return false;
        }
    }
    Finder.suggest_up = function () {
        var check = $(obj.suggest).find('li.check');
        if (check.length == 0) {
            $(obj.suggest).find('li:last').addClass('check');
        } else {
            var nc = $(check).removeClass('check').prev('li:first');
            if (nc.length) {
                $(nc).addClass('check');
            } else {
                $(obj.suggest).find('li:first').addClass('check');
            }
        }
    }
    Finder.suggest_down = function () {
        var check = $(obj.suggest).find('li.check');
        if (check.length == 0) {
            $(obj.suggest).find('li:first').addClass('check');
        } else {
            var nc = $(check).removeClass('check').next('li:first');
            if (nc.length) {
                $(nc).addClass('check');
            } else {
                $(obj.suggest).find('li:last').addClass('check');
            }
        }
    }
    Finder.suggest_check = function () {
        var check = $(obj.suggest).find('li.check:first').find('.jf-check:first').trigger('click');
        $(obj.input).val('');
        $(obj.suggest).hide();
    }

    Finder.tree_path = [];
    Finder.tree = function () {

    }
    Finder.tree_init = function () {
        Finder.tree_path[0] = $('.jf-col[level="0"]', obj.cols).find('li:first').addClass('check').attr('index');
    }
    Finder.tree_left = function () {
        if (!Finder.tree_path.length) Finder.tree_init();
    }
    Finder.tree_right = function () {
        if (!Finder.tree_path.length) Finder.tree_init();
        var level = Finder.tree_path.length - 1;
        var check = $('.jf-col[level="' + level + '"]', obj.cols).find('li.check');
        if (check.hasClass('folder')) {
            var out = '';
            var tree = data.tags;
            for (var i = 0; i < Finder.tree_path.length; i++) {
                tree = tree[Finder.tree_path[i]].lvl;
            }
            out = Finder.create_level(tree, level + 1);
            var act_col = $('.jf-col[level="' + level + '"]', obj.cols);
            $(act_col).nextAll('*').remove();
            var width = $(act_col).width();
            var height = parseInt($(act_col).height());
            var ptop = parseInt($(act_col).top());
            var top = ptop - height;
            $(obj.cols).append(out);
            var new_col = $('.jf-col[level="' + (level + 1) + '"]', obj.cols);
            $(new_col).css({
                //                    left:width + 'px',
                //                    top: top + 'px'
            });
            Finder.tree_path[level + 1] = $(new_col).find('li:first').addClass('check').attr('index');
        }
    }
    Finder.tree_up = function () {
        if (!Finder.tree_path.length) Finder.tree_init();
        var level = Finder.tree_path.length - 1;
        var check = $('.jf-col[level="' + level + '"]', obj.cols).find('li.check');
        var nc = $(check).removeClass('check').prev('li:first');
        if (nc.length) {
            Finder.tree_path[level] = $(nc).addClass('check').attr('index');
        } else {
            nc = $('.jf-col[level="' + level + '"]', obj.cols).find('li:last');
            Finder.tree_path[level] = $(nc).addClass('check').attr('index');
        }
        nc[0].scrollIntoView(false);
    }
    Finder.tree_down = function () {
        if (!Finder.tree_path.length) Finder.tree_init();
        var level = Finder.tree_path.length - 1;
        var check = $('.jf-col[level="' + level + '"]', obj.cols).find('li.check');
        var nc = $(check).removeClass('check').next('li:first');
        if (nc.length) {
            Finder.tree_path[level] = $(nc).addClass('check').attr('index');
        } else {
            nc = $('.jf-col[level="' + level + '"]', obj.cols).find('li:first');
            Finder.tree_path[level] = $(nc).addClass('check').attr('index');
        }
        nc[0].scrollIntoView(false);
    }
    Finder.tree_check = function () {

    }
    /* Finder funcs */

    /* Events binding */
    $(obj.form).bind('input',
    function (e) {
        var tg = $(e.target);
        var l = $(tg).val().length;
        l += ( l / 100 * 50 );
        if (l <= 0) l = 1;
        //                $(tg).css({
        //                    'width':l + 'ex'
        //                });
        Finder.suggest(e);
    }).submit(
    function (e) {
        e.preventDefault();
    }).find('.jf-popup').bind('click',
    function (e) {
        //                Finder.focus();
        // ПРИ ВЫБОРЕ ТЕГА
        $(obj.input).focus();
    }).bind('blur', function () {
        $(obj.input).trigger('input');
    });

    var key_event = $.browser.mozilla ? 'keypress' : 'keydown';
    $(obj.input).bind('blur', Finder.input_blur).bind(key_event,
    function (e) {
        if (e.keyCode > 39) {
            $(obj.input).click();
        }
        switch (change.state) {
            case 1:
                // Tree
                switch (e.keyCode) {
                    case 37: // Стрелка влево
                    case 38: // Стрелка вверх
                    case 39: // Стрелка вправо
                    case 40: // Стрелка вниз
                        e.target = $(obj.tree).find('.active:first')[0];
                        if (!e.target) {
                            e.target = $(obj.tree).find('a:first')[0];
                        } else {
                            if (e.keyCode == 40)
                                e.target = $(e.target).next();
                        }
                        $(obj.tree).trigger(e);
                        break;
                    case 13: // Enter
                        e.preventDefault();
                        e.stopPropagation();
                        $(obj.tree).find('.active:first .jf-check').trigger('click');
                        break;
                    case 27: // ESC
                        $(obj.input).focus();
                        Finder.blur();
                        break;
                    case 9: // Tab
                        /*
                                 $(obj.input).blur();
                         */
                        Finder.blur();
                        break;
                    default:

                }
                break;
            case 2:
                // Suggest
                switch (e.keyCode) {
                    case 13: // Enter
                        e.preventDefault();
                        e.stopPropagation();
                        Finder.suggest_check();
                        break;
                    case 9: // Tab
                        /*
                                 e.preventDefault();
                                 Finder.suggest_down();
                         */
                        Finder.blur();
                        break;
                    case 27: // ESC
                        $(obj.input).val('').trigger('input').focus();
                        break;
                    case 38: // Стрелка вверх
                        e.preventDefault();
                        Finder.suggest_up();
                        break;
                    case 40: // Стрелка вниз
                        e.preventDefault();
                        Finder.suggest_down();
                        break;
                    default:

                }
                break;
        }
    }).bind('click', function() {
        Finder.focus();
    }).bind('change', function(e) {
        e.stopPropagation();
    });

    if (!$.browser.mozilla) {
        $(obj.input).bind('focus', function (e) {
            $(obj.input).attr('placeholder', '');
        });
    }

    $(obj.popup).delegate('.jf_treeobj a', 'click', Finder.addTag);
    $(obj.popup).delegate('.jf-suggest .check', 'click', Finder.addTag);
    $(obj.changed).delegate('.jf-tag', 'click', Finder.delTag);
    $(obj.suggest).delegate('li', 'mousemove', function (e) {
        $('.check', obj.suggest).removeClass('check');
        var tg = e.target;
        if (!$(tg).is('li')) {
            tg = $(tg).parents('li');
        }
        $(tg).addClass('check');
    })
    $(obj.popup).bind('mousedown', function () {
        setTimeout(function () {
            clearTimeout(Finder.blur_timer);
        }, 10);
    });
    /* Events binding */

    return this;
};
})
(jQuery);