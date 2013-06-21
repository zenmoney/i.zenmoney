transAdd = {
	init: function(){
		transAdd.element = document.getElementById('transAdd');
		transAdd.i = {};
		transAdd.i.sum = transAdd.element.querySelector('[name="sum"]');
		
		transAdd.i.type = {};
		transAdd.i.type.get = function(){
			return transAdd.i.type.value;
		}
		transAdd.i.type.get = function(val){
			return transAdd.i.type.value;
		}
		transAdd.i.type.set = function(val){
			switch(val){
			case '-1':
			case -1:
				transAdd.i.type.i.expence.checked = true;
			break;
			case '1':
			case 1:
				transAdd.i.type.i.income.checked = true;
			break;
			case '0':
			case 0:
				transAdd.i.type.i.translate.checked = true;
			break;
			default:
				return false;
			}
			transAdd.i.type.value = val;
		}
		transAdd.i.type.init = function(){
			transAdd.i.type.i = {};
			transAdd.i.type.i.expence = transAdd.element.querySelector('[name="type"][value="-1"]');
			transAdd.i.type.i.income = transAdd.element.querySelector('[name="type"][value="1"]');
			transAdd.i.type.i.translate = transAdd.element.querySelector('[name="type"][value="0"]');
			transAdd.i.type.i.expence.addEventListener('change', function(){
				transAdd.i.type.set(-1);
			}, false);
			transAdd.i.type.i.income.addEventListener('change', function(){
				transAdd.i.type.set(1);
			}, false);
			transAdd.i.type.i.translate.addEventListener('change', function(){
				transAdd.i.type.set(0);
			}, false);
			transAdd.i.type.set(-1);
		};
		transAdd.i.type.init();
		transAdd.element.addEventListener(EVENTS.touchend, function(){
			transAdd.element.querySelector('.at-extend').style.height = 'auto';
			DOC.scrollObj.refresh();
		}, false);
	}
}