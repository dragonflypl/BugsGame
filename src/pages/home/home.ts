import { Component } from '@angular/core';
import { GameUI } from '../GameUI';
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

  ionViewDidLoad() {
    this.gameUI.init().then(() => {
      this.trackerTask = this.videoTracker.initialize((event) => {
        this.game.draw();
      });
    })
  }

  onStop = (score) => {
    this.trackerTask.stop();
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
