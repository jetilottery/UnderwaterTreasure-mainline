/**
 * @module gladButton
 * @memberof skbJet/componentCRDC/gladRenderer
 */
define([], function() {

    /**
     * @function GladButton
     * @description GladButton class constructor
     * @instance
     * @param sprite {Object} - The glad sprite object.
     * @param imgName {string} - The image of the button when active. By default, the image of inactive state should add a postfix "Inactive", also add "Over" postfix for mouse over, and "Pressed" postfix when mouse pressed / touch.
     * @param options {Object} - optional parameters.
     * @param options.scaleWhenClick {number} - default: 1. scale rate when click the button.
     * @param options.scaleWhenOver {number} - default: 1. scale rate when mouse move over the button.
     */
    function GladButton(sprite, imgName, options) {
        this.sprite = sprite;
        this.activeImg = imgName;
        this.inactiveImg = imgName + 'Inactive';
        this.overImg = imgName + 'Over';
        this.pressedImg = imgName + 'Pressed';
        this.enabled = true;
        var _this = this;
        _this.options = {};
        _this.options.scaleXWhenClick = 1;
        _this.options.scaleYWhenClick = 1;
        _this.options.scaleXWhenOver = 1;
        _this.options.scaleYWhenOver = 1;
        _this.options.avoidMultiTouch = false;

        _this.originalScaleX = sprite.scaleX;
        _this.originalScaleY = sprite.scaleY;

        if (options) {
            if (options.scaleXWhenClick) {
                _this.options.scaleXWhenClick = Number(options.scaleXWhenClick);
            }
            if (options.scaleYWhenClick) {
                _this.options.scaleYWhenClick = Number(options.scaleYWhenClick);
            }
            if (options.scaleXWhenOver) {
                _this.options.scaleXWhenOver = Number(options.scaleXWhenOver);
            }
            if (options.scaleYWhenOver) {
                _this.options.scaleXWhenOver = Number(options.scaleYWhenOver);
            }
            if (options.avoidMultiTouch) {
                _this.options.avoidMultiTouch = true;
            }
        }

        _this.sprite.on('mouseover', function() {
            if (_this.enabled) {
                try {
                    _this.sprite.$backgroundImage.gotoAndStop(_this.overImg);
                    if (_this.options.scaleXWhenOver !== 1 || _this.options.scaleYWhenOver !== 1) {
                        sprite.scaleX = _this.options.scaleXWhenOver;
                        sprite.scaleY = _this.options.scaleYWhenOver;
                    }
                } catch (e) {
                    //Nothing to do in case of mobile/tablet do not have mouse over image.
                }

            }
        });

        _this.sprite.on('click', function(event) {
            if (_this.enabled && _this.onClick) {
                event.stopPropagation();
                if (!_this.enabled) {
                    return;
                } else {
                    sprite.scaleX = _this.originalScaleX;
                    sprite.scaleY = _this.originalScaleY;
                    _this.onClick();
                }
            }
        });
    }
    /**
     * @function enable
     * @description enable/disable button
     * @instance
     * @param enableFlag {boolean} - optional, if it is not undefined, then set button status: true: enable; false: disable. If it is undefined, then return current enabled or not.
     * @return current button enabled or not.
     */
    GladButton.prototype.enable = function(enableFlag) {
        if (enableFlag === undefined || enableFlag === null) {
            return this.enabled;
        } else {
            this.enabled = enableFlag ? true : false;
            if (this.enabled) {
                this.sprite.$backgroundImage.gotoAndStop(this.activeImg);
            } else {
                this.sprite.$backgroundImage.gotoAndStop(this.inactiveImg);
            }
        }
    };
    /**
     * @function show
     * @description show/hide button
     * @instance
     * @param showFlag {boolean} - optional, if it is not undefined, then set button status: true: show; false: hide. If it is undefined, then return current shown or not.
     * @return current button shown or not.
     */
    GladButton.prototype.show = function(showFlag) {
        this.sprite.visible = showFlag;
    };

    /**
     * @function click
     * @description set the click action of the button
     * @instance
     * @param clickCallBack {Function} - call back function of button click
     */
    GladButton.prototype.click = function(clickCallBack) {
        this.onClick = clickCallBack;
    };

    /**
     * @function changeImg
     * @description change the activeImg
     * @instance
     * @param activeImg {String} - The image of the button when active
     */
    GladButton.prototype.changeImg = function(activeImg) {
        this.activeImg = activeImg;
        this.inactiveImg = activeImg + 'Inactive';
        this.overImg = activeImg + 'Over';
        this.pressedImg = activeImg + 'Pressed';

        if (this.enabled) {
            this.sprite.$backgroundImage.gotoAndStop(this.activeImg);
        } else {
            this.sprite.$backgroundImage.gotoAndStop(this.inactiveImg);
        }
    };

    return GladButton;
});