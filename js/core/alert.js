zm.alert = {}
zm.alert.data = {};
zm.alert.hide = function(){
	zm.alert.data.parent.style.display = 'none';
}
zm.alert.show = function(params){
	/*
	params:
		title: 'Во время синхронизации возникли следующие ошибки:',
		body:  'The :focus pseudo-class applies while an element has the focus (accepts keyboard or mouse events, or other forms of input).',
		report:  ''
	*/
	zm.alert.data.title.innerHTML = (params.title?params.title:'');
	if( params.body ){
		zm.alert.data.body.innerHTML = params.body;
		zm.alert.data.body.style.display = 'block';
	}else{
		zm.alert.data.body.style.display = 'none';
	}
	if( params.report ){
		zm.alert.data.report_a.setAttribute('href', params.report);
		zm.alert.data.report.style.display = 'block';
	}else{
		zm.alert.data.report.style.display = 'none';
	}
	zm.alert.data.parent.style.display = 'block';
	document.getElementById('diff').style.display = 'none';
}
zm.alert.init = function(){
	zm.alert.data.parent = document.getElementById('alertScreen');
	zm.alert.data.title = zm.alert.data.parent.querySelector('.title');
	zm.alert.data.body = zm.alert.data.parent.querySelector('.body');
	zm.alert.data.report = zm.alert.data.parent.querySelector('.report');
	zm.alert.data.report_a = zm.alert.data.parent.querySelector('.report a');
	zm.alert.data.close = zm.alert.data.parent.querySelector('button.close');
	zm.alert.data.close.onclick = zm.alert.hide;
}