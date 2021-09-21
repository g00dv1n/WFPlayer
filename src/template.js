import { errorHandle, throttle } from './utils';

export default class Template {
    constructor(wf) {
        this.wf = wf;
        this.canvas = null;
        const { refreshDelay } = wf.options;
        this.update = throttle(this.init, refreshDelay, this);
        this.init();
    }

    init() {
        const { container, pixelRatio, width, height, shadowCanvas } = this.wf.options;
        const { clientWidth, clientHeight } = container || {};
        const _width = width || clientWidth * pixelRatio;
        const _height = height || clientHeight * pixelRatio;

        if (this.canvas) {
            if (this.canvas.width !== _width) {
                this.canvas.width = _width;
            }
            if (this.canvas.height !== _height) {
                this.canvas.height = _height;
            }
        } else {
            errorHandle(
                this.wf.constructor.instances.every((wf) => wf.options.container !== container),
                'Cannot mount multiple instances on the same dom element, please destroy the previous instance first.',
            );

            this.canvas = document.createElement('canvas');
            this.canvas.width = _width;
            this.canvas.height = _height;

            if (!shadowCanvas) {
                container.innerHTML = '';
                this.canvas.style.width = '100%';
                this.canvas.style.height = '100%';
                container.appendChild(this.canvas);
            }

        }
    }

    exportImage() {
        const elink = document.createElement('a');
        elink.style.display = 'none';
        elink.href = this.canvas.toDataURL('image/jpeg', 1);
        elink.download = `${Date.now()}.jpeg`;
        document.body.appendChild(elink);
        elink.click();
        document.body.removeChild(elink);
    }

    exportImageAsBlob() {
        return new Promise((resolve) => {
            this.canvas.toBlob((blob) => {
                resolve(blob)
            }, 'image/jpeg', 1)
        })
    }

    destroy() {
        this.wf.options.container.innerHTML = '';
    }
}
