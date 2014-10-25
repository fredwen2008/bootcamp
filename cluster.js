#!/usr/bin/env node

var cluster = require('cluster');
var timeouts = [];

function errorMsg(worker) {
    console.error('Worker process %d must be wrong.\n', worker.process.pid);
    worker.kill();
}

function createWorkers() {
    if (cluster.isMaster) {
        handleSignal();
        cluster.setupMaster({
            exec: 'app.js',
            silent: false
        });
        console.log('Main process %s started.\n', process.pid);
        var n = require('os').cpus().length * 2;
        while (n-- > 0) {
            cluster.fork();
        }
        cluster.on('fork', function(worker) {
            timeouts[worker.id] = setTimeout(errorMsg, 2000, worker);
        });
        cluster.on('listening', function(worker, address) {
            clearTimeout(timeouts[worker.id]);
        });
        cluster.on('exit', function(worker, code, signal) {
            console.log('worker ' + worker.process.pid + ' died\n');
            clearTimeout(timeouts[worker.id]);
            cluster.fork();
        });
    }
}

function killAllWorkers(signal) {
    var uniqueID, worker;

    for (uniqueID in cluster.workers) {
        if (cluster.workers.hasOwnProperty(uniqueID)) {
            worker = cluster.workers[uniqueID];
            worker.removeAllListeners();
            worker.process.kill(signal);
        }
    }
}

function handleSignal() {
    process.on('SIGHUP', function() {
        killAllWorkers('SIGTERM');
    });

    process.on('SIGTERM', function() {
        killAllWorkers('SIGTERM');
    });
}

function main() {
    require('daemon')();
    createWorkers();
}

main();