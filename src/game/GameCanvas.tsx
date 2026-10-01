import { useEffect, useRef } from 'react'
import {
    Application,
    Graphics,
    Text,
} from 'pixi.js'

import { PlayerShip } from './PlayerShip'
import { Projectile } from './Projectile'
import { EnemyShip } from './EnemyShip'
import { ShooterShip } from './ShooterShip'
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
    onGameOver: (
        result: MatchResult
    ) => void
}
export function GameCanvas({
    playerName,
    duration,
    onGameOver,
}: GameCanvasProps) {
    const containerRef =
        useRef<HTMLDivElement>(null)

    useEffect(() => {
        const app = new Application()

        let destroyed = false

        // Essa função será preenchida depois que
        // os listeners de pause forem criados.
        let removeRuntimeListeners = () => { }

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

            if (!containerRef.current) return

            containerRef.current.appendChild(
                app.canvas
            )

            // Permite controlar a ordem visual
            // através do zIndex.
            app.stage.sortableChildren = true

            // =========================
            // ARENA
            // =========================

            const arena = new Graphics()
                .rect(40, 40, 1200, 640)
                .fill(0x167d9a)
                .stroke({
                    width: 4,
                    color: 0xffffff,
                    alpha: 0.4,
                })

            arena.zIndex = 0

            app.stage.addChild(arena)

            // =========================
            // ILHAS
            // =========================

            const islands: Island[] = [
                {
                    x: 390,
                    y: 250,
                    radius: 72,
                },
                {
                    x: 850,
                    y: 470,
                    radius: 85,
                },
            ]

            for (const island of islands) {
                const islandGraphic =
                    new Graphics()
                        .circle(
                            island.x,
                            island.y,
                            island.radius
                        )
                        .fill(0x8b6f47)
                        .stroke({
                            width: 8,
                            color: 0xd7b56d,
                        })

                islandGraphic.zIndex = 2

                const vegetation =
                    new Graphics()
                        .circle(
                            island.x - 10,
                            island.y - 5,
                            island.radius * 0.65
                        )
                        .fill(0x3d7a48)

                vegetation.zIndex = 3

                app.stage.addChild(
                    islandGraphic,
                    vegetation
                )
            }

            // Verifica colisão circular
            // contra qualquer ilha.
            const collidesWithIsland = (
                x: number,
                y: number,
                objectRadius: number
            ) => {
                for (const island of islands) {
                    const dx = x - island.x
                    const dy = y - island.y

                    const distance = Math.sqrt(
                        dx * dx + dy * dy
                    )

                    if (
                        distance <
                        island.radius + objectRadius
                    ) {
                        return true
                    }
                }

                return false
            }

            // =========================
            // ESTADO DA PARTIDA
            // =========================

            let score = 0
            let gameOver = false
            let isPaused = false

            const GAME_DURATION = duration

            let timeRemaining =
                GAME_DURATION

            // =========================
            // HUD
            // =========================

            const scoreText = new Text({
                text: 'Score: 0',
                style: {
                    fill: 0xffffff,
                    fontSize: 24,
                    fontWeight: 'bold',
                },
            })

            scoreText.position.set(
                60,
                55
            )

            scoreText.zIndex = 100

            const timeText = new Text({
                text: `Time: ${GAME_DURATION}`,
                style: {
                    fill: 0xffffff,
                    fontSize: 24,
                    fontWeight: 'bold',
                },
            })

            timeText.position.set(
                550,
                55
            )

            timeText.zIndex = 100

            const hpText = new Text({
                text: 'HP: 3 / 3',
                style: {
                    fill: 0xffffff,
                    fontSize: 24,
                    fontWeight: 'bold',
                },
            })

            hpText.position.set(
                1080,
                55
            )

            hpText.zIndex = 100

            const controlsText =
                new Text({
                    text:
                        'WASD / Arrows: Move   Space: Front   Q/E: Broadside   P: Pause',
                    style: {
                        fill: 0xffffff,
                        fontSize: 16,
                    },
                })

            controlsText.position.set(
                310,
                650
            )

            controlsText.zIndex = 100

            app.stage.addChild(
                scoreText,
                timeText,
                hpText,
                controlsText
            )

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

            player.sprite.zIndex = 10

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

            pauseOverlay.visible = false
            pauseOverlay.zIndex = 1000

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
                if (gameOver) return

                isPaused = paused

                pauseOverlay.visible =
                    paused

                pauseText.visible =
                    paused

                player.setInputEnabled(
                    !paused
                )
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

                if (gameOver) return

                setPaused(!isPaused)
            }

            // Se sair da janela,
            // pausa automaticamente.
            const handleBlur = () => {
                if (
                    !gameOver &&
                    !isPaused
                ) {
                    setPaused(true)
                }
            }

            // Também cobre troca de aba.
            const handleVisibility = () => {
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

            // Agora o cleanup consegue
            // chamar esta função.
            removeRuntimeListeners = () => {
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
                reason: 'Destroyed' | 'Time'
            ) => {
                if (gameOver) return

                gameOver = true
                isPaused = false

                player.setInputEnabled(false)

                pauseOverlay.visible = false
                pauseText.visible = false

                const elapsedTime =
                    GAME_DURATION -
                    timeRemaining

                const result: MatchResult = {
                    playerName,
                    score,

                    duration:
                        Math.ceil(elapsedTime),

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

            const enemies: Enemy[] = []

            const destroyedEnemyTimers =
                new Map<Enemy, number>()

            const MAX_ENEMIES = 4

            let spawnTimer = 0
            let spawningEnemies = 0

            const spawnPoints = [
                {
                    x: 130,
                    y: 130,
                },
                {
                    x: 1150,
                    y: 130,
                },
                {
                    x: 130,
                    y: 590,
                },
                {
                    x: 1150,
                    y: 590,
                },
            ]

            const getRandomSpawn = () => {
                return spawnPoints[
                    Math.floor(
                        Math.random() *
                        spawnPoints.length
                    )
                ]
            }

            const spawnChaser =
                async () => {
                    spawningEnemies++

                    const spawn =
                        getRandomSpawn()

                    const enemy =
                        new EnemyShip()

                    await enemy.init(
                        spawn.x,
                        spawn.y
                    )

                    spawningEnemies--

                    if (destroyed) {
                        enemy.destroy()
                        return
                    }

                    enemy.sprite.zIndex = 10

                    enemies.push(enemy)

                    app.stage.addChild(
                        enemy.sprite
                    )
                }

            const spawnShooter =
                async () => {
                    spawningEnemies++

                    const spawn =
                        getRandomSpawn()

                    const enemy =
                        new ShooterShip()

                    await enemy.init(
                        spawn.x,
                        spawn.y
                    )

                    spawningEnemies--

                    if (destroyed) {
                        enemy.destroy()
                        return
                    }

                    enemy.sprite.zIndex = 10

                    enemies.push(enemy)

                    app.stage.addChild(
                        enemy.sprite
                    )
                }

            // Começamos com os dois
            // tipos de inimigo.
            await spawnChaser()
            await spawnShooter()

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

                    // Pausa significa:
                    // nenhuma simulação avança.
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

                    timeText.text =
                        `Time: ${Math.ceil(
                            timeRemaining
                        )}`

                    if (
                        timeRemaining <= 0
                    ) {
                        showGameOver('Time')
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

                    // Se entrou numa ilha,
                    // volta para a posição anterior.
                    if (
                        collidesWithIsland(
                            player.sprite.x,
                            player.sprite.y,
                            32
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
                            0.5
                        ) {
                            spawnChaser()
                        } else {
                            spawnShooter()
                        }

                        spawnTimer = 2
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

                        enemy.update(
                            deltaSeconds,
                            player.sprite.x,
                            player.sprite.y
                        )

                        // Inimigos também
                        // não atravessam ilhas.
                        if (
                            collidesWithIsland(
                                enemy.sprite.x,
                                enemy.sprite.y,
                                30
                            )
                        ) {
                            enemy.sprite.position.set(
                                previousEnemyX,
                                previousEnemyY
                            )
                        }

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
                                    hpText.text =
                                        `HP: ${player.getHp()} / 3`
                                }

                                // O Chaser se destrói
                                // quando bate no jogador.
                                //
                                // Não soma score.
                                enemy.takeDamage()
                                enemy.takeDamage()
                                enemy.takeDamage()

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
                        const side =
                            attack === 'left'
                                ? 1
                                : -1

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

                        // Ilha bloqueia
                        // projétil do jogador.
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

                        // Colisão contra inimigos.
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

                                projectile.active =
                                    false

                                if (
                                    wasAlive &&
                                    !enemy.active
                                ) {
                                    // Um inimigo
                                    // destruído por tiro
                                    // vale 1 ponto.
                                    score += 1

                                    scoreText.text =
                                        `Score: ${score}`

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

                        // Ilha também protege
                        // contra tiro inimigo.
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
                                    hpText.text =
                                        `HP: ${player.getHp()} / 3`

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

            // Agora funciona porque o
            // cleanup guarda uma função,
            // não tenta acessar variáveis
            // fora do escopo.
            removeRuntimeListeners()

            if (app.renderer) {
                app.destroy(true)
            }
        }
    }, [])

    return (
        <div ref={containerRef} />
    )
}