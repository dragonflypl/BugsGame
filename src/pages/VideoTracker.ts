export class VideoTracker {

  private _trackColor: [number, number, number] = [95, 109, 150];

  get hexColor() {
    const r = Number(this._trackColor[0]).toString(16);
    const g = Number(this._trackColor[1]).toString(16);
    const b = Number(this._trackColor[2]).toString(16);
    return `#${r}${g}${b}`;
  }

  public colorTracker;

  private get trackingAPI() {
    return window['tracking'];
  }

  initialize(trackerCallback) {
    this.colorTracker = new this.trackingAPI.ColorTracker();
    this.colorTracker.minDimension = 3;
    this.colorTracker.minGroupSize = 3;
    this.updateColor();
    this.colorTracker.on('track', trackerCallback)
    const trackerTask = this.trackingAPI.track('#video', this.colorTracker, { camera: true });
    return trackerTask;
  }

  get trackColor(): [number, number, number] {
    return this._trackColor;
  }

  set trackColor(rgb: [number, number, number]) {
    this._trackColor = rgb;
    this.updateColor();
  }

  updateColor() {
    console.log('Setting color:', this.hexColor)

    const tracking = window['tracking'];

    var trapColorRed = this.trackColor[0];
    var trapColorGreen = this.trackColor[1];
    var trapColorBlue = this.trackColor[2];

    var trapColorTotal = trapColorRed + trapColorGreen + trapColorBlue;
    var trapRedRatio = trapColorRed / trapColorTotal;
    var trapGreenRatio = trapColorGreen / trapColorTotal;

    console.log('Registering ', this.trackColor);

    tracking.ColorTracker.registerColor('bugTrap', function (cameraPixelRed, cameraPixelGreen, cameraPixelBlue) {

      const cameraPixelColorTotal = cameraPixelRed + cameraPixelGreen + cameraPixelBlue;

      if (cameraPixelColorTotal === 0) {
        if (trapColorTotal < 10) {
          return true;
        }
        return false;
      }

      const cameraRedRatio = cameraPixelRed / cameraPixelColorTotal,
        cameraGreenRatio = cameraPixelGreen / cameraPixelColorTotal;

      const deltaColorTotal = trapColorTotal / cameraPixelColorTotal,
        deltaR = trapRedRatio / cameraRedRatio,
        deltaG = trapGreenRatio / cameraGreenRatio;

      return deltaColorTotal > 0.85 && deltaColorTotal < 1.15 &&
        deltaR > 0.85 && deltaR < 1.15 &&
        deltaG > 0.85 && deltaG < 1.15;
    });

    this.colorTracker.setColors(['bugTrap']);
  }

}
