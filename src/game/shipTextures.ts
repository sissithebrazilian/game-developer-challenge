import { Assets, type Texture } from 'pixi.js'

export type ShipVariant = 1 | 2 | 3 | 4 | 5 | 6

export type ShipTextures = {
  normal: Texture
  damaged: Texture
  critical: Texture
  destroyed: Texture
}

export async function loadShipTextures(
  variant: ShipVariant
): Promise<ShipTextures> {
  const [normal, damaged, critical, destroyed] =
    await Promise.all([
      Assets.load<Texture>(
        `/assets/png/default/ships/ship_${variant}.png`
      ),
      Assets.load<Texture>(
        `/assets/png/default/ships/ship_${variant + 6}.png`
      ),
      Assets.load<Texture>(
        `/assets/png/default/ships/ship_${variant + 12}.png`
      ),
      Assets.load<Texture>(
        `/assets/png/default/ships/ship_${variant + 18}.png`
      ),
    ])

  return {
    normal,
    damaged,
    critical,
    destroyed,
  }
}
