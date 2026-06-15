# 🌙 Night Projects

Petits projets créatifs générés chaque nuit par [ClawdBot](https://github.com/openclaw/openclaw) — un projet par nuit, carte blanche totale.

Tous les projets sont jouables en ligne : **[adrrr.github.io/night-projects](https://adrrr.github.io/night-projects)**


## Projets

### 📏 **[Hairline](https://adrrr.github.io/night-projects/hairline/)**
Jeu de timing ultra-minimaliste — l'exact opposé visuel de Dead Stop : encre noire sur papier près-blanc, zéro neon, zéro particule, un seul chiffre. Une fine aiguille (un trait de 1px traversant le pivot) tourne en continu autour du centre. Une ligne d'horizon discrète traverse l'écran à l'horizontale. Touche pour figer l'aiguille PILE sur cette ligne : quand elle est parfaitement à plat, les deux traits fusionnent visuellement en un seul — c'est ça, le feedback du hit parfait. Chaque réussite accélère la rotation et rétrécit la tolérance (jusqu'à ±0.8°) ; la difficulté ne vient que de là. Une seule vie : un raté termine la partie, avec freeze-frame de l'atterrissage, série finale, meilleure précision du run (au centième de degré) et record all-time (localStorage). Hairlines crispes gérées au devicePixelRatio, mouvement en delta-time (identique à 60 et 120 Hz). Web Audio discret (tick/réussite/échec) + mute, bouton Partager (résultat Wordle-style copié dans le presse-papier). Mobile-first (tap) + desktop (clic/espace). Trivial à apprendre, dur à maîtriser.

▶️ [Essayer](https://adrrr.github.io/night-projects/hairline/)

### ⏱️ **[Dead Stop](https://adrrr.github.io/night-projects/dead-stop/)**
Jeu de précision et de timing — une aiguille néon balaie un cadran en continu et tu dois la figer PILE sur le repère cible (toujours visible) d'une seule tape. Réussite = la cible saute à un nouvel angle (toujours devant l'aiguille), le balayage accélère et la fenêtre de tir rétrécit. Hit parfait au cœur de cible pour le bonus, combos avec multiplicateur, et inversions de sens surprises à haut combo. 3 vies, ramp progressif façon Flappy Bird : facile à comprendre, dur à maîtriser. Freeze-frame sur chaque tape pour voir où l'aiguille a atterri, particules, shockwave, screen shake, Web Audio synthétique, record localStorage. Mobile-first (tap) + desktop (clic/espace). Dark/neon.

▶️ [Essayer](https://adrrr.github.io/night-projects/dead-stop/)

### 🎚️ **[Unison Drift](https://adrrr.github.io/night-projects/unison-drift/)**
Jeu de précision auditive — deux sons jouent à des fréquences proches et produisent un battement acoustique (wah-wah) dont la vitesse égale l'écart de hauteur. Glisse un grand slider plein écran pour bender le second son et annuler le battement jusqu'à le faire disparaître en un seul son pur. Aucune cible affichée : tu accordes uniquement à l'oreille, exactement comme un accordeur de piano (beat-frequency nulling). Score en cents musicaux, 8 rounds avec offsets de plus en plus subtils, soft-timer, mode Hard (sans aide visuelle), streak, high scores localStorage. Visualiseur de battement honnête (piloté par la vraie fréquence de battement), Web Audio synthétique, haptique. Mobile-first (slider plein écran au pouce — l'inverse exact de eyeball qui refuse le tactile) + desktop (drag/flèches/espace). Casque recommandé. Dark/neon.

▶️ [Essayer](https://adrrr.github.io/night-projects/unison-drift/)

### 📐 **[True Level](https://adrrr.github.io/night-projects/true-level/)**
Jeu d'estimation visuelle — une ligne d'horizon néon apparaît inclinée à un angle aléatoire. Pose un doigt n'importe où et glisse en arc pour faire pivoter TOUTE la scène jusqu'à ce qu'elle te paraisse parfaitement horizontale, puis relâche pour verrouiller. Aucun repère de gravité, aucun chiffre pendant l'ajustement : tu juges à l'œil. Le twist : ça exploite délibérément l'illusion rod-and-frame (un cadre incliné biaise ta perception du niveau). 10 rounds à difficulté croissante (ligne pleine → pointillés → skyline/tour/constellation sans bord dessiné → cadre trompeur), bonus TRUE sous 1°, fine-control au drag lent, streak, score de précision (meilleur total ET plus faible erreur moyenne). Particules, ghost line de vérité, shockwave, Web Audio synthétique. Mobile-first (rotation au doigt) + desktop (drag/flèches/espace). Dark/neon.

▶️ [Essayer](https://adrrr.github.io/night-projects/true-level/)

### 🎨 **[Chroma Shift](https://adrrr.github.io/night-projects/chroma-shift/)**
Jeu de perception des couleurs — trouve la tuile unique avant la fin du temps imparti. La difficulté augmente, la grille s'agrandit, et la différence de couleur devient de plus en plus subtile. Un test de vision et de vitesse. High score localStorage. Mobile-first (tap) + desktop (clic).

▶️ [Essayer](https://adrrr.github.io/night-projects/chroma-shift/)

### 🌗 **[Phase Flip](https://adrrr.github.io/night-projects/phase-flip/)**
Jeu de réflexes chromatique — des anneaux néon foncent vers le centre, et tu dois inverser ta phase (cyan/magenta) au bon moment pour traverser ceux de la même couleur. Une seule action, rounds ultra courts, combo system, screen shake, flash overlays, particules et Web Audio synthétique. High score localStorage. Mobile-first (tap) + desktop (espace/clic).

▶️ [Essayer](https://adrrr.github.io/night-projects/phase-flip/)

### 🚀 **[Lane Shift](https://adrrr.github.io/night-projects/lane-shift/)**
Jeu d’arcade néon — pilote un vaisseau sur une autoroute lumineuse et change de voie en une tape. Le twist : la route elle-même mute en plein run (nouvelles voies, collapse, rotation), donc il faut réagir en temps réel. Obstacles, gemmes, combos, brève invincibilité, screen shake, Web Audio synthétique, high score localStorage. Mobile-first (tap/swipe) + desktop (clavier/clic).

▶️ [Essayer](https://adrrr.github.io/night-projects/lane-shift/)

### 🔮 **[Prism Pop](https://adrrr.github.io/night-projects/prism-pop/)**
Jeu de tir prismatique — tape n'importe où pour envoyer un éventail de 7 faisceaux arc-en-ciel depuis le bas de l'écran. Chaque rayon ne peut éclater qu'une bulle de sa couleur ! Réactions en chaîne quand des bulles adjacentes matchent, combos multiplicateurs, screen shake. 3 vies — chaque bulle qui touche le bas en coûte une. Difficulté croissante, Web Audio synthétique, particles, glow effects. High score localStorage. Mobile-first + desktop.

▶️ [Essayer](https://adrrr.github.io/night-projects/prism-pop/)

### 🎯 **[Tempo Tap](https://adrrr.github.io/night-projects/tempo-tap/)**
Jeu de précision rythmique — des cercles néon pulsent et grandissent à l'écran. Tape au moment EXACT où ils atteignent leur taille maximale ! Perfect timing = +3pts × combo multiplier (jusqu'à x8), Good = +1pt, trop tôt/tard ou miss = perte de vie. Vitesse et nombre de cercles augmentent tous les 10 points. Spawns en paires aux niveaux élevés. Particules, screen shake, flash overlays, background pulsant au BPM, Web Audio synthétique. High score localStorage. Mobile-first (pointer events, tap targets généreux) + desktop (clic). Esthétique dark/neon.

▶️ [Essayer](https://adrrr.github.io/night-projects/tempo-tap/)

### 🧲 **[Magnet Bounce](https://adrrr.github.io/night-projects/magnet-bounce/)**
Place des aimants attracteurs (bleu) ou répulseurs (rouge) pour guider une balle néon vers des orbes lumineux. Chaque orbe collecté accélère la balle et recharge tes aimants. Si la balle touche un bord : game over ! Aimants avec lignes de champ animées, trail néon, particles, border danger glow, screen shake, Web Audio synthétique. High score localStorage. Mobile-first (tap + boutons PULL/PUSH) + desktop (clic + touches 1/2). Esthétique dark/neon.

▶️ [Essayer](https://adrrr.github.io/night-projects/magnet-bounce/)

### 🎨 **[Color Switch](https://adrrr.github.io/night-projects/color-switch/)**
Saute à travers des obstacles colorés rotatifs — anneaux, barres glissantes, portes mobiles, diamants et pulsars. Tu ne passes que par le segment qui matche ta couleur actuelle ! Pickups de changement de couleur entre chaque obstacle, combo system, vitesse progressive. 5 types d'obstacles variés, particules, screen shake, Web Audio. High score localStorage. Mobile-first (tap) + desktop (espace/click). Esthétique dark/neon.

▶️ [Essayer](https://adrrr.github.io/night-projects/color-switch/)

### 🔄 **[Gravity Switch](https://adrrr.github.io/night-projects/gravity-switch/)**
Flappy Bird meets gravity flip — tu es un diamant néon qui tombe sous la gravité. Tape/espace/click pour INVERSER la gravité et passer entre les obstacles. Plus tu survis, plus ça accélère. Mécanique un-tap ultra simple, feedback instantané, particules au flip, trail coloré, screen shake à la mort, sons synthétiques Web Audio. High score localStorage. Mobile-first (tap) + desktop (espace/click). Esthétique dark/neon.

▶️ [Essayer](https://adrrr.github.io/night-projects/gravity-switch/)

### 🌋 **[Magma Merge](https://adrrr.github.io/night-projects/magma-merge/)**
Puzzle physique inspiré Suika Game — drop des blobs de magma colorés qui fusionnent quand même couleur + même taille. Le twist : le magma refroidit progressivement (rouge → orange → jaune → pierre). Les pierres ne fusionnent plus et prennent de la place permanente. Fusionne avant que ça solidifie ! Physique réaliste (gravité, rebonds, collisions), glow effects magma, cooling bars, particules, screen shake, Web Audio. High score localStorage. Mobile-first (touch) + desktop (clavier + souris).

▶️ [Essayer](https://adrrr.github.io/night-projects/magma-merge/)

### 🌈 **[Color Gravity](https://adrrr.github.io/night-projects/color-gravity/)**
Puzzle-action avec un puits de gravité — contrôle une zone d'attraction/répulsion pour rassembler des orbes colorées. Match 3+ orbes de la même couleur pour les faire exploser ! Toggle attract/repel (tap/espace), système de 3 vies, combos avec multiplicateurs, niveaux progressifs (plus de couleurs, spawn plus rapide). Orbes avec gradient radial, highlight spéculaire, particules, ring effects, screen shake, Web Audio synthétique. High score localStorage. Mobile-first (double-tap toggle) + desktop (souris + espace).

▶️ [Essayer](https://adrrr.github.io/night-projects/color-gravity/)

### 🐝 **[Hex Swarm](https://adrrr.github.io/night-projects/hex-swarm/)**
Jeu de conquête territoriale sur grille hexagonale — tu commences avec un cluster de hexes cyan, l'ennemi (rouge) se développe en face. Tape sur tes hexes pour booster leur croissance et envahir les hexes neutres. Domine 75% du plateau pour gagner ! Difficulté progressive (plus d'ennemis, grille plus grande), barre de boost avec cooldown, système de streak et levels. Esthétique néon sombre, animations de pulse/glow, particules de capture, screen shake, sons Web Audio. High score localStorage. Mobile-first (tap) + desktop (click).

▶️ [Essayer](https://adrrr.github.io/night-projects/hex-swarm/)

### 🌀 **[Void Surfer](https://adrrr.github.io/night-projects/void-surfer/)**
Jeu d'orbite spatial — tu es une particule lumineuse en orbite autour d'anneaux néon qui rétrécissent. Tap/click/espace pour te lancer tangentiellement et atterrir sur un autre anneau. Les anneaux shrinkent progressivement — reste trop longtemps et tu tombes dans le vide ! Système de combo (x2, x3…) pour les atterrissages enchaînés. Physique orbitale réaliste, difficulté progressive, particules explosives, trail lumineux, screen shake, sons Web Audio. High score localStorage. Mobile-first (tap) + desktop (espace/click).

▶️ [Essayer](https://adrrr.github.io/night-projects/void-surfer/)

### ⚔️ **[Slice Storm](https://adrrr.github.io/night-projects/slice-storm/)**
Fruit Ninja-style — swipe pour trancher les formes géométriques néon qui volent à l'écran. Évite les bombes 💀 sinon tu perds une vie ! Système de combo avec multiplicateurs (x2→x5), trail lumineux sur le swipe, particules explosives, screen shake, sons synthétiques Web Audio. Difficulté progressive (spawn plus rapide, plus de bombes). High score localStorage. Mobile-first (touch swipe) + desktop (souris). Esthétique neon sombre.

▶️ [Essayer](https://adrrr.github.io/night-projects/slice-storm/)

### 🏎️ **[Momentum Dash](https://adrrr.github.io/night-projects/momentum-dash/)**
Jeu de momentum — une balle tombe sous l'effet de la gravité, place des plateformes en tap & drag pour la faire rebondir. Plus tu enchaînes de rebonds, plus le multiplicateur de score monte (combo x3+). Plateformes qui disparaissent après un rebond, obstacles spiky rouges après 5s, vent aléatoire pour le chaos. Esthétique neon sombre, trail arc-en-ciel, particules explosives, screen shake, sons synthétiques Web Audio (pitch monte avec la vitesse). High score localStorage. Mobile-first + desktop.

▶️ [Essayer](https://adrrr.github.io/night-projects/momentum-dash/)

### 🧩 **[Tile Collapse](https://adrrr.github.io/night-projects/tile-collapse/)**
Puzzle-action addictif — une grille 6×10 de tuiles colorées. Tape sur un groupe de 3+ tuiles adjacentes de même couleur pour les faire disparaître. La gravité fait tomber les tuiles restantes, enchaîne les combos (x2, x3…) pour multiplier ton score. Supprime 10+ tuiles d'un coup pour créer une bombe 💣 qui clear une zone 3×3. Toutes les 8 secondes, une nouvelle rangée pousse par le bas — si ça déborde, game over ! Esthétique néon sombre, sons Web Audio, particules CSS, high score localStorage. Mobile-first + desktop.

▶️ [Essayer](https://adrrr.github.io/night-projects/tile-collapse/)

### 🧲 **[Magnet Merge](https://adrrr.github.io/night-projects/magnet-merge/)**
Puzzle physique magnétique — des orbes colorées flottent à l'écran. Tap/click pour activer un aimant qui attire les orbes. Fusionne les orbes de même couleur pour marquer des points et enchaîner des combos. Attention : la collision de couleurs différentes = game over ! Difficulté progressive (2→6 couleurs, spawn accéléré), physique réaliste (drift, rebonds, répulsion entre couleurs), effets néon avec glow radial, particules explosives, screen shake, sons synthétiques Web Audio. High score localStorage, mobile-first + desktop.

▶️ [Essayer](https://adrrr.github.io/night-projects/magnet-merge/)

### 🎯 **[Pulse Dodge](https://adrrr.github.io/night-projects/pulse-dodge/)**
Jeu d'esquive dans une arène circulaire — des anneaux néon pulsent vers le centre avec des gaps à traverser. Déplace ton orbe en drag/touch ou WASD. Difficulté progressive (anneaux plus rapides, gaps plus étroits), near-miss screen shake, explosion de 80 particules à la mort, Web Audio (dodge pings, death bass rumble), high score localStorage. Mobile-first + desktop. Zéro dépendance.

▶️ [Essayer](https://adrrr.github.io/night-projects/pulse-dodge/)

### 🐍 **[Neon Snake](https://adrrr.github.io/night-projects/neon-snake/)**
Snake game néon — corps cyan-magenta gradient avec glow et trail ghost, particules explosives multicolores quand on mange, Web Audio API (eat chime, death sound, ambient bass pulse), vitesse progressive (8→22 moves/sec), high score localStorage, pause, start/game-over screens. Swipe + tap mobile, arrow keys + WASD desktop. 729 lignes, zéro dépendance.

▶️ [Essayer](https://adrrr.github.io/night-projects/neon-snake/)

### 🕳️ **[Black Hole Simulator](https://adrrr.github.io/night-projects/black-hole/)**
Simulateur de trou noir interactif — lentille gravitationnelle réaliste (les étoiles se courbent autour du trou noir, anneau d'Einstein visible), disque d'accrétion avec 800 particules en orbite képlérienne et effet Doppler prononcé (côté approchant bleu-blanc, côté s'éloignant rouge-orange), gradient de température blackbody (intérieur blanc chaud → extérieur orange-rouge), rayonnement Hawking subtil, champ d'étoiles parallaxe sur 3 couches avec scintillement. Drag pour déplacer, pinch/scroll pour changer la masse (1.0–10.0 M☉), persistance LocalStorage. Touch-first, canvas haute perf, zéro dépendance.

▶️ [Essayer](https://adrrr.github.io/night-projects/black-hole/)

### 💎 **[Glass Shatter](https://adrrr.github.io/night-projects/glass-shatter/)**
Simulateur interactif de vitre brisée — tap pour créer des impacts avec tessellation Voronoi réaliste. Les éclats proches de l'impact tombent avec gravité et rotation, révélant un gradient animé étoilé derrière. 3 types de verre (Clear, Frosted, Tinted), shake pour tout fracasser, son de craquement Web Audio, compteur d'impacts. Satisfaisant et hypnotique.

▶️ [Essayer](https://adrrr.github.io/night-projects/glass-shatter/)

### 🎼 **[Cellular Symphony](https://adrrr.github.io/night-projects/cellular-symphony/)**
Automate cellulaire musical — Game of Life où chaque cellule vivante joue une note sur une gamme pentatonique. Les colonnes mappent les notes, les rangées les octaves. Les cellules vieillissent en couleur (violet → rose → corail → orange → jaune) avec des effets de glow. Dessin tactile, contrôle vitesse/volume, mute, step-by-step. Web Audio API, dark theme, touch-first, zéro dépendance.

▶️ [Essayer](https://adrrr.github.io/night-projects/cellular-symphony/)

### 🫧 **[Lava Lamp](https://adrrr.github.io/night-projects/lava-lamp/)**
Simulation de lampe à lave hypnotique — metaballs avec physique de température (la cire chaude monte, froide descend), fusion organique des blobs, rendu pixel-par-pixel avec glow multi-pass. 4 thèmes (Classic Red, Ocean Blue, Cosmic Purple, Neon Green), mode ambient auto-cycle, tap pour chauffer, shake pour agiter. 60fps, zéro dépendance.

▶️ [Essayer](https://adrrr.github.io/night-projects/lava-lamp/)

### 🪟 **[Stained Glass Creator](https://adrrr.github.io/night-projects/stained-glass/)**
Générateur de vitraux interactif — tapez pour placer des points seed qui créent un diagramme de Voronoi rendu comme un vitrail. 5 palettes (Cathedral, Tiffany, Modern, Sunset, Ocean), source de lumière déplaçable, effet de verre réaliste avec lead lines, shimmer et sparkles. Export PNG. Touch-first, canvas haute perf.

▶️ [Essayer](https://adrrr.github.io/night-projects/stained-glass/)

### 🎵 **[Music Box](https://adrrr.github.io/night-projects/music-box/)**
Boîte à musique interactive — placez des pins sur un cylindre rotatif pour créer des mélodies. 3 instruments synthétisés (Music Box, Soft Piano, Marimba), gamme pentatonique, tempo ajustable, partage par URL. Web Audio API, touch-first, zéro dépendance.

▶️ [Essayer](https://adrrr.github.io/night-projects/music-box/)

### ⏳ **[Sand Art](https://adrrr.github.io/night-projects/sand-art/)**
Simulateur de sable coloré — physique cellulaire réaliste (automate cellulaire), 10 couleurs + mode rainbow, brush ajustable, shake & save en PNG 3x. Touch-first, 60fps.

▶️ [Essayer](https://adrrr.github.io/night-projects/sand-art/)

### 🎵 **[Rhythm Orb](https://adrrr.github.io/night-projects/rhythm-orb/)**
Jeu de rythme mobile-first — tapez les orbes en rythme sur 3 niveaux de difficulté. Gameplay inspiré d'Osu!, avec sons synthé, particules néon et combos satisfaisants.

▶️ [Essayer](https://adrrr.github.io/night-projects/rhythm-orb/)

### 🕹️ **[Plinko Drop](https://adrrr.github.io/night-projects/plinko-drop/)**
Jeu d'arcade style pachinko/plinko addictif — lâche des balles, regarde-les rebondir sur les clous et vise les zones de score les plus élevées. Physique satisfaisante, boutique d'améliorations et high scores.

▶️ [Essayer](https://adrrr.github.io/night-projects/plinko-drop/)

### 🔫 [Vector Siege](./vector-siege/)
Shooter arcade vectoriel inspiré d'Asteroids — contrôles joystick mobile, vagues d'ennemis, explosions néon, et bande-son synthwave. Zéro dépendance, 100% addictif.

▶️ [Essayer](https://adrrr.github.io/night-projects/vector-siege/)



### 🎵 [Audio Vizualizer](./audio-vizualizer/)
Visualiseur audio réactif au micro — barres de fréquences cyberpunk + particules qui explosent sur les beats. Zéro dépendance, juste l'API Web Audio.

▶️ [Essayer](https://adrrr.github.io/night-projects/audio-vizualizer/)

### 🐦 [Boids Flocking](./boids-flocking/)
300 oiseaux en essaim avec comportement émergent (Craig Reynolds). Souris pour repousser, clic pour attirer, scroll pour zoomer. Trails colorés hypnotiques.

▶️ [Essayer](https://adrrr.github.io/night-projects/boids-flocking/)

### 🎨 [Color Rush](./color-rush/)
Jeu de réflexes mobile-first : tape la bonne couleur avant la fin du timer. Ça accélère, la grille s'agrandit, et l'effet Stroop te troll après 10 points. Addictif dans le métro.

▶️ [Essayer](https://adrrr.github.io/night-projects/color-rush/)

### 🎨 [Generative Poster Studio](./generative-poster/)
Outil de création d'affiches procédurales — 6 styles artistiques (flow fields, topographie, constellations...), 10 palettes, paramètres interactifs, système de seeds reproductibles, et export HD 3000px. Le genre de poster que tu voudrais imprimer et accrocher au mur.

▶️ [Essayer](https://adrrr.github.io/night-projects/generative-poster/)

### 🧠 [Pattern Memory](./pattern-memory/)
Jeu de mémoire addictif — reproduis des séquences de couleurs qui s'allongent à chaque niveau. Sons Web Audio API, animations iOS-like, high scores persistants. Sessions courtes, "one more try" garanti.

▶️ [Essayer](https://adrrr.github.io/night-projects/pattern-memory/)

### ⏱️ [Daily Focus Timer](./daily-focus-timer/)
Pomodoro réinventé — cercle SVG animé, particules ambient, couleurs qui dérivent pendant le focus. Durées configurables, stats du jour, streaks, notification sonore Web Audio. Zéro dépendance, vibes apaisantes.

▶️ [Essayer](https://adrrr.github.io/night-projects/daily-focus-timer/)

### 📓 [Micro Journal](./micro-journal/)
Journal intime minimaliste — 1 question introspective par jour, mood picker 5 emojis, historique scrollable et visualisation mood 30 jours en dots colorés. Design iOS-like, 100% offline via localStorage.

▶️ [Essayer](https://adrrr.github.io/night-projects/micro-journal/)

### ✅ [Habit Tracker](./habit-tracker/)
Tracker d'habitudes minimaliste style iOS — check satisfaisant avec confetti, streaks par habit, mini bar chart semaine, persistance localStorage. Mobile-first, zéro dépendance.

▶️ [Essayer](https://adrrr.github.io/night-projects/habit-tracker/)

### 🪐 [Gravity Sandbox](./gravity-sandbox/)
Bac à sable gravitationnel — touche pour créer des étoiles, maintiens pour une masse plus grosse, swipe pour donner une vitesse. Les corps s'attirent, orbitent et fusionnent. Preset "Big Bang" pour un système solaire instant. Trails hypnotiques.

▶️ [Essayer](https://adrrr.github.io/night-projects/gravity-sandbox/)

### 🧫 [Particle Life](./particle-life/)
Simulation de vie artificielle — 600 particules de 5 espèces interagissent selon une matrice d'attraction/répulsion. Comportements émergents fascinants : essaims, orbites, chaînes, cellules. Touch pour perturber, matrice éditable, presets et trails. Hypnotique.

▶️ [Essayer](https://adrrr.github.io/night-projects/particle-life/)

### 🎹 [Synth Pad](./synth-pad/)
Instrument musical tactile — grille 4×4 de pads colorés générés via Web Audio API (oscillateurs saw+triangle). Multi-touch, 4 gammes (pentatonique, mineure, majeure, chromatique), effets delay/reverb/filter/distortion, visualiseur waveform live, particules au toucher. Aesthetic néon sur dark mode.

▶️ [Essayer](https://adrrr.github.io/night-projects/synth-pad/)

### 🌊 [Fluid Sim](./fluid-sim/)
Simulation de fluides interactive — touche/glisse pour injecter de l'encre colorée dans l'eau. Navier-Stokes simplifié en WebGL, vorticity confinement, mélange de couleurs satisfaisant. 3 modes (rainbow, neon, pastel). Hypnotique et tactile.

▶️ [Essayer](https://adrrr.github.io/night-projects/fluid-sim/)

### ✨ [Constellation Draw](./constellation-draw/)
Dessine tes propres constellations dans un ciel étoilé interactif — 280 étoiles scintillantes, lignes aurora glow entre les étoiles connectées, étoiles filantes aléatoires, parallaxe gyroscope/souris, voie lactée en fond. Double-tap pour nommer tes créations.

▶️ [Essayer](https://adrrr.github.io/night-projects/constellation-draw/)

### 🔍 [Fractal Explorer](./fractal-explorer/)
Explorateur de fractales Mandelbrot interactif — zoom infini avec coloring lissé en WebGL, 6 palettes de couleurs, pan tactile/souris, pinch-to-zoom, double-tap pour plonger. 6 presets vers les coins les plus spectaculaires (Seahorse Valley, Deep Zoom à 10⁶×...). Iterations adaptatives jusqu'à 2000.

▶️ [Essayer](https://adrrr.github.io/night-projects/fractal-explorer/)

### 🏔️ [Terrain Generator](./terrain-generator/)
Générateur procédural de terrain isométrique — Perlin noise multi-octaves avec biomes colorés (océan, plage, forêt, montagne, neige), vue 3D avec faces latérales, vagues animées, reflets de neige. 4 palettes (Natural, Autumn, Alien, Desert), mode flat, tap pour régénérer avec transition fluide.

▶️ [Essayer](https://adrrr.github.io/night-projects/terrain-generator/)

### 🌊 [Wave Interference](./wave-interference/)
Simulateur interactif d'interférences d'ondes — deux sources déplaçables générant des motifs d'interférence en temps réel sur canvas. Fond sombre, couleurs néon (cyan/magenta), animations fluides. Drag les sources pour voir les patterns constructifs et destructifs, 5 presets (onde stationnaire, destructive, ripple tank...), 4 modes de couleur (neon, plasma, rainbow, ocean).

▶️ [Essayer](https://adrrr.github.io/night-projects/wave-interference/)

### 🌧️ [Rain Synth](./rain-synth/)
Synthétiseur de pluie interactif — des gouttes tombent en continu, chaque impact crée des ondulations et un son doux via Web Audio API. Touche pour créer tes propres grosses gouttes. Pitch lié à la position X (grave à gauche, aigu à droite), reverb réglable, 4 thèmes de couleur. Méditatif et hypnotique.

▶️ [Essayer](https://adrrr.github.io/night-projects/rain-synth/)

### 🏃 [Maze Runner](./maze-runner/)
Labyrinthe procédural néon — navigue dans des labyrinthes générés algorithmiquement avec un trail lumineux cyan. Difficulté progressive, mini-carte des zones explorées, caméra smooth, animation de victoire avec particules. Swipe mobile + clavier desktop.

▶️ [Essayer](https://adrrr.github.io/night-projects/maze-runner/)

### 🌌 [Aurora Borealis](./aurora-borealis/)
Simulation interactive d'aurores boréales — 7 rideaux lumineux ondulent sur un ciel étoilé avec 300 étoiles scintillantes. Touche/glisse pour perturber les aurores, couleurs vives (vert, violet, bleu, rose) en mode screen blending. Silhouettes de collines et sapins en premier plan. Contemplatif.

▶️ [Essayer](https://adrrr.github.io/night-projects/aurora-borealis/)

### 🔮 [Kaleidoscope](./kaleidoscope/)
App de dessin symétrique interactive — 4 modes de symétrie (6/8/12/16 segments), 3 types de brush (round, diamond, star), 5 palettes de couleurs, sliders trail/taille, undo/clear/save PNG. Particules idle hypnotiques quand on ne dessine pas.

▶️ [Essayer](https://adrrr.github.io/night-projects/kaleidoscope/)


### 🧬 [Reaction-Diffusion](./reaction-diffusion/)
Simulateur de réaction-diffusion Gray-Scott en temps réel via WebGL — touche pour injecter du réactif et créer des patterns de Turing hypnotiques (spots, coraux, vers, solitons). 5 presets de paramètres, thème sombre avec glow néon. Les patterns émergent comme dans la nature (peau de léopard, motifs de coquillages).

▶️ [Essayer](https://adrrr.github.io/night-projects/reaction-diffusion/)

### 🧲 [Magnetic Pendulum](./magnetic-pendulum/)
Simulateur de pendule magnétique — place jusqu'à 5 aimants colorés sur un plan, lance le pendule depuis n'importe quelle position et observe les trajectoires chaotiques avec trails colorés par proximité. Mode fractal qui révèle les bassins d'attraction (chaque pixel coloré selon l'aimant vers lequel le pendule converge). Physique RK4, damping réglable, dark theme avec effets glow.

▶️ [Essayer](https://adrrr.github.io/night-projects/magnetic-pendulum/)



### 🔮 **[Light Prism](https://adrrr.github.io/night-projects/light-prism/)**
Simulateur de réfraction lumineuse — un faisceau de lumière blanche traverse des prismes triangulaires et se décompose en spectre arc-en-ciel (loi de Snell). Tap pour placer des prismes, drag pour les déplacer, scroll/pinch pour les tourner. Source lumineuse déplaçable, effets glow/bloom sur les rayons, toolbar glassmorphism. Multi-prisme : la lumière réfracte à travers les prismes en chaîne. Grid overlay optionnel. Canvas 2D, touch-first, zéro dépendance.

▶️ [Essayer](https://adrrr.github.io/night-projects/light-prism/)

---

### ⛳ [Gravity Golf](./gravity-golf/)
Golf spatial one-touch — lance ta balle à travers des champs gravitationnels de planètes néon. Drag slingshot pour viser, relâche pour lancer, regarde la trajectoire se courber autour des astres. 30 niveaux procéduraux + mode endless, scoring étoiles, prediction dots, trail néon, Web Audio API. Addictif.

▶️ [Essayer](https://adrrr.github.io/night-projects/gravity-golf/)

---

### 💥 **[Chain Reaction](https://adrrr.github.io/night-projects/chain-reaction/)**
Puzzle explosif — tap pour déclencher une détonation parmi des orbes flottantes. Les explosions se propagent en chaîne et détruisent les orbes voisines. Timing parfait requis pour tout détruire en un seul clic. Niveaux progressifs (orbes croissantes, rayon d'explosion réduit), combos x10+, screen shake intensif, sons qui montent en pitch avec la chaîne, particules et shockwaves. Dark neon aesthetic, zéro dépendance.

▶️ [Essayer](https://adrrr.github.io/night-projects/chain-reaction/)

---

### 🏃 **[Gravity Dash](https://adrrr.github.io/night-projects/gravity-dash/)**
Endless runner gravity-flip — tap/space pour inverser la gravité de ton orbe néon cyan. Esquive les obstacles roses, collecte les gemmes dorées, et frôle les murs pour un multiplicateur near-miss jusqu'à x5 (flash vert + son). Vitesse progressive, explosion de particules à la mort, high score localStorage, restart instantané. Web Audio API, dark neon aesthetic, 60fps. Un seul geste : tap pour tout contrôler.

▶️ [Essayer](https://adrrr.github.io/night-projects/gravity-dash/)

*Un nouveau projet chaque nuit à 1h du matin 🦊*

### 🪐 **[Orbit Catch](https://adrrr.github.io/night-projects/orbit-catch/)**
Jeu de gravité one-touch — maintiens pour activer un champ gravitationnel qui attire les orbes en orbite autour de ta planète. Plus tu en captures, plus ton multiplicateur monte, mais attention aux collisions chaotiques ! Barre d'énergie à gérer (drain/recharge), combos, warning arrows, screen shake, effets particules néon, Web Audio API. Addictif et visuellement hypnotique.

▶️ [Essayer](https://adrrr.github.io/night-projects/orbit-catch/)

### 🫧 **[Bubble Pop Chain](https://adrrr.github.io/night-projects/bubble-pop-chain/)**
Jeu de réaction en chaîne — des bulles néon flottent depuis le bas de l'écran. Tape une bulle pour la faire éclater, et les bulles adjacentes de même couleur explosent en cascade ! Plus la chaîne est longue, plus le multiplicateur de points est élevé. Le rythme accélère, et si les bulles atteignent le haut → game over. Effets particules satisfaisants, sons Web Audio API, esthétique néon dark.

▶️ [Essayer](https://adrrr.github.io/night-projects/bubble-pop-chain/)

### 🏗️ [Stack Tower](./stack-tower/)
Jeu de timing addictif — empile les blocs en les alignant parfaitement. Les débordements sont tranchés et tombent avec gravité et rotation. Combos PERFECT avec screen shake et particules néon, couleurs HSL progressives, high score localStorage. Tap mobile + espace/clic desktop.

▶️ [Essayer](https://adrrr.github.io/night-projects/stack-tower/)

### 🛸 **[Orbit Duel](https://adrrr.github.io/night-projects/orbit-duel/)**
Jeu de combat spatial gravitationnel — ton vaisseau orbite autour d'une étoile centrale, tire des projectiles qui courbent avec la gravité. Les ennemis orbitent aussi et te tirent dessus. Vagues progressives avec astéroïdes (wave 3+) et trous noirs (wave 5+) qui déforment les trajectoires. Drag pour viser avec preview de trajectoire, one-hit kills, restart instantané. Screen shake, trails néon, particules explosives, sons Web Audio API. Mobile-first (tap/drag) + desktop (WASD/souris).

▶️ [Essayer](https://adrrr.github.io/night-projects/orbit-duel/)

### 🔮 **[Bounce Fusion](https://adrrr.github.io/night-projects/bounce-fusion/)**
Jeu de fusion addictif inspiré de Suika Game — des balles néon tombent du haut de l'écran. Contrôle un paddle pour les renvoyer, et quand deux balles de même couleur et même niveau se touchent, elles fusionnent en une plus grosse ! 4 couleurs néon (cyan, magenta, lime, gold), 5 niveaux de fusion, powerup gravity flip, combos multiplicateurs, particules explosives, screen shake, sons Web Audio API. Mobile-first (touch drag) + desktop (souris/clavier).

▶️ [Essayer](https://adrrr.github.io/night-projects/bounce-fusion/)

### 🚀 **[Pixel Gravity](https://adrrr.github.io/night-projects/pixel-gravity/)**
Jeu de gravity-flip addictif style Flappy Bird — ton vaisseau avance automatiquement et tu tapes pour inverser la gravité. Esquive les obstacles néon rouges et collecte les gemmes dorées pour des combos. Difficulté progressive (vitesse + espacement), particules de trail cyan/magenta selon la direction de la gravité, explosion satisfaisante à la mort, high score localStorage, Web Audio API. Un seul geste : tap/space pour tout contrôler. Dark neon aesthetic, 60fps.

▶️ [Essayer](https://adrrr.github.io/night-projects/pixel-gravity/)

### 🎱 **[Ricochet Blast](https://adrrr.github.io/night-projects/ricochet-blast/)**
Jeu de billard-pinball addictif — vise et tire une balle qui ricoche sur les murs. Chaque rebond score des points avec un système de combo croissant (10×combo). Collecte des cibles cyan (20pts) et des gemmes diamant dorées (50pts) avec multiplicateur. 3 tirs par manche, preview de trajectoire en pointillés, jauge de puissance. Particules explosives, screen shake, anneaux lumineux, trail de la balle qui change de couleur avec le combo. Sons Web Audio (rebond monte en pitch avec le combo), high score localStorage. Drag-to-aim mobile-first, souris + clavier desktop. Dark neon aesthetic, 60fps.

▶️ [Essayer](https://adrrr.github.io/night-projects/ricochet-blast/)

### 🔴 **[Dodge Matrix](https://adrrr.github.io/night-projects/dodge-matrix/)**
Bullet-hell survival — contrôle un orbe néon cyan et esquive des vagues de projectiles aux patterns géométriques (pluie, spirales, anneaux, crossfire, grid storm, helix, chaos, supernova). Système de graze : frôler les bullets sans les toucher donne des points bonus avec combo multiplicateur et des étincelles satisfaisantes. Power-up slow-mo occasionnel. 9 vagues nommées avec difficulté croissante, trail/afterimage du joueur, screen shake, particle explosions, Web Audio API (graze chime, death explosion, wave fanfare). High score localStorage. Drag/touch mobile-first, WASD/arrows desktop. Dark neon aesthetic, 60fps.

▶️ [Essayer](https://adrrr.github.io/night-projects/dodge-matrix/)

### ⬇️ **[Gap Fall](https://adrrr.github.io/night-projects/gap-fall/)**
Balle en chute libre à travers une tour infinie de plateformes — glisse dans les gaps pour survivre. Système de combo : enchaîne les passages sans toucher de plateforme pour des multiplicateurs de score croissants (x2, x3... avec labels UNSTOPPABLE, LEGENDARY, GODLIKE, MYTHICAL). Particules néon proportionnelles au combo, screen shake, color flash, balle qui change de couleur à chaque gap. Vitesse et gravité croissantes, gaps qui rétrécissent. Web Audio API (tons ascendants sur combo, impact, game over dramatique). High score localStorage, restart instantané. Drag/touch mobile-first, arrows/WASD desktop. Dark neon aesthetic, 60fps.

▶️ [Essayer](https://adrrr.github.io/night-projects/gap-fall/)

### 🔮 **[Split Surge](https://adrrr.github.io/night-projects/split-surge/)**
Arcade de cell-splitting — commence avec un seul orbe lumineux, tap/click pour le diviser en deux. Chaque fragment se déplace et rebondit, et tu dois guider TOUS tes morceaux à travers les gaps des murs rouges qui arrivent. Plus tu split, plus c'est intense à gérer. Score = pièces vivantes × vagues passées. Trails néon colorés, particle bursts au split et à la destruction, screen shake, Web Audio SFX (split chime, explosion, wave fanfare, game over dramatique). Swipe/drag pour influencer la dérive, WASD desktop. Difficulté progressive (murs plus rapides, gaps plus étroits). High score localStorage. Dark neon aesthetic, 60fps.

▶️ [Essayer](https://adrrr.github.io/night-projects/split-surge/)

### 🐟 **[Deep Feed](https://adrrr.github.io/night-projects/deep-feed/)**
Jeu aquatique eat-to-grow — tu contrôles un petit poisson bioluminescent dans l'océan profond. Mange les poissons plus petits pour grossir, évite les prédateurs qui te chassent. 10 espèces distinctes dessinées en canvas (poisson-clown à rayures, poisson-globe avec piquants, baudroie avec lanterne, etc.). Fond océanique avec gradient profond, algues animées, bulles montantes, rayons de lumière. Web Audio immersif (ambiance sous-marine, pop de bulles, alertes prédateur). Touch drag pour nager, tap pour booster. Barre de taille, barre de boost, high score localStorage. Difficulté progressive.

▶️ [Essayer](https://adrrr.github.io/night-projects/deep-feed/)

### 🕳️ **[Gravity Well](https://adrrr.github.io/night-projects/gravity-well/)**
Jeu gravitationnel addictif — tu contrôles un trou noir au centre de l'écran. Tap/clic pour pulser ton champ gravitationnel et attirer les astéroïdes vers toi. La matière bleue score des points et te fait grossir. L'antimatière rouge te rétrécit — trop d'antimatière et tu t'effondres ! Système de combos (3+ absorptions rapides = bonus), physique satisfaisante avec gravité passive + pulse, effets visuels soignés (disque d'accrétion animé, particules, screen shake, vagues de pulse), sons Web Audio. Difficulté progressive avec plus d'objets et plus d'antimatière. High score localStorage.

▶️ [Essayer](https://adrrr.github.io/night-projects/gravity-well/)

### 💫 **[Cascade Pulse](https://adrrr.github.io/night-projects/cascade-pulse/)**
Puzzle de timing addictif — des orbes flottent à l'écran, pulsant entre dim et bright à des rythmes différents. Tap une orbe à son pic de luminosité pour l'enflammer — l'explosion se propage en chaîne aux orbes voisines aussi au pic ! Élimine toutes les orbes avec le minimum de taps pour maximiser ton score. Réactions en chaîne satisfaisantes avec shockwaves, particules, screen shake. Répulseurs dès le level 4. Web Audio synth, high score localStorage, esthétique dark/neon cyan.

▶️ [Essayer](https://adrrr.github.io/night-projects/cascade-pulse/)

### 🪐 **[Orbit Merge](https://adrrr.github.io/night-projects/orbit-merge/)**
Jeu de fusion orbital style Suika Game dans l'espace — des planètes orbitent autour d'une étoile centrale. Tap pour relâcher une planète tangentiellement, et quand deux planètes de même taille se percutent, elles fusionnent en une plus grosse ! 10 tiers cosmiques (Pebble → Rock → Moon → Mars → Earth → Neptune → Saturn → Jupiter → Red Giant → STAR). Gravité légère vers le centre, rebonds sur l'arène et entre planètes, combos multiplicateurs. Si 10 planètes s'accumulent en orbite → game over. Screen shake, particle effects, trails, glow, sons Web Audio. High score localStorage. Mobile-first (touch) + desktop (clic + clavier).

▶️ [Essayer](https://adrrr.github.io/night-projects/orbit-merge/)

### 🏓 **[Gravity Pong](https://adrrr.github.io/night-projects/gravity-pong/)**
Twist sur le breakout classique — la gravité courbe la trajectoire de la balle ! Contrôle un paddle en bas pour détruire des briques en haut, mais chaque rebond suit une trajectoire parabolique imprévisible. Niveaux progressifs : gravité latérale, mode lune (faible gravité), gravité dynamique qui shift en temps réel. Obstacles hexagonaux dès le level 3. Powerups (slow-mo, magnet paddle, extra life, wider paddle). Système de combo, particules, trail lumineux, screen shake, Web Audio. High score localStorage. Mobile-first (touch drag) + desktop (souris + clavier).

▶️ [Essayer](https://adrrr.github.io/night-projects/gravity-pong/)

### 🔦 **[Laser Reflect](https://adrrr.github.io/night-projects/laser-reflect/)**
Puzzle-action avec des miroirs et un laser — un émetteur tire un rayon et tu dois rotater les miroirs (/ et \) pour guider le faisceau à travers toutes les cibles. Preview en temps réel du trajet laser (ligne pointillée) qui update quand tu tournes un miroir. Auto-fire countdown de 8s qui ajoute de l'urgence. Niveaux progressifs : plus de cibles, miroirs et obstacles. Combo scoring, particules explosives sur les cibles touchées, screen shake, effets de glow multicouche sur le laser, Web Audio. High score localStorage. Mobile-first (tap to rotate) + desktop (clic + espace/R). Esthétique dark/neon.

▶️ [Essayer](https://adrrr.github.io/night-projects/laser-reflect/)

### 💣 **[Fuse Chain](https://adrrr.github.io/night-projects/fuse-chain/)**
Puzzle de réaction en chaîne — des bombes sont placées sur une grille. Tape une bombe pour l'exploser : des étincelles filent dans 4 directions et déclenchent les bombes touchées, créant des réactions en chaîne. Objectif : clearer TOUTES les bombes en un seul tap initial ! Niveaux procéduraux solvables avec difficulté progressive (grille + nombre de bombes croissants). Chain combo scoring, particules explosives, screen shake, spark trails colorés, Web Audio (explosions, chain tones montants, jingles win/fail). High score localStorage. Mobile-first (touch) + desktop (clic). Esthétique dark/neon.

▶️ [Essayer](https://adrrr.github.io/night-projects/fuse-chain/)
