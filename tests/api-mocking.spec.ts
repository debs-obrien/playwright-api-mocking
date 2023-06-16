import { test, expect } from '@playwright/test';

test("mocks a fruit and doesn't call api", async ({ page }) => {
  // Mock the api call
  await page.route(
    'https://raw.githubusercontent.com/debs-obrien/playwright-api-mocking/main/fruit.json',
    async (route) => {
      const json = [
        {
          name: 'Playwright',
          id: 3,
          family: 'Rosaceae',
          order: 'Rosales',
          genus: 'Fragaria',
          img: 'https://raw.githubusercontent.com/debs-obrien/playwright-api-mocking/master/images/La_Trinidad_strawberries.jpg',
          nutritions: {
            calories: 29,
            fat: 0.4,
            sugar: 5.4,
            carbohydrates: 5.5,
            protein: 0.8,
          },
        },
      ];
      await route.fulfill({ json });
    }
  );
  // Go to the page
  await page.goto('./');

  // Wait for the image to load
  await page.waitForResponse('**/*.jpg');

  // Assert that the fruit is visible
  await expect(page.getByRole('heading', { name: 'Playwright' })).toBeVisible();
});

test('gets the json from api and adds a star rating to each fruit', async ({
  page,
}) => {
  // Get the response and add to it
  await page.route(
    'https://raw.githubusercontent.com/debs-obrien/playwright-api-mocking/main/fruit.json',
    async (route) => {
      const response = await route.fetch();
      const json = await response.json();
      for (const fruit of json) {
        fruit.stars = 5;
      }

      await route.fulfill({ response, json });
    }
  );
  // Go to the page
  await page.goto('./');

  // wait for the image to load
  await page.waitForResponse('**/*.jpg');

  // Assert that the stars are visible
  await expect(page.getByRole('img', { name: 'star' })).toBeVisible();
  await expect(page.getByText('5', { exact: true })).toBeVisible();
});

test('gets the har file from api and runs test against it', async ({
  page,
}) => {
  // Create the HAR file
  await page.routeFromHAR('./hars/fruit.har', {
    url: '**/*.json',
    update: true,
  });
  // Go to the page
  await page.goto('./');

  // assert that some text from the card is visible
  await expect(page.getByText('Protein')).toBeVisible();
});

test('gets the json from HAR and checks the stars have been added for each fruit', async ({
  page,
}) => {
  // Get the response and add to it
  await page.routeFromHAR('./hars/fruit.har', {
    url: '**/*.json',
    update: false,
  });
  // Go to the page
  await page.goto('./');

  // wait for the image to load
  await page.waitForResponse('**/*.jpg');

  // Assert that the stars are visible
  await expect(page.getByRole('img', { name: 'star' })).toBeVisible();
});
