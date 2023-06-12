import { useState, useEffect } from 'react'
import './App.css'

type Fruit = {
  name: string
  family: string
  genus: string
  nutritions: {
    calories: number
    fat: number
    sugar: number
    carbohydrates: number
    protein: number
  }
  img: string
}

function FetchAPI() {
  const num: number = Math.floor(Math.random() * 19)
  const [fruit, setFruit] = useState<Fruit[] | null>(null)
  const randomFruit: Fruit = fruit
    ? fruit[num]
    : {
        name: '',
        family: '',
        genus: '',
        nutritions: {
          calories: 0,
          fat: 0,
          sugar: 0,
          carbohydrates: 0,
          protein: 0,
        },
        img: '',
      }

  useEffect(() => {
    fetch(
      'https://raw.githubusercontent.com/debs-obrien/playwright-api-mocking/main/fruit.json'
    )
      .then((response) => response.json())
      .then((data) => setFruit(data))
  }, [])

  if (fruit === null) {
    return 'Loading...'
  }

  return (
    <div className="flex flex-col justify-center">
      <div className="relative flex flex-col md:flex-row md:space-x-5 space-y-3 md:space-y-0 rounded-xl shadow-lg p-3 max-w-xs md:max-w-3xl mx-auto border border-white bg-white">
        <div className="w-full md:w-1/3 bg-white grid place-items-center">
          <img
            src={randomFruit.img}
            alt={randomFruit.name}
            className="rounded-xl"
          />
        </div>
        <div className="w-full md:w-2/3 bg-white flex flex-col space-y-2 p-3">
          <div className="flex justify-between item-center">
            <p className="text-gray-500 font-medium hidden md:block">
              {randomFruit.family}
            </p>
            {/* <div className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-yellow-500"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <p className="text-gray-600 font-bold text-sm ml-1">
                4.96
                <span className="text-gray-500 font-normal">(76 reviews)</span>
              </p>
            </div> */}
            {/* <div className="">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-pink-500"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fill-rule="evenodd"
                  d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                  clip-rule="evenodd"
                />
              </svg>
            </div> */}
            <div className="bg-gray-200 px-3 py-1 rounded-full text-xs font-medium text-gray-800 hidden md:block">
              {randomFruit.genus}
            </div>
          </div>
          <h3 className="font-black text-gray-800 md:text-3xl text-xl">
            {randomFruit.name}
          </h3>

          <ul className="text-xl text-gray-800">
            <li>Calories: {randomFruit.nutritions.calories}</li>
            <li>Fat: {randomFruit.nutritions.fat}</li>
            <li>Sugar: {randomFruit.nutritions.sugar}</li>
            <li>Carbohydrates: {randomFruit.nutritions.carbohydrates}</li>
            <li>Protein: {randomFruit.nutritions.protein}</li>
          </ul>

          {/* <p className="text-xl font-black text-gray-800">
            $110
            <span className="font-normal text-gray-600 text-base">/night</span>
          </p> */}
        </div>
      </div>
    </div>
  )
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
  )
}

export default App
