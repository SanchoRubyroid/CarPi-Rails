import GoogleGauge from './google-gauge.es6'

export default class CarpiControl{
    constructor({ nodeAppUrl, serverHost, vehicleName, watcher = false}) {
        if(!watcher) {
            GoogleGauge.load(() => {
                this.torqueGauge = GoogleGauge.getTorqueGauge();
                this.directionGauge = GoogleGauge.getDirectionGauge();

                this._resizeHandler()
                this.gaugesInitialized = true;
            });

            let container = document.getElementById('carpi-control-container');
            this.elmApp = Elm.embed(Elm.CarPi, container);
            this._initializeElmControl();
        } else this._resizeHandler();

        let channel = (watcher ? 'watch' : 'control' );
        this.socket = io(`${nodeAppUrl}/${channel}`);
        this._initializeSocketEvents(serverHost, vehicleName);

        this.ratio_horizontal = 16;
        this.ratio_vertical = 12;

        $(window).resize(this._resizeHandler);
    }

    _initializeSocketEvents(serverHost, vehicleName){
        this.socket.on('before-stream', () => {
            //implement hook if needed
        })

        this.socket.on('stream', (data) => {
            let client = new WebSocket(`ws://${serverHost}:${data.port}/`);

            let canvas = document.getElementById('video-canvas');
            new jsmpeg(client, {canvas: canvas});
        })

        this.socket.emit('capture', vehicleName);
    }

    _initializeElmControl(){
        this.elmApp.ports.externalModel.subscribe((model) => {
            let compressedModel = this._getCompressedData(model);

            if (!(JSON.stringify(this.controlModel) === JSON.stringify(compressedModel))) {
                this.controlModel = compressedModel;
                this.socket.emit('car-control', compressedModel);

                let directionLevel = (parseFloat(compressedModel[1])/100).toFixed(1);
                if(model.direction < 0) directionLevel *= -1;

                if(this.gaugesInitialized) {
                    this.torqueGauge.update(compressedModel[0]);
                    this.directionGauge.update(directionLevel);
                }
            }
        });
    }

    _getCompressedData(model) {
        const torqueReversedMask = 0b00000100;
        const directionRightMask = 0b00000001;
        const directionLeftMask = 0b00000010;

        let values = [];
        let stateByte = 0;

        if (model.torqueReversed) stateByte |= torqueReversedMask;
        if (model.direction > 0) stateByte |= directionRightMask;
        else if (model.direction < 0) stateByte |= directionLeftMask;

        values.push(parseInt(model.torqueLevel));
        values.push(parseInt(model.directionLevel));
        values.push(stateByte);

        return values;
    }

    _resizeHandler() {
        let newWidth = 0;
        let newHeight = 0;
        let currentWidth = $(window).width();
        let currentHeight = $(window).height() - $('header').height();

        if ((currentHeight / this.ratio_vertical) * this.ratio_horizontal < currentWidth) {
            newWidth = (currentHeight / this.ratio_vertical) * this.ratio_horizontal;
            newHeight = currentHeight;
        } else {
            newWidth = currentWidth;
            newHeight = (currentWidth / this.ratio_horizontal) * this.ratio_vertical;
        }

        $('.stream-container').css({
            height: newHeight + 'px',
            width: newWidth + 'px'
        })

        if(this.gaugesInitialized) {
            let gaugeDimensions = newHeight * 0.25;
            if (gaugeDimensions > 150) gaugeDimensions = 150;

            this.torqueGauge.setSize(gaugeDimensions);
            this.directionGauge.setSize(gaugeDimensions);
        }
    }
}