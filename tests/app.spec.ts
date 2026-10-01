import { test, expect } from '@playwright/test'

test('menu principal carrega corretamente', async ({ page }) => {
    await page.goto('/')

    await expect(
        page.getByRole('heading', {
            name: /Naval Battle/i,
        })
    ).toBeVisible()

    await expect(
        page.getByRole('button', {
            name: /Play/i,
        })
    ).toBeVisible()

    await expect(
        page.getByRole('button', {
            name: /Ranking/i,
        })
    ).toBeVisible()

    await expect(
        page.getByRole('button', {
            name: /Match History/i,
        })
    ).toBeVisible()

    await expect(
        page.getByRole('button', {
            name: /Options/i,
        })
    ).toBeVisible()
})

test('abre a tela de opções', async ({ page }) => {
    await page.goto('/')

    await page.getByRole('button', {
        name: /Options/i,
    }).click()

    await expect(
        page.getByRole('heading', {
            name: /Options/i,
        })
    ).toBeVisible()
})

test('abre ranking e volta ao menu', async ({ page }) => {
    await page.goto('/')

    await page.getByRole('button', {
        name: /Ranking/i,
    }).click()

    await expect(
        page.getByRole('heading', {
            name: /Ranking/i,
        })
    ).toBeVisible()

    await page.getByRole('button', {
        name: /Back/i,
    }).click()

    await expect(
        page.getByRole('heading', {
            name: /Naval Battle/i,
        })
    ).toBeVisible()
})

test('abre histórico de partidas', async ({ page }) => {
    await page.goto('/')

    await page.getByRole('button', {
        name: /Match History/i,
    }).click()

    await expect(
        page.getByRole('heading', {
            name: /Match History/i,
        })
    ).toBeVisible()
})

test('inicia uma partida', async ({ page }) => {
    await page.goto('/')

    await page.getByRole('button', {
        name: /Play/i,
    }).click()

    await expect(
        page.locator('canvas')
    ).toBeVisible()
})