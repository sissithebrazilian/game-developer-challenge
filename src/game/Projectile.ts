import { Assets, Sprite } from 'pixi.js'

export class Projectile {
  public sprite!: Sprite
  public active = true

  private speed = 600

  private velocityX = 0
  private velocityY = 0

  async init(
    x: number,
    y: number,
    direction: number
  ) {
    const texture = await Assets.load(
      '/assets/png/default/ship_parts/cannon_ball.png'
    )

    this.sprite = new Sprite(texture)

    this.sprite.anchor.set(0.5)
    this.sprite.scale.set(0.5)

    // Posição onde o projétil nasce.
    this.sprite.position.set(x, y)

    // Calcula a direção do projétil.
    this.velocityX =
      -Math.sin(direction) * this.speed

    this.velocityY =
      Math.cos(direction) * this.speed
  }

  update(deltaSeconds: number) {
    if (!this.active) return

    this.sprite.x +=
      this.velocityX * deltaSeconds

    this.sprite.y +=
      this.velocityY * deltaSeconds

    // Remove o projétil quando sair da arena.
    if (
      this.sprite.x < 40 ||
      this.sprite.x > 1240 ||
      this.sprite.y < 40 ||
      this.sprite.y > 680
    ) {
      this.active = false
    }
  }

  destroy() {
    this.sprite?.destroy()
  }
}