# Kroki

1. Generowanie aplikacji

> ionic start BugsGame tabs --cordova --no-link

2. Urchomienie aplikacji

> ionic serve -l

oraz

> http://localhost:8100/ionic-lab

3. Połczenie z kamera (`git checkout v2.0-Video-connected)

- dodanie biblioteki do obsługi kamery

``` html
  <!-- index.html -->
  <!-- Tracking.js library -->
  <script src="assets/scripts/tracking.js"></script>
```

- dodanie tagów HTML do obsługi video oraz rysowania

``` html
<!-- home.html -->
<ion-content padding>
  <div id="game">
    <video id="video" width="100%" preload autoplay loop muted controls></video>
    <canvas id="videoCanvas" width="{{gameUI.width}}" height="{{gameUI.height}}"></canvas>
  </div>
```

- dodanie dwóch klas pomocniczych do obsługi video:
   - `GameUI`: klasa do obsługi gry oraz jej parametry
   - `VideoTracker`: klasa pomocnicza do wysokopoziomiwej obsługi biblioteki tracking.js

- inicjalizacja video:

``` typescript
// home.ts

export class HomePage {

  gameUI = new GameUI();
  videoTracker = new VideoTracker();
  trackerTask = null;

  ionViewDidLoad() {
    this.trackerTask = this.videoTracker.initialize();
  }
}
```

4. Przycisk start, stop, rysownie obszarów i robaka (`git checkout v3.0-Game-start)

- nowy przyciski na stronie głównej

``` html
<!-- home.html -->
<button ion-button block *ngIf="!trackerTask?.inRunning()" (click)="start()">Start</button>
<button ion-button block color="danger" *ngIf="trackerTask?.inRunning()" (click)="stop()">Stop</button>
```

I kod który rozpoczyna grę:

``` typescript
// home.ts
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
```

- nowa klasa `Game` która:
   - losuje pozycję robaka co dany interwał
   - odlicza ile robaków pozostało do końca gry
- klasa `GameUI` ma nowe metody:
   - `drawBug` rysuje robaka
   - `buildSections` rysuje sekcje

5. Rozpoznawanie koloru (`git checkout v4.0-Color-picker`)

- nowy parametr `videoTracker'a` (funkcja przyjmuje parametr który zawiera informacje o znalezionych kolorach) oraz możliwość wyboru koloru który ma być śledony (`onColorChange`)

``` typescript
// home.ts
ionViewDidLoad() {
  this.gameUI.init(this.onColorChange).then(() => {
    this.trackerTask = this.videoTracker.initialize((event) => {
      const matches = event.data as Match[];
      this.game.draw(matches);
    });
  });
  this.game = new Game(this.gameUI, this.onStop);
}

onColorChange = (colorToTrack) => {
  this.videoTracker.trackColor = colorToTrack;
}
```

oraz wyświetlanie informacji o wybranym kolorze:

```html
<!-- home.html -->
<ion-item>
  Tracked color:
  <span [ngStyle]="{'background-color': videoTracker.hexColor}">&nbsp;&nbsp;&nbsp;</span>
  <ion-badge item-end>{{videoTracker.hexColor}}</ion-badge>
</ion-item>
```

Metoda `Game.draw` przyjmuje dodatkowy parametr o znalezionych obszarach z kolorami:

``` typescript
// Game.ts
draw = (matches: Match[] = []) => {
  this.gameUI.clear();
  matches.forEach(match => this.gameUI.drawMatch(match));

  if (!this.inProgress) return;

  this.gameUI.buildSections();
  this.gameUI.drawBug(this.bugSectionInfo);
}
```

- `GameUI` ma nowa metode ktora rysuje informacje o znalezionych kolorach

``` typescript
// GameUI.ts
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
```

A metoda `init` obsługuje kliknięcie na obrazie i ustawia kolor klikniętego piksela:

``` typescript
// GameUI.ts
init(onColorChange) {
  this.videoCanvas.addEventListener('click', (e) => {
    this.colorPickerContext.drawImage(this.video, 0, 0, this.videoCanvas.width, this.videoCanvas.height);
    var pos = this.findPos(this.videoCanvas);
    var x = e.pageX - pos.x;
    var y = e.pageY - pos.y;
    var p = this.colorPickerContext.getImageData(x, y, 1, 1).data;
    onColorChange(p);
  });
}
```

- `VideoTracker` ma nowa metodę która sprawdza czy piksel a obrazu z kamery jest podobny do tego którego szukamy. Na tej podstawie gra śledzi piksele których kolory sa podobne do wybranego.

``` typescript
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

      const minDelta = 0.98;
      const maxDelta = 1.02;

      return deltaColorTotal > minDelta && deltaColorTotal < maxDelta &&
        deltaR > minDelta && deltaR < maxDelta &&
        deltaG > minDelta && deltaG < maxDelta;
    });

    this.colorTracker.setColors(['bugTrap']);
  }
```

## TODO:

- Obczaj: Get Ionic DevApp for easy device testing: https://bit.ly/ionic-dev-app
- `ionic serve -l --port 8200`
- replace tag: `git tag -fa <tagname>`
- add tag: `git tag -a v2.0 -m "message"`
- kolor #752c4
