define(['com/createjs/easeljs'], function (cjs) {
    cjs = window.createjs;
    var gr;

    function KeyFrameAnimation(animData, gData, _spritesNameList, _name) {
        this.animData = animData;
        if (!_name) {
            _name = this.animData._name;
        }
        if (animData._keyFrames && animData._keyFrames.length > 0) {
            var lastKeyFrame = animData._keyFrames[animData._keyFrames.length - 1];
            this.maxTime = Number(lastKeyFrame._time);
            this._spritesNameList = [];
            for (var i = 0; i < lastKeyFrame._SPRITES.length; i++) {
                this._spritesNameList.push(lastKeyFrame._SPRITES[i]._name);
            }
            if (_spritesNameList) {
                for (var i = 0; i < _spritesNameList.length && i < lastKeyFrame._SPRITES.length; i++) {
                    this._spritesNameList[i] = _spritesNameList[i];
                }
            }
        }
        this._name = _name;
        gr = gData;
        gr.animMap[_name] = this;
    }

    KeyFrameAnimation.prototype.animData = null;
    KeyFrameAnimation.prototype.isPlaying = false;
    KeyFrameAnimation.prototype.maxTime = 0;
    KeyFrameAnimation.prototype.timeCount = 0;
    KeyFrameAnimation.prototype.loopCount = 0;
    KeyFrameAnimation.prototype.loopNumber = 1;
    KeyFrameAnimation.prototype._frameIndex = 0;
    KeyFrameAnimation.prototype._onStart = null;
    KeyFrameAnimation.prototype._onEnd = null;
    KeyFrameAnimation.prototype._onComplete = null;
    KeyFrameAnimation.prototype._onLoop = null;
    KeyFrameAnimation.prototype._onFrame = null;
    KeyFrameAnimation.prototype._onResume = null;

    KeyFrameAnimation.prototype.updateStyleIfPlaying = function (timeslot) {
        if (!this.isPlaying) {
            return;
        }

        if (this.timeCount === 0 && this.loopCount === 0 && this._onStart) {
            this._onStart();
        } else if ((this.timeCount > 0 || this.loopCount > 0) && this._onResume) {
            this._onResume();
        }

        this.timeCount += timeslot;
        if (this.timeCount >= this.maxTime) {
            this.loopCount++;
            if (this.loopCount >= this.loopNumber) {
                this.updateStyleToTime(this.maxTime);
                _stopThisAnim(this);
                if (this._onComplete) {
                    this._onComplete();
                }
                return;
            } else {
                this.timeCount = 0;
                this._frameIndex = 0;
                if (this._onLoop) {
                    this._onLoop();
                }
            }
        }

        this.updateStyleToTime(this.timeCount);
    };




    function updateCurrentStyle(sp, newStyle) {
        if (!newStyle) {
            return;
        }
        if (newStyle._width || newStyle._width === 0|| newStyle._width === '0') {
            sp.regX = Number(newStyle._width) / 2;
        }
        if (newStyle._height || newStyle._height === 0 || newStyle._height === '0') {
            sp.regY = Number(newStyle._height) / 2;
        }

        if (newStyle._left || newStyle._left === 0|| newStyle._left === '0') {
            sp.x = Number(newStyle._left) + sp.regX;
        }

        if (newStyle._top || newStyle._top === 0 || newStyle._top === '0') {
            sp.y = Number(newStyle._top) + sp.regY;
        }

        if (newStyle._opacity) {
            if (!(typeof newStyle._opacity === 'string' && newStyle._opacity === '')) {
                sp.alpha = Number(newStyle._opacity);
            }
        }
        if (newStyle._background) {
            if (newStyle._background._color) {
                sp.$backgroundColor.graphics.beginFill('#' + newStyle._background._color).drawRect(0, 0, Number(newStyle._width), Number(newStyle._height));
            }
            //TODO
//          if(newStyle._background._imagePlate){
//              originStyle._background._imagePlate = newStyle._background._imagePlate;
//          }

//          if(newStyle._background._position){
//              if(newStyle._background._position._x!==null&&newStyle._background._position._x!==''){
//                  originStyle._background._position._x = Number(newStyle._background._position._x);
//              }
//              if(newStyle._background._position._y!==null&&newStyle._background._position._y!==''){
//                  originStyle._background._position._y = Number(newStyle._background._position._y);
//              }
//          }
        }
        if (newStyle._transform) {
            if (newStyle._transform._scale) {
                if (newStyle._transform._scale._x || newStyle._transform._scale._x === 0|| newStyle._transform._scale._x === '0') {
                    if (!(typeof newStyle._transform._scale._x === 'string' && newStyle._transform._scale._x === '')) {
                        sp.scaleX = Number(newStyle._transform._scale._x);
                    }
                }
                if (newStyle._transform._scale._y || newStyle._transform._scale._y === 0) {
                    if (!(typeof newStyle._transform._scale._y === 'string' && newStyle._transform._scale._y === '')) {
                        sp.scaleY = Number(newStyle._transform._scale._y);
                    }
                }
            }
            if (newStyle._transform._rotate || newStyle._transform._rotate === 0|| newStyle._transform._rotate === '0') {
                sp.rotation = Number(newStyle._transform._rotate);
            }
        }

        if (newStyle._text) {
            var sText = sp.$text;
            if (!sText) {
                sText = new cjs.Text("");
            }
            if (newStyle._text._align) {
                sText.textAlign = newStyle._text._align;
            }
            if (newStyle._text._color) {
                sText.color = '#' + newStyle._text._color;
            }
            if (newStyle._text._token) {
                sText.token = newStyle._text._token;
            }
            if (newStyle._text._lineHight) {
                sText.lineHight = newStyle._text._lineHight;
            } else if (newStyle._font && newStyle._font._size) {
                sText.lineHight = newStyle._font._size;
            }

            if (newStyle._text._strokeWidth) {
                sText.strokeWidth = newStyle._text._strokeWidth;
            }
            if (newStyle._text._strokeColor) {
                sText.strokeColor = '#' + newStyle._text._strokeColor;
            }
//      }

            if (newStyle._font) {
                var font = '';
                if (newStyle._font._size) {
                    font += ' ' + newStyle._font._size + 'px';
                }
                if (newStyle._font._weight) {
                    font += ' ' + newStyle._font._weight;
                }
                if (newStyle._font._family) {
                    font += ' ' + newStyle._font._family;
                }
                font = font.length > 0 ? font.substring(1) : '';
                if (font) {
                    sText.font = font;
                }

                if (newStyle._width) {
                    sText.lineWidth = Number(newStyle._width);
                    sText.setTransform(sText.lineWidth / 2, 0);
                }
            }

            if (!sp.$text) {
                sp.addChild(sText);
                sp.$text = sText;
            }
        }

        if (newStyle._display) {
            sp.display = newStyle._display;
        }

        if (newStyle._overflow) {
            sp.overflow = newStyle._overflow;
        }

    }

    KeyFrameAnimation.prototype.updateStyleToTime = function (time) {
        if (time < 0 || time > this.maxTime) {
            console.warn('Time out of animation range.');
            return;
        }
        var frame = this.getFrameAtTime(time);
        if (!frame._SPRITES) {
            return;
        }
        for (var i = 0; i < this._spritesNameList.length; i++) {
            var sprite = gr[this._spritesNameList[i]];
            updateCurrentStyle(sprite, frame._SPRITES[i]._style);
        }
    };

    KeyFrameAnimation.prototype.play = function (loopNumber) {
        if (this.maxTime <= 0) {
            return;
        }
        if (this.isPlaying === true) {
            console.warn('Animation ' + this.animData._name + ' is already running!');
            return;
        }
        if (!loopNumber) {
            loopNumber = 1;
        }
        this.loopNumber = loopNumber;
        this.lastTimeStamp = null;
        this.isPlaying = true;
        this.timeCount = 0;
    };

    function _stopThisAnim(_this) {
        _this.pause();
        _this.timeCount = 0;
        _this.loopCount = 0;
        _this.loopNumber = 1;
        _this._frameIndex = 0;
    }

    KeyFrameAnimation.prototype.stop = function () {
        _stopThisAnim(this);
        if (this._onEnd) {
            this._onEnd();
        }
    };

    KeyFrameAnimation.prototype.pause = function () {
        this.isPlaying = false;
        this.lastTimeStamp = null;
    };

    KeyFrameAnimation.prototype.clone = function (gData, newSpriteNameList, newName) {
        var newAnim = new KeyFrameAnimation(this.animData, gData, newSpriteNameList, newName);
        return newAnim;
    };

    KeyFrameAnimation.prototype.getFrameAtTime = function (time) {
        var _this = this;
        if (_this.animData._keyFrames.length === 1) {
            if (time === _this.animData._keyFrames[0]._time) {
                return _this.animData._keyFrames[0];
            }
            return null;
        }
        _this._frameIndex = findFrameIndex(_this, time, _this._frameIndex);
        var nextFrame = _this.animData._keyFrames[_this._frameIndex];
        if (!nextFrame) {
            return null;
        }

        var lastFrame = _this.animData._keyFrames[_this._frameIndex - 1];
        var currentFrame = {
            _time: time,
            _SPRITES: []
        };
        var ctime = currentFrame._time;
        if (_this.animData._step) {
            ctime = _this.animData._step * (Math.floor(currentFrame._time / _this.animData._step));
        }
        var rt = (ctime - lastFrame._time) / (nextFrame._time - lastFrame._time);
        for (var i = 0; i < nextFrame._SPRITES.length; i++) {
            var nextSprite = nextFrame._SPRITES[i];
            var lastSprite = lastFrame._SPRITES[i];
            if (lastSprite._id !== nextSprite._id) {
                throw 'Error: sprite list dismatch in animation frames';
            }
            var currentSprite = {
                _id: nextSprite._id,
                _name: nextSprite._name,
                _style: {}
            };
            caculateCurrentStyle(lastSprite, currentSprite, nextSprite, rt);
            currentFrame._SPRITES.push(currentSprite);
        }
        return currentFrame;
    };

    function caculateCurrent(last, next, rt) {
        var l = Number(last);
        var n = Number(next);
        return (n - l) * rt + l;
    }

    function findFrameIndex(_this, time, lastIndex) {
        time = Number(time);
        if (_this.animData._keyFrames.length <= 1 || time <= 0) {
            return 0;
        }
        if (!lastIndex) {
            lastIndex = 0;
        }
        for (var i = lastIndex; i < _this.animData._keyFrames.length; i++) {
            if (time <= Number(_this.animData._keyFrames[i]._time) && time > Number(_this.animData._keyFrames[i - 1]._time)) {
                return i;
            }
        }
        return _this.animData._keyFrames.length;
    }

    function caculateCurrentStyle(lastSprite, currentSprite, nextSprite, rt) {
        if (!nextSprite._style) {
            return;
        }
        var ls = lastSprite._style;
        var cs = currentSprite._style;
        var ns = nextSprite._style;

        if (ns._width) {
            cs._width = caculateCurrent(ls._width * 2, ns._width * 2, rt);
        }

        if (ns._height) {
            cs._height = caculateCurrent(ls._height * 2, ns._height * 2, rt);
        }

        if (ns._top) {
            cs._top = caculateCurrent(ls._top * 2, ns._top * 2, rt);
        }

        if (ns._left) {
            cs._left = caculateCurrent(ls._left * 2, ns._left * 2, rt);
        }

        if (ns._opacity) {
            cs._opacity = caculateCurrent(ls._opacity, ns._opacity, rt);
        }

        if (ns._background) {
            cs._background = {};
            if (ns._background._position) {
                cs._background._position = {};
                if (ns._background._position._x) {
                    cs._background._position._x = caculateCurrent(ls._background._position._x, ns._background._position._x, rt);
                }
                if (ns._background._position._y) {
                    cs._background._position._y = caculateCurrent(ls._background._position._y, ns._background._position._y, rt);
                }
            }
        }

        if (ns._transform) {
            cs._transform = {};
            if (ns._transform._rotate) {
                cs._transform._rotate = caculateCurrent(ls._transform._rotate, ns._transform._rotate, rt);
            }
            if (ns._transform._scale) {
                cs._transform._scale = {};
                if (ns._transform._scale._x) {
                    cs._transform._scale._x = caculateCurrent(ls._transform._scale._x, ns._transform._scale._x, rt);
                }
                if (ns._transform._scale._y) {
                    cs._transform._scale._y = caculateCurrent(ls._transform._scale._y, ns._transform._scale._y, rt);
                }
            }
            if (ns._transform._skew) {
                cs._transform._skew = {};
                if (ns._transform._skew._x) {
                    cs._transform._skew._x = caculateCurrent(ls._transform._skew._x, ns._transform._skew._x, rt);
                }
                if (ns._transform._skew._y) {
                    cs._transform._skew._y = caculateCurrent(ls._transform._skew._y, ns._transform._skew._y, rt);
                }
            }
        }
    }

    return KeyFrameAnimation;
});