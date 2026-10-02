import { Sprite, type Texture } from 'pixi.js'
import { loadShipTextures } from './shipTextures'

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

  private keys =
    new Set<string>()

  private inputEnabled = true

  private requestedAttack:
    AttackType | null = null

  private frontCooldown = 0
  private sideCooldown = 0

  // Reduced only for the player ship.
  private readonly frontCooldownTime = 0.3
  private readonly sideCooldownTime = 0.9

  async init() {
    const textures = await loadShipTextures(1)

    this.normalTexture = textures.normal
    this.damagedTexture = textures.damaged
    this.criticalTexture = textures.critical
    this.destroyedTexture = textures.destroyed

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

    if (event.repeat) {
      return
    }

    if (
      event.code === 'Space'
    ) {
      this.requestedAttack =
        'front'
    }

    if (key === 'q') {
      this.requestedAttack =
        'left'
    }

    if (key === 'e') {
      this.requestedAttack =
        'right'
    }
  }

  private handleKeyUp = (
    event: KeyboardEvent
  ) => {
    this.keys.delete(
      event.key.toLowerCase()
    )
  }

  setMovementControl(
    control: MovementControl,
    pressed: boolean
  ) {
    const keyMap:
      Record<
        MovementControl,
        string
      > = {
      forward: 'w',
      backward: 's',
      left: 'a',
      right: 'd',
    }

    const key =
      keyMap[control]

    if (pressed) {
      if (
        this.inputEnabled &&
        this.active
      ) {
        this.keys.add(key)
      }
    } else {
      this.keys.delete(key)
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

    if (
      this.keys.has('a') ||
      this.keys.has(
        'arrowleft'
      )
    ) {
      this.sprite.rotation -=
        this.rotationSpeed *
        deltaSeconds
    }

    if (
      this.keys.has('d') ||
      this.keys.has(
        'arrowright'
      )
    ) {
      this.sprite.rotation +=
        this.rotationSpeed *
        deltaSeconds
    }

    let direction = 0

    if (
      this.keys.has('w') ||
      this.keys.has(
        'arrowup'
      )
    ) {
      direction = 1
    }

    if (
      this.keys.has('s') ||
      this.keys.has(
        'arrowdown'
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

  takeDamage() {
    if (
      !this.active ||
      this.invulnerabilityTimer >
        0
    ) {
      return false
    }

    this.hp -= 1
    this.invulnerabilityTimer = 1

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

    return true
  }

  getHp() {
    return this.hp
  }

  setInputEnabled(
    enabled: boolean
  ) {
    this.inputEnabled =
      enabled

    if (!enabled) {
      this.keys.clear()
      this.requestedAttack =
        null
    }
  }

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

    if (
      attack === 'front'
    ) {
      if (
        this.frontCooldown >
        0
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
