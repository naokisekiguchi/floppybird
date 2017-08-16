Floppy Bird for CHIRIMEN
=========

はじめに、[Floppy Bird](https://github.com/nebez/floppybird)はNebez Briefkani氏による、Flappy BirdのHTML5版コピーです。

Floppy Bird for CHIRIMENはFloppy Birdを[CHIRIMEN](https://chirimen.org/)で動作させ、GPIOやI2Cセンサーでゲームの制御ができるように改変したものです。

Initially, [Floppy Bird](https://github.com/nebez/floppybird) is recreating Flappy Bird in HTML5 by Nebez Briefkani.

Floppy Bird for CHIRIMEN is modification of Floppy Bird to be applied to [CHIRIMEN](https://chirimen.org/) board and enable to control by GPIO and I2C sensors.

Modifications : 改変点
----

* CHIRIMENで動作させるための軽量化
  * サウンドエフェクトの無効化
  * 一部背景アニメーションの停止
* ゲームパラメータの調整
* GPIOやI2Cセンサーによるゲームの制御機能の搭載


* Effect reductions for CHIRIMEN
  * turn off sound effects by a flag
  * stop background animation
* Adjusting game parameters
* Game controlling by GPIO or I2C Sensors

License
====
* Original Floppy Bird

Copyright 2014 Nebez Briefkani

Licensed under the Apache License, Version 2.0 (the "License");  
you may not use this file except in compliance with the License.  
You may obtain a copy of the License at  
http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software  
distributed under the License is distributed on an "AS IS" BASIS,  
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.  
See the License for the specific language governing permissions and  
limitations under the License.

* WebGPIO/I2C polyfill

Copyright (c) 2016 club-wot team and chirimen-oh team , other contributors

Licensed under the MIT License

* Modifications for Floppy Bird for CHIRIMEN

Copyright (c) 2017 CHIRIMEN Open Hardware

Licensed under the MIT License
