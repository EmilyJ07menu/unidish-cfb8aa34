import stirfry from "@/assets/stirfry.jpg";
import beansToast from "@/assets/beans-toast.jpg";
import lentilCurry from "@/assets/lentil-curry.jpg";
import sausagePasta from "@/assets/sausage-pasta.jpg";

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
  },
  {
    id: "beans-toast",
    title: "Baked Beans on Toast with a Twist",
    description:
      "The classic student meal, upgraded with cheese and a pinch of chilli flakes.",
    price: 0.6,
    minutes: 7,
    serves: 1,
    tags: ["quick", "budget", "vegetarian"],
    author: "Tom",
    likes: 8,
    image: beansToast,
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
  },
];
