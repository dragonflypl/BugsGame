import { GameUI, BugSectionInfo, Match } from "./GameUI";

export class Game {

  constructor(private gameUI: GameUI, private onGameDone) { }

  public inProgress = false;

  private bugSectionInfo: BugSectionInfo = BugSectionInfo.NULL;

  private score = 0;

  shufflesLeft: number = this.gameUI.gameLength;

  getBugPosition(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  stop() {
    this.inProgress = false;
    this.shufflesLeft = 0;
    this.onGameDone(this.score)
  }

  start() {
    this.inProgress = true;
    this.shufflesLeft = this.gameUI.gameLength;
    this.shuffleBug();
  }

  private shuffleBug() {
    let previousSectionX = null;
    let previousSectionY = null;
    let start = null;

    const shuffle = function (timestamp) {

      if (!start) start = timestamp - this.gameUI.gameSpeed;
      const progress = timestamp - start;

      if (progress + 30 >= this.gameUI.gameSpeed) {
        start = timestamp;

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
        this.shufflesLeft === 0 && this.stop();;
      }

      if (this.shufflesLeft > 0) {
        requestAnimationFrame(shuffle);
      }
    }.bind(this);

    requestAnimationFrame(shuffle);
  }

  draw = (matches: Match[] = []) => {
    this.gameUI.clear();
    matches.forEach(match => this.gameUI.drawMatch(match));
    this.gameUI.buildSections();

    if (!this.inProgress) return;

    this.gameUI.drawBug(this.bugSectionInfo);
    if (matches.find(match => this.wasHit(match))) {
      this.killBug();
    }
  }

  killBug() {
    this.bugSectionInfo.killed = true;
    this.score += 1;
  }

  wasHit(match: Match) {
    if (this.bugSectionInfo.killed) return false;

    const matchSection = this.gameUI.toSection(match);

    return matchSection.sectionX === this.bugSectionInfo.sectionX &&
      matchSection.sectionY === this.bugSectionInfo.sectionY;
  }
}
