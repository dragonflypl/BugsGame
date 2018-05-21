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

## TODO:

- Obczaj: Get Ionic DevApp for easy device testing: https://bit.ly/ionic-dev-app