export default class GoogleGauge{
    static load(afterLoadCallback){
        google.charts.load('current', {'packages': ['gauge']});
        google.charts.setOnLoadCallback(afterLoadCallback);
    }

    static getTorqueGauge(){
        let gaugeOptions = {
            width: 150,
            redFrom: 90, redTo: 100,
            yellowFrom: 75, yellowTo: 90,
            minorTicks: 5,
            majorTicks: ['0', 10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
            animation: {
                duration: 0
            }
        };

        let gaugeData = google.visualization.arrayToDataTable([
            ['Label', 'Value'],
            ['Torque', 0],
        ]);

        return new GoogleGauge('chart-torque', gaugeData, gaugeOptions);
    }

    static getDirectionGauge(){
        let gaugeOptions = {
            width: 150,
            animation: {
                duration: 0
            },
            min: -1,
            max: 1
        };

        let gaugeData = google.visualization.arrayToDataTable([
            ['Label', 'Value'],
            ['Direction', 0]
        ]);

        return new GoogleGauge('chart-direction', gaugeData, gaugeOptions);
    }

    constructor(containerId, gaugeData, gaugeOptions){
        this.data = gaugeData;
        this.options = gaugeOptions;
        this.chart = new google.visualization.Gauge(document.getElementById(containerId));
    }

    update(newValue){
        this.data.setValue(0, 1, newValue);
        this._render();
    }

    setSize(newSize){
        this.options.width = newSize;
        this.options.height = newSize;

        this._render();
    }

    _render(){
        this.chart.draw(this.data, this.options);
    }
}