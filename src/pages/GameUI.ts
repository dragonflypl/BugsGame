export class BugSectionInfo {

  sectionX: number;
  sectionY: number;
  killed: boolean;

  constructor(sectionX, sectionY) {
    this.sectionX = sectionX;
    this.sectionY = sectionY;
    this.killed = false;
  }

  static NULL = new BugSectionInfo(Number.MIN_SAFE_INTEGER, Number.MIN_SAFE_INTEGER);
}

export interface Match {
  x: number,
  y: number,
  width: number,
  height: number,
  color: string
}

export class GameUI {

  private bugImage: HTMLImageElement;

  constructor() {

  }

  public gameLength = 16;

  public gameSpeed = 500;

  public calibration = 0;

  private get videoContext() {
    return this.videoCanvas.getContext('2d');
  }

  get gameSize() {
    return this.height - this.calibration;
  }

  get sectionSize() {
    return this.gameSize / this.numSections;
  }

  private get widthOffset() {
    return (this.width - (this.sectionSize * this.numSections)) / 2;
  }

  private get heightOffset() {
    return this.calibration / 2
  }

  clear() {
    this.videoContext.clearRect(0, 0, this.width, this.height);
  }

  drawBug = (bugSectionInfo: BugSectionInfo) => {

    if (!bugSectionInfo) return;

    const bugPosition = {
      x1: this.sectionSize * bugSectionInfo.sectionX,
      y1: this.sectionSize * bugSectionInfo.sectionY,
      x2: this.sectionSize * (bugSectionInfo.sectionX + 1),
      y2: this.sectionSize * (bugSectionInfo.sectionY + 1),
    }

    this.videoContext.save();
    this.videoContext.translate(this.widthOffset, this.heightOffset);
    this.videoContext.globalAlpha = 0.4;

    this.videoContext.drawImage(
      this.bugImage,
      0, 0, this.bugImage.width, this.bugImage.height,
      bugPosition.x1, bugPosition.y1,
      bugPosition.x2 - bugPosition.x1,
      bugPosition.y2 - bugPosition.y1);

    if (bugSectionInfo.killed) {
      this.videoContext.globalAlpha = 1;
      this.videoContext.strokeStyle = 'red';
      this.videoContext.beginPath();
      this.videoContext.moveTo(bugPosition.x1, bugPosition.y1);
      this.videoContext.lineTo(bugPosition.x2, bugPosition.y2);
      this.videoContext.stroke();
      this.videoContext.beginPath();
      this.videoContext.moveTo(bugPosition.x2, bugPosition.y1);
      this.videoContext.lineTo(bugPosition.x1, bugPosition.y2);
      this.videoContext.stroke();
    }
    this.videoContext.restore();
  }

  buildSections() {

    this.videoContext.save();
    this.videoContext.translate(this.widthOffset, this.heightOffset);
    this.videoContext.globalAlpha = 0.4;
    this.videoContext.strokeStyle = 'white';
    this.videoContext.lineWidth = 2;
    this.videoContext.strokeRect(
      1, 1,
      this.sectionSize * this.numSections - 2,
      this.sectionSize * this.numSections - 2);

    for (let section = 1; section <= this.numSections; section++) {
      this.videoContext.beginPath();
      this.videoContext.moveTo(this.sectionSize * section, 0);
      this.videoContext.lineTo(this.sectionSize * section, this.gameSize);
      this.videoContext.closePath();
      this.videoContext.stroke();

      this.videoContext.beginPath();
      this.videoContext.moveTo(0, this.sectionSize * section);
      this.videoContext.lineTo(this.gameSize, this.sectionSize * section);
      this.videoContext.closePath();
      this.videoContext.stroke();
    }

    const padding = 5;
    this.videoContext.globalAlpha = 1;
    for (let ySection = 1; ySection <= this.numSections; ySection++) {
      for (let xSection = 1; xSection <= this.numSections; xSection++) {
        const yCharName = String.fromCharCode(64 + ySection);
        this.videoContext.fillText(
          `${yCharName}${xSection}`,
          this.sectionSize * (xSection - 1) + padding,
          this.sectionSize * ySection - padding);
      }
    }

    this.videoContext.restore();
  }

  get numSections() {
    return 3;
  }

  private get video() {
    return document.getElementById('video') as HTMLVideoElement;
  }

  private get videoCanvas() {
    return document.getElementById('videoCanvas') as HTMLCanvasElement
  }

  get width() {
    const style = window.getComputedStyle(this.video);
    return style && parseFloat(style.width.replace('px', ''));
  }

  private get height() {
    const style = window.getComputedStyle(this.video);
    return style && parseFloat(style.height.replace('px', ''));
  }

  init() {
    if (this.bugImage) {
      return Promise.resolve({});
    }

    return new Promise(resolve => {
      this.bugImage = new Image();
      this.bugImage.src = 'assets/imgs/bug.jpg';
      this.bugImage.onload = () => {
        resolve({});
      };
    });
  }
}
