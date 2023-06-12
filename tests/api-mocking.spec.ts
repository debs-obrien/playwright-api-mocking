import { test, expect } from '@playwright/test'

test.describe('mock and modify', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/')
  })

  test("mocks a fruit and doesn't call api", async ({ page }) => {
    await page.route(
      'https://raw.githubusercontent.com/debs-obrien/playwright-api-mocking/main/fruit.json',
      async (route) => {
        const json = {
          name: 'Blueberry',
        }
        await route.fulfill({ json })
      }
    )
    await expect(page.getByRole('heading', { name: 'Blueberry' })).toBeVisible()
  })

  test('gets a fruit from api and modifys it', async ({ page }) => {
    await page.route(
      'https://raw.githubusercontent.com/debs-obrien/playwright-api-mocking/main/fruit.json',
      async (route) => {
        const response = await route.fetch()
        const json = await response.json()
        console.log(json)
        json['name'] = 'Blueberry'
        await route.fulfill({ response, json })
      }
    )
    await expect(page.getByRole('heading', { name: 'Blueberry' })).toBeVisible()
  })
})
