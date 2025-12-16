// 🚐 Retro Camper: Euro Trip 2000
// Arcade Driving Simulator / Chill-out Adventure

// ==================== KONFIGURACE ====================

const CONFIG = {
    // Grafika
    RENDER_DISTANCE: 500,
    FOG_DENSITY: 0.01,
    PIXEL_RATIO: 1, // Retro low-res look

    // Fyzika vozu
    MAX_SPEED: 200,
    ACCELERATION: 0.8,
    BRAKE_FORCE: 1.0,
    DRIFT_FACTOR: 0.92,
    TURN_SPEED: 0.04,
    WOBBLE_FACTOR: 0.15, // Houpání vozu

    // Gameplay
    FUEL_CONSUMPTION: 0.01,
    CHILL_DECAY: 0.1,
    DAMAGE_THRESHOLD: 50,

    // Sbírání
    COLLECT_DISTANCE: 5,
    PHOTO_COOLDOWN: 3000, // ms
};

// ==================== EVROPSKÉ DESTINACE ====================

const DESTINATIONS = {
    SPRING: {
        name: 'HOLANDSKO & BELGIE',
        season: '🌷 JARO',
        groundColor: 0x44ff44,
        skyColor: 0x87ceeb,
        obstacles: ['CYKLISTA', 'ZVEDACÍ MOST'],
        specialties: ['🧀 Gouda', '🍟 Hranolky'],
        photoSpots: ['Větrný mlýn', 'Pole tulipánů', 'Kanály Amsterdam']
    },
    SUMMER: {
        name: 'CHORVATSKO & ITÁLIE',
        season: '☀️ LÉTO',
        groundColor: 0xffee44,
        skyColor: 0x00aaff,
        obstacles: ['VESPA', 'TRAKTOR', 'TURISTA'],
        specialties: ['🍕 Pizza', '🍝 Pasta', '🍦 Gelato'],
        photoSpots: ['Azurové moře', 'Koloseum', 'Benátky']
    },
    AUTUMN: {
        name: 'ČESKO & RAKOUSKO',
        season: '🍂 PODZIM',
        groundColor: 0xdd8844,
        skyColor: 0x9999aa,
        obstacles: ['TRAKTOR', 'SRNKA', 'BAHNO'],
        specialties: ['🍺 Pivo', '🥨 Preclík', '🍰 Štrúdl'],
        photoSpots: ['Karlův most', 'Hrad Karlštejn', 'Vídeňská opera']
    },
    WINTER: {
        name: 'NORSKO & ŠVÉDSKO',
        season: '❄️ ZIMA',
        groundColor: 0xffffff,
        skyColor: 0x334466,
        obstacles: ['LEDOVKA', 'SOB', 'SNĚŽNÝ PLUH'],
        specialties: ['🐟 Losos', '🧇 Vafle', '☕ Káva'],
        photoSpots: ['Polární záře', 'Fjordy', 'Ледяной отель']
    }
};

// ==================== HERNÍ STAV ====================

class GameState {
    constructor() {
        this.currentSeason = 'SPRING';
        this.currentDay = 1;
        this.totalDays = 14;
        this.distanceToDestination = 25.0;

        this.photos = {
            collected: 0,
            total: 7
        };

        this.food = {
            collected: 0,
            total: 5
        };

        this.fuel = 100;
        this.speed = 0;
        this.chill = 100;
        this.health = 100;

        this.isPaused = false;
        this.isGameOver = false;

        this.photoAlbum = [];
        this.lastPhotoTime = 0;
    }

    reset() {
        Object.assign(this, new GameState());
    }
}

// ==================== THREE.JS SETUP ====================

class RetroCamera {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(
            45,
            window.innerWidth / window.innerHeight,
            0.1,
            CONFIG.RENDER_DISTANCE
        );

        this.renderer = new THREE.WebGLRenderer({
            canvas: document.getElementById('game-canvas'),
            antialias: false // Retro sharp edges
        });

        this.renderer.setPixelRatio(CONFIG.PIXEL_RATIO);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.BasicShadowMap; // Retro hard shadows

        // Izometrický pohled shora
        this.camera.position.set(0, 30, 25);
        this.camera.lookAt(0, 0, 0);

        // Mlha pro retro atmosféru
        this.scene.fog = new THREE.Fog(0x87ceeb, 50, CONFIG.RENDER_DISTANCE);

        // Osvětlení
        this.setupLights();
    }

    setupLights() {
        // Ambientní světlo (zvýšené pro lepší viditelnost)
        const ambient = new THREE.AmbientLight(0xffffff, 0.9);
        this.scene.add(ambient);

        // Slunce (silnější)
        const sun = new THREE.DirectionalLight(0xffffee, 1.2);
        sun.position.set(50, 100, 50);
        sun.castShadow = true;
        sun.shadow.camera.left = -50;
        sun.shadow.camera.right = 50;
        sun.shadow.camera.top = 50;
        sun.shadow.camera.bottom = -50;
        sun.shadow.mapSize.width = 512; // Low-res shadows
        sun.shadow.mapSize.height = 512;
        this.scene.add(sun);

        // Přidáme další světlo shora pro lepší viditelnost
        const topLight = new THREE.DirectionalLight(0xffffff, 0.5);
        topLight.position.set(0, 200, 0);
        this.scene.add(topLight);
    }

    updateCameraPosition(target) {
        // Kamera následuje vůz s mírným zpožděním
        const offset = new THREE.Vector3(0, 30, 25);
        const targetPos = target.position.clone().add(offset);

        this.camera.position.lerp(targetPos, 0.1);
        this.camera.lookAt(target.position);
    }
}

// ==================== LOW-POLY MODELY ====================

class CamperVan {
    constructor() {
        this.mesh = this.createModel();
        this.velocity = new THREE.Vector3();
        this.rotation = 0;
        this.turnAngle = 0;
        this.wobbleOffset = 0;
    }

    createModel() {
        const group = new THREE.Group();

        // Hlavní tělo - HymerCar inspirace (hranatý design 80s)
        const bodyGeometry = new THREE.BoxGeometry(3, 2.5, 5);
        const bodyMaterial = new THREE.MeshPhongMaterial({
            color: 0xeeeeee,
            flatShading: true // Retro low-poly look
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 1.5;
        body.castShadow = true;
        group.add(body);

        // Kabina
        const cabinGeometry = new THREE.BoxGeometry(2.8, 1.5, 2);
        const cabinMaterial = new THREE.MeshPhongMaterial({
            color: 0xff6600,
            flatShading: true
        });
        const cabin = new THREE.Mesh(cabinGeometry, cabinMaterial);
        cabin.position.set(0, 3, 1);
        cabin.castShadow = true;
        group.add(cabin);

        // Okna (jasně modrá - retro look)
        const windowGeometry = new THREE.BoxGeometry(2.6, 1, 0.1);
        const windowMaterial = new THREE.MeshPhongMaterial({
            color: 0x00aaff,
            flatShading: true
        });

        const frontWindow = new THREE.Mesh(windowGeometry, windowMaterial);
        frontWindow.position.set(0, 3, 2.1);
        group.add(frontWindow);

        // Kola (chunky, nízko-poly)
        const wheelGeometry = new THREE.CylinderGeometry(0.5, 0.5, 0.3, 8);
        const wheelMaterial = new THREE.MeshPhongMaterial({
            color: 0x222222,
            flatShading: true
        });

        const wheelPositions = [
            [-1.5, 0.5, 1.5],
            [1.5, 0.5, 1.5],
            [-1.5, 0.5, -1.5],
            [1.5, 0.5, -1.5]
        ];

        wheelPositions.forEach(pos => {
            const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
            wheel.rotation.z = Math.PI / 2;
            wheel.position.set(...pos);
            wheel.castShadow = true;
            group.add(wheel);
        });

        // Pruh (retro design element)
        const stripeGeometry = new THREE.BoxGeometry(3.1, 0.3, 5.1);
        const stripeMaterial = new THREE.MeshPhongMaterial({
            color: 0xff9900,
            flatShading: true
        });
        const stripe = new THREE.Mesh(stripeGeometry, stripeMaterial);
        stripe.position.set(0, 1.5, 0);
        group.add(stripe);

        return group;
    }

    update(keys, deltaTime) {
        // Arkádové ovládání
        let acceleration = 0;
        let turning = 0;

        if (keys['ArrowUp'] || keys['w']) {
            acceleration = CONFIG.ACCELERATION;
        }
        if (keys['ArrowDown'] || keys['s']) {
            acceleration = -CONFIG.BRAKE_FORCE;
        }
        if (keys['ArrowLeft'] || keys['a']) {
            turning = CONFIG.TURN_SPEED;
        }
        if (keys['ArrowRight'] || keys['d']) {
            turning = -CONFIG.TURN_SPEED;
        }

        // Rychlost
        this.velocity.z += acceleration;
        this.velocity.z *= CONFIG.DRIFT_FACTOR; // Drift efekt
        this.velocity.z = Math.max(-CONFIG.MAX_SPEED * 0.5, Math.min(CONFIG.MAX_SPEED, this.velocity.z));

        // Otáčení (pouze při pohybu)
        if (Math.abs(this.velocity.z) > 1) {
            this.rotation += turning * (this.velocity.z / CONFIG.MAX_SPEED);
            this.turnAngle = turning * 0.3; // Natáčení kol
        } else {
            this.turnAngle *= 0.9;
        }

        // Pozice
        const forward = new THREE.Vector3(
            Math.sin(this.rotation),
            0,
            Math.cos(this.rotation)
        );

        this.mesh.position.add(forward.multiplyScalar(-this.velocity.z * deltaTime));
        this.mesh.rotation.y = this.rotation;

        // Houpání vozu (wobble effect)
        this.wobbleOffset += deltaTime * Math.abs(this.velocity.z) * 0.1;
        const wobble = Math.sin(this.wobbleOffset) * CONFIG.WOBBLE_FACTOR * (this.velocity.z / CONFIG.MAX_SPEED);
        this.mesh.rotation.z = wobble * 0.1;
        this.mesh.rotation.x = -turning * 0.2;

        return Math.abs(this.velocity.z);
    }
}

// ==================== PROSTŘEDÍ ====================

class Environment {
    constructor(scene, season) {
        this.scene = scene;
        this.season = season;
        this.objects = [];
        this.collectibles = [];
        this.obstacles = [];

        this.createGround();
        this.createScenery();
        this.createCollectibles();
        this.createObstacles();
    }

    createGround() {
        const destination = DESTINATIONS[this.season];

        // Silnice (hlavní track)
        const roadGeometry = new THREE.PlaneGeometry(10, 1000);
        const roadMaterial = new THREE.MeshPhongMaterial({
            color: 0x444444,
            flatShading: true
        });
        const road = new THREE.Mesh(roadGeometry, roadMaterial);
        road.rotation.x = -Math.PI / 2;
        road.receiveShadow = true;
        this.scene.add(road);

        // Krajina po stranách
        const grassGeometry = new THREE.PlaneGeometry(200, 1000);
        const grassMaterial = new THREE.MeshPhongMaterial({
            color: destination.groundColor,
            flatShading: true
        });
        const grass = new THREE.Mesh(grassGeometry, grassMaterial);
        grass.rotation.x = -Math.PI / 2;
        grass.position.y = -0.1;
        grass.receiveShadow = true;
        this.scene.add(grass);

        // Bílé čáry na silnici
        for (let i = -500; i < 500; i += 20) {
            const lineGeometry = new THREE.BoxGeometry(0.3, 0.1, 8);
            const lineMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
            const line = new THREE.Mesh(lineGeometry, lineMaterial);
            line.position.set(0, 0.05, i);
            this.scene.add(line);
        }
    }

    createScenery() {
        const destination = DESTINATIONS[this.season];

        // Stromy po stranách silnice
        for (let i = 0; i < 50; i++) {
            const side = Math.random() > 0.5 ? 1 : -1;
            const tree = this.createTree(destination);
            tree.position.set(
                side * (15 + Math.random() * 20),
                0,
                (Math.random() - 0.5) * 800
            );
            this.scene.add(tree);
            this.objects.push(tree);
        }

        // Sezónní prvky
        if (this.season === 'SPRING') {
            this.createWindmills();
        } else if (this.season === 'WINTER') {
            this.createSnowEffect();
        }
    }

    createTree(destination) {
        const group = new THREE.Group();

        // Kmen
        const trunkGeometry = new THREE.CylinderGeometry(0.3, 0.4, 3, 6);
        const trunkMaterial = new THREE.MeshPhongMaterial({
            color: 0x8B4513,
            flatShading: true
        });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.y = 1.5;
        trunk.castShadow = true;
        group.add(trunk);

        // Koruna (podle sezóny)
        let crownColor;
        switch(this.season) {
            case 'SPRING': crownColor = 0x44ff44; break;
            case 'SUMMER': crownColor = 0x228822; break;
            case 'AUTUMN': crownColor = 0xff8844; break;
            case 'WINTER': crownColor = 0x88aa88; break;
            default: crownColor = 0x44ff44;
        }

        const crownGeometry = new THREE.ConeGeometry(2, 4, 6);
        const crownMaterial = new THREE.MeshPhongMaterial({
            color: crownColor,
            flatShading: true
        });
        const crown = new THREE.Mesh(crownGeometry, crownMaterial);
        crown.position.y = 4.5;
        crown.castShadow = true;
        group.add(crown);

        return group;
    }

    createWindmills() {
        for (let i = 0; i < 3; i++) {
            const windmill = new THREE.Group();

            // Věž
            const towerGeometry = new THREE.CylinderGeometry(0.5, 0.8, 10, 8);
            const towerMaterial = new THREE.MeshPhongMaterial({
                color: 0xeeeeee,
                flatShading: true
            });
            const tower = new THREE.Mesh(towerGeometry, towerMaterial);
            tower.position.y = 5;
            tower.castShadow = true;
            windmill.add(tower);

            // Vrtule (zjednodušené)
            const bladeGeometry = new THREE.BoxGeometry(0.3, 8, 0.1);
            const bladeMaterial = new THREE.MeshPhongMaterial({
                color: 0xffffff,
                flatShading: true
            });

            for (let j = 0; j < 4; j++) {
                const blade = new THREE.Mesh(bladeGeometry, bladeMaterial);
                blade.rotation.z = (Math.PI / 2) * j;
                blade.position.y = 10;
                blade.castShadow = true;
                windmill.add(blade);
            }

            windmill.position.set(
                (i % 2 === 0 ? 1 : -1) * (30 + i * 10),
                0,
                i * 200 - 300
            );

            this.scene.add(windmill);
            this.objects.push(windmill);
        }
    }

    createSnowEffect() {
        // Padající sníh (particle system by byl moc náročný, použijeme kostky)
        for (let i = 0; i < 50; i++) {
            const snowGeometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
            const snowMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
            const snow = new THREE.Mesh(snowGeometry, snowMaterial);
            snow.position.set(
                (Math.random() - 0.5) * 100,
                Math.random() * 50,
                (Math.random() - 0.5) * 500
            );
            this.scene.add(snow);
            this.objects.push(snow);
        }
    }

    createCollectibles() {
        // Fotospoty
        for (let i = 0; i < 7; i++) {
            const photo = this.createCollectible('PHOTO', 0xffff00);
            photo.position.set(
                (Math.random() - 0.5) * 15,
                2,
                i * 100 - 300
            );
            this.scene.add(photo);
            this.collectibles.push({
                mesh: photo,
                type: 'PHOTO',
                collected: false,
                name: DESTINATIONS[this.season].photoSpots[i % 3]
            });
        }

        // Jídlo
        for (let i = 0; i < 5; i++) {
            const food = this.createCollectible('FOOD', 0xff00ff);
            food.position.set(
                (Math.random() - 0.5) * 15,
                2,
                i * 150 - 200
            );
            this.scene.add(food);
            this.collectibles.push({
                mesh: food,
                type: 'FOOD',
                collected: false,
                name: DESTINATIONS[this.season].specialties[i % 3]
            });
        }

        // Palivo
        for (let i = 0; i < 3; i++) {
            const fuel = this.createCollectible('FUEL', 0x00ffff);
            fuel.position.set(
                (Math.random() - 0.5) * 15,
                2,
                i * 200 - 100
            );
            this.scene.add(fuel);
            this.collectibles.push({
                mesh: fuel,
                type: 'FUEL',
                collected: false
            });
        }
    }

    createCollectible(type, color) {
        const group = new THREE.Group();

        // Ikona (rotující kostka)
        const iconGeometry = new THREE.BoxGeometry(1.5, 1.5, 1.5);
        const iconMaterial = new THREE.MeshPhongMaterial({
            color: color,
            emissive: color,
            emissiveIntensity: 0.5,
            flatShading: true
        });
        const icon = new THREE.Mesh(iconGeometry, iconMaterial);
        icon.userData.type = type;
        group.add(icon);

        // Podstavec
        const baseGeometry = new THREE.CylinderGeometry(0.8, 0.8, 0.2, 8);
        const baseMaterial = new THREE.MeshPhongMaterial({
            color: 0x666666,
            flatShading: true
        });
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        base.position.y = -1;
        group.add(base);

        return group;
    }

    createObstacles() {
        const destination = DESTINATIONS[this.season];

        // Vytvoř překážky podle sezóny
        switch(this.season) {
            case 'SPRING':
                this.createCyclists();
                this.createTractors(); // Farmáři na jaře
                break;
            case 'SUMMER':
                this.createVespas();
                this.createTractors();
                break;
            case 'AUTUMN':
                this.createTractors();
                this.createDeer();
                break;
            case 'WINTER':
                this.createReindeers();
                this.createSnowPlows();
                break;
        }
    }

    createCyclists() {
        // Cyklisti (Holandsko)
        for (let i = 0; i < 5; i++) {
            const cyclist = new THREE.Group();

            // Tělo
            const bodyGeometry = new THREE.CylinderGeometry(0.3, 0.3, 1.5, 6);
            const bodyMaterial = new THREE.MeshPhongMaterial({
                color: 0xff0000,
                flatShading: true
            });
            const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
            body.position.y = 1.5;
            cyclist.add(body);

            // Hlava
            const headGeometry = new THREE.SphereGeometry(0.4, 6, 6);
            const headMaterial = new THREE.MeshPhongMaterial({
                color: 0xffcc99,
                flatShading: true
            });
            const head = new THREE.Mesh(headGeometry, headMaterial);
            head.position.y = 2.5;
            cyclist.add(head);

            // Kolo (zjednodušené)
            const wheelGeometry = new THREE.TorusGeometry(0.5, 0.1, 6, 8);
            const wheelMaterial = new THREE.MeshPhongMaterial({
                color: 0x333333,
                flatShading: true
            });
            const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
            wheel.rotation.y = Math.PI / 2;
            wheel.position.y = 0.5;
            cyclist.add(wheel);

            const side = Math.random() > 0.5 ? 1 : -1;
            cyclist.position.set(
                side * 4,
                0,
                i * 150 - 300
            );

            cyclist.userData = {
                type: 'CYCLIST',
                speed: 10 + Math.random() * 5,
                direction: side,
                dangerous: true
            };

            this.scene.add(cyclist);
            this.obstacles.push(cyclist);
        }
    }

    createTractors() {
        // Traktory (pomalé překážky)
        for (let i = 0; i < 3; i++) {
            const tractor = new THREE.Group();

            // Tělo traktoru
            const bodyGeometry = new THREE.BoxGeometry(3, 2, 4);
            const bodyMaterial = new THREE.MeshPhongMaterial({
                color: 0x00aa00,
                flatShading: true
            });
            const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
            body.position.y = 1.5;
            body.castShadow = true;
            tractor.add(body);

            // Kabina
            const cabinGeometry = new THREE.BoxGeometry(2, 1.5, 2);
            const cabinMaterial = new THREE.MeshPhongMaterial({
                color: 0x006600,
                flatShading: true
            });
            const cabin = new THREE.Mesh(cabinGeometry, cabinMaterial);
            cabin.position.set(0, 2.8, 0);
            cabin.castShadow = true;
            tractor.add(cabin);

            // Velká zadní kola
            const bigWheelGeometry = new THREE.CylinderGeometry(1, 1, 0.5, 8);
            const wheelMaterial = new THREE.MeshPhongMaterial({
                color: 0x222222,
                flatShading: true
            });

            [-1.5, 1.5].forEach(x => {
                const wheel = new THREE.Mesh(bigWheelGeometry, wheelMaterial);
                wheel.rotation.z = Math.PI / 2;
                wheel.position.set(x, 1, -1);
                tractor.add(wheel);
            });

            // Malá přední kola
            const smallWheelGeometry = new THREE.CylinderGeometry(0.6, 0.6, 0.4, 8);
            [-1.2, 1.2].forEach(x => {
                const wheel = new THREE.Mesh(smallWheelGeometry, wheelMaterial);
                wheel.rotation.z = Math.PI / 2;
                wheel.position.set(x, 0.6, 1.5);
                tractor.add(wheel);
            });

            tractor.position.set(
                (Math.random() - 0.5) * 8,
                0,
                i * 200 - 250
            );

            tractor.userData = {
                type: 'TRACTOR',
                speed: 3 + Math.random() * 2,
                direction: 0,
                dangerous: true
            };

            this.scene.add(tractor);
            this.obstacles.push(tractor);
        }
    }

    createVespas() {
        // Vespas (rychlé italské skútry)
        for (let i = 0; i < 4; i++) {
            const vespa = new THREE.Group();

            // Tělo skútru
            const bodyGeometry = new THREE.BoxGeometry(1, 1.2, 2);
            const bodyMaterial = new THREE.MeshPhongMaterial({
                color: 0xff6600,
                flatShading: true
            });
            const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
            body.position.y = 1;
            vespa.add(body);

            // Sedadlo
            const seatGeometry = new THREE.BoxGeometry(0.8, 0.3, 1);
            const seatMaterial = new THREE.MeshPhongMaterial({
                color: 0x8B4513,
                flatShading: true
            });
            const seat = new THREE.Mesh(seatGeometry, seatMaterial);
            seat.position.y = 1.8;
            vespa.add(seat);

            // Řidič (jednoduchý)
            const riderGeometry = new THREE.CylinderGeometry(0.3, 0.3, 1, 6);
            const riderMaterial = new THREE.MeshPhongMaterial({
                color: 0x0066cc,
                flatShading: true
            });
            const rider = new THREE.Mesh(riderGeometry, riderMaterial);
            rider.position.y = 2.5;
            vespa.add(rider);

            // Kola
            const wheelGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.2, 8);
            const wheelMaterial = new THREE.MeshPhongMaterial({
                color: 0x222222,
                flatShading: true
            });

            [[-0.5, 0.4, 0.8], [0.5, 0.4, 0.8], [-0.5, 0.4, -0.8], [0.5, 0.4, -0.8]].forEach(pos => {
                const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
                wheel.rotation.z = Math.PI / 2;
                wheel.position.set(...pos);
                vespa.add(wheel);
            });

            const side = Math.random() > 0.5 ? 1 : -1;
            vespa.position.set(
                side * 4.5,
                0,
                i * 120 - 200
            );

            vespa.userData = {
                type: 'VESPA',
                speed: 40 + Math.random() * 20,
                direction: side,
                dangerous: true
            };

            this.scene.add(vespa);
            this.obstacles.push(vespa);
        }
    }

    createDeer() {
        // Srnky (podzim)
        for (let i = 0; i < 4; i++) {
            const deer = new THREE.Group();

            // Tělo
            const bodyGeometry = new THREE.BoxGeometry(0.8, 0.8, 1.5);
            const bodyMaterial = new THREE.MeshPhongMaterial({
                color: 0x8B4513,
                flatShading: true
            });
            const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
            body.position.y = 1;
            deer.add(body);

            // Hlava
            const headGeometry = new THREE.BoxGeometry(0.5, 0.6, 0.6);
            const head = new THREE.Mesh(headGeometry, bodyMaterial);
            head.position.set(0, 1.3, 1);
            deer.add(head);

            // Nohy
            const legGeometry = new THREE.CylinderGeometry(0.1, 0.1, 1, 6);
            [[0.3, 0.5, 0.5], [-0.3, 0.5, 0.5], [0.3, 0.5, -0.5], [-0.3, 0.5, -0.5]].forEach(pos => {
                const leg = new THREE.Mesh(legGeometry, bodyMaterial);
                leg.position.set(...pos);
                deer.add(leg);
            });

            const side = Math.random() > 0.5 ? 1 : -1;
            deer.position.set(
                side * 6,
                0,
                i * 180 - 300
            );

            deer.userData = {
                type: 'DEER',
                speed: 25 + Math.random() * 15,
                direction: side,
                crossing: false,
                dangerous: true
            };

            this.scene.add(deer);
            this.obstacles.push(deer);
        }
    }

    createReindeers() {
        // Sobi (zima - podobné srnkám ale s parožím)
        for (let i = 0; i < 3; i++) {
            const reindeer = new THREE.Group();

            // Tělo
            const bodyGeometry = new THREE.BoxGeometry(1, 1, 2);
            const bodyMaterial = new THREE.MeshPhongMaterial({
                color: 0xcccccc,
                flatShading: true
            });
            const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
            body.position.y = 1.2;
            reindeer.add(body);

            // Hlava
            const headGeometry = new THREE.BoxGeometry(0.6, 0.7, 0.7);
            const head = new THREE.Mesh(headGeometry, bodyMaterial);
            head.position.set(0, 1.5, 1.2);
            reindeer.add(head);

            // Paroží (stylizované)
            const antlerGeometry = new THREE.ConeGeometry(0.1, 1, 6);
            const antlerMaterial = new THREE.MeshPhongMaterial({
                color: 0x8B4513,
                flatShading: true
            });

            [-0.3, 0.3].forEach(x => {
                const antler = new THREE.Mesh(antlerGeometry, antlerMaterial);
                antler.position.set(x, 2.2, 1);
                reindeer.add(antler);
            });

            // Nohy
            const legGeometry = new THREE.CylinderGeometry(0.12, 0.12, 1.2, 6);
            [[0.4, 0.6, 0.6], [-0.4, 0.6, 0.6], [0.4, 0.6, -0.6], [-0.4, 0.6, -0.6]].forEach(pos => {
                const leg = new THREE.Mesh(legGeometry, bodyMaterial);
                leg.position.set(...pos);
                reindeer.add(leg);
            });

            const side = Math.random() > 0.5 ? 1 : -1;
            reindeer.position.set(
                side * 7,
                0,
                i * 220 - 350
            );

            reindeer.userData = {
                type: 'REINDEER',
                speed: 20 + Math.random() * 10,
                direction: side,
                crossing: false,
                dangerous: true
            };

            this.scene.add(reindeer);
            this.obstacles.push(reindeer);
        }
    }

    createSnowPlows() {
        // Sněžné pluhy (zimní údržba)
        for (let i = 0; i < 2; i++) {
            const plow = new THREE.Group();

            // Tělo vozu
            const bodyGeometry = new THREE.BoxGeometry(3, 2.5, 5);
            const bodyMaterial = new THREE.MeshPhongMaterial({
                color: 0xff6600,
                flatShading: true
            });
            const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
            body.position.y = 1.5;
            body.castShadow = true;
            plow.add(body);

            // Radlice (pluh)
            const bladeGeometry = new THREE.BoxGeometry(4, 1.5, 0.3);
            const bladeMaterial = new THREE.MeshPhongMaterial({
                color: 0xffaa00,
                flatShading: true
            });
            const blade = new THREE.Mesh(bladeGeometry, bladeMaterial);
            blade.position.set(0, 0.8, 2.8);
            blade.castShadow = true;
            plow.add(blade);

            // Kabina
            const cabinGeometry = new THREE.BoxGeometry(2.5, 1.8, 2);
            const cabinMaterial = new THREE.MeshPhongMaterial({
                color: 0xcc4400,
                flatShading: true
            });
            const cabin = new THREE.Mesh(cabinGeometry, cabinMaterial);
            cabin.position.set(0, 3.2, 0);
            plow.add(cabin);

            // Kola
            const wheelGeometry = new THREE.CylinderGeometry(0.7, 0.7, 0.5, 8);
            const wheelMaterial = new THREE.MeshPhongMaterial({
                color: 0x222222,
                flatShading: true
            });

            [[-1.5, 0.7, 1.5], [1.5, 0.7, 1.5], [-1.5, 0.7, -1.5], [1.5, 0.7, -1.5]].forEach(pos => {
                const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
                wheel.rotation.z = Math.PI / 2;
                wheel.position.set(...pos);
                plow.add(wheel);
            });

            plow.position.set(
                (Math.random() - 0.5) * 8,
                0,
                i * 300 - 400
            );

            plow.userData = {
                type: 'SNOWPLOW',
                speed: 15 + Math.random() * 5,
                direction: 0,
                dangerous: true
            };

            this.scene.add(plow);
            this.obstacles.push(plow);
        }
    }

    update(deltaTime, camperPosition) {
        // Rotace collectibles
        this.collectibles.forEach(item => {
            if (!item.collected) {
                item.mesh.rotation.y += deltaTime * 2;

                // Hover efekt
                item.mesh.children[0].position.y = Math.sin(Date.now() * 0.003) * 0.3;
            }
        });

        // Rotace větrných mlýnů
        if (this.season === 'SPRING') {
            this.objects.forEach(obj => {
                if (obj.children.length > 5) { // Je to větrný mlýn
                    obj.children.forEach((child, idx) => {
                        if (idx > 0) { // Vrtule
                            child.rotation.z += deltaTime * 0.5;
                        }
                    });
                }
            });
        }

        // Padající sníh
        if (this.season === 'WINTER') {
            this.objects.forEach(obj => {
                if (obj.geometry && obj.geometry.type === 'BoxGeometry' && obj.material.color.getHex() === 0xffffff) {
                    obj.position.y -= deltaTime * 5;
                    if (obj.position.y < 0) {
                        obj.position.y = 50;
                    }
                }
            });
        }

        // Update překážek
        this.obstacles.forEach(obstacle => {
            const data = obstacle.userData;

            switch(data.type) {
                case 'CYCLIST':
                    // Cyklisté jezdí po straně silnice
                    obstacle.position.z += data.speed * deltaTime;
                    obstacle.rotation.y = data.direction > 0 ? 0 : Math.PI;
                    break;

                case 'VESPA':
                    // Vespas jedou rychle po silnici
                    obstacle.position.z += data.speed * deltaTime;
                    obstacle.rotation.y = data.direction > 0 ? 0 : Math.PI;
                    // Občas projíždějí ze strany na stranu
                    if (Math.random() < 0.001) {
                        obstacle.position.x += data.direction * deltaTime * 10;
                    }
                    break;

                case 'TRACTOR':
                    // Traktory jedou pomalu
                    obstacle.position.z += data.speed * deltaTime;
                    break;

                case 'DEER':
                case 'REINDEER':
                    // Zvěř občas přebíhá silnici
                    if (!data.crossing && Math.random() < 0.0005) {
                        data.crossing = true;
                    }

                    if (data.crossing) {
                        obstacle.position.x -= data.direction * data.speed * deltaTime;
                        obstacle.rotation.y = data.direction > 0 ? Math.PI / 2 : -Math.PI / 2;

                        // Když dorazí na druhou stranu
                        if (Math.abs(obstacle.position.x) > 10) {
                            data.crossing = false;
                            data.direction *= -1;
                        }
                    }
                    break;

                case 'SNOWPLOW':
                    // Sněžné pluhy jedou pomalu ale zabírají celou cestu
                    obstacle.position.z += data.speed * deltaTime;
                    break;
            }

            // Reset pozice když zmizí z pohledu
            if (obstacle.position.z > camperPosition.z + 100) {
                obstacle.position.z = camperPosition.z - 500;
            }
        });
    }

    checkCollision(camperPosition, camperRotation) {
        // Kontrola kolize s překážkami
        for (let obstacle of this.obstacles) {
            const distance = new THREE.Vector2(
                obstacle.position.x - camperPosition.x,
                obstacle.position.z - camperPosition.z
            ).length();

            // Různé hitboxy pro různé překážky
            let hitboxSize = 3;
            if (obstacle.userData.type === 'DEER' || obstacle.userData.type === 'REINDEER') {
                hitboxSize = 2;
            } else if (obstacle.userData.type === 'CYCLIST') {
                hitboxSize = 1.5;
            }

            if (distance < hitboxSize) {
                return {
                    hit: true,
                    type: obstacle.userData.type,
                    damage: this.calculateDamage(obstacle.userData.type)
                };
            }
        }

        return { hit: false };
    }

    calculateDamage(obstacleType) {
        switch(obstacleType) {
            case 'CYCLIST': return 5;
            case 'VESPA': return 10;
            case 'TRACTOR': return 25;
            case 'DEER':
            case 'REINDEER': return 15;
            case 'SNOWPLOW': return 30;
            default: return 10;
        }
    }
}

// ==================== HUD MANAGER ====================

class HUDManager {
    constructor(gameState) {
        this.gameState = gameState;
        this.speedoCanvas = document.getElementById('speedo-canvas');
        this.speedoCtx = this.speedoCanvas.getContext('2d');
        this.minimapCanvas = document.getElementById('minimap-canvas');
        this.minimapCtx = this.minimapCanvas.getContext('2d');

        this.notification = document.getElementById('notification');
    }

    update(speed, camperPosition) {
        // Destinace
        document.getElementById('destination-name').textContent =
            DESTINATIONS[this.gameState.currentSeason].name;
        document.getElementById('destination-distance').textContent =
            this.gameState.distanceToDestination.toFixed(1) + ' km';

        // Den
        document.getElementById('current-day').textContent = this.gameState.currentDay;
        document.getElementById('total-days').textContent = this.gameState.totalDays;

        // Sbírky
        document.getElementById('photos-count').textContent = this.gameState.photos.collected;
        document.getElementById('photos-total').textContent = this.gameState.photos.total;
        document.getElementById('food-count').textContent = this.gameState.food.collected;
        document.getElementById('food-total').textContent = this.gameState.food.total;
        document.getElementById('fuel-level').textContent = Math.round(this.gameState.fuel);

        // Rychlost
        document.getElementById('speed-value').textContent = Math.round(speed);

        // Pohoda
        document.getElementById('chill-fill').style.width = this.gameState.chill + '%';

        // Zdraví
        document.getElementById('health-fill').style.width = this.gameState.health + '%';

        // Tachometr canvas
        this.drawSpeedometer(speed);

        // Minimapa
        this.drawMinimap(camperPosition);
    }

    drawSpeedometer(speed) {
        const ctx = this.speedoCtx;
        const centerX = 75;
        const centerY = 75;
        const radius = 60;

        // Vyčistit
        ctx.clearRect(0, 0, 150, 150);

        // Kruh pozadí
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.stroke();

        // Stupnice
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 2;
        for (let i = 0; i <= 12; i++) {
            const angle = (i / 12) * Math.PI * 2 - Math.PI / 2;
            const startX = centerX + Math.cos(angle) * (radius - 10);
            const startY = centerY + Math.sin(angle) * (radius - 10);
            const endX = centerX + Math.cos(angle) * radius;
            const endY = centerY + Math.sin(angle) * radius;

            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, endY);
            ctx.stroke();
        }

        // Ručička
        const speedAngle = ((speed / CONFIG.MAX_SPEED) * Math.PI * 1.5) - Math.PI / 2;
        ctx.strokeStyle = '#ffff00';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(
            centerX + Math.cos(speedAngle) * (radius - 15),
            centerY + Math.sin(speedAngle) * (radius - 15)
        );
        ctx.stroke();

        // Střed
        ctx.fillStyle = '#ff00ff';
        ctx.beginPath();
        ctx.arc(centerX, centerY, 5, 0, Math.PI * 2);
        ctx.fill();
    }

    drawMinimap(camperPosition) {
        const ctx = this.minimapCtx;

        // Vyčistit
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, 150, 150);

        // Silnice
        ctx.fillStyle = '#444';
        ctx.fillRect(50, 0, 50, 150);

        // Vůz (ve středu)
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(70, 70, 10, 10);

        // Směr
        ctx.strokeStyle = '#ffff00';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(75, 75);
        ctx.lineTo(75, 60);
        ctx.stroke();

        // Cíl (nahoře)
        ctx.fillStyle = '#ff0000';
        ctx.beginPath();
        ctx.arc(75, 20, 5, 0, Math.PI * 2);
        ctx.fill();
    }

    showNotification(message, duration = 2000) {
        this.notification.textContent = message;
        this.notification.classList.add('show');

        setTimeout(() => {
            this.notification.classList.remove('show');
        }, duration);
    }
}

// ==================== HLAVNÍ HERNÍ TŘÍDA ====================

class RetroCamperGame {
    constructor() {
        this.gameState = new GameState();
        this.keys = {};
        this.lastTime = Date.now();

        this.renderer = null;
        this.camper = null;
        this.environment = null;
        this.hud = null;

        this.setupEventListeners();
    }

    setupEventListeners() {
        // Klávesy
        window.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;

            // Pauza
            if (e.key === 'Escape' || e.key === 'p') {
                this.togglePause();
            }

            // Fotografie
            if (e.key === ' ' && !this.gameState.isPaused) {
                this.takePhoto();
            }
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });

        // Menu tlačítka
        document.getElementById('start-game').addEventListener('click', () => {
            this.startGame();
        });

        document.getElementById('resume-game').addEventListener('click', () => {
            this.togglePause();
        });

        document.getElementById('restart-game').addEventListener('click', () => {
            this.restartGame();
        });

        document.getElementById('exit-game').addEventListener('click', () => {
            this.exitToMenu();
        });

        // Resize
        window.addEventListener('resize', () => {
            if (this.renderer) {
                this.renderer.camera.aspect = window.innerWidth / window.innerHeight;
                this.renderer.camera.updateProjectionMatrix();
                this.renderer.renderer.setSize(window.innerWidth, window.innerHeight);
            }
        });
    }

    startGame() {
        document.getElementById('main-menu').classList.remove('active');
        document.getElementById('game-screen').classList.add('active');

        this.gameState.reset();
        this.init();
        this.animate();
    }

    init() {
        // Three.js setup
        this.renderer = new RetroCamera();

        // Obytný vůz
        this.camper = new CamperVan();
        this.renderer.scene.add(this.camper.mesh);

        // Prostředí
        this.environment = new Environment(
            this.renderer.scene,
            this.gameState.currentSeason
        );

        // HUD
        this.hud = new HUDManager(this.gameState);

        this.hud.showNotification('🚐 VYJEL JSI NA CESTU!', 3000);
    }

    animate() {
        if (this.gameState.isGameOver) return;

        requestAnimationFrame(() => this.animate());

        if (this.gameState.isPaused) return;

        const currentTime = Date.now();
        const deltaTime = Math.min((currentTime - this.lastTime) / 1000, 0.1);
        this.lastTime = currentTime;

        this.update(deltaTime);
        this.render();
    }

    update(deltaTime) {
        // Update vozu
        const speed = this.camper.update(this.keys, deltaTime);

        // Update paliva
        if (speed > 0) {
            this.gameState.fuel -= CONFIG.FUEL_CONSUMPTION * deltaTime;
            this.gameState.fuel = Math.max(0, this.gameState.fuel);
        }

        // Update pohody
        const roughness = Math.abs(speed - 60) / 60; // Ideální rychlost je 60
        this.gameState.chill -= CONFIG.CHILL_DECAY * roughness * deltaTime;
        this.gameState.chill = Math.min(100, Math.max(0, this.gameState.chill));

        // Update prostředí
        this.environment.update(deltaTime, this.camper.mesh.position);

        // Check kolizí s překážkami
        const collision = this.environment.checkCollision(this.camper.mesh.position, this.camper.rotation);
        if (collision.hit) {
            this.handleCollision(collision);
        }

        // Check collectibles
        this.checkCollectibles();

        // Update vzdálenosti
        this.gameState.distanceToDestination -= (speed / 3600) * deltaTime;
        if (this.gameState.distanceToDestination <= 0) {
            this.reachDestination();
        }

        // Update kamery
        this.renderer.updateCameraPosition(this.camper.mesh);

        // Update HUD
        this.hud.update(speed, this.camper.mesh.position);

        // Game over podmínky
        if (this.gameState.fuel <= 0) {
            this.gameOver('Došlo ti palivo! 😢');
        }
        if (this.gameState.health <= 0) {
            this.gameOver('Vůz je příliš poškozen! 😢');
        }
    }

    render() {
        this.renderer.renderer.render(this.renderer.scene, this.renderer.camera);
    }

    checkCollectibles() {
        this.environment.collectibles.forEach(item => {
            if (item.collected) return;

            const distance = this.camper.mesh.position.distanceTo(item.mesh.position);

            if (distance < CONFIG.COLLECT_DISTANCE) {
                this.collectItem(item);
            }
        });
    }

    collectItem(item) {
        item.collected = true;
        this.renderer.scene.remove(item.mesh);

        switch(item.type) {
            case 'PHOTO':
                // Fotky se sbírají mezerníkem, jen se označí jako dostupné
                break;

            case 'FOOD':
                this.gameState.food.collected++;
                this.gameState.chill = Math.min(100, this.gameState.chill + 20);
                this.hud.showNotification(`🍴 ${item.name}`, 2000);
                break;

            case 'FUEL':
                this.gameState.fuel = Math.min(100, this.gameState.fuel + 30);
                this.hud.showNotification('⛽ +30% PALIVA', 2000);
                break;
        }
    }

    handleCollision(collision) {
        // Prevent multiple collisions in quick succession
        const now = Date.now();
        if (this.lastCollisionTime && now - this.lastCollisionTime < 1000) return;

        this.lastCollisionTime = now;

        // Apply damage
        this.gameState.health -= collision.damage;
        this.gameState.health = Math.max(0, this.gameState.health);

        // Decrease chill
        this.gameState.chill -= collision.damage * 2;
        this.gameState.chill = Math.max(0, this.gameState.chill);

        // Show warning
        const messages = {
            CYCLIST: '🚴 POZOR! CYKLISTA!',
            VESPA: '🛵 BAM! VESPA!',
            TRACTOR: '🚜 CRASH! TRAKTOR!',
            DEER: '🦌 AU! SRNKA!',
            REINDEER: '🦌 POZOR! SOB!',
            SNOWPLOW: '❄️ SRÁŽKA! PLUH!'
        };

        this.hud.showNotification(messages[collision.type] || '💥 NÁRAZ!', 2000);

        // Camera shake effect (simple version)
        this.renderer.camera.position.x += (Math.random() - 0.5) * 2;
        this.renderer.camera.position.y += (Math.random() - 0.5) * 2;
    }

    takePhoto() {
        const now = Date.now();
        if (now - this.gameState.lastPhotoTime < CONFIG.PHOTO_COOLDOWN) return;

        // Hledej blízký fotospot
        const nearbyPhoto = this.environment.collectibles.find(item => {
            if (item.type !== 'PHOTO' || item.collected) return false;
            const distance = this.camper.mesh.position.distanceTo(item.mesh.position);
            return distance < CONFIG.COLLECT_DISTANCE * 2;
        });

        if (nearbyPhoto && this.gameState.speed < 20) { // Musíš zpomalit
            this.gameState.photos.collected++;
            this.gameState.lastPhotoTime = now;
            nearbyPhoto.collected = true;
            this.renderer.scene.remove(nearbyPhoto.mesh);

            this.hud.showNotification(`📸 CVAK! ${nearbyPhoto.name}`, 3000);

            // Přidej do alba
            this.gameState.photoAlbum.push({
                name: nearbyPhoto.name,
                location: DESTINATIONS[this.gameState.currentSeason].name,
                day: this.gameState.currentDay
            });
        } else if (nearbyPhoto) {
            this.hud.showNotification('⚠️ ZPOMAL PRO FOCENÍ!', 2000);
        }
    }

    reachDestination() {
        this.gameState.currentDay++;
        this.gameState.distanceToDestination = 25.0;

        if (this.gameState.currentDay > this.gameState.totalDays) {
            this.winGame();
        } else {
            // Změna sezóny
            const seasons = ['SPRING', 'SUMMER', 'AUTUMN', 'WINTER'];
            const currentIndex = seasons.indexOf(this.gameState.currentSeason);
            this.gameState.currentSeason = seasons[(currentIndex + 1) % seasons.length];

            this.hud.showNotification(`🏁 ${DESTINATIONS[this.gameState.currentSeason].season}`, 4000);

            // Reload prostředí
            this.reloadEnvironment();
        }
    }

    reloadEnvironment() {
        // Vyčistit staré prostředí
        this.environment.objects.forEach(obj => this.renderer.scene.remove(obj));
        this.environment.collectibles.forEach(item => this.renderer.scene.remove(item.mesh));

        // Vytvořit nové
        this.environment = new Environment(
            this.renderer.scene,
            this.gameState.currentSeason
        );

        // Reset counters
        this.gameState.photos.collected = 0;
        this.gameState.food.collected = 0;

        // Update mlhy a oblohy
        const destination = DESTINATIONS[this.gameState.currentSeason];
        this.renderer.scene.fog.color.setHex(destination.skyColor);
        this.renderer.renderer.setClearColor(destination.skyColor);
    }

    togglePause() {
        this.gameState.isPaused = !this.gameState.isPaused;

        if (this.gameState.isPaused) {
            document.getElementById('pause-menu').classList.add('active');
        } else {
            document.getElementById('pause-menu').classList.remove('active');
        }
    }

    restartGame() {
        document.getElementById('pause-menu').classList.remove('active');
        this.gameState.reset();
        this.reloadEnvironment();
        this.camper.mesh.position.set(0, 0, 0);
        this.camper.velocity.set(0, 0, 0);
        this.camper.rotation = 0;
        this.gameState.isPaused = false;
    }

    exitToMenu() {
        document.getElementById('pause-menu').classList.remove('active');
        document.getElementById('game-screen').classList.remove('active');
        document.getElementById('main-menu').classList.add('active');
        this.gameState.isGameOver = true;
    }

    gameOver(message) {
        this.gameState.isGameOver = true;
        this.hud.showNotification(message, 5000);

        setTimeout(() => {
            this.exitToMenu();
        }, 5000);
    }

    winGame() {
        this.gameState.isGameOver = true;

        const totalPhotos = this.gameState.photoAlbum.length;
        const totalFood = this.gameState.food.collected;

        this.hud.showNotification(
            `🎉 DOKONČIL JSI EURO TRIP!\n📸 ${totalPhotos} fotek\n🍴 ${totalFood} specialit`,
            8000
        );

        setTimeout(() => {
            this.exitToMenu();
        }, 8000);
    }
}

// ==================== START ====================

let game;

window.addEventListener('load', () => {
    game = new RetroCamperGame();
});
