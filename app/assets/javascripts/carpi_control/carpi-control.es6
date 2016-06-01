import GoogleGauge from './google-gauge.es6'

export default class CarpiControl{
    constructor({ nodeAppUrl, serverHost, vehicleName, watcher = false}) {
        this.ratio = { horizontal: 16, vertical: 9 };

        if(!watcher) {
            GoogleGauge.load(() => {
                this.torqueGauge = GoogleGauge.getTorqueGauge();
                this.directionGauge = GoogleGauge.getDirectionGauge();

                this.gaugesInitialized = true;
                this._resizeHandler()
            });

            let container = document.getElementById('carpi-control-container');
            this.elmApp = Elm.embed(Elm.CarPi, container);
            this._initializeElmControl();
        }

        let channel = (watcher ? 'watch' : 'control' );
        this.socket = io(`${nodeAppUrl}/${channel}`);
        this._initializeSocketEvents(serverHost, vehicleName);

        $(window).resize(() => {
            this._resizeHandler();
        });

        // TODO move to a separate class
        let dialog = document.querySelector('dialog');
        dialogPolyfill.registerDialog(dialog);

        $('#video-settings-button').click(() => {
            dialog.showModal();
        });

        $('#release-button').click(() => {
            window.location = '/';
        });


        $('dialog .close').click(() => {
            dialog.close();
        });

        $('dialog .apply').click(() => {
            this.socket.emit('video-settings', {
                videoQuality: $('#video-quality-slider').val()
            });
            dialog.close();
        });
    }

    _initializeSocketEvents(serverHost, vehicleName){
        this.socket.on('before-stream', () => {
            //implement hook if needed
        })

        this.socket.on('stream', (data) => {
            this.ratio = data.ratio;

            let client = new WebSocket(`ws://${serverHost}:${data.port}/`);

            let canvas = document.getElementById('video-canvas');
            new jsmpeg(client, {canvas: canvas});

            this._resizeHandler();
        })

        this.socket.on('release', () => {
            window.location = '/';
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

        if ((currentHeight / this.ratio.vertical) * this.ratio.horizontal < currentWidth) {
            newWidth = (currentHeight / this.ratio.vertical) * this.ratio.horizontal;
            newHeight = currentHeight;
        } else {
            newWidth = currentWidth;
            newHeight = (currentWidth / this.ratio.horizontal) * this.ratio.vertical;
        }

        $('.stream-container').css({
            height: newHeight + 'px',
            width: newWidth + 'px'
        });

        if(this.gaugesInitialized) {
            let gaugeDimensions = newHeight * 0.25;
            if (gaugeDimensions > 150) gaugeDimensions = 150;

            this.torqueGauge.setSize(gaugeDimensions);
            this.directionGauge.setSize(gaugeDimensions);
        }
    }
}