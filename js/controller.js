/*
Copyright (c) 2017 CHIRIMEN Open Hardware

Licensed under the MIT License
*/
function Controller(config){
  console.log("new controller");
  this.defaultconfig = {};
  for(let i in config){
    this.defaultconfig[i] = config[i];
  }
  this.config = config;
  console.log(this.config);
  this.sensors = new Sensor({
    "accelerometer": true,
    "light": true,
    "dom":"sensorheader"
  });
  this.previousValues=null;
}

Controller.prototype = {
  controller:function(values){
    let isClick = false;

    this.setPipeHeight(values.light);


    return isClick;
  },
  setConfig:function(config){
    this.config = config;
  },
  setPipeHeight:function(height){
    this.config.pipeheight = height;
  },
  setJump:function(jump){
    this.config.jump = jump;
  },
  setGravity:function(gravity){
    this.config.gravity = gravity;
  }
}
