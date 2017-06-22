export default class ButtonsPanel{
    constructor(){
        this.lightsButton = $('button#lights-button');
        this.videoSettingsButton = $('button#video-settings-button');
        this.vehicleSettingsButton = $('button#vehicle-settings-button');
        this.changeCameraButton = $('button#change-camera-button');
        this.releaseVehicleContainer = $('button#release-button');
    }

    composeLightsButton(clickHandler){
        this.lightsButton.click(clickHandler);
    }

    composeVideoButton(applyHandler){
        this._composeDialog('video-settings-dialog', this.videoSettingsButton, applyHandler);
    }

    composeVehicleButton(applyHandler){
        this._composeDialog('vehicle-settings-dialog', this.vehicleSettingsButton, applyHandler);
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
        return $(`button#${id}-button`);
    }

    _composeDialog(dialogContainerId, activateDialogButton, applyHandler){
        let dialog = document.querySelector(`dialog#${dialogContainerId}`);
        dialogPolyfill.registerDialog(dialog);

        activateDialogButton.click(() => {
            dialog.showModal();
        });

        $(`dialog#${dialogContainerId} .close`).click(() => {
            dialog.close();
        });

        $(`dialog#${dialogContainerId} .apply`).click(() => {
            if(applyHandler) applyHandler.call()
            dialog.close();
        });
    }
}