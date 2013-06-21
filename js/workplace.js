Button = function(options){
	this.data = {
		text: '',
		img: '',
		type: 'button',
		node: undefined,
		textnode: undefined,
		click: undefined
	}
	this.text = function(text){
		removeChildrens( this.data.textnode );
		this.data.textnode.appendChild( document.createTextNode( text ) );
	}
	this.img = function(){
		
	}
	this.type = function(type){
		// backward || forward || button
		switch(type){
		case 'backward':
			this.data.node.className = 'ButtonStyleBackward';
		break;
		case 'forward':
			this.data.node.className = 'ButtonStyleForward';
		break;
		default:
			this.data.node.className = 'ButtonStyleButton';
		break;
		}
	}
	this.show = function(){
		this.data.node.style.display = 'block';
	}
	this.hide = function(){
		this.data.node.style.display = 'none';
	}
	this.click = function(){
		if( arguments.length ){
			if( typeof arguments[0] == 'function' ){
				this.data.click = arguments[0];
			}
		}else{
			if( typeof this.data.click == 'function' ){
				this.data.click();
			}
		}
	}
	this.init = function(){
		this.data.node = document.createElement('div');
		var bg1 = document.createElement('div');
		bg1.className = 'bg1';
		var bg2 = document.createElement('div');
		bg2.className = 'bg2';
		this.data.textnode = document.createElement('div');
		this.data.textnode.className = 'text';
		bg1.appendChild(bg2);
		bg2.appendChild(this.data.textnode);
		this.data.node.appendChild(bg1);
		
		this.hide();
		var Parent = this;
		zenEvents.ontap(this.data.node, function(){ Parent.click(); });
		this.type( options.type );
		if( options.text ) this.text( options.text );
		this.element = this.data.node;
	}
	this.init();
}

/*
* Объект WorkPlace
* Определяет рабочие области и выполняет кучу полезных вещей...
* Полностью опишу позже
*/
LayerCount = 0;
Layer = function(options){
	this.data = {
		title: undefined,
		node: undefined,
		y: 0
	}
	this.show = function(params){
		var s_top = document.body.scrollTop;
		var there = this;
		this.data.node.style.display = 'block';
		/*
		(function(there){
			setTimeout(function(){ there.data.node.style.left = '0%'; }, 1);
		})(this)
		*/
		//this.data.node.style.webkitTransform = 'translate(0, 0)';
		//this.data.node.style.visibility = 'visible';
		
		this.data.node.style.marginTop = s_top+'px';
		setTimeout(function(){
			document.body.scrollTop = 0;
			there.data.node.style.marginTop = 0;
		}, 200);
		
		var thb = document.getElementById('topHeaderBlock');
		var title = document.querySelector('#topHeaderBlock .title');
		var logo = document.querySelector('#topHeaderBlock .logo');
		removeChildrens(title);
		if( this.data.title ){
			var text = document.createTextNode(this.data.title);
			title.appendChild(text);
			logo.style.display = 'none';
		}else{
			logo.style.display = 'block';
		}
		if( options.leftButton ){
			leftTopBtn.text( options.leftButton.text );
			leftTopBtn.click( options.leftButton.click );
			leftTopBtn.type( options.leftButton.type );
			leftTopBtn.show();
		}else{
			leftTopBtn.hide();
		}
		if( options.rightButton ){
			rightTopBtn.text( options.rightButton.text );
			rightTopBtn.click( options.rightButton.click );
			rightTopBtn.show();
		}else{
			rightTopBtn.hide();
		}
		var lbtn = document.getElementById('topHeaderLeftPlace');
		var rbtn = document.getElementById('topHeaderRightPlace');
		var lbtnw = lbtn.offsetWidth;
		var rbtnw = rbtn.offsetWidth;
		if( lbtnw > rbtnw ){
			thb.style.marginLeft = ( lbtnw + 5 ) + 'px';
			thb.style.marginRight = ( lbtnw + 5 ) + 'px';
		}else{
			thb.style.marginLeft = ( rbtnw + 5 ) + 'px';
			thb.style.marginRight = ( rbtnw + 5 ) + 'px';
		}
		if( this.render ) this.render(this, params);
	}
	this.hide = function(direction){
		var there = this;
		switch(direction){
		case 'left':
			/*
			this.data.node.style.left = '-100%';
			//this.data.node.style.webkitTransform = 'translate(-100%, 0)';
			//this.data.node.style.opacity = 0;
			//this.data.node.style.visibility = 'hidden';
			(function(there){
				setTimeout(function(){ there.data.node.style.display = 'none'; }, 200);
			})(this);
			*/
			there.data.node.style.display = 'none';
		break;
		case 'right':
			/*
			this.data.node.style.left = '100%';
			//this.data.node.style.webkitTransform = 'translate(100%, 0)';
			//this.data.node.style.opacity = 0;
			//this.data.node.style.visibility = 'hidden';
			(function(there){
				setTimeout(function(){ there.data.node.style.display = 'none'; }, 200);
			})(this);
			*/
			there.data.node.style.display = 'none';
		break;
		}
	}
	this.init = function(){
		var dragstart = false;
		var drag = {};
		drag.y = 0;
		this.data.title = options.title;
		if(options.render){
			this.render = options.render;
		}else{
			this.render = undefined;
		}
		// Создаем и вставляем в DOM элемент WorkPlace
		this.data.node = document.createElement('div');
		this.data.node.className = 'Layer';
		this.data.node.leftButton = options.leftButton;
		this.data.node.rightButton = options.rightButton;
		this.data.content = document.createElement('div');
		this.data.content.className = 'Content';
		this.data.content.setAttribute('id', 'Content'+LayerCount);
		this.data.node.setAttribute('id', 'Layer'+LayerCount);
		
		var parent = options.workplace.data.node;
		this.data.node.appendChild(this.data.content);
		parent.appendChild(this.data.node);
		var there = this;
		if( zm.fixed ){
			this.data.scroll = {
				refresh: function(){  }
			};
		}else{
			this.data.scroll = new iScroll('Content'+LayerCount, {desktopCompatibility:true, checkDOMChanges:true});
		}
		LayerCount++;
	}
	this.init();
}
WorkPlaceStack = [];
WorkPlace = function(options){
	this.data = {
		button: undefined,
		node: undefined,
		visible: false 
	}
	this.close = function(){
		
	}
	this.remove = function(){
		
	}
	this.show = function(){
		if( this.data.button ) this.data.button.className = 'active';
		this.data.node.style.display = 'block';
		this.data.visible = true;
		activePageHash = '#wp=';
		for( var i = 0; i<WorkPlaceStack.length; i++ ){
			if( WorkPlaceStack[i] != this ){
				WorkPlaceStack[i].hide();
			}else{
				activePageHash += i;
			}
		}
		if( !arguments[0] ){
			this.showLayer(0, arguments[1]);
			activePageHash += '&l=' + 0;
		}else{
			this.showLayer( arguments[0], arguments[1] );
			activePageHash += '&l=' + arguments[0];
		}
		window.location.hash = activePageHash;
	}
	this.hide = function(){
		if( this.data.button ) this.data.button.className = '';
		this.data.node.style.display = 'none';
		//this.showLayer(0);
		this.data.visible = false;
	}
	this.init = function(){
		// Создаем и вставляем в DOM элемент WorkPlace
		this.data.node = document.createElement('div');
		this.data.node.className = 'WorkPlace';
		var parent = document.getElementById('mainWorkplace');
		parent.appendChild(this.data.node);
		WorkPlaceStack.push(this);
	}
	this.layers = [];
	this.activeLayer = 0;
	this.newLayer = function(options){
		options.workplace = this;
		var layer = new Layer(options);
		this.layers.push(layer);
		if( this.layers.length == 1 ) this.showLayer(0);
		return this.layers.length;
	}
	this.showLayer = function(id, params){
		var focus = document.querySelector('*:focus');
		if( focus ) focus.blur();
		if( this.data.visible ){
			if( this.layers[id] ){
				/*
				for( var i = 0; i < this.layers.length; i++ ){
					if( i == id || i == this.activeLayer ){
						this.layers[i].data.node.style.webkitTransitionDuration = '0.2s';
						this.layers[i].data.node.style.webkitTransitionDuration = '0.2s';
					}else{
						this.layers[i].data.node.style.webkitTransitionDuration = '0';
						this.layers[i].data.node.style.webkitTransitionDuration = '0';
					}
				}
				*/
				this.activeLayer = id;
				for( var i = 0; i < this.layers.length; i++ ){
					if( this.layers[i] && id != i ){
						if( i < id ){
							this.layers[i].hide('left');
						}else{
							this.layers[i].hide('right');
						}
					}
				}
				this.layers[id].show(params);
			}
		}
	}
	this.init();
}