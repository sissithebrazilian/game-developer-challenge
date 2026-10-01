import { Assets, Sprite, Texture } from 'pixi.js'

export class ShooterShip {
    public sprite!: Sprite
    public active = true

    private speed = 85
    private hp = 3

    private shootCooldown = 1
    private readonly shootCooldownTime = 2

    private readonly preferredDistance = 330

    private normalTexture!: Texture
    private damagedTexture!: Texture
    private criticalTexture!: Texture
    private destroyedTexture!: Texture

    async init(x: number, y: number) {
        const [
            normalTexture,
            damagedTexture,
            criticalTexture,
            destroyedTexture,
        ] = await Promise.all([
            Assets.load('/assets/png/default/ships/ship_3.png'),
            Assets.load('/assets/png/default/ships/ship_9.png'),
            Assets.load('/assets/png/default/ships/ship_15.png'),
            Assets.load('/assets/png/default/ships/ship_21.png'),
        ])

        this.normalTexture = normalTexture
        this.damagedTexture = damagedTexture
        this.criticalTexture = criticalTexture
        this.destroyedTexture = destroyedTexture

        this.sprite = new Sprite(this.normalTexture)

        this.sprite.anchor.set(0.5)
        this.sprite.position.set(x, y)
        this.sprite.scale.set(0.55)
    }

    update(
        deltaSeconds: number,
        targetX: number,
        targetY: number
    ) {
        if (!this.active) return

        this.shootCooldown -= deltaSeconds

        const dx = targetX - this.sprite.x
        const dy = targetY - this.sprite.y

        const distance = Math.sqrt(
            dx * dx + dy * dy
        )

        if (distance === 0) return

        const directionX = dx / distance
        const directionY = dy / distance

        // Shooter tenta manter distância.
        if (distance > this.preferredDistance + 50) {
            this.sprite.x +=
                directionX *
                this.speed *
                deltaSeconds

            this.sprite.y +=
                directionY *
                this.speed *
                deltaSeconds
        }

        if (distance < this.preferredDistance - 70) {
            this.sprite.x -=
                directionX *
                this.speed *
                deltaSeconds

            this.sprite.y -=
                directionY *
                this.speed *
                deltaSeconds
        }

        this.sprite.rotation =
            Math.atan2(
                -directionX,
                directionY
            )
    }

    consumeShootRequest() {
        if (
            !this.active ||
            this.shootCooldown > 0
        ) {
            return false
        }

        this.shootCooldown =
            this.shootCooldownTime

        return true
    }

    takeDamage() {
        if (!this.active) return

        this.hp -= 1

        if (this.hp === 2) {
            this.sprite.texture =
                this.damagedTexture
        }

        if (this.hp === 1) {
            this.sprite.texture =
                this.criticalTexture
        }

        if (this.hp <= 0) {
            this.sprite.texture =
                this.destroyedTexture

            this.active = false
        }
    }

    destroy() {
        this.active = false
        this.sprite?.destroy()
    }
}