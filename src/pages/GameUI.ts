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

  get calibrationRange() {
    return Math.floor(this.width / 4);
  }

  private get colorPickerContext() {
    return this.colorPickerCanvas.getContext('2d');
  }

  private get videoContext() {
    return this.videoCanvas.getContext('2d');
  }

  get gameSize() {
    return this.width - this.calibration;
  }

  get sectionSize() {
    return this.gameSize / this.numSections;
  }

  private get heightOffset() {
    return (this.height - (this.sectionSize * this.numSections)) / 2;
  }

  private get widthOffset() {
    return this.calibration / 2
  }

  clear() {
    this.videoContext.clearRect(0, 0, this.width, this.height);
  }


  toSection(match: Match): BugSectionInfo {

    const matchRectangle = {
      x1: match.x,
      y1: match.y,
      x2: match.x + match.width,
      y2: match.y + match.height
    }

    for (let sectionX = 0; sectionX < this.numSections; sectionX++) {
      for (let sectionY = 0; sectionY < this.numSections; sectionY++) {
        const sectionRectangle = {
          x1: this.sectionSize * sectionX + this.widthOffset,
          y1: this.sectionSize * sectionY + this.heightOffset,
          x2: this.sectionSize * (sectionX + 1) + this.widthOffset,
          y2: this.sectionSize * (sectionY + 1) + this.heightOffset
        }

        if (matchRectangle.x1 >= sectionRectangle.x1 &&
          matchRectangle.y1 >= sectionRectangle.y1 &&
          matchRectangle.x2 <= sectionRectangle.x2 &&
          matchRectangle.y2 <= sectionRectangle.y2
        ) {
          return new BugSectionInfo(sectionX, sectionY);
        }
      }
    }
    return BugSectionInfo.NULL;
  }

  drawMatch(match: Match) {
    const matchSection = this.toSection(match);
    this.videoContext.strokeStyle = '#FFF';
    this.videoContext.strokeRect(match.x, match.y, match.width, match.height);
    if (matchSection.sectionX >= 0 && matchSection.sectionY >= 0) {
      this.videoContext.font = '11px Helvetica';
      this.videoContext.fillStyle = "#fff";
      this.videoContext.fillText('x: ' + match.x + 'px ' + matchSection.sectionX, match.x + match.width + 5, match.y + 11);
      this.videoContext.fillText('y: ' + match.y + 'px ' + matchSection.sectionY, match.x + match.width + 5, match.y + 22);
    }
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

  private get colorPickerCanvas() {
    return document.getElementById('colorPickerCanvas') as HTMLCanvasElement
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

  findPos(obj) {
    var curleft = 0, curtop = 0;
    if (obj.offsetParent) {
      do {
        curleft += obj.offsetLeft;
        curtop += obj.offsetTop;
      } while (obj = obj.offsetParent);
      return { x: curleft, y: curtop };
    }
    return undefined;
  }

  init(onColorChange) {
    if (this.bugImage) {
      return Promise.resolve({});
    }

    this.videoCanvas.addEventListener('click', (e) => {
      this.colorPickerContext.drawImage(this.video, 0, 0, this.videoCanvas.width, this.videoCanvas.height);
      var pos = this.findPos(this.videoCanvas);
      var x = e.pageX - pos.x;
      var y = e.pageY - pos.y;
      var p = this.colorPickerContext.getImageData(x, y, 1, 1).data;
      onColorChange(p);
    });

    return new Promise(resolve => {
      this.bugImage = new Image();
      this.bugImage.src = 'assets/imgs/bug.jpg';
      this.bugImage.onload = () => {
        resolve({});
      };
    });
  }
}
