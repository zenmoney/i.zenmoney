// Get object category
zenMoney.category.cache = false;
zenMoney.category.sort = {};
zenMoney.category.sort[-1] = [];
zenMoney.category.sort[1] = [];
zenMoney.category.init = function(tx, callback){
    zenMoney.category.cache = {};
    zenMoney.category.sort[-1] = [];
    zenMoney.category.sort[1] = [];
    var query = function(type, cb){
        tx.executeSql('SELECT * FROM categories WHERE deleted = 0 AND ( ( type = 0 ) OR ( type = ? ) ) ORDER BY title;', [type], function(tx, result){
            zenMoney.category.cache[type] = {};
            zenMoney.category.sort[type].push(0);
            for( var i = 0; i < result.rows.length; i++ ){
                var id = result.rows.item(i)['id'];
                if( id != 0 && id != 1 && id != 2 ){
                    zenMoney.category.sort[type].push(id);
                }
                zenMoney.category.cache[type][ id ] = {};
                zenMoney.category.cache[type][ id ]['id'] = result.rows.item(i)['id'];
                zenMoney.category.cache[type][ id ]['server_id'] = result.rows.item(i)['server_id'];
                zenMoney.category.cache[type][ id ]['static_id'] = result.rows.item(i)['static_id'];
                zenMoney.category.cache[type][ id ]['title'] = result.rows.item(i)['title'];
                zenMoney.category.cache[type][ id ]['type'] = result.rows.item(i)['type'];
                zenMoney.category.cache[type][ id ]['transfer'] = result.rows.item(i)['transfer'];
                zenMoney.category.cache[type][ id ]['deleted'] = result.rows.item(i)['deleted'];
                zenMoney.category.cache[type][ id ]['edited'] = result.rows.item(i)['edited'];
            }
            if (cb) cb();
        }, function(tx, err) {
            console.log('categories failed to init', err);
        });
    }
    query(-1, function(){
        query(1, function() {
            if (callback) callback();
        });
    })
}
zenMoney.category.get = function(){
    if( !arguments[0] ){
        return zenMoney.category.cache;
    }else{
        return zenMoney.category.cache[arguments[0]];
    }
}
zenMoney.category.edit = function(options, callback){
    if( options.title == '' || options.id == '' ){
        callback({
            result: false
        });
        return false;
    }
	
    var prepare_data = [options.title, options.id];
    if( prepare_data ){
        zenMoney.sql.db.transaction(function(tx){
            tx.executeSql('UPDATE categories SET title=?, diff=strftime("%s"), edited=1 WHERE id=?;', prepare_data, function(tx, res){
                if( callback ){
                    options.result = true;
                    zenMoney.category.init(tx, function(){
                        callback(options);
                    });
                }else{
                    zenMoney.category.init(tx, function() {
                        
                        });
                }
            }, function(){
                if( callback ){
                    callback({
                        result: false
                    });
                }
            });
        });
    }else{
        if( callback ){
            callback({
                result: false
            });
        }
    }
}
zenMoney.category.add = function(options, callback){
    if( options.title == '' ){
        callback({
            result: false
        });
        return false;
    }
    var prepare_data = [options.title, options.type, new Date().getTime()];
    if( prepare_data ){
        zenMoney.sql.db.transaction(function(tx){
            var perm = true;
            tx.executeSql('SELECT * FROM categories WHERE ( title = ? ) AND ( type = ? ) AND deleted = 0;', [options.title, options.type], function(tx, res){
                if( res.rows.length == 0 ){
                    tx.executeSql('INSERT INTO categories (title, type, transfer, deleted, edited, created, diff) VALUES (?, ?, 0, 0, 1, ?, strftime("%s"));', prepare_data, function(tx, res){
                        if( callback ){
                            options.result = true;
                            zenMoney.category.init(tx, function(){
                                callback(options);
                            });
                        }else{
                            zenMoney.category.init(tx);
                        }
                    }, function(){
                        if( callback ){
                            callback({
                                result: false
                            });
                        }
                    });
                }else{
                    if( callback ){
                        callback({
                            result: false
                        });
                    }
                }
            }, function(){
                if( callback ){
                    callback({
                        result: false
                    });
                }
            });
        }, function(){ }, function(){
			
            });
    }else{
        if( callback ){
            callback({
                result: false
            });
        }
    }
}
zenMoney.category.del = function(options, callback){
    if( options.id ){
        zenMoney.sql.db.transaction(function(tx){
            tx.executeSql('UPDATE transactions SET category = 0, diff = strftime("%s") WHERE category = ?;', [options.id], null, null);
            tx.executeSql('UPDATE categories SET deleted = 1, edited = 1, diff = strftime("%s") WHERE id = ?;', [options.id], function(tx, res){
                if( callback ){
                    options.result = true;
                    zenMoney.category.init(tx, function(){
                        callback(options);
                    });
                }else{
                    zenMoney.category.init(tx);
                }
            }, function(tx, res){
                if( callback ){
                    callback({
                        result: false
                    });
                }
            });
        });
    }else{
        if( callback ){
            callback({
                result: false
            });
        }
    }
}