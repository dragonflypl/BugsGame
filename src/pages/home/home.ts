import { Component } from '@angular/core';
import { GameUI, Match } from '../GameUI';
import { Game } from '../Game';
import { VideoTracker } from '../VideoTracker';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  game: Game;
  gameUI = new GameUI();
  videoTracker = new VideoTracker();
  trackerTask = null;

  onColorChange = (colorToTrack) => {
    this.videoTracker.trackColor = colorToTrack;
  }

  ionViewDidLoad() {
    this.gameUI.init(this.onColorChange).then(() => {
      this.trackerTask = this.videoTracker.initialize((event) => {
        const matches = event.data as Match[];
        this.game.draw(matches);
      });
    });
    this.game = new Game(this.gameUI, this.onStop);
  }

  onStop = (score) => {
    alert(`Game finished, your score ${score}`);
  }

  stop = () => {
    this.game.stop();
  }

  start() {
    this.game = new Game(this.gameUI, this.onStop);
    this.game.start();
    this.trackerTask.run();
  }
}
