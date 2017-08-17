/*
Copyright (c) 2017 CHIRIMEN Open Hardware

Licensed under the MIT License
*/
const { spawn, sleep } = task;
function Sensor(settings){
  this.settings = settings;
  this.port = null;
  if(this.settings.dom){
    this.createDoms(this.settings.dom);
  }

  this.ledStatus = 1;
}
Sensor.prototype = {
  createDoms:function(id){
    var parent = document.getElementById(id);
    for(var i in this.settings){
      if(i != "dom" && this.settings[i]){
        var ele = document.createElement("div");
        ele.id = i;
        parent.appendChild(ele);
      }
    }
  },
  showValue:function(id,mes){
    var ele = document.querySelector("#"+id);
    if(ele){
      ele.innerHTML = mes;
    }
  },
  initSensors:function(){
    const self = this;
    return new Promise(function(resolve,reject){
      spawn(function() {
        // I2C へのアクセサを取得
        const accessor = yield navigator.requestI2CAccess();
        // I2C 0 ポートを使うので、0 を指定してポートを取得
        self.port = accessor.ports.get(0);
        if(self.settings.light){
          try{
            yield self.groveLightInit(self.port,0x29);
          }catch(e){
            self.settings.light = false;
          }
        }
        if(self.settings.accelerometer){
          try{
            yield self.groveAccelerometerInit(self.port,0x53);
          }catch(e){
            self.settings.accelerometer = false;
          }
        }
        if(self.settings.color){
          try{
            yield self.groveColorInit(self.port,0x39);
          }catch(e){
            self.settings.color = false;
          }
        }
        if(self.settings.touch){
          try{
            yield self.groveTouchInit(self.port,0x5a);
          }catch(e){
            self.settings.touch = false;
          }
        }
        resolve();
      });
    });
  },
  getSensors:function(){
    const self = this;
    return new Promise(function(resolve,reject){
      spawn(function(){
        const values = new Object();
        if(self.settings.temp){
          try{
            const temp = yield self.getTemp(port,0x48);
            console.log("temp: "+temp);
            self.showValue("temp","temp: "+temp);
            values.temp = temp;
          }catch(e){
            self.settings.temp = false;
          }
        }
        if(self.settings.distance){
          try{
            const distance = yield self.getDistance(port,0x70);
            console.log("distance: "+distance);
            values.distance = distance;
            self.showValue("distance","distance: "+distance);
          }catch(e){
            self.settings.distance = false;
          }
        }
        if(self.settings.light){
          try{
            const lux = yield self.getLight(self.port,0x29);
            console.log("lux: "+lux);
            values.light = lux;
            self.showValue("light","lux: "+lux);
          }catch(e){
            self.settings.light = false;
          }
        }
        if(self.settings.accelerometer){
          try{
            const accelerometer = yield self.getAccelerometer(self.port,0x53);
            console.log("accelerometer: " + accelerometer.x + ","+ accelerometer.y + ","+ accelerometer.z);
            values.accelerometer = accelerometer;
            self.showValue("accelerometer","accelerometer: " + accelerometer.x + ","+ accelerometer.y + ","+ accelerometer.z);
          }catch(e){
            self.settings.accelerometer = false;
          }
        }
        if(self.settings.color){
          try{
            const color = yield self.getColor(self.port,0x39);
            console.log("color: "+color);
            values.color = color;
          }catch(e){
            self.settings.color = false;
          }
        }
        if(self.settings.touch){
          try{
            const touch = yield self.getTouch(self.port,0x5a);;
            console.log(JSON.stringify(touch));
            values.touch = touch;
          }catch(e){
            self.settings.touch = false;
          }
        }

        resolve(values);
      });
    });
  },
  groveLightInit:function(port,addr){
    return new Promise(function(resolve,reject){
      spawn(function(){
        try{
          const slave = yield port.open(addr);

          yield slave.write8(0x80,0x03);
          yield sleep(10);
          yield slave.write8(0x81,0x00);
          yield sleep(14);
          yield slave.write8(0x86,0x00);
          yield sleep(10);
          yield slave.write8(0x80,0x00);
          yield sleep(10);

          resolve();
        }catch(e){
          reject();
        }

      });
    });
  },
  getLight:function(port,addr){
    const self=this;
    return new Promise(function(resolve,reject){
      spawn(function(){
        try{
          const slave = yield port.open(addr);

          yield slave.write8(0x80,0x03);
          //yield sleep(14);
          yield sleep(1);


          const ch0H = yield slave.read8(0x8d,true);
          const ch0L = yield slave.read8(0x8c,true);
          const ch1H = yield slave.read8(0x8f,true);
          const ch1L = yield slave.read8(0x8e,true);

          const ch0 = ((ch0H << 8) | ch0L);
          const ch1 = ((ch1H << 8) | ch1L);

          const lux = self.calculateLux(ch0,ch1,0,0,0);

          resolve(lux);
        }catch(e){
          reject();
        }

      });
    });
  },
  calculateLux:function(ch0,ch1,iGain,tInt,iType){
      var chScale = 0x7517 << 4;
      var LUX_SCALE = 14;
      var CH_SCALE = 10;
      var RATIO_SCALE = 9;

      var K1T = 0x0040;   // 0.125 * 2^RATIO_SCALE
      var B1T = 0x01f2;   // 0.0304 * 2^LUX_SCALE
      var M1T = 0x01be;   // 0.0272 * 2^LUX_SCALE
      var K2T = 0x0080;   // 0.250 * 2^RATIO_SCA
      var B2T = 0x0214;   // 0.0325 * 2^LUX_SCALE
      var M2T = 0x02d1;   // 0.0440 * 2^LUX_SCALE
      var K3T = 0x00c0;   // 0.375 * 2^RATIO_SCALE
      var B3T = 0x023f;   // 0.0351 * 2^LUX_SCALE
      var M3T = 0x037b;   // 0.0544 * 2^LUX_SCALE
      var K4T = 0x0100;   // 0.50 * 2^RATIO_SCALE
      var B4T = 0x0270;   // 0.0381 * 2^LUX_SCALE
      var M4T = 0x03fe;   // 0.0624 * 2^LUX_SCALE
      var K5T = 0x0138;   // 0.61 * 2^RATIO_SCALE
      var B5T = 0x016f;   // 0.0224 * 2^LUX_SCALE
      var M5T = 0x01fc;   // 0.0310 * 2^LUX_SCALE
      var K6T = 0x019a;   // 0.80 * 2^RATIO_SCALE
      var B6T = 0x00d2;   // 0.0128 * 2^LUX_SCALE
      var M6T = 0x00fb;   // 0.0153 * 2^LUX_SCALE
      var K7T = 0x029a;   // 1.3 * 2^RATIO_SCALE
      var B7T = 0x0018;   // 0.00146 * 2^LUX_SCALE
      var M7T = 0x0012;   // 0.00112 * 2^LUX_SCALE
      var K8T = 0x029a;   // 1.3 * 2^RATIO_SCALE
      var B8T = 0x0000;   // 0.000 * 2^LUX_SCALE
      var M8T = 0x0000;   // 0.000 * 2^LUX_SCALE

      var channel0 = (ch0 * chScale) >> CH_SCALE;
      var channel1 = (ch1 * chScale) >> CH_SCALE;

      var ratio1 = 0;
      if (channel0!= 0) ratio1 = (channel1 << (RATIO_SCALE+1))/channel0;
      var ratio = (ratio1 + 1) >> 1;

      if ((ratio >= 0) && (ratio <= K1T)){b=B1T; m=M1T;
      }else if (ratio <= K2T){b=B2T; m=M2T;
      }else if (ratio <= K3T){b=B3T; m=M3T;
      }else if (ratio <= K4T){b=B4T; m=M4T;
      }else if (ratio <= K5T){b=B5T; m=M5T;
      }else if (ratio <= K6T){b=B6T; m=M6T;
      }else if (ratio <= K7T){b=B7T; m=M7T;
      }else if (ratio > K8T){b=B8T; m=M8T;}

      var temp=((channel0*b)-(channel1*m));
      if(temp<0) temp=0;
      temp+=(1<<(LUX_SCALE-1));
      var lux=temp>>LUX_SCALE;
      return lux;
  },
  groveAccelerometerInit:function(port,addr){
    return new Promise(function(resolve,reject){
      spawn(function(){
        try{
          const slave = yield port.open(addr);

          yield slave.write8(0x2d,0x00);
          yield sleep(10);
          yield slave.write8(0x2d,0x16);
          yield sleep(10);
          yield slave.write8(0x2d,0x08);
          yield sleep(10);

          resolve();
        }catch(e){
          reject();
        }
      });
    });
  },
  getAccelerometer:function(port,addr){
    return new Promise(function(resolve,reject){
      spawn(function(){
        try{
          const slave = yield port.open(addr);

          yield slave.write8(0x80,0x03);
          //yield sleep(14);
          yield sleep(1);

          const xL = yield slave.read8(0x32,true);
          const xH = yield slave.read8(0x33,true);
          const yL = yield slave.read8(0x34,true);
          const yH = yield slave.read8(0x35,true);
          const zL = yield slave.read8(0x36,true);
          const zH = yield slave.read8(0x37,true);

          let x = xL + (xH << 8);
          if(x & (1 << 16 - 1)){x = x - (1<<16);}
          let y = yL + (yH << 8);
          if(y & (1 << 16 - 1)){y = y - (1<<16);}
          let z = zL + (zH << 8);
          if(z & (1 << 16 - 1)){z = z - (1<<16);}

          const EARTH_GRAVITY_MS2=9.80665;
          const SCALE_MULTIPLIER=0.004;

          x = x*SCALE_MULTIPLIER;
          y = y*SCALE_MULTIPLIER;
          z = z*SCALE_MULTIPLIER;

          x = x*EARTH_GRAVITY_MS2;
          y = y*EARTH_GRAVITY_MS2;
          z = z*EARTH_GRAVITY_MS2;

          x=Math.round(x*10000)/10000;
          y=Math.round(y*10000)/10000;
          z=Math.round(z*10000)/10000;

          const accelerometer = {"x": x, "y": y, "z": z};

          resolve(accelerometer);
        }catch(e){
          reject();
        }

      });
    });
  },
  getTemp:function(port,addr){
    return new Promise(function(resolve,reject){
      spawn(function(){
        try{
          const slave = yield port.open(addr);

          const highBit = yield slave.read8(0x00, true);
          const lowBit = yield slave.read8(0x01, true);

          const temp = ((highBit << 8) + lowBit)/128.0;
          resolve(temp);
        }catch(e){
          reject();
        }

      });
    });
  },
  getDistance:function(port,addr){
    return new Promise(function(resolve,reject){
      spawn(function(){
        try{
          const slave = yield port.open(addr);

          yield slave.write8(0x00, 0x00);
          yield sleep(1);
          yield slave.write8(0x00, 0x51);
          yield sleep(70);
          const highBit = yield slave.read8(0x02, true);
          const lowBit = yield slave.read8(0x03, true);

          const distance = (highBit << 8) + lowBit;
          resolve(distance);
        }catch(e){
          reject();
        }

      });
    });
  },
  groveColorInit: function(port,addr){
    var self = this;
    return new Promise(function(resolve, reject){
      spawn(function(){
        try{
          const slave = yield port.open(addr);

          //set timing reg
          yield slave.write8(0x81,0x00);
          yield sleep(1);
          //set interrupt source reg
          yield slave.write8(0x83,0x03);
          yield sleep(14);
          //set interrupt control reg
          yield slave.write8(0x82,0x10);
          yield sleep(1);
          //set gain
          yield slave.write8(0x87,0x00);
          yield sleep(1);
          //set enable adc
          yield slave.write8(0x80,0x03);
          yield sleep(1);

          resolve();
        }catch(e){
          reject();
        }
      });
    });
  },
  clearInterrupt: function(port,addr){
    var self = this;
    return new Promise(function(resolve, reject){
      spawn(function(){
        try{
          const slave = yield port.open(addr);
          yield slave.write8(0xe0,0x00);
          yield sleep(1);
          resolve();
        }catch(e){
          reject();
        }
      });
    });
  },
  calcColor: function(r,g,b){
    var self = this;
    var maxColor,tmp;
    if(self.ledStatus == 1){
      r = r * 1.70;
      b = b * 1.35;
      maxColor = Math.max(r,g);
      maxColor = Math.max(maxColor,b);

      if(maxColor > 255){
        tmp = 250.0/maxColor;
        g *= tmp;
        r *= tmp;
        b *= tmp;
      }
    }
    if(self.ledStatus == 0){
      maxColor = Math.max(r,g);
      maxColor = Math.mac(maxColor,b);

      tmp = 250.0/maxColor;
      g *= tmp;
      r *= tmp;
      b *= tmp;
    }

    var minColor = Math.min(r,g);
    minColor = Math.min(maxColor,b);
    maxColor = Math.max(r,g);
    maxColor = Math.max(maxColor,b);

    var gtmp=g;
    var rtmp=r;
    var btmp=b;

    if(r < 0.8*maxColor && r >= 0.6*maxColor){
      r *= 0.4;
    }else if(r < 0.6*maxColor){
      r *= 0.2;
    }

    if(g < 0.8*maxColor && g >= 0.6*maxColor){
      g *= 0.4;
    }else if(r < 0.6*maxColor){
      if(maxColor == rtmp && gtmp >= 2*btmp && gtmp >= 0.2*rtmp){
        g *= 5;
      }
      g *= 0.2;
    }

    if(b < 0.8*maxColor && b >= 0.6*maxColor){
      b *= 0.4;
    }else if(b < 0.6*maxColor){
      if(maxColor == rtmp && gtmp >= 2*btmp && gtmp >= 0.2*rtmp){
        g *= 0.5;
      }
      if(maxColor == rtmp && gtmp <= btmp && btmp >= 0.2*rtmp){
        b *= 5;
      }
      b *= 0.2;
    }

    minColor = Math.min(r,g);
    minColor = Math.min(maxColor,b);
    if(maxColor == g && r >= 0.85*maxColor && minColor == b){
      r = maxColor;
      b *= 0.4;
    }

    return {red:r,green:g,blue:b};
  },
  getColor: function(port,addr){
    var self = this;
    return new Promise(function(resolve, reject){
      spawn(function(){
        try{
          const slave = yield port.open(addr);

          yield slave.write8(0xd0,0x00);
          yield sleep(1);

          const v = [];
          // get light value
          v[0] = yield slave.read8(0xd0,true),
          v[1] = yield slave.read8(0xd1,true),
          v[2] = yield slave.read8(0xd2,true),
          v[3] = yield slave.read8(0xd3,true),
          v[4] = yield slave.read8(0xd4,true),
          v[5] = yield slave.read8(0xd5,true),
          v[6] = yield slave.read8(0xd6,true),
          v[7] = yield slave.read8(0xd7,true)

          const g = v[1]*256 + v[0];
          const r = v[3]*256 + v[2];
          const b = v[5]*256 + v[4];
          const c = v[7]*256 + v[6];
          resolve(self.calcColor(r,g,b));

        }catch(e){
          reject();
        }
      });
    });
  },
  groveTouchInit:function(port,addr){
    var self = this;
    return new Promise(function(resolve, reject){
      spawn(function(){
        try{
          const slave = yield port.open(addr);

          yield slave.write8(0x2b,0x01);
          yield sleep(1);
          yield slave.write8(0x2c,0x01);
          yield sleep(1);
          yield slave.write8(0x2d,0x01);
          yield sleep(1);
          yield slave.write8(0x2e,0x01);
          yield sleep(1);

          yield slave.write8(0x2f,0x01);
          yield sleep(1);
          yield slave.write8(0x30,0x01);
          yield sleep(1);
          yield slave.write8(0x31,0xff);
          yield sleep(1);
          yield slave.write8(0x32,0x02);
          yield sleep(1);


          for(var i=0;i<12*2;i+=2){
            var address = 0x41+i;
            yield slave.write8(address,0x0f);
            yield sleep(1);
            yield slave.write8(address+1,0x0a);
            yield sleep(1);
          }


          yield slave.write8(0x5d,0x04);
          yield sleep(1);
          yield slave.write8(0x5e,0x0c);
          yield sleep(1);

          resolve();
        }catch(e){
          reject();
        }
      });
    });
  },
  getTouch:function(port,addr){
    var self = this;
    return new Promise(function(resolve, reject){
      spawn(function(){
        try{
          const slave = yield port.open(addr);

          const L =  yield slave.read8(0x00,true);
          const H =  yield slave.read8(0x01,true);
          var value = ((H << 8) + L);
          var array = self.arrayFromMask(value);
          resolve(array);
        }catch(e){
          reject();
        }
      });
    });
  },
  arrayFromMask:function arrayFromMask (nMask) {
    if (nMask > 0x7fffffff || nMask < -0x80000000) { throw new TypeError("arrayFromMask - out of range"); }
    for (var nShifted = nMask, aFromMask = []; nShifted; aFromMask.push(Boolean(nShifted & 1)), nShifted >>>= 1);
    return aFromMask;
  }
}
