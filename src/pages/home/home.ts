import { Component } from '@angular/core';
import { GameUI } from '../GameUI';
import { VideoTracker } from '../VideoTracker';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  gameUI = new GameUI();
  videoTracker = new VideoTracker();
  trackerTask = null;

  ionViewDidLoad() {
    this.gameUI.init().then(() => {
      this.trackerTask = this.videoTracker.initialize();
    })
  }
}
