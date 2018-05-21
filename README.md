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


## TODO:

- Obczaj: Get Ionic DevApp for easy device testing: https://bit.ly/ionic-dev-app
- `ionic serve -l --port 8200`
- replace tag: `git tag -fa <tagname>`
