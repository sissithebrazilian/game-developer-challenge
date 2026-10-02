import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
    await page.goto('/')
})

test('menu principal carrega corretamente', async ({ page }) => {
    await expect(
        page.getByAltText('Pirate Battle')
    ).toBeVisible()

    await expect(
        page.getByRole('button', {
            name: 'PLAY',
            exact: true,
        })
    ).toBeVisible()

    await expect(
        page.getByRole('button', {
            name: 'OPTIONS',
            exact: true,
        })
    ).toBeVisible()

    await expect(
        page.getByRole('button', {
            name: 'RANKING',
            exact: true,
        })
    ).toBeVisible()

    await expect(
        page.getByRole('button', {
            name: 'MATCH HISTORY',
            exact: true,
        })
    ).toBeVisible()
})

test('abre opções e volta ao menu', async ({ page }) => {
    await page
        .getByRole('button', {
            name: 'OPTIONS',
            exact: true,
        })
        .click()

    await expect(
        page.getByRole('heading', {
            name: 'OPTIONS',
            exact: true,
        })
    ).toBeVisible()

    await page
        .getByRole('button', {
            name: 'MAIN MENU',
            exact: true,
        })
        .click()

    await expect(
        page.getByRole('button', {
            name: 'PLAY',
            exact: true,
        })
    ).toBeVisible()
})

test('abre ranking e volta ao menu', async ({ page }) => {
    await page
        .getByRole('button', {
            name: 'RANKING',
            exact: true,
        })
        .click()

    await expect(
        page.getByRole('heading', {
            name: "CAPTAIN'S LOG",
            exact: true,
        })
    ).toBeVisible()

    await page
        .getByRole('button', {
            name: 'MAIN MENU',
            exact: true,
        })
        .click()

    await expect(
        page.getByRole('button', {
            name: 'PLAY',
            exact: true,
        })
    ).toBeVisible()
})

test('abre histórico de partidas e volta ao menu', async ({ page }) => {
    await page
        .getByRole('button', {
            name: 'MATCH HISTORY',
            exact: true,
        })
        .click()

    await expect(
        page.getByRole('heading', {
            name: "CAPTAIN'S LOG",
            exact: true,
        })
    ).toBeVisible()

    await page
        .getByRole('button', {
            name: 'MAIN MENU',
            exact: true,
        })
        .click()

    await expect(
        page.getByRole('button', {
            name: 'PLAY',
            exact: true,
        })
    ).toBeVisible()
})

test('abre seleção de fases', async ({ page }) => {
    await page
        .getByRole('button', {
            name: 'PLAY',
            exact: true,
        })
        .click()

    await expect(
        page.getByRole('heading', {
            name: 'CHOOSE YOUR BATTLE',
            exact: true,
        })
    ).toBeVisible()

    await expect(
        page.getByRole('button', {
            name: 'LEVEL 1',
            exact: true,
        })
    ).toBeVisible()

    await expect(
        page.getByRole('button', {
            name: 'LEVEL 10',
            exact: true,
        })
    ).toBeVisible()
})

test('inicia uma partida', async ({ page }) => {
    await page
        .getByRole('button', {
            name: 'PLAY',
            exact: true,
        })
        .click()

    await page
        .getByRole('button', {
            name: 'LEVEL 1',
            exact: true,
        })
        .click()

    await page
        .getByRole('button', {
            name: 'START LEVEL 1',
            exact: true,
        })
        .click()

    await expect(
        page.locator('canvas')
    ).toBeVisible({
        timeout: 15000,
    })
})

test('pause permite voltar ao menu', async ({ page }) => {
    await page
        .getByRole('button', {
            name: 'PLAY',
            exact: true,
        })
        .click()

    await page
        .getByRole('button', {
            name: 'LEVEL 1',
            exact: true,
        })
        .click()

    await page
        .getByRole('button', {
            name: 'START LEVEL 1',
            exact: true,
        })
        .click()

    await expect(
        page.locator('canvas')
    ).toBeVisible({
        timeout: 15000,
    })

    // O canvas aparece antes da inicialização completa
    // do Pixi/listeners. Aguarda o jogo ficar pronto.
    await page.waitForTimeout(1200)

    await page.keyboard.press('p')

    await expect(
        page.getByText('PAUSED', {
            exact: true,
        })
    ).toBeVisible({
        timeout: 5000,
    })

    await expect(
        page.getByRole('button', {
            name: 'RESUME',
            exact: true,
        })
    ).toBeVisible()

    await expect(
        page.getByRole('button', {
            name: 'MAIN MENU',
            exact: true,
        })
    ).toBeVisible()

    await page
        .getByRole('button', {
            name: 'MAIN MENU',
            exact: true,
        })
        .click()

    await expect(
        page.getByRole('button', {
            name: 'PLAY',
            exact: true,
        })
    ).toBeVisible({
        timeout: 5000,
    })

    await expect(
        page.locator('canvas')
    ).toHaveCount(0)
})