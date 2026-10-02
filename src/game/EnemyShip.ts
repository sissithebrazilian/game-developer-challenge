import { Sprite, type Texture } from 'pixi.js'
import {
  loadShipTextures,
  type ShipVariant,
} from './shipTextures'

export class EnemyShip {
  public sprite!: Sprite
  public active = true

  private speed = 110

  private readonly maxHp = 3
  private hp = this.maxHp

  private normalTexture!: Texture
  private damagedTexture!: Texture
  private criticalTexture!: Texture
  private destroyedTexture!: Texture

  async init(
    x: number,
    y: number,
    variant: ShipVariant = 2
  ) {
    const textures = await loadShipTextures(variant)

    this.normalTexture = textures.normal
    this.damagedTexture = textures.damaged
    this.criticalTexture = textures.critical
    this.destroyedTexture = textures.destroyed

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

  getHp() {
    return this.hp
  }

  getMaxHp() {
    return this.maxHp
  }

  destroy() {
    this.active = false
    this.sprite?.destroy()
  }
}
