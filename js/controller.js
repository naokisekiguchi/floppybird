
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
    "light": false
  });
  this.previousValues=null;
}

Controller.prototype = {
  controller:function(values){
    let isClick = false;


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
