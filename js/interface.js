DOC = {};
wps = {}; // Work PlaceS
zForm = undefined;
activePageHash = '';
initZenForm = function(){
    var zenformPlaceholder = document.getElementById('zenform-placeholder');
    zenformPlaceholder.innerHTML = '';
    zForm = new zenform({
        parent: zenformPlaceholder,
        callback: function(data){
            if(isNaN(parseInt(data.id))){
                zenMoney.transaction.add(data, function(res){
                    if( res.result ){
                        appChanged();
                        zForm.alert('Транзакция добавлена', 'done');
                        zenMoney.account.activity(res.account)
                        zForm.refill();
                    }else{
                        zForm.alert('Ошибка при добавлении', 'error');
                    }
                });
            }else{
                zenMoney.transaction.edit(data, function(res){
                    if( res.result ){
                        appChanged();
                        zForm.refill();
                        zForm.alert('Транзакция добавлена', 'done');
                        zForm.parent.style.display = 'none';
                        DOC.page.className = '';
                        wps.browse.show(7);
                    }else{
                        zForm.alert('Ошибка при добавлении', 'error');
                    }
                });
            }
        },
        cancel: function(){
            zForm.parent.style.display = 'none';
            DOC.page.className = '';
            wps.browse.show(7);
        },
        del: function(id){
            zenMoney.transaction.del({
                id:id
            }, function(res){
                if( res.result ){
                    appChanged();
                    zForm.refill();
                    zForm.parent.style.display = 'none';
                    DOC.page.className = '';
                    wps.browse.show(7);
                }else{
                    alert('Ошибка! Не удалось удалить транзакцию.');
                }
            });
        }
    });
}

initializeInterface = function(){
    leftTopBtn = new Button({
        text:'Left', 
        type:'button'
    });
    rightTopBtn = new Button({
        text:'Right', 
        type:'button'
    });
	
    var lBtnPlace = document.getElementById('topHeaderLeftPlace');
    lBtnPlace.appendChild(leftTopBtn.element);
    leftTopBtn.hide();
        
    if (window.devicePixelRatio > 1) {
        $('body').addClass('retina');
    }
	
    var rBtnPlace = document.getElementById('topHeaderRightPlace');
    rBtnPlace.appendChild(rightTopBtn.element);
    rightTopBtn.hide();

    wps.add = new WorkPlace({
        icon: 'images/menu/1.png'
    });
    wps.add.newLayer({
        title:'',
        rightButton:{
            text: 'Создать',
            click: function(){
                renders.add.data.form.submit();
            }
        },
        render: renders.add.init
    });
	
    wps.settings = new WorkPlace();
    /*
	* 
	* 0 - Настройки
	* 1 - Счета
	* 2 - Категории
	* 3 - Базовые настройки
	* 4 - Новый/Редактирование счета
	* 5 - Новая/Редактирование категории
	* 
	*/
    wps.settings.newLayer({
        title:'Настройки',
        render: Settings.main.init,
        leftButton:{
            text: 'Обзор',
            type: 'backward',
            click: function(){
                wps.browse.show(0)
            }
        }
    });
    wps.settings.newLayer({
        title:'Счета',
        render: Settings.accounts.init,
        leftButton:{
            text: 'Настройки',
            type: 'backward',
            click: function(){
                wps.settings.show(0)
            }
        },
        rightButton:{
            text: 'Добавить',
            click: function(){
                edit_account_form.add();
            }
        }
    });
    wps.settings.newLayer({
        title:'Категории',
        render: Settings.categories.init,
        leftButton:{
            text: 'Настройки',
            type: 'backward',
            click: function(){
                wps.settings.show(0)
            }
        },
        rightButton:{
            text: 'Изменить',
            click: function(){
                var layer = document.getElementById('LayerSettingsCategories');
                if( layer.className == 'editInterface' ){
                    rightTopBtn.text( 'Изменить' );
                    layer.className = '';
                }else{
                    rightTopBtn.text( 'Готово' );
                    layer.className = 'editInterface';
                }
            }
        }
    });
    wps.settings.newLayer({
        title:'Ред. счета',
        render: Settings.account_edit.init,
        leftButton:{
            text: 'Счета',
            type: 'backward',
            click: function(){
                wps.settings.show(1)
            }
        }
    });
		
    // Обзор
    wps.browse = new WorkPlace();
    /*
	* 
	* 0 - Обзор
	* 1 - Счета
	* 2 - Бюджет
	* 3 - Категории
	* 4 - Синхронизация
	* 5 - Редактор счетов
	* 6 - Новая транзакция
	* 7 - Транзакции
	* 8 - Редактор транзакций
	* 
	*/
    wps.browse.newLayer({
        title:'Обзор',
        render: Browse.main.init,
        leftButton:{
            text: 'Настройки',
            click: function(){
                wps.settings.show(0)
            }
        }
    });
    wps.browse.newLayer({
        title:'Счета',
        render: Browse.accounts.init,
        leftButton:{
            text: 'Обзор',
            type: 'backward',
            click: function(){
                wps.browse.show(0)
            }
        }
    });
    wps.browse.newLayer({
        title:'Бюджет',
        render: Browse.budget.init,
        leftButton:{
            text: 'Обзор',
            type: 'backward',
            click: function(){
                wps.browse.show(0)
            }
        }
    });
    wps.browse.newLayer({
        title:'Категории',
        render: Browse.categories.init,
        leftButton:{
            text: 'Обзор',
            type: 'backward',
            click: function(){
                wps.browse.show(0)
            }
        }
    });
    wps.browse.newLayer({
        title:'Синхронизация',
        render: Browse.sync.init,
        leftButton:{
            text: 'Обзор',
            type: 'backward',
            click: function(){
                wps.browse.show(0)
            }
        }
    });
    wps.browse.newLayer({
        title:'Ред. счета',
        render: function(){  },
        leftButton:{
            text: 'Счета',
            type: 'backward',
            click: function(){
                wps.browse.show(1)
            }
        }
    });
    wps.browse.newLayer({
        title:'Новая транзакция',
        leftButton:{
            text: 'Транзакции',
            type: 'backward',
            click: function(){
                wps.browse.show(7);
                zForm.parent.style.display = 'none';
                DOC.page.className = '';
            }
        }
    });
    wps.browse.newLayer({
        title:'Транзакции',
        render: Transactions.list.init,
        leftButton:{
            text: 'Обзор',
            type: 'backward',
            click: function(){
                wps.browse.show(0);
            }
        },
        rightButton:{
            text: 'Добавить',
            click: function(){
                zForm.refill();
                zForm.parent.style.display = 'block';
                DOC.page.className = 'mini';
                wps.browse.show(6);
            }
        }
    });
    wps.browse.newLayer({
        title:'Редактирование',
        leftButton:{
            text: 'Транзакции',
            type: 'backward',
            click: function(){
                wps.browse.show(7);
                zForm.parent.style.display = 'none';
                DOC.page.className = '';
            }
        }
    });
	
    wps.browse.show(0);
    window.onhashchange = function(){
        if( loadScreen.className == 'loadHide' ){
            var hash = window.location.hash;
            var wr_reg	= /wp=(\d)/
            var l_reg	= /l=(\d)/
            var wp		= wr_reg.exec(hash);
            var l		= l_reg.exec(hash);
            if( activePageHash != window.location.hash ){
                if( typeof wp[1] != 'undefined' && typeof l[1] != 'undefined' )
                    if( ( wp[1] == 2 && l[1] == 6 ) || ( wp[1] == 2 && l[1] == 8 ) ){
//                        zForm.refill();
                        zForm.parent.style.display = 'block';
                        DOC.page.className = 'mini';
                    }else{
                        zForm.parent.style.display = 'none';
                        DOC.page.className = '';
                    }
                WorkPlaceStack[ wp[1] ].show( l[1] );
            }
        }
    }
}





pageOnLoad = function(){
    zm.console.log('interface: pageOnLoad');

    DOC.body = document.body;
    DOC.html = document.querySelector('html');
    DOC.bodyH = DOC.html.clientHeight;
    DOC.bodyW = DOC.html.clientWidth;
    DOC.page = document.getElementById('page');
    DOC.header = document.getElementById('header');
    DOC.headerH = 45;
    DOC.content = document.getElementById('content');
    DOC.scroll = document.getElementById('scroll');
    if( zm.fixed ){
        DOC.content.style.height = 'auto';	
    }else{
        DOC.content.style.height = ( DOC.bodyH - ( DOC.headerH ) ) + 'px';
    }
    window.addEventListener('orientationchange', updateOrientation, false);
    window.addEventListener('online', appOnLine, false);
    window.addEventListener('offline', appOffLine, false);
    DOC.header.addEventListener(EVENTS.touchstart, function(e){
        e.preventDefault();
    }, false);
	
    /* sync action */
	
    oauth = function(){
        if (!navigator.onLine) {
            alert('Для синхронизации подключитесь к интернету.');
            return;
        }
        var parent = document.getElementById('diff');
        var ifAuth = parent.querySelector('.ifAuth');
        var ifNAuth = parent.querySelector('.ifNAuth');
        ifNAuth.innerHTML = '';
        parent.style.display = 'block';

        if( SINC.oauth.hasToken() ){
            setTimeout(function() {
                parent.style.display = 'none';
            }, 5000);
            ifAuth.style.display = 'block';
            ifNAuth.style.display = 'none';
            if( localStorage['diff'] == 0 ){
                SINC.clearQuestion(function(){
                    SINC.getDiff( Layer_sync_send );
                });
            }else{
                SINC.getDiff( Layer_sync_send );
            }
        }else{
            SINC.oauth.authorize();
        }
    }
	
    /* sync action */
	
    var start_application = function(){
        // Стартуем отсюда!
        zm.console.log('interface: Инициализация');
        initZenForm();
        initializeInterface();
        if( window.location.search == '?firstrun' ){
            oauth();
        }
		
        setTimeout(function(){
            var loadScreen = document.getElementById('loadScreen');
            loadScreen.className = 'loadHide';
            if( window.navigator.onLine ){
                appOnLine();
            }
        }, 100);
    }
    // Синхронизация
    if( zenMoney.user.get() == false ){
        zm.console.log('interface: user get == false');
        zenMoney.user.add({
            country:1,
            city:1,
            currency:2,
            sum:0,
            title:'Наличные',
            pin:false
        }, function(){
            start_application();
        });
    }else{
        zm.console.log('interface: user get != false');
        start_application();
    }
}

updateTimer = undefined;
chechUpdateData = function(){
    clearTimeout(updateTimer);
    updateTimer = window.setTimeout(SINC.shadow, 3000);
}
appChanged = function(){
    if( SINC.checkOauthState() ){
        chechUpdateData();
    }
}
appOnLine = function(){
    if( SINC.checkOauthState() ){
        chechUpdateData();
    }
}
appOffLine = function(){
    /* alert('offline'); */
    }
updateOrientation = function(){
    var orientation = window.orientation;
    DOC.bodyH = DOC.html.clientHeight;
    DOC.content.style.height = ( DOC.bodyH - ( DOC.headerH ) ) + 'px';
}


/* Стартуем */
documentReadyInit = function(){
    var d = document;
    var h = d.getElementById('header');
    h.style.position = 'fixed';
    if( h.style.position == 'fixed' ){
        zm.fixed = true;
        d.body.className = 'fixed';
    }else{
        zm.fixed = false;
        d.body.className = 'absolute';
    }
    setTimeout(function(){
        var console_parent = document.getElementById('console');
        console_parent.style.visibility = 'visible';
    }, 3000);
    zm.console.log('interface: Страница загружена');
    zm.sql.connect( pageOnLoad, function(){
        zm.console.log('interface: Не получилось создать БД');
        alert('Не могу создать базу.');
    } );
}
window.addEventListener('load', function(){
    /* Заканчиваем авторизацию если нужно */
    var oa = OAuth.decodeForm(window.location.search.substr(1));
    if( oa.length >= 2 ){
        if( ( oa[0][0] == 'oauth_token' ) && ( oa[1][0] == 'oauth_verifier' ) ){
            SINC.oauth.complete(oa[0][1], oa[1][1]);
            return false;
        }
    }
	
    documentReadyInit();
}, false);
/* Стартуем */