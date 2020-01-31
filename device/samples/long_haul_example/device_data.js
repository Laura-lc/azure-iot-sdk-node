// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.
'use strict';

const os = require('os'); 

const ONE_KILO_VALUE = 1024;
var existing_cpu = 0;
var existing_hrtime = 0;

var telemetry_data = {
    id: '',
    platform: '',
    node_version: '',
    deviceData: {
        cpu: '',
        uptime: 0
    },
    memData: {
        heapSize: 0, // Total Size of allocated heap
        memoryUsed: 0 // actual memory used during the execution of our process
    }
};

function format_uptime(seconds) {
    function pad(s){
      return (s < 10 ? '0' : '') + s;
    }
    var hours = Math.floor(seconds / (60*60));
    var minutes = Math.floor(seconds % (60*60) / 60);
    var seconds = Math.floor(seconds % 60);

    return pad(hours) + ':' + pad(minutes) + ':' + pad(seconds);
}

function format_memory_value(memValue) {
    return Math.round(memValue / ONE_KILO_VALUE / ONE_KILO_VALUE * 100) / 100;
};

function hrtime_to_ms(hrtime) {
    return hrtime[0] * 1000 + hrtime[1] / 1000000;
}

function secNSec2ms(secNSec) {
    if (Array.isArray(secNSec)) {
        return secNSec[0] * 1000 + secNSec[1] / 1000000;
    }
    else {
        return secNSec / 1000000;
    }
}

function retrieve_process_cpu_perc() {
    if (existing_cpu !== 0) {
        existing_hrtime = process.hrtime(existing_hrtime);
        existing_cpu = process.cpuUsage(existing_cpu);

        var elapTimeMS = hrtime_to_ms(existing_hrtime);

        var elapUserMS = existing_cpu.user / 1000;
        var elapSystMS = existing_cpu.system / 1000;
        return (100 * (elapUserMS + elapSystMS) / elapTimeMS);
    }
    else {
        existing_cpu = process.cpuUsage();
        existing_hrtime = process.hrtime();
        return 0;
    }
};

function aquire_report_telemetry() {
    telemetry_data.id = process.pid;
    telemetry_data.platform = process.platform;
    telemetry_data.node_version = process.version;
    telemetry_data.deviceData.cpu = retrieve_process_cpu_perc().toFixed(1);
    telemetry_data.deviceData.uptime = format_uptime(process.uptime());

    var mem_usage = process.memoryUsage();
    telemetry_data.memData.heapSize = format_memory_value(mem_usage.heapTotal);
    telemetry_data.memData.memoryUsed = format_memory_value(mem_usage.heapUsed);
    return telemetry_data;
}

module.exports.aquire_report_telemetry = aquire_report_telemetry;