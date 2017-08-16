
function Controller(config){
  console.log("new controller");
  this.config = config;
  console.log(this.config);
  this.sensors = new Sensor({
    "accelerometer": true,
    "light": true
  });
}

Controller.prototype = {
  controller:function(values){
    var isClick = true;



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
