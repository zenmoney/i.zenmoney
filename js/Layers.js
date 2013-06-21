/*
* Layers driver
*
* Объект выполняющий переключение слоев
* 
* Входные параметры
* side - сторона [0||1]
	0 - Блокирующий слой	(прозрачный)
	1 - Лицевая сторона		(белый)
	2 - Обратная сторона	(серый)

* render
	название объекта генератора
	Browse, Transactions, Settings, ZenForm, Sync, Budget

* params
	Параметры передаваемые генератору
	title - если нужен
	button.[left|right].callback - функция
	button.[left|right].text - функция
	button.[left|right].type - normal|left|right
	button.[left|right].tpl - Шаблон кнопки будет вставлен innerHTML

* onrender
	callback после отрисовки

* onhide
	callback перед закрытием ( Что-бы убрать выделение пункта меню )

Что мне понадобится еще...
Перерисовать транзакцию после её изменения...

*/
Layers = {
	status: {
		side: 1,
		render: null,
		sides: {
			0:{
				layer:-1
			},
			1:{
				layer:-1
			},
			2:{
				layer:-1
			}
		}
	},
	els: {
		layers: {},
		header: {
			parent: undefined,
			text: undefined,
			btns: {
				left: undefined,
				right: undefined
			}
		}
	},
	init: function(){
		var there = Layers;
		
		// Инициализируем все скроллы
		for( var i = 0; i<=2; i++ ){
			there.els.layers[i] = {};
			there.els.layers[i].e = document.getElementById('Layer_'+i);
			for( var j = 0; j<=1; j++ ){
				there.els.layers[i][j] = {};
				there.els.layers[i][j].e = document.getElementById('Layer_'+i+'_'+j);
				there.els.layers[i][j].se = there.els.layers[i][j].e.querySelector('.scroll');
				if( zm.fixed ){
					alert('test');
				}else{
					there.els.layers[i][j].s = new iScroll(there.els.layers[i][j].se, {desktopCompatibility:true});
				}
			}
		}
		
		there.els.header.parent = document.getElementById('header');
		there.els.header.text = document.getElementById('Layers_header_text');
		
		there.els.header.btns.left = document.getElementById('Layers_button_left');
		there.els.header.btns.right = document.getElementById('Layers_button_right');
	},
	set: function(params){
		var there = Layers;
		switch( params.side ){
		case 0:
			switch( there.status.side ){
			case 0:
				// Просят нулевой активен нулевой
				
			break;
			case 1:
				
			break;
			case 2:
				
			break;
			}
		break;
		case 1:
			switch( there.status.side ){
			case 0:
				// Просят первый активен нулевой
				
			break;
			case 1:
				// Просят первый активен первый
				//if( sides )
			break;
			case 2:
				// Просят первый активен второй
				
			break;
			default:
				
			}
		break;
		case 2:
			
		break;
		}
	}
}

Layers.view = function(view){
	switch( view ){
	case 'browse':
		Layers.set({
			side: 1,
			render: 'Browse',
			title: 'Обзор',
			button: {
				left: {
					text: 'Добавить',
					type: 'normal',
					callback: function(){
						zForm.parent.style.display = 'block';
					}
				},
				right: {
					text: 'Настройки',
					type: 'normal',
					callback: function(){
						Layers.view('settings');
					}
				}
			},
			onrender: function(){
				console.log('Нарисовал Browse');
			},
			onhide: function(){
				alert('Спрятал Browse');
			}
		});
	break;
	case 'settings':
		Layers.set({
			side: 2,
			render: 'Settings',
			title: 'Настройки'
		});
	break;
	}
}