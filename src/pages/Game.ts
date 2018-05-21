import { GameUI, BugSectionInfo, Match } from "./GameUI";

export class Game {

  constructor(private gameUI: GameUI, private onGameDone) { }

  private bugSectionInfo: BugSectionInfo = BugSectionInfo.NULL;

  private intervalId;

  private score = 0;

  shufflesLeft: number = this.gameUI.gameLength;

  getBugPosition(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  stop() {
    clearInterval(this.intervalId);
    this.intervalId = null;
    this.onGameDone(this.score)
  }

  start() {
    this.shufflesLeft = this.gameUI.gameLength;
    this.shuffleBug();
  }

  get gameFinished() {
    return this.intervalId === null;
  }

  private shuffleBug() {
    let previousSectionX = null;
    let previousSectionY = null;
    this.intervalId = setInterval(() => {
      let sectionX;
      let sectionY;
      do {
        sectionX = this.getBugPosition(0, this.gameUI.numSections - 1);
        sectionY = this.getBugPosition(0, this.gameUI.numSections - 1);
      }
      while (previousSectionX === sectionX && previousSectionY === sectionY);

      previousSectionX = sectionX;
      previousSectionY = sectionY;

      this.bugSectionInfo = new BugSectionInfo(sectionX, sectionY);

      this.shufflesLeft -= 1;
      if (this.shufflesLeft === 0) {
        this.stop();
      }
    }, this.gameUI.gameSpeed);
  }

  draw = () => {
    this.gameUI.clear();
    this.gameUI.buildSections();
    if (!this.gameFinished) {
      this.gameUI.drawBug(this.bugSectionInfo)
    }
  }
}
