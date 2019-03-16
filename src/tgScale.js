class TgScale extends TgLayerBase {
    constructor(parent, series) {
        super(parent);
        this._canvasNode.classList.add('scale');
        this._series = series;
    }

    set series(value) {
        this._series = value;
    }

    onMouseDown(coords) {
        this._mouseIsDown = true;
        this._downCoords = coords;
        this._initialScaleStart = this._chart.scaleStart;
        this._initialScale = this._chart.scale;
    }

    onMouseUp(coords) {
        this._mouseIsDown = false;
    }

    onMouseMove(coords) {
        if (!this._mouseIsDown) {
            if (coords.y >= this._scaleY && coords.y <= this._scaleY + this._chart.theme.scale.height) {
                this._leftHandleHover = coords.x >= this._scaleX + this._leftHoverWidth && coords.x <= this._scaleX + this._leftHoverWidth + 10;
                this._rightHandleHover = coords.x >= this._scaleX + this._leftHoverWidth + this._framePart - 10 && coords.x <= this._scaleX + this._leftHoverWidth + this._framePart;
                this._frameHover = coords.x >= this._scaleX + this._leftHoverWidth + 10 && coords.x <= this._scaleX + this._leftHoverWidth + this._framePart - 10;

                this._chart.style.cursor = this._leftHandleHover || this._rightHandleHover ? 'ew-resize' : (this._frameHover ? 'move' : this._chart.style.cursor);
            }
        } else {
            let deltaX = coords.x - this._downCoords.x;
            let scaleMove = deltaX / this._scaleWidth;
            if (this._frameHover) {
                this._chart.scaleStart = this._initialScaleStart + scaleMove;
                if (this._chart.scaleStart <= 0) {
                    this._chart.scaleStart = 0;
                }
                if (this._chart.scaleStart + this._chart.scale >= 1) {
                    this._chart.scaleStart = 1 - this._chart.scale;
                }
            }
            if (this._leftHandleHover) {
                this._chart.scaleStart = this._initialScaleStart + scaleMove;
                this._chart.scale = this._initialScale - scaleMove;
                if (this._chart.scaleStart <= 0) {
                    let diff = this._chart.scaleStart;
                    this._chart.scaleStart = 0;
                    this._chart.scale += diff;
                }
                if (this._chart.scale < .1) {
                    let diff = .1 - this._chart.scale;
                    this._chart.scale = .1;
                    this._chart.scaleStart -= diff;
                }
            }
            if (this._rightHandleHover) {
                this._chart.scale = this._initialScale + scaleMove;
                if (this._chart.scaleStart + this._chart.scale >= 1) {
                    this._chart.scale = 1 - this._chart.scaleStart;
                }
                if (this._chart.scale < .1) {
                    this._chart.scale = .1;
                }
            }
            this._chart.recalc();
            this._chart.redraw();
        }
    }

    onAnimationFrame(fromLast) {
        if (this._animationProgress < 1 && this._seriesCoords) {
            this._animationProgress += fromLast / this._animDuration;
            this._seriesCoords.forEach(seriesCoords => {
                seriesCoords.forEach(point => {
                    point.y = point.old_y + (point.new_y - point.old_y) * this._animationProgress;
                });
                this.redraw();
            });
            return true;
        } else {
            return false;
        }
    }

    recalc() {
        this._animationProgress = 0;
        let height = this._theme.scale.height;
        this._scaleX = this._chart.plotArea.x + this._theme.spacing;
        this._scaleY = this._chart.plotArea.x + this._chart.plotArea.h - height;
        this._scaleWidth = this._chart.plotArea.w - this._theme.spacing * 2;
        let connectorWidth = this._scaleWidth / (this._chart.categories.length - 1);
        let dataDistance = this._chart.seriesBounds.max - this._chart.seriesBounds.min;
        if (!this._seriesCoords) {
            this._seriesCoords = [];
        }
        for (let i = 0; i < this._series.length; i++) {
            let series = this._series[i];
            if (!this._seriesCoords[i]) {
                this._seriesCoords.push([]);
            }
            let seriesCoords = this._seriesCoords[i];
            let x = this._scaleX;
            for (let dx = 0; dx < series.data.length; dx++) {
                let point = series.data[dx];
                let y = height - ((point - this._chart.seriesBounds.min) / dataDistance) * height;
                if (!seriesCoords[dx]) {
                    seriesCoords[dx] = {};
                }
                let coord = seriesCoords[dx];
                coord.x = x;
                coord.new_y = y + this._chart.plotArea.y + this._chart.plotArea.h - height;
                coord.old_y = coord.y || coord.new_y;
                coord.y = coord.old_y;
                x += connectorWidth;
            }
        }

        this._framePart = Math.floor(this._scaleWidth * this._chart.scale);
        this._leftHoverWidth = Math.ceil(this._scaleWidth * this._chart.scaleStart);
        this._rightHoverWidth = Math.floor(this._scaleWidth - this._framePart - this._leftHoverWidth);

        this._chart.plotArea.h -= (this._theme.scale.height + this._theme.spacing);
    }

    redraw() {
        this._ctx.clearRect(0, 0, 9999, 9999);

        this._ctx.save();
        this._ctx.fillStyle = '#000000';
        this._ctx.fillRect(this._scaleX + this._leftHoverWidth + 10, this._scaleY + 2, this._framePart - 20, this._chart.theme.scale.height - 4);
        this._ctx.globalCompositeOperation = 'source-out';
        this._ctx.fillStyle = this._chart.theme.scale.frameColor;
        this._ctx.fillRect(this._scaleX + this._leftHoverWidth, this._scaleY, this._framePart, this._chart.theme.scale.height);
        this._ctx.restore();

        this._ctx.beginPath();
        this._ctx.rect(this._scaleX, this._scaleY, this._scaleWidth, this._chart.theme.scale.height);
        this._ctx.clip();
        this._ctx.lineWidth = 1;
        for (let i = 0; i < this._seriesCoords.length; i++) {
            if (!this._series[i].enabled) {
                continue;
            }
            this._ctx.strokeStyle = this._theme.colors[i % this._theme.colors.length];
            let seriesPoints = this._seriesCoords[i];
            this._ctx.beginPath();
            for (let x = 0; x < seriesPoints.length; x++) {
                if (x === 0) {
                    this._ctx.moveTo(seriesPoints[x].x, seriesPoints[x].y);
                } else {
                    this._ctx.lineTo(seriesPoints[x].x, seriesPoints[x].y);
                }
            }
            this._ctx.stroke();
        }

        this._ctx.fillStyle = this._chart.theme.scale.hoverColor;
        this._ctx.fillRect(this._scaleX, this._scaleY, this._leftHoverWidth, this._chart.theme.scale.height);
        this._ctx.fillRect(this._scaleX + this._leftHoverWidth + this._framePart, this._scaleY, this._rightHoverWidth, this._chart.theme.scale.height);
    }
}