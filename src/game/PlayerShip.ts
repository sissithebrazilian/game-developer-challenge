import { Assets, Sprite, Texture } from 'pixi.js'

export type AttackType = 'front' | 'left' | 'right'

export type MovementControl =
    | 'forward'
    | 'backward'
    | 'left'
    | 'right'

export class PlayerShip {
    public sprite!: Sprite
    public active = true

    private speed = 250
    private rotationSpeed = 2.5

    private hp = 3
    private invulnerabilityTimer = 0

    private normalTexture!: Texture
    private damagedTexture!: Texture
    private criticalTexture!: Texture
    private destroyedTexture!: Texture

    // Controles de teclado.
    private keys = new Set<string>()

    // Controles virtuais para celular/tablet.
    private touchControls =
        new Set<MovementControl>()

    private inputEnabled = true

    private requestedAttack:
        AttackType | null = null

    private frontCooldown = 0
    private sideCooldown = 0

    private readonly frontCooldownTime = 0.5
    private readonly sideCooldownTime = 1.5

    async init() {
        const [
            normalTexture,
            damagedTexture,
            criticalTexture,
            destroyedTexture,
        ] = await Promise.all([
            Assets.load(
                '/assets/png/default/ships/ship_1.png'
            ),

            Assets.load(
                '/assets/png/default/ships/ship_7.png'
            ),

            Assets.load(
                '/assets/png/default/ships/ship_13.png'
            ),

            Assets.load(
                '/assets/png/default/ships/ship_19.png'
            ),
        ])

        this.normalTexture =
            normalTexture

        this.damagedTexture =
            damagedTexture

        this.criticalTexture =
            criticalTexture

        this.destroyedTexture =
            destroyedTexture

        this.sprite =
            new Sprite(
                this.normalTexture
            )

        this.sprite.anchor.set(0.5)

        this.sprite.position.set(
            640,
            360
        )

        this.sprite.scale.set(0.65)

        window.addEventListener(
            'keydown',
            this.handleKeyDown
        )

        window.addEventListener(
            'keyup',
            this.handleKeyUp
        )
    }

    // =========================
    // TECLADO
    // =========================

    private handleKeyDown = (
        event: KeyboardEvent
    ) => {
        if (
            !this.inputEnabled ||
            !this.active
        ) {
            return
        }

        const key =
            event.key.toLowerCase()

        this.keys.add(key)

        if (event.repeat) return

        if (
            event.code === 'Space'
        ) {
            this.requestAttack(
                'front'
            )
        }

        if (key === 'q') {
            this.requestAttack(
                'left'
            )
        }

        if (key === 'e') {
            this.requestAttack(
                'right'
            )
        }
    }

    private handleKeyUp = (
        event: KeyboardEvent
    ) => {
        this.keys.delete(
            event.key.toLowerCase()
        )
    }

    // =========================
    // TOUCH / MOBILE
    // =========================

    setMovementControl(
        control: MovementControl,
        pressed: boolean
    ) {
        if (
            !this.inputEnabled ||
            !this.active
        ) {
            return
        }

        if (pressed) {
            this.touchControls.add(
                control
            )
        } else {
            this.touchControls.delete(
                control
            )
        }
    }

    requestAttack(
        attack: AttackType
    ) {
        if (
            !this.inputEnabled ||
            !this.active
        ) {
            return
        }

        this.requestedAttack =
            attack
    }

    // =========================
    // UPDATE
    // =========================

    update(
        deltaSeconds: number
    ) {
        if (
            !this.sprite ||
            !this.active
        ) {
            return
        }

        if (
            this.invulnerabilityTimer >
            0
        ) {
            this.invulnerabilityTimer -=
                deltaSeconds
        }

        if (
            this.frontCooldown > 0
        ) {
            this.frontCooldown -=
                deltaSeconds
        }

        if (
            this.sideCooldown > 0
        ) {
            this.sideCooldown -=
                deltaSeconds
        }

        // =========================
        // ROTAÇÃO ESQUERDA
        // =========================

        if (
            this.keys.has('a') ||
            this.keys.has(
                'arrowleft'
            ) ||
            this.touchControls.has(
                'left'
            )
        ) {
            this.sprite.rotation -=
                this.rotationSpeed *
                deltaSeconds
        }

        // =========================
        // ROTAÇÃO DIREITA
        // =========================

        if (
            this.keys.has('d') ||
            this.keys.has(
                'arrowright'
            ) ||
            this.touchControls.has(
                'right'
            )
        ) {
            this.sprite.rotation +=
                this.rotationSpeed *
                deltaSeconds
        }

        let direction = 0

        // =========================
        // FRENTE
        // =========================

        if (
            this.keys.has('w') ||
            this.keys.has(
                'arrowup'
            ) ||
            this.touchControls.has(
                'forward'
            )
        ) {
            direction = 1
        }

        // =========================
        // RÉ
        // =========================

        if (
            this.keys.has('s') ||
            this.keys.has(
                'arrowdown'
            ) ||
            this.touchControls.has(
                'backward'
            )
        ) {
            direction = -0.6
        }

        if (direction !== 0) {
            this.sprite.x +=
                -Math.sin(
                    this.sprite.rotation
                ) *
                this.speed *
                direction *
                deltaSeconds

            this.sprite.y +=
                Math.cos(
                    this.sprite.rotation
                ) *
                this.speed *
                direction *
                deltaSeconds
        }

        // =========================
        // LIMITES DA ARENA
        // =========================

        this.sprite.x =
            Math.max(
                60,
                Math.min(
                    1220,
                    this.sprite.x
                )
            )

        this.sprite.y =
            Math.max(
                60,
                Math.min(
                    660,
                    this.sprite.y
                )
            )
    }

    // =========================
    // VIDA
    // =========================

    takeDamage() {
        if (
            !this.active ||
            this.invulnerabilityTimer >
            0
        ) {
            return false
        }

        this.hp -= 1

        this.invulnerabilityTimer =
            1

        if (this.hp === 2) {
            this.sprite.texture =
                this.damagedTexture
        }

        if (this.hp === 1) {
            this.sprite.texture =
                this.criticalTexture
        }

        if (this.hp <= 0) {
            this.hp = 0

            this.sprite.texture =
                this.destroyedTexture

            this.active = false
        }

        console.log(
            'Player HP:',
            this.hp
        )

        return true
    }

    getHp() {
        return this.hp
    }

    // =========================
    // INPUT
    // =========================

    setInputEnabled(
        enabled: boolean
    ) {
        this.inputEnabled =
            enabled

        if (!enabled) {
            this.keys.clear()

            this.touchControls.clear()

            this.requestedAttack =
                null
        }
    }

    // =========================
    // ATAQUES
    // =========================

    consumeAttackRequest():
        AttackType | null {
        if (
            !this.active ||
            !this.inputEnabled ||
            !this.requestedAttack
        ) {
            return null
        }

        const attack =
            this.requestedAttack

        this.requestedAttack =
            null

        if (attack === 'front') {
            if (
                this.frontCooldown > 0
            ) {
                return null
            }

            this.frontCooldown =
                this.frontCooldownTime

            return 'front'
        }

        if (
            this.sideCooldown > 0
        ) {
            return null
        }

        this.sideCooldown =
            this.sideCooldownTime

        return attack
    }

    // =========================
    // CLEANUP
    // =========================

    destroy() {
        window.removeEventListener(
            'keydown',
            this.handleKeyDown
        )

        window.removeEventListener(
            'keyup',
            this.handleKeyUp
        )

        this.sprite?.destroy()
    }
}