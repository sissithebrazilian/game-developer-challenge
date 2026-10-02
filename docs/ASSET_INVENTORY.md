# Pirate Battle — Asset Inventory

This inventory was generated from the supplied `png.rar`.

## Archive overview

- 487 archive entries total.
- `png/default`: 234 usable files for normal resolution.
- `png/retina`: high-resolution counterparts.
- Default pack includes ships, ship parts, 96 individual map tiles, UI and effects.

## Map tiles

All map tiles are individual 64×64 PNG files under:

`public/assets/png/default/tiles/tile_<number>.png`

The most useful tiles for the current map are:

- `tile_73.png` — water.
- `tile_1,2,3 / 17,18,19 / 33,34,35` — complete 3×3 sand island.
- `tile_6,7,8,9 / 22,23,24,25 / 38,39,40,41 / 54,55,56,57` — complete 4×4 sand + grass island.
- `tile_49,50,51` — gray rocks.
- `tile_65,66,67` — mossy rocks.
- `tile_70,71,72` — large vegetation.
- `tile_81,82` — dinghy/beach decoration.
- `tile_83,84` — beach cannon / wood decoration.
- `tile_85,86` — rock + vegetation decoration.
- `tile_87,88` — small leaves.
- `tile_13–16, 29–32, 45–48, 60–64, 76–80, 89–96` — dock/metal structure pieces.

## Ships

Main ship state families:

- Player white: `ship_1.png`, `ship_7.png`, `ship_13.png`, `ship_19.png`.
- Black pirate: `ship_2.png`, `ship_8.png`, `ship_14.png`, `ship_20.png`.
- Red: `ship_3.png`, `ship_9.png`, `ship_15.png`, `ship_21.png`.
- Green: `ship_4.png`, `ship_10.png`, `ship_16.png`, `ship_22.png`.
- Blue: `ship_5.png`, `ship_11.png`, `ship_17.png`, `ship_23.png`.
- Yellow: `ship_6.png`, `ship_12.png`, `ship_18.png`, `ship_24.png`.

The gray wreck added as environmental decoration in the polished GameCanvas uses `ship_21.png`.

Dinghies:

- `dinghy_large_1.png` to `dinghy_large_3.png`
- `dinghy_small_1.png` to `dinghy_small_3.png`

## HUD

Located under `png/default/ui/hud/`:

- `health_frame.png`
- `health_fill_green.png`
- `health_fill_amber.png`
- `health_fill_red.png`
- `enemy_health_frame.png`
- `enemy_health_fill_green.png`
- `enemy_health_fill_red.png`
- `counter_panel.png`
- `icon_heart.png`
- `icon_score.png`
- `icon_time.png`

## Touch / UI controls

Located under `png/default/ui/controls/`:

- `button_round_normal.png`
- `button_round_hover.png`
- `button_round_pressed.png`
- `icon_forward.png`
- `icon_turn_left.png`
- `icon_turn_right.png`
- `icon_fire_front.png`
- `icon_fire_left.png`
- `icon_fire_right.png`
- `icon_pause.png`
- `icon_play.png`
- `icon_home.png`
- `icon_settings.png`
- `icon_restart.png`
- `icon_plus.png`
- `icon_minus.png`
- `icon_close.png`

The polished GameCanvas uses these icons for the mobile controls instead of plain HTML letters/arrows.

## Menu UI

Located under `png/default/ui/menu/`:

- `panel_menu.png`
- `title_pirate_battle.png`
- `button_primary_normal.png`
- `button_primary_hover.png`
- `button_primary_pressed.png`
- `button_primary_disabled.png`
- `button_secondary_normal.png`
- `button_secondary_pressed.png`

## Effects

Located under `png/default/effects/`:

- `explosion_1.png`
- `explosion_2.png`
- `explosion_3.png`
- `fire_1.png`
- `fire_2.png`

The current game already uses the explosion sequence from these assets.

## What the polished package changes

- Uses individual official 64×64 tiles instead of manually cropping `tiles_sheet.png`.
- Keeps a complete official water tile field inside PixiJS.
- Builds the two main islands using official matching tile groups.
- Restores/adds a gray wreck as map decoration and obstacle.
- Adds a decorative dinghy.
- Uses official UI icons for touch controls.
- Keeps the React Pirate Battle menu styling.
- Keeps 16:9 gameplay without cropping the HUD.
- Uses the existing `ui_scene_background.png` behind the canvas on aspect-ratio side space rather than repeating a water tile.

## Installation

Copy the package files into the project root, preserving their folders.

The included `public/assets/png/default` can be merged with the existing `public/assets/png/default` directory.

Do not delete the existing sound files or `ui_scene_background.png`; those are referenced by the current game but are not part of this PNG-only archive.
