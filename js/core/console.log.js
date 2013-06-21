if( typeof window.console == 'undefined' && !(window.location.hostname == 'i.zenmoney' || window.location.hostname == 'dev.i.zenmoney.ru') ){
    if (!window.location.href.match(/#[^\?]*\?.*debug/)) {
        console = {};
        console.error = console.log = function(){
        }
    }
}