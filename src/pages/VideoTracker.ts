export class VideoTracker {

  private colorTracker;

  private get trackingAPI() {
    return window['tracking'];
  }

  initialize(trackerCallback) {
    this.colorTracker = new this.trackingAPI.ColorTracker();
    this.colorTracker.minDimension = 3;
    this.colorTracker.minGroupSize = 11;
    this.colorTracker.on('track', trackerCallback)
    const trackerTask = this.trackingAPI.track('#video', this.colorTracker, { camera: true });
    trackerTask.stop()
    return trackerTask;
  }
}
