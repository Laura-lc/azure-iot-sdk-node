// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

'use strict';

var Protocol = require('azure-iot-device-mqtt').Mqtt;
var Client = require('azure-iot-device').Client;
var Message = require('azure-iot-device').Message;
var deviceData = require('./device_data.js');

const SEND_INTERVAL_SEC  = 30000;

var msg_interval = 0;

var deviceConnectionString = process.env.DEVICE_CONNECTION_STRING;

// fromConnectionString must specify a transport constructor, coming from any transport package.
var client = Client.fromConnectionString(deviceConnectionString, Protocol);

var connectCallback = function (err) {
  if (err) {
    console.error('Could not connect: ' + err.message);
  } else {
    console.log('Client connected');

    client.on('message', function (msg) {
      //console.log('Id: ' + msg.messageId + ' Body: ' + msg.data);

      console.log('Done sending interval')
      clearInterval(msg_interval);

      // When using MQTT the following line is a no-op.
      client.complete(msg, printResultFor('completed'));
    });

    // Create a message and send it to the IoT Hub every two seconds
    msg_interval = setInterval(function () {
      var data = JSON.stringify(deviceData.aquire_report_telemetry());
      var message = new Message(data);
      console.log('Sending message: ' + message.getData());

      client.sendEvent(message, printResultFor('send'));

      //var msg_size = message.getBytes().byteLength;
      //var msg_size_2 = determine_size(message);
      //console.log('Mem size fail ' + msg_size + ' mem size ' + msg_size_2);

    }, SEND_INTERVAL_SEC);

    client.on('error', function (err) {
      console.error(err.message);
    });

    client.on('disconnect', function () {
      clearInterval(sendInterval);
      client.removeAllListeners();
      client.open(connectCallback);
    });
  }
};

client.open(connectCallback);

// Helper function to print results in the console
function printResultFor(op) {
  return function printResult(err, res) {
    if (err) console.log(op + ' error: ' + err.toString());
    if (res) console.log(op + ' status: ' + res.constructor.name);
  };
}