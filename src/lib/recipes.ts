import stirfry from "@/assets/stirfry.jpg";
import beansToast from "@/assets/beans-toast.jpg";
import lentilCurry from "@/assets/lentil-curry.jpg";
import sausagePasta from "@/assets/sausage-pasta.jpg";
import chilli from "@/assets/chilli.jpg";
import eggFriedRice from "@/assets/egg-fried-rice.jpg";
import fajitas from "@/assets/fajitas.jpg";
import tomatoSoup from "@/assets/tomato-soup.jpg";

export type Recipe = {
  id: string;
  title: string;
  description: string;
  price: number;
  minutes: number;
  serves: number;
  tags: string[];
  author: string;
  likes: number;
  image: string;
  ingredients: string[];
  steps: string[];
};

export const recipes: Recipe[] = [
  {
    id: "stir-fry",
    title: "5-Minute Student Stir-Fry",
    description:
      "A quick, cheap veggie stir-fry that's ready faster than instant noodles — and way tastier.",
    price: 0.9,
    minutes: 10,
    serves: 2,
    tags: ["quick", "vegetarian", "budget"],
    author: "Jess",
    likes: 12,
    image: stirfry,
    ingredients: [
      "1 tbsp vegetable oil",
      "300g frozen stir-fry vegetable mix",
      "2 garlic cloves, finely chopped",
      "1 tsp grated ginger (or 1/2 tsp ground)",
      "2 nests dried egg noodles (150g)",
      "2 tbsp soy sauce",
      "1 tsp honey or sugar",
      "1 tsp sesame oil (optional)",
    ],
    steps: [
      "Boil the kettle, pour over the noodles in a bowl and leave for 4 minutes, then drain.",
      "Heat the oil in a large frying pan or wok over high heat until shimmering.",
      "Add the frozen vegetables and stir-fry for 3 minutes until hot and starting to colour.",
      "Add the garlic and ginger and cook for 30 seconds, stirring so they don't burn.",
      "Tip in the drained noodles with the soy sauce and honey; toss for 1–2 minutes.",
      "Finish with sesame oil, taste, and add a splash more soy if needed.",
    ],
  },
  {
    id: "beans-toast",
    title: "Baked Beans on Toast with a Twist",
    description: "The classic student meal, upgraded with cheese and a pinch of chilli flakes.",
    price: 0.6,
    minutes: 7,
    serves: 1,
    tags: ["quick", "budget", "vegetarian"],
    author: "Tom",
    likes: 8,
    image: beansToast,
    ingredients: [
      "1 x 400g tin baked beans",
      "2 thick slices of bread",
      "30g cheddar, grated",
      "1 tsp butter",
      "1/4 tsp chilli flakes",
      "1/2 tsp Worcestershire sauce (or a dash of soy)",
      "Black pepper",
    ],
    steps: [
      "Tip the beans into a small pan with the chilli flakes and Worcestershire sauce.",
      "Simmer over medium heat for 4–5 minutes, stirring, until thick and glossy.",
      "Toast the bread and butter it while hot.",
      "Stir half the cheese through the beans until melted.",
      "Spoon the beans over the toast, scatter the rest of the cheese on top and grind over pepper.",
    ],
  },
  {
    id: "lentil-curry",
    title: "One-Pot Lentil Curry",
    description: "Hearty, filling and cheap — makes 4 portions you can freeze for later.",
    price: 1.2,
    minutes: 30,
    serves: 4,
    tags: ["vegetarian", "batch-cook", "budget"],
    author: "Aisha",
    likes: 21,
    image: lentilCurry,
    ingredients: [
      "1 tbsp oil",
      "1 onion, diced",
      "3 garlic cloves, crushed",
      "2 tsp curry powder",
      "1 tsp ground cumin",
      "1/2 tsp turmeric",
      "250g dried red lentils, rinsed",
      "1 x 400g tin chopped tomatoes",
      "1 x 400ml tin coconut milk",
      "500ml vegetable stock",
      "Handful of spinach (optional)",
      "Salt, pepper and a squeeze of lemon",
    ],
    steps: [
      "Heat the oil in a large pan and cook the onion for 5 minutes until soft.",
      "Add the garlic and spices and fry for 1 minute until fragrant.",
      "Stir in the lentils, tomatoes, coconut milk and stock.",
      "Bring to a boil, then simmer uncovered for 20 minutes, stirring now and then, until the lentils collapse.",
      "Stir in the spinach until wilted, then season with salt, pepper and lemon juice.",
      "Serve with rice or flatbread; cool leftovers quickly and freeze in portions.",
    ],
  },
  {
    id: "sausage-pasta",
    title: "Sausage and Tomato Pasta",
    description:
      "A comforting bowl of pasta featuring pork sausages in a rich, tangy tomato sauce.",
    price: 1.2,
    minutes: 20,
    serves: 1,
    tags: ["pasta", "pork", "comforting"],
    author: "Marcus",
    likes: 15,
    image: sausagePasta,
    ingredients: [
      "100g dried pasta (penne or rigatoni)",
      "2 pork sausages",
      "1 tsp oil",
      "1 garlic clove, sliced",
      "1/2 tsp dried oregano",
      "1/2 x 400g tin chopped tomatoes",
      "1 tsp tomato purée",
      "Pinch of sugar",
      "Grated parmesan or cheddar, to serve",
    ],
    steps: [
      "Cook the pasta in well-salted boiling water according to the packet.",
      "Meanwhile squeeze the sausage meat out of its skins into an oiled frying pan in rough chunks.",
      "Fry over medium-high heat for 5 minutes until browned all over.",
      "Add the garlic and oregano, cook 1 minute, then stir in the tomatoes, purée and sugar.",
      "Simmer for 8 minutes, loosening with a splash of pasta water if it gets thick.",
      "Drain the pasta, toss into the sauce, season and top with cheese.",
    ],
  },
  {
    id: "chilli-con-carne",
    title: "Batch-Cook Chilli con Carne",
    description: "A freezer-friendly chilli that gets cheaper — and better — the bigger you make it.",
    price: 1.35,
    minutes: 45,
    serves: 4,
    tags: ["batch-cook", "beef", "budget"],
    author: "Priya",
    likes: 27,
    image: chilli,
    ingredients: [
      "1 tbsp oil",
      "1 onion, diced",
      "1 red pepper, diced",
      "2 garlic cloves, crushed",
      "500g beef mince",
      "2 tsp ground cumin",
      "1 tbsp mild chilli powder",
      "1 tsp smoked paprika",
      "1 x 400g tin chopped tomatoes",
      "1 x 400g tin kidney beans, drained",
      "1 beef stock cube in 200ml water",
      "Rice and soured cream, to serve",
    ],
    steps: [
      "Fry the onion and pepper in the oil for 6–8 minutes until soft.",
      "Add the garlic and spices and cook for 1 minute.",
      "Turn the heat up, add the mince and brown it well, breaking up the lumps.",
      "Pour in the tomatoes, beans and stock and bring to a simmer.",
      "Cook uncovered for 25–30 minutes until thick and rich, stirring occasionally.",
      "Season, then serve over rice with soured cream. Freezes for up to 3 months.",
    ],
  },
  {
    id: "egg-fried-rice",
    title: "Leftover Egg Fried Rice",
    description: "Turn yesterday's rice into dinner in under ten minutes with two eggs and a wok.",
    price: 0.55,
    minutes: 10,
    serves: 2,
    tags: ["quick", "vegetarian", "leftovers"],
    author: "Danny",
    likes: 19,
    image: eggFriedRice,
    ingredients: [
      "400g cold cooked rice (cooked and chilled the day before)",
      "2 eggs, beaten",
      "1 tbsp vegetable oil",
      "100g frozen peas",
      "2 spring onions, sliced",
      "1 garlic clove, finely chopped",
      "1.5 tbsp soy sauce",
      "1/2 tsp sesame oil",
    ],
    steps: [
      "Heat half the oil in a wok over high heat and scramble the eggs for 30 seconds; tip onto a plate.",
      "Add the rest of the oil, then the garlic and white parts of the spring onion; fry 30 seconds.",
      "Add the peas and cold rice, breaking up any clumps, and stir-fry for 3–4 minutes until piping hot.",
      "Return the egg, add the soy sauce and toss everything together for 1 minute.",
      "Finish with sesame oil and the green spring onion tops.",
      "Only use rice that was chilled quickly after cooking, and reheat it until steaming.",
    ],
  },
  {
    id: "chicken-fajitas",
    title: "Sheet-Pan Chicken Fajitas",
    description: "Everything roasts on one tray — minimal washing up, maximum flavour.",
    price: 1.8,
    minutes: 30,
    serves: 3,
    tags: ["chicken", "one-pan", "sharing"],
    author: "Leah",
    likes: 24,
    image: fajitas,
    ingredients: [
      "400g chicken breast or thigh, sliced",
      "2 peppers, sliced",
      "1 red onion, sliced",
      "2 tbsp oil",
      "2 tsp smoked paprika",
      "1 tsp ground cumin",
      "1/2 tsp garlic powder",
      "1/2 tsp dried oregano",
      "Juice of 1 lime",
      "6 tortillas, to serve",
    ],
    steps: [
      "Heat the oven to 220C / 200C fan / gas 7.",
      "Toss the chicken, peppers and onion on a large baking tray with the oil and spices.",
      "Spread out in a single layer — crowding steams the veg instead of charring it.",
      "Roast for 20–22 minutes, tossing halfway, until the chicken is cooked through and the edges catch.",
      "Squeeze over the lime and warm the tortillas in the oven for the last 2 minutes.",
      "Pile into the tortillas with anything else you have: soured cream, cheese, salsa.",
    ],
  },
  {
    id: "tomato-soup",
    title: "Roasted Tomato Soup",
    description: "Six ingredients, one blender, and a soup that tastes nothing like the tin.",
    price: 0.75,
    minutes: 40,
    serves: 4,
    tags: ["vegan", "batch-cook", "budget"],
    author: "Sam",
    likes: 16,
    image: tomatoSoup,
    ingredients: [
      "800g tomatoes, halved (or 2 x 400g tins)",
      "1 onion, cut into wedges",
      "4 garlic cloves, unpeeled",
      "2 tbsp olive oil",
      "500ml vegetable stock",
      "1 tsp sugar",
      "Handful of basil",
      "Salt and black pepper",
    ],
    steps: [
      "Heat the oven to 200C / 180C fan / gas 6.",
      "Toss the tomatoes, onion and garlic with the oil, salt and pepper on a roasting tray.",
      "Roast for 30 minutes until soft and blistered.",
      "Squeeze the garlic out of its skins into a pan with the roasted veg and the stock.",
      "Simmer for 5 minutes, then blend until smooth with the sugar and most of the basil.",
      "Season to taste and serve with the rest of the basil and bread for dunking.",
    ],
  },
];

export function getRecipe(id: string) {
  return recipes.find((r) => r.id === id);
}
