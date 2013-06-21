zenMoney.tag = {};
zenMoney.tag.list = [];
zenMoney.tag.group = [];
zenMoney.tag.byId = {};
zenMoney.tag.groupById = {};
zenMoney.tag.tree = {};
zenMoney.tag.suggest = [];

zenMoney.tag.init = function(tx, callback) {
    zenMoney.tag.list = [];
    zenMoney.tag.group = [];
    zenMoney.tag.byId = {};
    zenMoney.tag.groupById = {};
    zenMoney.tag.tree = {};
    zenMoney.tag.suggest = [];
    tx.executeSql('SELECT * FROM tag', [], function(tx, result) {
        for (i=0;i<result.rows.length;i++) {
            obj = result.rows.item(i);
            zenMoney.tag.list.push(obj);
            zenMoney.tag.byId[obj.id] = obj;
        }
        // loading tag_groups
        tx.executeSql('SELECT * FROM (SELECT *, (select count(id) from transaction_tag where tag_group = tag_group.id AND coalesce(deleted, 0) = 0) as popularity from tag_group) as d ORDER BY popularity DESC', [], function(tx, result) {
            for (i=0;i<result.rows.length;i++) {
                obj = result.rows.item(i);
                obj.show_income = Boolean(obj.show_income);
                obj.show_outcome = Boolean(obj.show_outcome);
                zenMoney.tag.group.push(obj);
                zenMoney.tag.groupById[obj.id] = obj;
            } 
            // building tree
            zenMoney.tag.buildSuggest();
            zenMoney.tag.buildTree(callback);
            if (zForm)
                zForm.els.tagbox.setData(zenMoney.tag.suggest);
        }, function(tx, err) {
            zm.console.log('Tag_group list failed with error #' + err.code + ': ' + err.message);
        });
    }, function(tx, err) {
        zm.console.log('Tag list failed with error #' + err.code + ': ' + err.message);
    })
}


zenMoney.tag.buildTree = function(cb) {
    //    for(k in zenMoney.tag.group) {
    //        
    //    }
    if (cb) cb();
}
zenMoney.tag.buildSuggest = function() {
    zenMoney.tag.suggest = [];
    for(i=0;i<zenMoney.tag.group.length;i++) {
        group = zenMoney.tag.group[i];
        if (!group.tag0) continue;
        title = zenMoney.tag.byId[group.tag0].title;
        if (group.tag1) 
            title += '&nbsp;/&nbsp;' + zenMoney.tag.byId[group.tag1].title;
        if (group.tag2) 
            title += '&nbsp;/&nbsp;' + zenMoney.tag.byId[group.tag2].title;
        
        zenMoney.tag.suggest.push({
            type: 'tag_group', 
            title: title,
            show_income: group.show_income == 'true',
            show_outcome: group.show_outcome == 'true',
            popularity: group.popularity,
            id: group.id
        });
    }
//    console.log('suggest', zenMoney.tag.group, zenMoney.tag.suggest);
}