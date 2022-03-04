
/**
 * Adds a beatgrid to the waveform.
 *
 * @implements {PluginClass}
 * @extends {Observer}
 */
import TimelinePlugin from 'wavesurfer.js/src/plugin/timeline/index.js'
export default class BeatGridPlugin extends TimelinePlugin {
    /**
     * Timeline plugin definition factory
     *
     * This function must be used to create a plugin definition which can be
     * used by wavesurfer to correctly instantiate the plugin.
     *
     * @param  {BeatgridPluginParams} params parameters use to initialise the plugin
     * @return {PluginDefinition} an object representing the plugin
     */
    static create(params) {
        return {
            name: 'beatgrid',
            deferInit: params && params.deferInit ? params.deferInit : false,
            params: params,
            instance: BeatGridPlugin
        };
    }

    /**
     * Render the timeline labels and notches
     *
     */
    renderCanvases() {
        const duration =
            this.params.duration ||
            this.wavesurfer.backend.getDuration();

        if (duration <= 0) {
            return;
        }
        const wsParams = this.wavesurfer.params;
        const fontSize = this.params.fontSize * wsParams.pixelRatio;
        const totalSeconds = parseInt(duration, 10) + 1;
        const width =
            wsParams.fillParent && !wsParams.scrollParent
                ? this.drawer.getWidth()
                : this.drawer.wrapper.scrollWidth * wsParams.pixelRatio;
        const height1 = this.params.height * this.pixelRatio;
        const height2 =
            this.params.height *
            (this.params.notchPercentHeight / 100) *
            this.pixelRatio;
        const pixelsPerSecond = width / duration;

        const formatTime = this.params.formatTimeCallback;
        // if parameter is function, call the function with
        // pixelsPerSecond, otherwise simply take the value as-is
        const intervalFnOrVal = option =>
            typeof option === 'function' ? option(pixelsPerSecond) : option;
        const timeInterval = intervalFnOrVal(this.params.timeInterval);
        const primaryLabelInterval = intervalFnOrVal(
            this.params.primaryLabelInterval
        );
        const secondaryLabelInterval = intervalFnOrVal(
            this.params.secondaryLabelInterval
        );

        let curPixel = pixelsPerSecond * this.params.offset;
        let curSeconds = 0;
        let i;
        // build an array of position data with index, second and pixel data,
        // this is then used multiple times below
        const positioning = [];

        // render until end in case we have a negative offset
        const renderSeconds = (this.params.offset < 0)
            ? totalSeconds - this.params.offset
            : totalSeconds;

        for (i = 0; i < renderSeconds / timeInterval; i++) {
            positioning.push([i, curSeconds, curPixel]);
            curSeconds += timeInterval;
            curPixel += pixelsPerSecond * timeInterval;
        }

        // iterate over each position
        const renderPositions = cb => {
            positioning.forEach(pos => {
                cb(pos[0], pos[1], pos[2]);
            });
        };

        // render primary labels
        this.setFillStyles(this.params.primaryColor);
        this.setFonts(`${fontSize}px ${this.params.fontFamily}`);
        this.setFillStyles(this.params.primaryFontColor);
        renderPositions((i, curSeconds, curPixel) => {
            if (i % primaryLabelInterval === 0) {
                this.fillRect(curPixel, 0, 1, height1);
                this.fillText(
                    formatTime(curSeconds, pixelsPerSecond),
                    curPixel + this.params.labelPadding * this.pixelRatio,
                    height1
                );
            }
        });

        // render secondary labels
        this.setFillStyles(this.params.secondaryColor);
        this.setFonts(`${fontSize}px ${this.params.fontFamily}`);
        this.setFillStyles(this.params.secondaryFontColor);
        renderPositions((i, curSeconds, curPixel) => {
            if (i % secondaryLabelInterval === 0) {
                this.fillRect(curPixel, 0, 1, height1);
                this.fillText(
                    formatTime(curSeconds, pixelsPerSecond),
                    curPixel + this.params.labelPadding * this.pixelRatio,
                    height1
                );
            }
        });

        // render the actual notches (when no labels are used)
        this.setFillStyles(this.params.unlabeledNotchColor);
        renderPositions((i, curSeconds, curPixel) => {
            if (
                i % secondaryLabelInterval !== 0 &&
                i % primaryLabelInterval !== 0
            ) {
                this.fillRect(curPixel, 0, 1, height2);
            }
        });
    }
}
