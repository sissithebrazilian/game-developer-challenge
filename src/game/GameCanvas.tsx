import { useEffect, useRef, useState } from 'react'



import {
    Application,
    Assets,
    Graphics,
    Sprite,
    Text,
    Texture,
} from 'pixi.js'



import { PlayerShip } from './PlayerShip'

import { Projectile } from './Projectile'

import { EnemyShip } from './EnemyShip'

import { ShooterShip } from './ShooterShip'

import type { ShipVariant } from './shipTextures'



import type { MatchResult } from '../types/game'



type Enemy = EnemyShip | ShooterShip



type Island = {

    x: number

    y: number

    radius: number

}

type GameCanvasProps = {
    playerName: string
    duration: number
    level: number
    onGameOver: (result: MatchResult) => void
    onMainMenu: () => void
}



export function GameCanvas({
    playerName,
    duration,
    level,
    onGameOver,
    onMainMenu,
}: GameCanvasProps) {

    const containerRef =

        useRef<HTMLDivElement>(null)



    // Referência para que os controles React/touch

    // consigam controlar o mesmo PlayerShip do Pixi.

    const playerRef =

        useRef<PlayerShip | null>(null)



    // Permite que o botão de pause mobile

    // use a mesma função de pause do jogo.

    const pauseToggleRef =

        useRef<(() => void) | null>(null)

    const [pauseMenuVisible, setPauseMenuVisible] =
        useState(false)



    useEffect(() => {

        const app = new Application()



        let destroyed = false



        // Será preenchida depois que

        // os listeners forem criados.

        let removeRuntimeListeners = () => { }
        let stopAudio = () => { }



        const startGame = async () => {

            await app.init({

                width: 1280,

                height: 720,

                backgroundColor: 0x0b4f6c,

                antialias: true,

            })



            if (destroyed) {

                app.destroy(true)

                return

            }



            if (!containerRef.current) {

                return

            }



            containerRef.current.appendChild(

                app.canvas

            )



            app.stage.sortableChildren = true

            const levelConfig = {
                maxEnemies: Math.min(10, 2 + Math.ceil(level * 0.8)),
                spawnInterval: Math.max(1.1, 3.3 - level * 0.22),
                chaserChance: Math.max(0.35, 0.82 - level * 0.05),
                initialEnemies: Math.min(5, 1 + Math.ceil(level / 3)),
                mapVariant: Math.max(1, Math.min(10, level)),
            }



            // =========================
            // MAPA / ASSETS OFICIAIS
            // =========================

            const TILE_SIZE = 64

            const neededTiles = [
                1, 2, 3, 6, 7, 8, 9,
                17, 18, 19, 22, 23, 24, 25,
                33, 34, 35, 38, 39, 40, 41,
                50, 54, 55, 56, 57,
                70, 71, 72, 73,
            ]

            const tileTextures =
                new Map<number, Texture>()

            await Promise.all(
                neededTiles.map(
                    async (tileNumber) => {
                        const texture =
                            await Assets.load<Texture>(
                                `/assets/png/default/tiles/tile_${tileNumber}.png`
                            )

                        tileTextures.set(
                            tileNumber,
                            texture
                        )
                    }
                )
            )

            const addTile = (
                tileNumber: number,
                x: number,
                y: number,
                zIndex = 0
            ) => {
                const texture =
                    tileTextures.get(
                        tileNumber
                    )

                if (!texture) {
                    return null
                }

                const sprite =
                    new Sprite(texture)

                sprite.position.set(
                    x,
                    y
                )

                sprite.width =
                    TILE_SIZE

                sprite.height =
                    TILE_SIZE

                sprite.zIndex =
                    zIndex

                app.stage.addChild(
                    sprite
                )

                return sprite
            }

            const addTileGrid = (
                tiles: number[][],
                startX: number,
                startY: number,
                zIndex = 2
            ) => {
                tiles.forEach(
                    (
                        row,
                        rowIndex
                    ) => {
                        row.forEach(
                            (
                                tile,
                                columnIndex
                            ) => {
                                addTile(
                                    tile,

                                    startX +
                                    columnIndex *
                                    TILE_SIZE,

                                    startY +
                                    rowIndex *
                                    TILE_SIZE,

                                    zIndex
                                )
                            }
                        )
                    }
                )
            }

            // Água oficial em toda a área do jogo.
            for (
                let y = 0;
                y < 720;
                y += TILE_SIZE
            ) {
                for (
                    let x = 0;
                    x < 1280;
                    x += TILE_SIZE
                ) {
                    addTile(
                        73,
                        x,
                        y,
                        0
                    )
                }
            }

            // Borda discreta da área jogável.
            const arenaBorder =
                new Graphics()
                    .rect(
                        40,
                        40,
                        1200,
                        640
                    )
                    .stroke({
                        width: 3,
                        color:
                            0xffffff,
                        alpha: 0.18,
                    })

            arenaBorder.zIndex = 20

            app.stage.addChild(
                arenaBorder
            )

            // =========================
            // ILHA SUPERIOR ESQUERDA
            // =========================

            addTileGrid(
                [
                    [1, 2, 3],
                    [17, 18, 19],
                    [33, 34, 35],
                ],
                250,
                125,
                2
            )

            addTile(
                71,
                300,
                160,
                4
            )

            addTile(
                70,
                380,
                245,
                4
            )

            // =========================
            // ILHA INFERIOR DIREITA
            // =========================

            addTileGrid(
                [
                    [6, 7, 8, 9],
                    [22, 23, 24, 25],
                    [38, 39, 40, 41],
                    [54, 55, 56, 57],
                ],
                735,
                360,
                2
            )

            addTile(
                50,
                790,
                420,
                4
            )

            addTile(
                72,
                915,
                500,
                4
            )

            // Decoração de praia removida daqui.
            // Os tiles 81 e 83 já possuem um quadrado de areia próprio,
            // então sobrepor esses tiles à ilha criava blocos visíveis.
            // A decoração naval abaixo usa sprites transparentes separados.

            const extraIslands: Island[] = []

            const addSmallIsland = (
                x: number,
                y: number
            ) => {
                addTileGrid(
                    [
                        [1, 2, 3],
                        [17, 18, 19],
                        [33, 34, 35],
                    ],
                    x,
                    y,
                    2
                )

                addTile(71, x + 48, y + 38, 4)

                extraIslands.push({
                    x: x + 96,
                    y: y + 96,
                    radius: 104,
                })
            }

            const addLargeIsland = (
                x: number,
                y: number
            ) => {
                addTileGrid(
                    [
                        [6, 7, 8, 9],
                        [22, 23, 24, 25],
                        [38, 39, 40, 41],
                        [54, 55, 56, 57],
                    ],
                    x,
                    y,
                    2
                )

                addTile(50, x + 55, y + 60, 4)
                addTile(72, x + 180, y + 140, 4)

                extraIslands.push({
                    x: x + 128,
                    y: y + 128,
                    radius: 132,
                })
            }

            switch (levelConfig.mapVariant) {
                case 2:
                    addSmallIsland(70, 450)
                    break

                case 3:
                    addSmallIsland(1000, 80)
                    break

                case 4:
                    addSmallIsland(70, 450)
                    addSmallIsland(1000, 80)
                    break

                case 5:
                    addSmallIsland(550, 60)
                    break

                case 6:
                    addLargeIsland(40, 410)
                    break

                case 7:
                    addLargeIsland(980, 60)
                    break

                case 8:
                    addSmallIsland(70, 450)
                    addSmallIsland(550, 60)
                    break

                case 9:
                    addSmallIsland(1000, 80)
                    addSmallIsland(500, 500)
                    break

                case 10:
                    addSmallIsland(70, 450)
                    addSmallIsland(550, 60)
                    addSmallIsland(1000, 80)
                    break

                default:
                    break
            }

            // Hitboxes simples e invisíveis das ilhas.
            const islands: Island[] = [
                {
                    x: 346,
                    y: 221,
                    radius: 102,
                },

                {
                    x: 863,
                    y: 488,
                    radius: 132,
                },

                ...extraIslands,
            ]



            const collidesWithIsland = (

                x: number,

                y: number,

                objectRadius: number

            ) => {

                for (const island of islands) {

                    const dx =

                        x - island.x



                    const dy =

                        y - island.y



                    const distance =

                        Math.sqrt(

                            dx * dx +

                            dy * dy

                        )



                    if (

                        distance <

                        island.radius +

                        objectRadius

                    ) {

                        return true

                    }

                }



                return false

            }

            const getSmartEnemyTarget = (
                enemyX: number,
                enemyY: number,
                playerX: number,
                playerY: number
            ) => {
                let targetX = playerX
                let targetY = playerY

                const toPlayerX = playerX - enemyX
                const toPlayerY = playerY - enemyY
                const playerDistance = Math.max(
                    1,
                    Math.hypot(toPlayerX, toPlayerY)
                )

                const dirX = toPlayerX / playerDistance
                const dirY = toPlayerY / playerDistance

                const lookAheadX = enemyX + dirX * 140
                const lookAheadY = enemyY + dirY * 140

                for (const island of islands) {
                    const awayX = enemyX - island.x
                    const awayY = enemyY - island.y
                    const distance = Math.max(
                        1,
                        Math.hypot(awayX, awayY)
                    )

                    const lookDistance = Math.hypot(
                        lookAheadX - island.x,
                        lookAheadY - island.y
                    )

                    const dangerRadius =
                        island.radius + 105

                    if (
                        distance < dangerRadius ||
                        lookDistance < island.radius + 60
                    ) {
                        const strength = Math.max(
                            0.25,
                            1 - distance / dangerRadius
                        )

                        const outwardX = awayX / distance
                        const outwardY = awayY / distance

                        const tangentA = {
                            x: -outwardY,
                            y: outwardX,
                        }

                        const tangentB = {
                            x: outwardY,
                            y: -outwardX,
                        }

                        const scoreA =
                            tangentA.x * dirX +
                            tangentA.y * dirY

                        const tangent =
                            scoreA >= 0
                                ? tangentA
                                : tangentB

                        targetX +=
                            outwardX * 340 * strength +
                            tangent.x * 410 * strength

                        targetY +=
                            outwardY * 340 * strength +
                            tangent.y * 410 * strength
                    }
                }

                const borderMargin = 125

                if (enemyX < borderMargin) {
                    targetX += 450
                }

                if (enemyX > 1280 - borderMargin) {
                    targetX -= 450
                }

                if (enemyY < borderMargin) {
                    targetY += 450
                }

                if (enemyY > 720 - borderMargin) {
                    targetY -= 450
                }

                return {
                    x: Math.max(
                        80,
                        Math.min(1200, targetX)
                    ),
                    y: Math.max(
                        80,
                        Math.min(640, targetY)
                    ),
                }
            }



            // =========================

            // ESTADO DA PARTIDA

            // =========================



            let score = 0

            let gameOver = false

            let isPaused = false



            const GAME_DURATION =

                duration



            let timeRemaining =

                GAME_DURATION



            // =========================
            // AUDIO
            // =========================

            const createAudio = (
                path: string,
                volume = 0.7,
                loop = false
            ) => {
                const audio = new Audio(path)
                audio.volume = volume
                audio.loop = loop
                audio.preload = 'auto'
                return audio
            }

            const sounds = {
                cannon: createAudio('/assets/sounds/cannon_fire_1.wav', 0.55),
                broadside: createAudio('/assets/sounds/cannon_broadside.wav', 0.6),
                hit: createAudio('/assets/sounds/ship_wood_hit_1.wav', 0.65),
                collision: createAudio('/assets/sounds/ship_collision.wav', 0.7),
                explosion: createAudio('/assets/sounds/ship_explosion_1.wav', 0.72),
                score: createAudio('/assets/sounds/score_point.wav', 0.55),
                pause: createAudio('/assets/sounds/game_pause.wav', 0.55),
                resume: createAudio('/assets/sounds/game_resume.wav', 0.55),
                complete: createAudio('/assets/sounds/game_complete.wav', 0.65),
                gameOver: createAudio('/assets/sounds/game_over.wav', 0.65),
                waterHit: createAudio('/assets/sounds/cannonball_water_hit_1.wav', 0.45),
                healthLow: createAudio('/assets/sounds/health_low.wav', 0.5),
                ocean: createAudio('/assets/sounds/ocean_ambience_loop.wav', 0.25, true),
                sailing: createAudio('/assets/sounds/ship_sailing_loop.wav', 0.2, true),
            }

            const playSound = (audio: HTMLAudioElement) => {
                try {
                    audio.currentTime = 0
                } catch {
                    // Ignore early seek errors.
                }

                void audio.play().catch(() => { })
            }

            const startAmbient = () => {
                void sounds.ocean.play().catch(() => { })
                void sounds.sailing.play().catch(() => { })
            }

            const unlockAudio = () => {
                startAmbient()
            }

            window.addEventListener('pointerdown', unlockAudio, { once: true })
            window.addEventListener('keydown', unlockAudio, { once: true })

            stopAudio = () => {
                window.removeEventListener('pointerdown', unlockAudio)
                window.removeEventListener('keydown', unlockAudio)

                Object.values(sounds).forEach((audio) => {
                    audio.pause()
                    try {
                        audio.currentTime = 0
                    } catch {
                        // Ignore cleanup seek errors.
                    }
                })
            }

            // =========================
            // HUD OFICIAL
            // =========================

            const [
                healthFrameTexture,
                healthGreenTexture,
                healthAmberTexture,
                healthRedTexture,
                heartTexture,
                scoreIconTexture,
                timeIconTexture,
                counterPanelTexture,
                enemyHealthFrameTexture,
                enemyHealthGreenTexture,
                explosion1Texture,
                explosion2Texture,
                explosion3Texture,
                fire1Texture,
                fire2Texture,
            ] = await Promise.all([
                Assets.load('/assets/png/default/ui/hud/health_frame.png'),
                Assets.load('/assets/png/default/ui/hud/health_fill_green.png'),
                Assets.load('/assets/png/default/ui/hud/health_fill_amber.png'),
                Assets.load('/assets/png/default/ui/hud/health_fill_red.png'),
                Assets.load('/assets/png/default/ui/hud/icon_heart.png'),
                Assets.load('/assets/png/default/ui/hud/icon_score.png'),
                Assets.load('/assets/png/default/ui/hud/icon_time.png'),
                Assets.load('/assets/png/default/ui/hud/counter_panel.png'),
                Assets.load('/assets/png/default/ui/hud/enemy_health_frame.png'),
                Assets.load('/assets/png/default/ui/hud/enemy_health_fill_green.png'),
                Assets.load('/assets/png/default/effects/explosion_1.png'),
                Assets.load('/assets/png/default/effects/explosion_2.png'),
                Assets.load('/assets/png/default/effects/explosion_3.png'),
                Assets.load('/assets/png/default/effects/fire_1.png'),
                Assets.load('/assets/png/default/effects/fire_2.png'),
            ])

            const heartIcon = new Sprite(heartTexture)
            heartIcon.position.set(35, 35)
            heartIcon.width = 42
            heartIcon.height = 42
            heartIcon.zIndex = 103

            const healthFill = new Sprite(healthGreenTexture)
            healthFill.position.set(92, 45)
            healthFill.width = 205
            healthFill.height = 24
            healthFill.zIndex = 101

            const healthFrame = new Sprite(healthFrameTexture)
            healthFrame.position.set(75, 30)
            healthFrame.width = 250
            healthFrame.height = 55
            healthFrame.zIndex = 102

            const healthText = new Text({
                text: '3 / 3',
                style: {
                    fill: 0xffffff,
                    fontSize: 18,
                    fontWeight: 'bold',
                    stroke: { color: 0x2a1609, width: 4 },
                },
            })
            healthText.anchor.set(0.5)
            healthText.position.set(195, 57)
            healthText.zIndex = 104

            const scorePanel = new Sprite(counterPanelTexture)
            scorePanel.position.set(915, 30)
            scorePanel.width = 145
            scorePanel.height = 54
            scorePanel.zIndex = 100

            const scoreIcon = new Sprite(scoreIconTexture)
            scoreIcon.position.set(932, 42)
            scoreIcon.width = 30
            scoreIcon.height = 30
            scoreIcon.zIndex = 102

            const scoreText = new Text({
                text: '0',
                style: {
                    fill: 0xffe29a,
                    fontSize: 22,
                    fontWeight: 'bold',
                    stroke: { color: 0x2a1609, width: 4 },
                },
            })
            scoreText.anchor.set(0.5)
            scoreText.position.set(1010, 57)
            scoreText.zIndex = 103

            const timePanel = new Sprite(counterPanelTexture)
            timePanel.position.set(1070, 30)
            timePanel.width = 165
            timePanel.height = 54
            timePanel.zIndex = 100

            const timeIcon = new Sprite(timeIconTexture)
            timeIcon.position.set(1088, 42)
            timeIcon.width = 30
            timeIcon.height = 30
            timeIcon.zIndex = 102

            const formatTime = (secondsTotal: number) => {
                const safeSeconds = Math.max(0, Math.ceil(secondsTotal))
                const minutes = Math.floor(safeSeconds / 60)
                const seconds = safeSeconds % 60
                return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
            }

            const timeText = new Text({
                text: formatTime(GAME_DURATION),
                style: {
                    fill: 0xffffff,
                    fontSize: 21,
                    fontWeight: 'bold',
                    stroke: { color: 0x2a1609, width: 4 },
                },
            })
            timeText.anchor.set(0.5)
            timeText.position.set(1170, 57)
            timeText.zIndex = 103

            const levelText = new Text({
                text: `LEVEL ${level}`,
                style: {
                    fill: 0xffe29a,
                    fontSize: 18,
                    fontWeight: 'bold',
                    stroke: {
                        color: 0x2a1609,
                        width: 4,
                    },
                },
            })

            levelText.anchor.set(0.5)
            levelText.position.set(640, 55)
            levelText.zIndex = 103

            const updateHealthHud = (hp: number) => {
                const clampedHp = Math.max(0, Math.min(3, hp))
                healthText.text = `${clampedHp} / 3`
                healthFill.width = 205 * (clampedHp / 3)

                if (clampedHp >= 3) {
                    healthFill.texture = healthGreenTexture
                } else if (clampedHp === 2) {
                    healthFill.texture = healthAmberTexture
                } else {
                    healthFill.texture = healthRedTexture
                }
            }

            app.stage.addChild(
                healthFill,
                healthFrame,
                heartIcon,
                healthText,
                scorePanel,
                scoreIcon,
                scoreText,
                timePanel,
                timeIcon,
                timeText,
                levelText
            )

            // =========================
            // EXPLOSÕES
            // =========================

            type ExplosionEffect = {
                sprite: Sprite
                elapsed: number
                delay: number
                duration: number
                baseScale: number
            }

            const explosions: ExplosionEffect[] = []
            const explosionTextures: Texture[] = [
                explosion1Texture,
                explosion2Texture,
                explosion3Texture,
            ]

            const spawnExplosion = (x: number, y: number) => {
                for (let burst = 0; burst < 3; burst++) {
                    const texture = explosionTextures[
                        Math.floor(Math.random() * explosionTextures.length)
                    ]
                    const sprite = new Sprite(texture)
                    const targetSize = 72 + Math.random() * 36

                    sprite.anchor.set(0.5)
                    sprite.position.set(
                        x + (Math.random() - 0.5) * 46,
                        y + (Math.random() - 0.5) * 46
                    )
                    sprite.rotation = Math.random() * Math.PI * 2
                    sprite.visible = burst === 0
                    sprite.zIndex = 50

                    explosions.push({
                        sprite,
                        elapsed: 0,
                        delay: burst * 0.12,
                        duration: 0.7 + Math.random() * 0.25,
                        baseScale:
                            targetSize /
                            Math.max(texture.width, texture.height),
                    })

                    app.stage.addChild(sprite)
                }

                playSound(sounds.explosion)
            }

            // =========================

            // JOGADOR

            // =========================



            const player =

                new PlayerShip()



            await player.init()



            if (destroyed) {

                player.destroy()

                return

            }



            playerRef.current = player



            player.sprite.zIndex = 10
            player.sprite.scale.set(1.22)



            app.stage.addChild(

                player.sprite

            )



            // =========================

            // PAUSE

            // =========================



            const pauseOverlay =

                new Graphics()

                    .rect(

                        0,

                        0,

                        1280,

                        720

                    )

                    .fill({

                        color: 0x000000,

                        alpha: 0.65,

                    })



            pauseOverlay.visible =

                false



            pauseOverlay.zIndex =

                1000



            const pauseText =

                new Text({

                    text:

                        'PAUSED\n\nPress P to resume',

                    style: {

                        fill: 0xffffff,

                        fontSize: 44,

                        fontWeight: 'bold',

                        align: 'center',

                    },

                })



            pauseText.anchor.set(0.5)



            pauseText.position.set(

                640,

                360

            )



            pauseText.visible = false



            pauseText.zIndex = 1001



            app.stage.addChild(

                pauseOverlay,

                pauseText

            )



            const setPaused = (

                paused: boolean

            ) => {

                if (gameOver) {

                    return

                }



                isPaused = paused



                pauseOverlay.visible =

                    paused



                pauseText.visible = false

                setPauseMenuVisible(paused)

                if (paused) {
                    playSound(sounds.pause)
                } else {
                    playSound(sounds.resume)
                }

                player.setInputEnabled(!paused)

            }



            // Faz o botão mobile usar

            // exatamente a mesma lógica.

            pauseToggleRef.current =

                () => {

                    setPaused(!isPaused)

                }



            const handlePauseKey = (

                event: KeyboardEvent

            ) => {

                if (

                    event.key.toLowerCase() !==

                    'p'

                ) {

                    return

                }



                if (gameOver) {

                    return

                }



                setPaused(!isPaused)

            }



            const handleBlur = () => {

                if (

                    !gameOver &&

                    !isPaused

                ) {

                    setPaused(true)

                }

            }



            const handleVisibility =

                () => {

                    if (

                        document.hidden &&

                        !gameOver

                    ) {

                        setPaused(true)

                    }

                }



            window.addEventListener(

                'keydown',

                handlePauseKey

            )



            window.addEventListener(

                'blur',

                handleBlur

            )



            document.addEventListener(

                'visibilitychange',

                handleVisibility

            )



            removeRuntimeListeners =

                () => {

                    window.removeEventListener(

                        'keydown',

                        handlePauseKey

                    )



                    window.removeEventListener(

                        'blur',

                        handleBlur

                    )



                    document.removeEventListener(

                        'visibilitychange',

                        handleVisibility

                    )

                }



            // =========================

            // GAME OVER

            // =========================



            const showGameOver = (

                reason:

                    | 'Destroyed'

                    | 'Time'

            ) => {

                if (gameOver) return



                gameOver = true

                isPaused = false

                const endSound =
                    (
                        reason === 'Destroyed'
                            ? sounds.gameOver
                            : sounds.complete
                    ).cloneNode(
                        true
                    ) as HTMLAudioElement

                endSound.volume =
                    reason === 'Destroyed'
                        ? 0.65
                        : 0.65

                playSound(
                    endSound
                )



                player.setInputEnabled(

                    false

                )



                pauseOverlay.visible =

                    false



                pauseText.visible =

                    false

                setPauseMenuVisible(false)



                const elapsedTime =

                    GAME_DURATION -

                    timeRemaining



                const result:

                    MatchResult = {

                    playerName,

                    score,



                    duration:

                        Math.ceil(

                            elapsedTime

                        ),



                    survived:

                        reason === 'Time',



                    endedBy: reason,



                    finishedAt:

                        new Date().toISOString(),

                }



                onGameOver(result)

            }



            // =========================

            // INIMIGOS

            // =========================



            const enemies:

                Enemy[] = []



            const destroyedEnemyTimers =

                new Map<

                    Enemy,

                    number

                >()

            const enemyFireEffects =
                new Map<Enemy, Sprite>()

            type EnemyHealthBar = {
                frame: Sprite
                fill: Sprite
            }

            const enemyHealthBars =
                new Map<Enemy, EnemyHealthBar>()

            const createEnemyHealthBar = (enemy: Enemy) => {
                const fill = new Sprite(enemyHealthGreenTexture)
                const frame = new Sprite(enemyHealthFrameTexture)

                fill.anchor.set(0, 0.5)
                frame.anchor.set(0, 0.5)
                fill.width = 84
                fill.height = 21
                frame.width = 84
                frame.height = 21
                fill.zIndex = 26
                frame.zIndex = 25

                enemyHealthBars.set(enemy, { frame, fill })
                app.stage.addChild(fill, frame)
            }

            const updateEnemyHealthBar = (enemy: Enemy) => {
                const healthBar = enemyHealthBars.get(enemy)

                if (!healthBar) {
                    return
                }

                const hp = enemy.getHp()
                const ratio = Math.max(
                    0,
                    Math.min(1, hp / enemy.getMaxHp())
                )
                const x = enemy.sprite.x - 42
                const y = enemy.sprite.y - 76

                healthBar.fill.texture = enemyHealthGreenTexture

                if (ratio > 0.67) {
                    healthBar.fill.tint = 0x22ff44
                } else if (ratio > 0.34) {
                    healthBar.fill.tint = 0xffcc22
                } else {
                    healthBar.fill.tint = 0xff3333
                }

                healthBar.fill.position.set(x, y)
                healthBar.fill.width = 84 * ratio
                healthBar.fill.height = 21

                healthBar.frame.position.set(x, y)

                healthBar.fill.visible = hp > 0 && ratio > 0
                healthBar.frame.visible = hp > 0
            }

            const removeEnemyHealthBar = (enemy: Enemy) => {
                const healthBar = enemyHealthBars.get(enemy)

                if (!healthBar) {
                    return
                }

                healthBar.fill.destroy()
                healthBar.frame.destroy()
                enemyHealthBars.delete(enemy)
            }

            const styleEnemyShip = (enemy: Enemy) => {
                enemy.sprite.scale.set(
                    enemy instanceof ShooterShip
                        ? 1.1
                        : 1.06
                )
                enemy.sprite.tint = 0xffffff
                enemy.sprite.alpha = 1
            }

            const markEnemyDamaged = (enemy: Enemy) => {
                if (
                    !enemy.active ||
                    enemyFireEffects.has(enemy)
                ) {
                    return
                }

                const fire =
                    new Sprite(fire1Texture)

                fire.anchor.set(0.5)
                fire.scale.set(0.72)
                fire.position.set(
                    enemy.sprite.x,
                    enemy.sprite.y
                )
                fire.zIndex = 22

                enemyFireEffects.set(
                    enemy,
                    fire
                )

                app.stage.addChild(fire)
            }



            const MAX_ENEMIES =
                levelConfig.maxEnemies

            const chaserVariants: ShipVariant[] = [2, 4, 6]
            const shooterVariants: ShipVariant[] = [3, 5]

            const pickShipVariant = (variants: ShipVariant[]) =>
                variants[Math.floor(Math.random() * variants.length)]



            let spawnTimer = 0



            let spawningEnemies = 0



            const spawnPoints = [
                { x: 100, y: 100 },
                { x: 320, y: 90 },
                { x: 540, y: 90 },
                { x: 740, y: 90 },
                { x: 960, y: 90 },
                { x: 1180, y: 100 },
                { x: 100, y: 620 },
                { x: 320, y: 630 },
                { x: 540, y: 630 },
                { x: 740, y: 630 },
                { x: 960, y: 630 },
                { x: 1180, y: 620 },
                { x: 90, y: 250 },
                { x: 90, y: 470 },
                { x: 1190, y: 250 },
                { x: 1190, y: 470 },
            ]

            const reservedSpawnPoints = new Set<string>()

            const getSpawnKey = (spawn: { x: number; y: number }) =>
                `${spawn.x}:${spawn.y}`



            const getRandomSpawn =

                () => {

                    const availableSpawnPoints =
                        spawnPoints.filter(
                            (spawn) => {
                                if (
                                    reservedSpawnPoints.has(
                                        getSpawnKey(spawn)
                                    ) ||
                                    collidesWithIsland(
                                        spawn.x,
                                        spawn.y,
                                        54
                                    ) ||
                                    Math.hypot(
                                        spawn.x - player.sprite.x,
                                        spawn.y - player.sprite.y
                                    ) < 220
                                ) {
                                    return false
                                }

                                return enemies.every(
                                    (enemy) =>
                                        !enemy.active ||
                                        Math.hypot(
                                            spawn.x - enemy.sprite.x,
                                            spawn.y - enemy.sprite.y
                                        ) >= 150
                                )
                            }
                        )

                    if (availableSpawnPoints.length === 0) {
                        return null
                    }

                    const spawn = availableSpawnPoints[
                        Math.floor(
                            Math.random() *
                            availableSpawnPoints.length
                        )
                    ]

                    reservedSpawnPoints.add(getSpawnKey(spawn))

                    return spawn
                }



            const spawnChaser =

                async () => {

                    spawningEnemies++



                    const spawn =

                        getRandomSpawn()

                    if (!spawn) {
                        spawningEnemies--
                        return
                    }



                    const enemy =

                        new EnemyShip()



                    await enemy.init(

                        spawn.x,

                        spawn.y,

                        pickShipVariant(chaserVariants)

                    )

                    reservedSpawnPoints.delete(
                        getSpawnKey(spawn)
                    )



                    spawningEnemies--



                    if (destroyed) {

                        enemy.destroy()

                        return

                    }



                    enemy.sprite.zIndex =

                        10

                    styleEnemyShip(enemy)



                    enemies.push(enemy)



                    app.stage.addChild(

                        enemy.sprite

                    )

                    createEnemyHealthBar(enemy)
                    updateEnemyHealthBar(enemy)

                }



            const spawnShooter =

                async () => {

                    spawningEnemies++



                    const spawn =

                        getRandomSpawn()

                    if (!spawn) {
                        spawningEnemies--
                        return
                    }



                    const enemy =

                        new ShooterShip()



                    await enemy.init(

                        spawn.x,

                        spawn.y,

                        pickShipVariant(shooterVariants)

                    )

                    reservedSpawnPoints.delete(
                        getSpawnKey(spawn)
                    )



                    spawningEnemies--



                    if (destroyed) {

                        enemy.destroy()

                        return

                    }



                    enemy.sprite.zIndex =

                        10

                    styleEnemyShip(enemy)



                    enemies.push(enemy)



                    app.stage.addChild(

                        enemy.sprite

                    )

                    createEnemyHealthBar(enemy)
                    updateEnemyHealthBar(enemy)

                }



            for (
                let initialIndex = 0;
                initialIndex < levelConfig.initialEnemies;
                initialIndex++
            ) {
                if (
                    Math.random() <
                    levelConfig.chaserChance
                ) {
                    await spawnChaser()
                } else {
                    await spawnShooter()
                }
            }



            // =========================

            // PROJÉTEIS

            // =========================



            const projectiles:

                Projectile[] = []



            const enemyProjectiles:

                Projectile[] = []



            const createPlayerProjectile =

                (

                    x: number,

                    y: number,

                    direction: number

                ) => {

                    const projectile =

                        new Projectile()



                    projectile

                        .init(

                            x,

                            y,

                            direction

                        )

                        .then(() => {

                            if (destroyed) {

                                projectile.destroy()

                                return

                            }



                            projectile.sprite.zIndex =

                                20



                            projectiles.push(

                                projectile

                            )



                            app.stage.addChild(

                                projectile.sprite

                            )

                        })

                }



            const createEnemyProjectile =

                (

                    x: number,

                    y: number,

                    targetX: number,

                    targetY: number

                ) => {

                    const dx =

                        targetX - x



                    const dy =

                        targetY - y



                    const direction =

                        Math.atan2(

                            -dx,

                            dy

                        )



                    const projectile =

                        new Projectile()



                    projectile

                        .init(

                            x,

                            y,

                            direction

                        )

                        .then(() => {

                            if (destroyed) {

                                projectile.destroy()

                                return

                            }



                            projectile.sprite.zIndex =

                                20



                            enemyProjectiles.push(

                                projectile

                            )



                            app.stage.addChild(

                                projectile.sprite

                            )

                        })

                }



            // =========================

            // GAME LOOP

            // =========================



            app.ticker.add(

                (ticker) => {

                    const deltaSeconds =

                        ticker.deltaMS /

                        1000



                    if (

                        gameOver ||

                        isPaused

                    ) {

                        return

                    }



                    // =====================

                    // TIMER

                    // =====================



                    timeRemaining -=

                        deltaSeconds



                    if (

                        timeRemaining < 0

                    ) {

                        timeRemaining = 0

                    }



                    timeText.text = formatTime(timeRemaining)



                    if (

                        timeRemaining <= 0

                    ) {

                        showGameOver(

                            'Time'

                        )



                        return

                    }



                    // =====================

                    // JOGADOR

                    // =====================



                    const previousPlayerX =

                        player.sprite.x



                    const previousPlayerY =

                        player.sprite.y



                    player.update(

                        deltaSeconds

                    )



                    if (

                        collidesWithIsland(

                            player.sprite.x,

                            player.sprite.y,

                            54

                        )

                    ) {

                        player.sprite.position.set(

                            previousPlayerX,

                            previousPlayerY

                        )

                    }



                    // =====================

                    // SPAWN

                    // =====================



                    spawnTimer -=

                        deltaSeconds



                    if (

                        spawnTimer <= 0 &&

                        enemies.length +

                        spawningEnemies <

                        MAX_ENEMIES

                    ) {

                        if (

                            Math.random() <
                            levelConfig.chaserChance

                        ) {

                            spawnChaser()

                        } else {

                            spawnShooter()

                        }



                        spawnTimer =
                            levelConfig.spawnInterval

                    }



                    // =====================

                    // INIMIGOS

                    // =====================



                    for (

                        const enemy of enemies

                    ) {

                        if (!enemy.active) {

                            continue

                        }



                        const previousEnemyX =

                            enemy.sprite.x



                        const previousEnemyY =

                            enemy.sprite.y



                        const smartTarget =
                            getSmartEnemyTarget(
                                enemy.sprite.x,
                                enemy.sprite.y,
                                player.sprite.x,
                                player.sprite.y
                            )

                        enemy.update(
                            deltaSeconds,
                            smartTarget.x,
                            smartTarget.y
                        )

                        enemy.sprite.x = Math.max(
                            55,
                            Math.min(1225, enemy.sprite.x)
                        )

                        enemy.sprite.y = Math.max(
                            55,
                            Math.min(665, enemy.sprite.y)
                        )

                        const intendedEnemyX = enemy.sprite.x
                        const intendedEnemyY = enemy.sprite.y

                        if (
                            collidesWithIsland(
                                intendedEnemyX,
                                intendedEnemyY,
                                52
                            )
                        ) {
                            const canSlideHorizontally =
                                !collidesWithIsland(
                                    intendedEnemyX,
                                    previousEnemyY,
                                    52
                                )
                            const canSlideVertically =
                                !collidesWithIsland(
                                    previousEnemyX,
                                    intendedEnemyY,
                                    52
                                )

                            if (canSlideHorizontally) {
                                enemy.sprite.position.set(
                                    intendedEnemyX,
                                    previousEnemyY
                                )
                            } else if (canSlideVertically) {
                                enemy.sprite.position.set(
                                    previousEnemyX,
                                    intendedEnemyY
                                )
                            } else {
                                enemy.sprite.position.set(
                                    previousEnemyX,
                                    previousEnemyY
                                )
                            }
                        }

                        for (const other of enemies) {
                            if (other === enemy || !other.active) {
                                continue
                            }

                            const separationX =
                                enemy.sprite.x - other.sprite.x
                            const separationY =
                                enemy.sprite.y - other.sprite.y
                            const separationDistance = Math.hypot(
                                separationX,
                                separationY
                            )
                            const minimumDistance = 92

                            if (
                                separationDistance === 0 ||
                                separationDistance >= minimumDistance
                            ) {
                                continue
                            }

                            const push =
                                (minimumDistance - separationDistance) * 0.5
                            const candidateX =
                                enemy.sprite.x +
                                (separationX / separationDistance) * push
                            const candidateY =
                                enemy.sprite.y +
                                (separationY / separationDistance) * push

                            if (
                                !collidesWithIsland(
                                    candidateX,
                                    candidateY,
                                    52
                                )
                            ) {
                                enemy.sprite.position.set(
                                    candidateX,
                                    candidateY
                                )
                            }
                        }

                        updateEnemyHealthBar(enemy)



                        // ===================

                        // SHOOTER

                        // ===================



                        if (

                            enemy instanceof

                            ShooterShip &&

                            enemy.consumeShootRequest()

                        ) {

                            createEnemyProjectile(

                                enemy.sprite.x,

                                enemy.sprite.y,

                                player.sprite.x,

                                player.sprite.y

                            )

                        }



                        // ===================

                        // CHASER

                        // ===================



                        if (

                            enemy instanceof

                            EnemyShip &&

                            enemy.active

                        ) {

                            const dx =

                                player.sprite.x -

                                enemy.sprite.x



                            const dy =

                                player.sprite.y -

                                enemy.sprite.y



                            const distance =

                                Math.sqrt(

                                    dx * dx +

                                    dy * dy

                                )



                            if (

                                distance < 48

                            ) {

                                const damaged =

                                    player.takeDamage()



                                if (damaged) {

                                    updateHealthHud(player.getHp())
                                    playSound(sounds.hit)
                                    if (player.getHp() === 1) {
                                        playSound(sounds.healthLow)
                                    }

                                }



                                // Chaser se destrói

                                // ao colidir.

                                enemy.takeDamage()

                                enemy.takeDamage()

                                enemy.takeDamage()

                                updateEnemyHealthBar(enemy)



                                destroyedEnemyTimers.set(

                                    enemy,

                                    0.5

                                )



                                if (

                                    !player.active

                                ) {

                                    showGameOver(

                                        'Destroyed'

                                    )



                                    return

                                }

                            }

                        }

                    }



                    // =====================

                    // ATAQUES DO JOGADOR

                    // =====================



                    const attack =

                        player.consumeAttackRequest()



                    if (

                        attack === 'front'

                    ) {

                        playSound(sounds.cannon)

                        createPlayerProjectile(

                            player.sprite.x,

                            player.sprite.y,

                            player.sprite.rotation

                        )

                    }



                    if (

                        attack === 'left' ||

                        attack === 'right'

                    ) {

                        playSound(sounds.broadside)

                        const side =

                            attack === 'left'

                                ? -1

                                : 1



                        const direction =

                            player.sprite.rotation +

                            side *

                            (Math.PI / 2)



                        const forwardX =

                            -Math.sin(

                                player.sprite.rotation

                            )



                        const forwardY =

                            Math.cos(

                                player.sprite.rotation

                            )



                        const offsets = [

                            -30,

                            0,

                            30,

                        ]



                        for (

                            const offset of offsets

                        ) {

                            createPlayerProjectile(

                                player.sprite.x +

                                forwardX *

                                offset,



                                player.sprite.y +

                                forwardY *

                                offset,



                                direction

                            )

                        }

                    }



                    // =====================

                    // TIROS DO JOGADOR

                    // =====================



                    for (

                        let i =

                            projectiles.length -

                            1;

                        i >= 0;

                        i--

                    ) {

                        const projectile =

                            projectiles[i]



                        projectile.update(

                            deltaSeconds

                        )



                        if (

                            projectile.active &&

                            collidesWithIsland(

                                projectile.sprite.x,

                                projectile.sprite.y,

                                5

                            )

                        ) {

                            projectile.active =

                                false

                        }



                        for (

                            const enemy of enemies

                        ) {

                            if (

                                !projectile.active ||

                                !enemy.active

                            ) {

                                continue

                            }



                            const dx =

                                projectile.sprite.x -

                                enemy.sprite.x



                            const dy =

                                projectile.sprite.y -

                                enemy.sprite.y



                            const distance =

                                Math.sqrt(

                                    dx * dx +

                                    dy * dy

                                )



                            if (

                                distance < 40

                            ) {

                                const wasAlive =

                                    enemy.active



                                enemy.takeDamage()

                                updateEnemyHealthBar(enemy)



                                projectile.active =

                                    false

                                if (enemy.active) {
                                    markEnemyDamaged(enemy)
                                }



                                if (

                                    wasAlive &&

                                    !enemy.active

                                ) {

                                    score += 1



                                    scoreText.text = `${score}`
                                    playSound(sounds.score)
                                    spawnExplosion(enemy.sprite.x, enemy.sprite.y)



                                    destroyedEnemyTimers.set(

                                        enemy,

                                        1

                                    )

                                }



                                break

                            }

                        }



                        if (

                            !projectile.active

                        ) {

                            projectile.destroy()



                            projectiles.splice(

                                i,

                                1

                            )

                        }

                    }



                    // =====================

                    // TIROS DOS SHOOTERS

                    // =====================



                    for (

                        let i =

                            enemyProjectiles.length -

                            1;

                        i >= 0;

                        i--

                    ) {

                        const projectile =

                            enemyProjectiles[i]



                        projectile.update(

                            deltaSeconds

                        )



                        if (

                            projectile.active &&

                            collidesWithIsland(

                                projectile.sprite.x,

                                projectile.sprite.y,

                                5

                            )

                        ) {

                            projectile.active =

                                false

                        }



                        if (

                            projectile.active &&

                            player.active

                        ) {

                            const dx =

                                projectile.sprite.x -

                                player.sprite.x



                            const dy =

                                projectile.sprite.y -

                                player.sprite.y



                            const distance =

                                Math.sqrt(

                                    dx * dx +

                                    dy * dy

                                )



                            if (

                                distance < 35

                            ) {

                                const damaged =

                                    player.takeDamage()



                                projectile.active =

                                    false



                                if (damaged) {

                                    updateHealthHud(player.getHp())
                                    playSound(sounds.hit)
                                    if (player.getHp() === 1) {
                                        playSound(sounds.healthLow)
                                    }



                                    if (

                                        !player.active

                                    ) {

                                        showGameOver(

                                            'Destroyed'

                                        )



                                        return

                                    }

                                }

                            }

                        }



                        if (

                            !projectile.active

                        ) {

                            projectile.destroy()



                            enemyProjectiles.splice(

                                i,

                                1

                            )

                        }

                    }



                    for (let i = explosions.length - 1; i >= 0; i--) {
                        const explosion = explosions[i]
                        explosion.elapsed += deltaSeconds

                        const activeTime =
                            explosion.elapsed - explosion.delay

                        if (activeTime < 0) {
                            continue
                        }

                        const progress = Math.min(
                            1,
                            activeTime / explosion.duration
                        )
                        const pulse = Math.sin(progress * Math.PI)
                        const scale =
                            explosion.baseScale *
                            (0.55 + pulse * 0.85)

                        explosion.sprite.visible = true
                        explosion.sprite.scale.set(scale)
                        explosion.sprite.alpha = 1 - progress
                        explosion.sprite.rotation +=
                            deltaSeconds * 0.45

                        if (progress >= 1) {
                            explosion.sprite.destroy()
                            explosions.splice(i, 1)
                        }
                    }

                    for (const [enemy, fire] of enemyFireEffects) {
                        if (!enemy.active) {
                            fire.destroy()
                            enemyFireEffects.delete(enemy)
                            continue
                        }

                        fire.texture =
                            Math.floor(
                                performance.now() / 120
                            ) %
                                2 ===
                                0
                                ? fire1Texture
                                : fire2Texture

                        fire.position.set(
                            enemy.sprite.x,
                            enemy.sprite.y
                        )
                        fire.rotation =
                            enemy.sprite.rotation
                        fire.alpha =
                            0.72 +
                            Math.sin(
                                performance.now() / 90
                            ) *
                            0.16
                    }



                    // =====================

                    // DESPAWN

                    // =====================



                    for (

                        let i =

                            enemies.length - 1;

                        i >= 0;

                        i--

                    ) {

                        const enemy =

                            enemies[i]



                        if (enemy.active) {

                            continue

                        }



                        const timer =

                            destroyedEnemyTimers.get(

                                enemy

                            )



                        if (

                            timer === undefined

                        ) {

                            continue

                        }



                        const newTimer =

                            timer -

                            deltaSeconds



                        destroyedEnemyTimers.set(

                            enemy,

                            newTimer

                        )



                        if (

                            newTimer <= 0

                        ) {

                            destroyedEnemyTimers.delete(

                                enemy

                            )

                            const fire =
                                enemyFireEffects.get(
                                    enemy
                                )

                            if (fire) {
                                fire.destroy()
                                enemyFireEffects.delete(
                                    enemy
                                )
                            }

                            removeEnemyHealthBar(enemy)


                            enemy.destroy()



                            enemies.splice(

                                i,

                                1

                            )

                        }

                    }

                }

            )

        }



        startGame()



        return () => {

            destroyed = true



            playerRef.current = null



            pauseToggleRef.current =

                null



            removeRuntimeListeners()

            stopAudio()



            if (app.renderer) {

                app.destroy(true)

            }

        }

    }, [

        duration,

        level,

        onGameOver,

        onMainMenu,

        playerName,

    ])



    return (

        <div

            className="game-canvas-wrapper"

            onContextMenu={(event) =>

                event.preventDefault()

            }

        >

            <div ref={containerRef} />

            {pauseMenuVisible && (
                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        zIndex: 9000,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background:
                            'rgba(2, 12, 18, 0.56)',
                    }}
                >
                    <div
                        className="pirate-panel"
                        style={{
                            width: 'min(540px, 88vw)',
                            height: 'auto',
                            minHeight: 0,
                            padding: '88px 72px 72px',
                        }}
                    >
                        <h1 className="pirate-heading">
                            PAUSED
                        </h1>

                        <p className="pirate-hint">
                            Level {level}
                        </p>

                        <button
                            className="pirate-button pirate-button-primary"
                            onClick={() =>
                                pauseToggleRef.current?.()
                            }
                        >
                            RESUME
                        </button>

                        <button
                            className="pirate-button pirate-button-primary"
                            onClick={() => {
                                setPauseMenuVisible(false)
                                onMainMenu()
                            }}
                        >
                            MAIN MENU
                        </button>
                    </div>
                </div>
            )}



            <div

                className="touch-controls"

                aria-label="Touch game controls"

            >

                <div className="touch-movement">

                    <button

                        className="touch-button touch-up"

                        aria-label="Move forward"

                        onPointerDown={() =>

                            playerRef.current?.setMovementControl(

                                'forward',

                                true

                            )

                        }

                        onPointerUp={() =>

                            playerRef.current?.setMovementControl(

                                'forward',

                                false

                            )

                        }

                        onPointerCancel={() =>

                            playerRef.current?.setMovementControl(

                                'forward',

                                false

                            )

                        }

                        onPointerLeave={() =>

                            playerRef.current?.setMovementControl(

                                'forward',

                                false

                            )

                        }

                    >

                        <img
                            src="/assets/png/default/ui/controls/icon_forward.png"
                            alt=""
                        />

                    </button>



                    <button

                        className="touch-button touch-left"

                        aria-label="Turn left"

                        onPointerDown={() =>

                            playerRef.current?.setMovementControl(

                                'left',

                                true

                            )

                        }

                        onPointerUp={() =>

                            playerRef.current?.setMovementControl(

                                'left',

                                false

                            )

                        }

                        onPointerCancel={() =>

                            playerRef.current?.setMovementControl(

                                'left',

                                false

                            )

                        }

                        onPointerLeave={() =>

                            playerRef.current?.setMovementControl(

                                'left',

                                false

                            )

                        }

                    >

                        <img
                            src="/assets/png/default/ui/controls/icon_turn_left.png"
                            alt=""
                        />

                    </button>



                    <button

                        className="touch-button touch-down"

                        aria-label="Move backward"

                        onPointerDown={() =>

                            playerRef.current?.setMovementControl(

                                'backward',

                                true

                            )

                        }

                        onPointerUp={() =>

                            playerRef.current?.setMovementControl(

                                'backward',

                                false

                            )

                        }

                        onPointerCancel={() =>

                            playerRef.current?.setMovementControl(

                                'backward',

                                false

                            )

                        }

                        onPointerLeave={() =>

                            playerRef.current?.setMovementControl(

                                'backward',

                                false

                            )

                        }

                    >

                        <span className="touch-reverse">▼</span>

                    </button>



                    <button

                        className="touch-button touch-right"

                        aria-label="Turn right"

                        onPointerDown={() =>

                            playerRef.current?.setMovementControl(

                                'right',

                                true

                            )

                        }

                        onPointerUp={() =>

                            playerRef.current?.setMovementControl(

                                'right',

                                false

                            )

                        }

                        onPointerCancel={() =>

                            playerRef.current?.setMovementControl(

                                'right',

                                false

                            )

                        }

                        onPointerLeave={() =>

                            playerRef.current?.setMovementControl(

                                'right',

                                false

                            )

                        }

                    >

                        <img
                            src="/assets/png/default/ui/controls/icon_turn_right.png"
                            alt=""
                        />

                    </button>

                </div>



                <div className="touch-actions">

                    <button

                        className="touch-button"

                        aria-label="Left broadside"

                        onPointerDown={() =>

                            playerRef.current?.requestAttack(

                                'left'

                            )

                        }

                    >

                        <img
                            src="/assets/png/default/ui/controls/icon_fire_left.png"
                            alt=""
                        />

                    </button>



                    <button

                        className="touch-button touch-fire"

                        aria-label="Fire front cannon"

                        onPointerDown={() =>

                            playerRef.current?.requestAttack(

                                'front'

                            )

                        }

                    >

                        <img
                            src="/assets/png/default/ui/controls/icon_fire_front.png"
                            alt=""
                        />

                    </button>



                    <button

                        className="touch-button"

                        aria-label="Right broadside"

                        onPointerDown={() =>

                            playerRef.current?.requestAttack(

                                'right'

                            )

                        }

                    >

                        <img
                            src="/assets/png/default/ui/controls/icon_fire_right.png"
                            alt=""
                        />

                    </button>



                    <button

                        className="touch-button touch-pause"

                        aria-label="Pause game"

                        onClick={() =>

                            pauseToggleRef.current?.()

                        }

                    >

                        <img
                            src="/assets/png/default/ui/controls/icon_pause.png"
                            alt=""
                        />

                    </button>

                </div>

            </div>

        </div>

    )

}
