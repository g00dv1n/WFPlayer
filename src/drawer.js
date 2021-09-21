import { throttle } from './utils';
import worker from './worker';

export default class Drawer {
    constructor(wf) {
        this.wf = wf;
        this.canvas = wf.template.canvas;

        const { refreshDelay, useWorker } = wf.options;
        this.update = throttle(this.update, refreshDelay, this);

        if (useWorker && window.OffscreenCanvas && window.Worker) {
            this.worker = new Worker('./worker.js');
            this.ctx = this.canvas.getContext('bitmaprenderer');

            this.wf.events.proxy(this.worker, 'message', (event) => {
                const { type, data } = event.data;
                if (type === 'UPFATE' && !wf.isDestroy) {
                    this.wf.emit('update', data.config);
                    this.ctx.transferFromImageBitmap(data.imageBitmap);
                    this.wf.emit('finish');
                }
            });

            this.worker.postMessage({
                type: 'INIT',
                data: {
                    width: this.canvas.width,
                    height: this.canvas.height,
                },
            });
        } else {
            this.worker = worker;
            this.worker.postMessage({
                type: 'INIT',
                data: {
                    canvas: this.canvas,
                    wf: this.wf,
                },
            });
        }

        wf.on('decode', ({ channelData, sampleRate }) => {
            this.worker.postMessage({
                type: 'DECODE',
                data: { channelData, sampleRate },
            });
            this.update();
        });
    }

    update() {
        const {
            currentTime,
            options: { container, mediaElement, ...options },
        } = this.wf;
        const { width, height } = this.canvas;

        this.worker.postMessage({
            type: 'UPDATE',
            data: { ...options, currentTime, width, height },
        });
    }

    destroy() {
        if (this.worker.terminate) {
            this.worker.terminate();
        }
    }
}
