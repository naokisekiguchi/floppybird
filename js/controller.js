/*
Copyright (c) 2017 CHIRIMEN Open Hardware

Licensed under the MIT License
*/
function Controller(){

  var config = {
    "pipeheight":150, //初期値　150
    "jump":-4.6,      //初期値　-4.6
    "gravity":0.25    //初期値　0.25
  }
  console.log("new controller");
  this.defaultconfig = {};
  for(let i in config){
    this.defaultconfig[i] = config[i];
  }
  this.config = config;
  console.log(this.config);
  this.previousValues=null;

  this.sensors = new Sensor({
    "accelerometer": true,
    "light": true,
    "dom":"sensorheader"
  });

  this.setPipeHeight(this.config.pipeheight);
  this.setJump(this.config.jump);
  this.setGravity(this.config.gravity);      
}

Controller.prototype = {
  /*
  values.light:光センサの値
  values.accelerometer.x:加速度センサのx軸の値
  values.accelerometer.y:加速度センサのy軸の値
  values.accelerometer.z:加速度センサのz軸の値


  this.previousValues:一つ前に取得したセンサの値
  this.previousValues.light:一つ前に取得した光センサの値
  this.previousValues.accelerometer.x:一つ前に取得した加速度センサのx軸の値
  this.previousValues.accelerometer.y:一つ前に取得した加速度センサのy軸の値
  this.previousValues.accelerometer.z:一つ前に取得した加速度センサのz軸の値
  */
  controller:function(values){
    let isClick = false;


    //暗くなったらジャンプする
    if(values.light < 100){
      isClick = true;
    }

    /*
    //x軸加速度の変化量が10以上だったらジャンプする（加速度センサを振ったらジャンプする）
    if(Math.abs(values.accelerometer.x - this.previousValues.accelerometer.x) > 2){
      isClick = true;
    }
    */

    /*
    //光センサの値でジャンプ力を変化させる
    this.setJump(-1 * values.light / 100.0);
    */
    /*
    //x軸加速度の値で重力をコントロールする
    this.setGravity(values.accelerometer.x/10.0);
    */


    return isClick;
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
