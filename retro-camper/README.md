# 🚐 Retro Camper: Euro Trip 2000

**Žánr:** Arcade Driving Simulator / Chill-out Adventure
**Platforma:** PC (retro styl), Mobile
**Grafický styl:** Low-poly 3D, Top-down perspektiva (fixní kamera)

![Retro Camper Banner](https://img.shields.io/badge/Retro-Camper-00ff00?style=for-the-badge)
![Three.js](https://img.shields.io/badge/Three.js-black?style=for-the-badge&logo=three.js)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)

## 📖 O hře

Retro Camper: Euro Trip 2000 je arkádová jízdní hra inspirovaná retro hrami z konce 90. let. Cestuj obytným vozem HymerCar z roku 1987 napříč celou Evropou, sbírej nezapomenutelné zážitky a fotografuj památky!

### 🎮 Hlavní vlastnosti

- **Low-poly 3D grafika** v retro stylu (256x256 textury, saturované barvy)
- **Izometrický pohled** shora s dynamickou kamerou
- **4 roční období** s unikátními prostředími:
  - 🌷 **Jaro** - Holandsko & Belgie (tulipány, větrné mlýny)
  - ☀️ **Léto** - Chorvatsko & Itálie (azurové moře, historické památky)
  - 🍂 **Podzim** - Česko & Rakousko (zlaté lesy, mlhavé krajiny)
  - ❄️ **Zima** - Norsko & Švédsko (sníh, polární záře)
- **Systém sbírání zážitků** místo závodění
- **Arkádové ovládání** s driftem a houpáním vozu
- **Dynamické překážky** specifické pro každou zemi

## 🎯 Cíl hry

Tvým úkolem **NENÍ** dojet první, ale dojet s **nejlepším albem fotek** a šťastnými spolucestujícími! Sbírej:

- 📸 **Fotografie** památek (mezerník u fotospotů)
- 🥪 **Místní speciality** (gouda, pizza, pivo, losos...)
- ⛽ **Palivo** (nenechej se vysychat tank!)

Udrž:
- 😎 **Pohodu** (chill factor) - neber zatáčky moc rychle!
- 💚 **Zdraví vozu** - vyhýbej se překážkám!

## 🕹️ Ovládání

### Klávesnice

```
↑ nebo W  - Plyn
↓ nebo S  - Brzda
← nebo A  - Doleva
→ nebo D  - Doprava
MEZERNÍK  - Vyfotit památku (když jsi blízko fotospotu a jedešs pomalu)
ESC nebo P - Pauza
```

### Tipy pro hraní

1. **Ideální rychlost je 60 km/h** - při této rychlosti se pohoda neztrácí
2. **Pro focení musíš zpomalit** na méně než 20 km/h
3. **Každá srážka snižuje zdraví I pohodu** - objížděj překážky!
4. **Jídlo obnovuje pohodu** - sbírej místní speciality
5. **Sleduj palivo** - vyhledávej čerpací stanice
6. **Vůz se v zatáčkách naklání** - drift je zábavný, ale nebezpečný!

## 🌍 Evropské destinace

### 🌷 Jaro - Holandsko & Belgie
- **Prostředí:** Jasně zelená tráva, pole tulipánů, větrné mlýny
- **Překážky:** Cyklisté, zvedací mosty
- **Speciality:** 🧀 Gouda, 🍟 Hranolky
- **Fotospoty:** Větrný mlýn, Pole tulipánů, Kanály Amsterdam

### ☀️ Léto - Chorvatsko & Itálie
- **Prostředí:** Žlutá suchá tráva, azurové moře, tunely
- **Překážky:** Vespas, traktory, turisté
- **Speciality:** 🍕 Pizza, 🍝 Pasta, 🍦 Gelato
- **Fotospoty:** Azurové moře, Koloseum, Benátky

### 🍂 Podzim - Česko & Rakousko
- **Prostředí:** Oranžové a hnědé stromy, padající listí, mlha
- **Překážky:** Traktory, srnky, bahno
- **Speciality:** 🍺 Pivo, 🥨 Preclík, 🍰 Štrúdl
- **Fotospoty:** Karlův most, Hrad Karlštejn, Vídeňská opera

### ❄️ Zima - Norsko & Švédsko
- **Prostředí:** Bílý sníh, zamrzlá jezera, polární záře
- **Překážky:** Ledovka (extrémní drift!), sobi, sněžné pluhy
- **Speciality:** 🐟 Losos, 🧇 Vafle, ☕ Káva
- **Fotospoty:** Polární záře, Fjordy, Ledový hotel

## 🎨 Vizuální styl

Hra používá retro low-poly estetiku:

- **Modely:** "Chunky" (robustní) s málo polygony
- **Textury:** 256x256 pixelů, jasné saturované barvy
- **Stíny:** Tvrdé (hard shadows) bez rozmazání
- **UI:** Neonový retro design (zelená, žlutá, fialová)
- **Animace:** Přehnaná (houpání vozu, rotace collectibles)

## 🚐 HymerCar 1987

Tvůj věrný společník na cestách! Obytný vůz HymerCar inspirovaný designem 80. let:

- Hranatý design typický pro 80. léta
- Oranžová kabina s bílým tělem
- Výrazný pruh po stranách
- Chunky kola s nízko-poly modelem
- Realističné houpání při jízdě

## 🛠️ Technologie

- **Three.js** - 3D rendering engine
- **Vanilla JavaScript** - žádné framework dependencies
- **HTML5 Canvas** - UI rendering (tachometr, minimapa)
- **CSS3** - retro styling s neonovými efekty
- **Web Audio API** - (připraveno pro zvuky)

## 📦 Instalace a spuštění

### Lokální spuštění

1. Naklonuj nebo stáhni tento repozitář:
```bash
git clone https://github.com/your-username/retro-camper.git
cd retro-camper
```

2. Otevři `index.html` v prohlížeči nebo spusť lokální server:

```bash
# Python 3
python -m http.server 8000

# Node.js (http-server)
npx http-server -p 8000

# PHP
php -S localhost:8000
```

3. Otevři prohlížeč na `http://localhost:8000`

### Požadavky

- Moderní webový prohlížeč s podporou WebGL (Chrome, Firefox, Safari, Edge)
- JavaScript povolený
- Minimálně 2 GB RAM
- Doporučená GPU s podporou WebGL 2.0

## 📁 Struktura projektu

```
retro-camper/
│
├── index.html          # Hlavní HTML soubor
├── style.css           # Retro styling a UI
├── game.js             # Herní logika (Three.js, gameplay)
├── README.md           # Tento soubor
│
└── assets/             # Budoucí assety (zvuky, textury)
    └── (zatím prázdné)
```

## 🎵 Budoucí vylepšení

- [ ] Retro chiptune hudba pro každou sezónu
- [ ] Zvukové efekty (motor, klakson, srážky)
- [ ] Pokročilé particle systémy (sníh, déšť, listí)
- [ ] Více úrovní a destinací
- [ ] Multiplayer race mód
- [ ] Album fotografií s pixel-art snímky
- [ ] Uložení postupu (localStorage)
- [ ] Leaderboards
- [ ] Mobile touch controls

## 🐛 Známé problémy

- Občasné "protnutí" překážek při vysoké rychlosti
- Kamera může mírně "záseknout" po kolizi
- Na velmi starých GPU může docházet k poklesům FPS

## 📝 Licence

MIT License - volné použití a modifikace

## 🙏 Kredity

- **Design & Development:** Created with Claude AI
- **Inspirace:** Retro arcade hry z 90. let
- **3D Engine:** Three.js
- **Font:** Press Start 2P (Google Fonts)

## 🌟 Přispění

Pull requesty jsou vítány! Pro větší změny prosím nejdřív otevřete issue.

## 📞 Kontakt

Máte nápad na vylepšení? Našli jste bug? Dejte vědět!

---

**Užij si retro roadtrip napříč Evropou! 🚐✨**

Made with ❤️ and nostalgia for the golden age of arcade games
