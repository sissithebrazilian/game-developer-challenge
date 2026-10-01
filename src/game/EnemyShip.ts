import { Assets, Sprite, Texture } from 'pixi.js'

export class EnemyShip {
  public sprite!: Sprite
  public active = true

  private speed = 110

  private hp = 3

  private normalTexture!: Texture
  private damagedTexture!: Texture
  private criticalTexture!: Texture
  private destroyedTexture!: Texture

  async init(x: number, y: number) {
    // Carrega os diferentes estados visuais do navio.
    const [
      normalTexture,
      damagedTexture,
      criticalTexture,
      destroyedTexture,
    ] = await Promise.all([
      Assets.load('/assets/png/default/ships/ship_2.png'),
      Assets.load('/assets/png/default/ships/ship_8.png'),
      Assets.load('/assets/png/default/ships/ship_14.png'),
      Assets.load('/assets/png/default/ships/ship_20.png'),
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
    if (!this.active || !this.sprite) return

    const dx = targetX - this.sprite.x
    const dy = targetY - this.sprite.y

    const distance = Math.sqrt(
      dx * dx + dy * dy
    )

    if (distance === 0) return

    const directionX = dx / distance
    const directionY = dy / distance

    this.sprite.x +=
      directionX *
      this.speed *
      deltaSeconds

    this.sprite.y +=
      directionY *
      this.speed *
      deltaSeconds

    this.sprite.rotation =
      Math.atan2(
        -directionX,
        directionY
      )
  }

  takeDamage() {
    if (!this.active) return

    this.hp -= 1

    console.log('Enemy HP:', this.hp)

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