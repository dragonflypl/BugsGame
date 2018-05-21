export class GameUI {

  private bugImage: HTMLImageElement;

  constructor() {

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
