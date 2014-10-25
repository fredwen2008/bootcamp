var AWS = require('aws-sdk');
AWS.config.loadFromPath('./config.json');
var dynamodb = new AWS.DynamoDB();
var async = require('async');
var current;
var actions = {
    buyfield:handleBuyField,
    seed:handleSeed,
};
function getSession(sessionId, callback) {
    var params = {
        TableName: 'hayday-session',
        Key: {
            id: {
                S: sessionId,
            }
        },
        ConsistentRead: true,
    };
    dynamodb.getItem(params, function(err, data) {
        if (err || data.Item == undefined) {
            callback(['session does not exist', err]);
        } else {
            callback(null, data.Item);
        }
    });
}

function updateSession(session, callback) {
    var expired = (current + 30 * 60 * 1000).toString();
    var params = {
        TableName: 'hayday-session',
        Key: {
            id: {
                S: session.id.S,
            }
        },
        AttributeUpdates: {
            expiredTime: {
                Action: 'PUT',
                Value: { /* AttributeValue */
                    N: expired
                }
            }
        }
    };
    dynamodb.updateItem(params, function(err, data) {
        if (err) {
            callback(['session update failed', err]);
        } else {
            callback(null, session);
        }
    });
}

function getAccount(accountId, callback) {
    var params = {
        TableName: 'hayday-account',
        Key: {
            id: {
                S: accountId,
            }
        },
        ConsistentRead: true,
    };
    dynamodb.getItem(params, function(err, data) {
        if (err || data.Item == undefined) {
            callback(['account does not exist', err]);
        } else {
            callback(null, data.Item);
        }
    });
}

function getPlayer(accountId, callback) {
    var params = {
        TableName: 'hayday-player',
        Key: {
            id: {
                S: accountId,
            }
        },
        ConsistentRead: true,
    };
    dynamodb.getItem(params, function(err, data) {
        if (err || data.Item == undefined) {
            callback(['player does not exist', err]);
        } else {
            callback(null, data.Item);
        }
    });
}

var validateAuthToken = function(sessionId, callback) {
    async.waterfall([
        function(callback) {
            getSession(sessionId, callback);
        },
        function(session, callback) {
            current = new Date().getTime();
            var expiredTime = session.expiredTime.N;
            if (current > expiredTime) {
                callback("session expired");
            } else {
                callback(null, session);
            }
        },
        function(session, callback) {
            updateSession(session, callback);
        },
        function(session, callback) {
            getPlayer(session.userId.S, callback);
        },
    ], function(err, result) {
        if (err)
            callback(err);
        else
            callback(null, result.player.S);
    });
}

var handleBufField(parameters,callback){
    var result = "111";
    callback(null,result);
}

var handleActions = function(actons,callback){
    if(!Array.isArray(actions){
        callback("invalid request");
    }
    async.mapSeries(actions,function(action,cb){
        if(action.action && action.parameters && actions[action.action]){
            actions[action.action](action.parameters,cb);
        }else{
            cb("bad action");
        }
    },function(err,result){
        if(err){
            callback(err);
        }else{
            //save changes to db
            callback(null,result);
        }
    });
});

var service = exports = module.exports = {};
service.validateAuthToken = validateAuthToken;
