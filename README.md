# playwright-api-mocking

When working with third party API's it is better to mock the API call rather than hit the API especially when they are API's that you do not control. You might also want to mock an API when in development mode and the API hasn't been written yet. Mocking the API allows you to finish developing your component and write the tests and then when the API is ready you can just swap out the mock for the real API call.

With Playwright you don't need any additional libraries to mock an API call. You can use the `route` method to intercept the API call and return a mock response. This means that instead of hitting the real API you can return a mock response and write your tests based on the mock response.

## Mocking the API call

In the example below we are intercepting an API call to `/api/fruit` and returning a mock response of `[{ name: 'Strawberry' }]` by using the `fulfill` method, which fulfills a route's request with a given response.

```js
await page.route('**/api/fruit', async (route) => {
  const json = [
    {
      name: 'Strawberry',
    },
  ];
  await route.fulfill({ json });
});
```

Let's take a look at this with a real example. We have a page that fetches a list of fruit from an API and renders a random fruit from the list. We want to test that the page renders the correct fruit but as the response we get back is a random one it makes it very hard to test. However if we mock the response we can test that it renders correctly with the mocked data.

First let's start by adding the `baseUrl` to our `playwright.config.js` file. This will allow us to use relative paths in our tests.

```js
export default defineConfig({
  use: {
    baseURL: 'https://debs-obrien.github.io/playwright-api-mocking/',
  },
});
```

We then intercept the browser API call to `https://raw.githubusercontent.com/debs-obrien/playwright-api-mocking/main/fruit.json` and pass in a mock response that we want to be fulfilled by our route.

We then go to the page and assert that the page has a role of 'Heading' with the name of 'Strawberry' and an image with the name of 'Strawberry'. Now every time we run the test we can be assured that we will always test this page with the same data.

```js
test("mocks a fruit and doesn't call api", async ({ page }) => {
  // Mock the api call
  await page.route(
    'https://raw.githubusercontent.com/debs-obrien/playwright-api-mocking/main/fruit.json',
    async (route) => {
      const json = [
        {
          name: 'Strawberry',
          id: 3,
          family: 'Rosaceae',
          order: 'Rosales',
          genus: 'Fragaria',
          img: 'https://upload.wikimedia.org/wikipedia/commons/7/73/La_Trinidad_strawberries.jpg?20070506152740',
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
  await page.goto('/playwright-api-mocking/');

  // Assert that the fruit is visible
  await expect(page.getByRole('heading', { name: 'Strawberry' })).toBeVisible();
  await expect(page.getByRole('img', { name: 'Strawberry' })).toBeVisible();
});
```

![fruit of month: strawberry](https://github.com/microsoft/playwright/assets/13063165/e9e85d06-d130-4323-bd5c-4dd29080a9de)

Running our test with the trace viewer we can inspect the network tab and see that our API call of 'fruit.json' has the 'fulfilled' tag next to it. This means that the API call has been intercepted and the mock response has been returned.

![trace of test showing route fulfilled](https://github.com/microsoft/playwright/assets/13063165/c9ee58f9-782e-48a5-8700-9ba4b7d3e887)

As you can see we have used a real scenario here but how can we be sure that the network is being intercepted and that it's not just returning Strawberry as the random fruit? One thing we can do is modify our json response using the name of a fruit that doesn't exist such as 'Playwright'.

```js
name: 'Playwright',
```

When we run our test we will see how the DOM now shows the fruit called Playwright instead of Strawberry.

![fruit of month: playwright](https://github.com/microsoft/playwright/assets/13063165/60f2a858-b187-49d2-9d27-e5df9fed4f9d)

We can also open our dev tools and check the network tab to see that the API call has been intercepted and the response is the mock response. Run the test and click on the `fruit.json` file in the network tab and click on the Response. You should see the mock response exactly as you have in your test.

![network tab showing fruit of Playwright](https://github.com/microsoft/playwright/assets/13063165/b9e2641d-4c9b-4fcc-90d7-62afc2bc6e54)

## Modifying the API call

Sometimes you might want to modify the API call such as when you are adding a new feature to your component and you need to test that it displays correctly on the page. In this scenario you own the API and therefore want to test against it but the new feature has not been implemented yet on the API side.

Instead of mocking the API we can intercept the route just like in the example above but instead we will use the `fetch` method. This performs the request and fetches the result without fulfilling it, so that the response can be modified and then fulfilled using the `fulfill` method.

In the `fulfill` method we pass in the `response` argument,which is the API response to fulfill the route's request with, and the `json` argument, which will contain the new star rating for each fruit.

```js
await page.route('**/api/fruit', async (route) => {
  const response = await route.fetch();
  const json = await response.json();
  for (const fruit of json) {
    fruit.stars = 5;
  }
  await route.fulfill({ response, json });
});
```

In our real example it will look something like this where we fetch the API response and add a star rating to each fruit. We then go to the page and assert that the stars are visible.

```js
test('gets the json from api and adds to it', async ({ page }) => {
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
```

When we run our test we can now see that the stars are visible on the page.

![fruit of month with star rating](https://github.com/microsoft/playwright/assets/13063165/7df77b5d-cbf2-4635-9c89-9f8fbd3d3322)

However if we refresh the page you will see that there are no stars. This is because we have set in our code that if we have the data of `fruit.stars` we then show the code to render the stars. As we have not added this to our API response the stars are not visible. We only see the stars when we run our test because we have added the stars to the API response in our test.

If we run our test with the trace viewer option we can see that we are using `route.fetch`. If we open the network tab on the `page.goto` step we can see our 'fruit.json' call has the 'api' tag next to it followed by the 'fulfilled' tag. This means that the API has been called and the response has been modified.

![trace viewer api call](https://github.com/microsoft/playwright/assets/13063165/dac47162-5278-4e96-8095-e375cec7de64)

We can also open our dev tools and check the network tab to see that the API call has been intercepted and the response is the modified response. Run the test and click on the `fruit.json` file while you have the network tab opened and click on the Response. You should see the modified response with the star rating added to each fruit.

![fruit](https://github.com/microsoft/playwright/assets/13063165/03560ed1-2cf8-4b64-b975-5056eaa0f00e)

## Mocking with HAR files

A HAR file is an HTTP Archive file that contains a record of all the network requests that are made when a page is loaded. It contains information about the request and response headers, cookies, content, timings, and more. You can use HAR files to mock network requests in your tests.

To record a HAR file we use the `routeFromHAR` method. This method takes in the path to the HAR file and an optional object of options.

The options object can contain the URL so that only requests with the URL matching the specified glob pattern will be served from the HAR File. If not specified, all requests will be served from the HAR file.

The `update` option updates the given HAR file with the actual network information instead of serving from the file. In order to record the HAR file, you need to set `update` to true.

```js
await page.routeFromHAR('./hars/fruit.har', {
  url: '**/*.json',
  update: true,
});
```

Let's take a look at how we would write our test using a HAR file. We start by recording the HAR file by setting the `url`option to our API and the `update` option to true.

We then go to our home page and assert that the page contains some text. As our page gives back a random fruit we can simply test that the text of 'protein' exits on the page. This way our test will pass no matter what fruit is returned so we can easily record our HAR file.

```js
test('gets the har file from api and runs test against it', async ({
  page,
}) => {
  // Create the HAR file
  await page.routeFromHAR('./hars/fruit.har', {
    url: '**/*.json',
    update: true,
  });

  // Go to the page
  await page.goto('/');

  // assert that some text from the card is visible
  await expect(page.getByText('Protein')).toBeVisible();
});
```

When you run the test you will see that the HAR file has been recorded in the `hars` folder. You can open the HAR file and see the request and response information.

Under the content section of the `fruit.har` file you will see the name of a '.txt' file with a hashed name. This file contains the JSON response from your API call and is located inside the `hars` folder.

```json
"content": {
            "size": -1,
            "mimeType": "text/plain; charset=utf-8",
            "_file": "071271e20ae0915b74df7103cbde3151afa4c4df.txt"
          },
```

When you open the '.txt' file you will see the full result of your API response. You can now use this HAR file in your test to mock the API call meaning you are testing against the real API data without having to make the API call each time.

Now to run our test against the HAR file we just have to set 'update' to false.

```js
test('gets the har file from api and runs test against it', async ({
  page,
}) => {
  // All requests will be served from the HAR file
  await page.routeFromHAR('./hars/fruit.har', {
    url: '**/*.json',
    update: false,
  });

  // Go to the page
  await page.goto('/');

  // assert that some text from the card is visible
  await expect(page.getByText('Protein')).toBeVisible();
});
```

## Modifying the HAR file

You can also modify the response from the HAR file and then run your tests against the modified response. This is useful if you want to test a new feature that has not been implemented on the API side yet. As in the previous example we could add a star rating to each fruit and then test that the stars are visible on the page.

This is a little more manual work than our previous example as we need to open the HAR file for our response and add the star rating to each fruit. However it does allow us to test against a more real scenario as we can add different ratings for each fruit.

```json
[
  {
    "name": "Strawberry",
    "id": 3,
    "family": "Rosaceae",
    "order": "Rosales",
    "genus": "Fragaria",
    "img": "https://raw.githubusercontent.com/debs-obrien/playwright-api-mocking/master/images/La_Trinidad_strawberries.jpg",
    "nutritions": {
      "calories": 29,
      "fat": 0.4,
      "sugar": 5.4,
      "carbohydrates": 5.5,
      "protein": 0.8
    },
    "stars": 5
  },
  {
    "name": "Banana",
    "id": 1,
    "family": "Musaceae",
    "order": "Zingiberales",
    "genus": "Musa",
    "img": "https://raw.githubusercontent.com/debs-obrien/playwright-api-mocking/master/images/Banana.arp.750pix.jpg",
    "nutritions": {
      "calories": 96,
      "fat": 0.2,
      "sugar": 17.2,
      "carbohydrates": 22,
      "protein": 1
    },
    "stars": 4
  }
  // etc
]
```

We can now run our test against the modified HAR file and assert that the stars are visible on the page.

```js
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
```

How can we tell if we are really running our tests against the HAR file?

When we inspect the trace of our test we can see we are using routeFromHAR to mock the API call with a pattern of `[{"glob":"**/*.json"}]`

![trace viewer routeFromHAR](https://github.com/microsoft/playwright/assets/13063165/672b2563-fed8-4933-8b16-ad9c4224315c)

When we click on the next step of our test and open the network tab we can see that 'fruit.json' file has been fulfilled meaning we are using the HAR file to mock the API call.

![trace viewer route fulfilled](https://github.com/microsoft/playwright/assets/13063165/f07be109-6905-4c35-ac69-e63325c48828)

We can expand the network call and scroll down to inspect the response body. Here we can see the star rating has been added to each of our fruits.

![trace view of response](https://github.com/microsoft/playwright/assets/13063165/dc3eb6a9-2b68-4b5f-9b8f-59bdd6289ab3)

## Conclusion

With Playwright you can intercept Browser API calls and run your tests against the mock data with the `route` and `fullfil` methods. You can also intercept the API call and modify the response by passing in the response and your modified data to the [`route.fulfill`](https://playwright.dev/docs/api/class-route#route-fulfill) method. You can use the [`routeFromHAR`](https://playwright.dev/docs/api/class-browsercontext#browser-context-route-from-har) method to record the API call and response and then use the HAR file to run your tests against instead of hitting the API each time. You can also modify the HAR file and run your tests against the modified data.

## Useful Links

- [Playwright API mocking repo](https://github.com/debs-obrien/playwright-api-mocking)
- [Playwright docs](https://playwright.dev/docs/intro)
- [Playwright YouTube Channel](https://aka.ms/playwright/youtube)
- [Playwright Discord server](https://aka.ms/playwright/discord)
