export default class ButtonsPanel{
    constructor(){
        this.lightsButton = $('button#lights-button')
        this.videoSettingsButton = $('button#video-settings-button')
        this.changeCameraButton = $('button#change-camera-button')
        this.releaseVehicleContainer = $('button#release-button')
    }

    composeLightsButton(clickHandler){
        this.lightsButton.click(clickHandler);
    }

    composeVideoButton(applyHandler){
        let videoDialog = document.querySelector('#video-settings-dialog');
        dialogPolyfill.registerDialog(videoDialog);

        this.videoSettingsButton.click(() => {
            videoDialog.showModal();
        });

        $('dialog#video-settings-dialog .close').click(() => {
            videoDialog.close();
        });

        $('dialog#video-settings-dialog .apply').click(() => {
            applyHandler.call()
            videoDialog.close();
        });
    }

    composeChangeCameraButton(clickHandler){
        this.changeCameraButton.click(clickHandler);
    }

    composeReleaseButton(){
        this.releaseVehicleContainer.click(() => {
            window.location = '/';
        });
    }

    getElement(id){
        return $(`button#${id}-button`)
    }
}