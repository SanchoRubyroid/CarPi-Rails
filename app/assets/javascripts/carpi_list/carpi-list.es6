export default class CarpiList {
    constructor(options = {}){
        this.container = document.getElementById('carpi-list-container');
        this.elmApp = Elm.embed(Elm.CarPiList, this.container, {vehicles: [[], []]});
        this.socket = io(`${options.nodeAppUrl}/list`);
        this._initializeSocketEvents();

        $(window).resize(this._resizeHandler);
        this._resizeHandler();
    }

    _initializeSocketEvents(){
        this.socket.on('cars-list', (list) => {
            this.elmApp.ports.vehicles.send(list);
        });
    }

    _resizeHandler() {
        let caption = $('#carpi-list-wrapper').find('h1');
        let currentWidth = $(window).width();
        let newHeight = $(window).height() - $('header').height();
        $('#carpi-list-container').css('height', newHeight + 'px');

        if (currentWidth < 608)
            caption.addClass('smaller');
        else
            caption.removeClass('smaller');
    }
}

