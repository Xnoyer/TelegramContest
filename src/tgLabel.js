class TgLabel {
    constructor(context, text) {
        this._ctx = context;
        this._text = text;
        this._draw = false;
        this._newDraw = true;
        this._opacity = 1;
        this.x = 0;
        this.y = 0;
        this._animDuration = 200;
        this._animationProgress = 1;
    }

    set draw(value) {
        if (this._newDraw === value) {
            return;
        }
        if (this._animationProgress >= 1) {
            this._animationProgress = 0;
        }
        this._newDraw = value;
    }

    get draw() {
        return this._draw;
    }

    onAnimationFrame(fromLast) {
        if (this._animationProgress < 1 && this._draw) {
            this._animationProgress += fromLast / this._animDuration;
            if (this._animationProgress > 1) {
                this._animationProgress = 1;
            }
            this._opacity = this._newDraw ? this._animationProgress : 1 - this._animationProgress;
            this._opacity = this._opacity > 1 ? 1 : (this._opacity < 0 ? 0 : this._opacity);
            return true;
        } else if (this._draw !== this._newDraw) {
            this._draw = this._newDraw;
        }
        return false;
    }

    recalc() {
        this.width = this._ctx.measureText(this._text).width;
    }

    redraw() {
        if (!this._draw) {
            return;
        }
        let fontSize = parseInt(this._ctx.font);
        this._ctx.save();
        this._ctx.globalAlpha = this._opacity;
        this._ctx.textAlign = 'center';
        this._ctx.textBaseline = 'middle';
        this._ctx.fillText(this._text, this.x, this.y);
        this._ctx.restore();
    }
}