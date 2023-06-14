import { useState, useEffect, Suspense } from 'react';
import './App.css';

type Fruit = {
  name: string;
  family: string;
  genus: string;
  nutritions: {
    calories: number;
    fat: number;
    sugar: number;
    carbohydrates: number;
    protein: number;
  };
  img: string;
  stars: number;
};

function FetchAPI() {
  const [fruit, setFruit] = useState<Fruit | null>(null);

  useEffect(() => {
    fetch(
      'https://raw.githubusercontent.com/debs-obrien/playwright-api-mocking/main/fruit.json',
      { cache: 'no-cache' }
    )
      .then((response) => response.json())
      .then((fruits) => {
        setFruit(fruits[Math.floor(Math.random() * fruits.length)]);
      });
  }, []);

  if (fruit === null) {
    return 'Loading...';
  }

  return (
    <div className="flex flex-col justify-center">
      <div className="relative flex flex-col md:flex-row md:space-x-5 space-y-3 md:space-y-0 rounded-xl shadow-lg p-3 max-w-xs md:max-w-3xl mx-auto border border-white bg-white">
        <div className="w-full md:w-1/3 bg-white grid place-items-center">
          <img
            src={fruit.img}
            alt={fruit.name}
            className="rounded-xl"
            width={480}
            height={510}
          />
        </div>
        <div className="w-full md:w-2/3 bg-white flex flex-col space-y-2 p-3">
          <div className="flex justify-between item-center">
            <p className="text-gray-500 font-medium hidden md:block">
              {fruit.family}
            </p>
            {fruit.stars ? (
              <div className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-yellow-500"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-label="star"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <p className="text-gray-600 font-bold text-sm ml-1">
                  {fruit.stars}
                </p>
              </div>
            ) : null}

            <div className="bg-gray-200 px-3 py-1 rounded-full text-xs font-medium text-gray-800 hidden md:block">
              {fruit.genus}
            </div>
          </div>
          <h3 className="font-black text-gray-800 md:text-3xl text-xl">
            {fruit.name}
          </h3>

          <ul className="text-xl text-gray-800">
            <li>Calories: {fruit.nutritions.calories}</li>
            <li>Fat: {fruit.nutritions.fat}</li>
            <li>Sugar: {fruit.nutritions.sugar}</li>
            <li>Carbohydrates: {fruit.nutritions.carbohydrates}</li>
            <li>Protein: {fruit.nutritions.protein}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <>
      <div></div>
      <h1>Fruit of the Month</h1>
      <div className="card">
        <FetchAPI />
        <div>
          <br />
        </div>
      </div>
    </>
  );
}

export default App;
