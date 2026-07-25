/**
 * The Lounge's menu — single source of truth for the menu grid, filters,
 * and item dialog on /lounge.
 *
 * Copy and prices are placeholder-grade pending the client's real menu.
 * Every item's image is left unset on purpose: <SiteImage> renders its
 * branded placeholder frame instead of a real photo until dish/drink
 * photography arrives.
 */

export const menuCategories = [
  "Food",
  "Pastries",
  "Pizza",
  "Signature Cocktail",
  "Classic Cocktails",
  "Mocktail",
  "Smoothie",
  "Juices",
  "Shots",
  "Drinks",
] as const;

export type MenuCategory = (typeof menuCategories)[number];

export type MenuItem = {
  id: string;
  name: string;
  category: MenuCategory;
  /** Naira, formatted for display (e.g. "₦6,500"). */
  price: string;
  description: string;
  /** Alt text for the placeholder image frame — swap in a real photo later. */
  image: { alt: string };
  tags?: string[];
};

export const menuItems: MenuItem[] = [
  // Food
  {
    id: "suya-platter",
    name: "Suya Platter",
    category: "Food",
    price: "₦6,500",
    description:
      "Spiced grilled beef skewers, sliced onions, and a peppered yaji dry rub. Boxx bar-food, done properly.",
    image: { alt: "Suya Platter" },
    tags: ["Popular", "Spicy"],
  },
  {
    id: "peppered-wings",
    name: "Peppered Chicken Wings",
    category: "Food",
    price: "₦5,500",
    description:
      "Deep-fried wings tossed in a fiery pepper sauce, finished with crispy onions.",
    image: { alt: "Peppered Chicken Wings" },
    tags: ["Spicy"],
  },
  {
    id: "asun-bowl",
    name: "Asun Bowl",
    category: "Food",
    price: "₦7,000",
    description:
      "Smoky, chopped, and peppered goat meat — a lounge classic built for sharing.",
    image: { alt: "Asun Bowl" },
    tags: ["Spicy"],
  },
  {
    id: "loaded-plantain-chips",
    name: "Loaded Plantain Chips",
    category: "Food",
    price: "₦4,000",
    description:
      "Crisp fried plantain chips with a smoky pepper dip on the side.",
    image: { alt: "Loaded Plantain Chips" },
  },

  // Pastries
  {
    id: "meat-pie",
    name: "Meat Pie",
    category: "Pastries",
    price: "₦1,500",
    description:
      "Flaky golden pastry filled with seasoned minced beef, carrots, and potato.",
    image: { alt: "Meat Pie" },
    tags: ["Popular"],
  },
  {
    id: "sausage-roll",
    name: "Sausage Roll",
    category: "Pastries",
    price: "₦1,200",
    description: "Buttery pastry wrapped tight around a savoury sausage filling.",
    image: { alt: "Sausage Roll" },
  },
  {
    id: "chicken-puff",
    name: "Chicken Puff",
    category: "Pastries",
    price: "₦1,500",
    description:
      "Light, flaky puff pastry packed with a peppered chicken filling.",
    image: { alt: "Chicken Puff" },
  },
  {
    id: "fruit-danish",
    name: "Fruit Danish",
    category: "Pastries",
    price: "₦1,800",
    description:
      "Sweet, buttery Danish pastry topped with a warm seasonal fruit compote.",
    image: { alt: "Fruit Danish" },
  },

  // Pizza
  {
    id: "margherita",
    name: "Margherita",
    category: "Pizza",
    price: "₦8,000",
    description:
      "San Marzano tomato, fresh mozzarella, and basil on a thin, blistered crust.",
    image: { alt: "Margherita Pizza" },
  },
  {
    id: "pepperoni-feast",
    name: "Pepperoni Feast",
    category: "Pizza",
    price: "₦9,500",
    description:
      "Loaded with pepperoni, mozzarella, and a hit of oregano — a Boxx favourite.",
    image: { alt: "Pepperoni Feast Pizza" },
    tags: ["Popular"],
  },
  {
    id: "suya-pizza",
    name: "Suya Pizza",
    category: "Pizza",
    price: "₦10,000",
    description:
      "Spiced beef suya, peppers, red onion, and a drizzle of chili oil — the house signature.",
    image: { alt: "Suya Pizza" },
    tags: ["Popular", "Spicy"],
  },
  {
    id: "bbq-chicken-pizza",
    name: "BBQ Chicken",
    category: "Pizza",
    price: "₦9,000",
    description:
      "Smoky barbecue sauce, grilled chicken, red onion, and mozzarella.",
    image: { alt: "BBQ Chicken Pizza" },
  },

  // Signature Cocktail
  {
    id: "boxxcentral-old-fashioned",
    name: "BoxxCentral Old Fashioned",
    category: "Signature Cocktail",
    price: "₦8,500",
    description:
      "House bourbon, aromatic bitters, and an orange twist. Slow-sipped, the way it should be.",
    image: { alt: "BoxxCentral Old Fashioned" },
    tags: ["Popular", "Alcoholic"],
  },
  {
    id: "lounge-sunset",
    name: "Lounge Sunset",
    category: "Signature Cocktail",
    price: "₦8,000",
    description:
      "Vodka, passionfruit, and a chili-lime rim — sweet heat in a glass.",
    image: { alt: "Lounge Sunset Cocktail" },
    tags: ["Alcoholic"],
  },
  {
    id: "osogbo-spice",
    name: "Osogbo Spice",
    category: "Signature Cocktail",
    price: "₦8,500",
    description: "Spiced rum, fresh ginger, and hibiscus over crushed ice.",
    image: { alt: "Osogbo Spice Cocktail" },
    tags: ["Alcoholic"],
  },
  {
    id: "red-room",
    name: "Red Room",
    category: "Signature Cocktail",
    price: "₦8,000",
    description: "Gin, hibiscus cordial, lime, and a long top of soda.",
    image: { alt: "Red Room Cocktail" },
    tags: ["Alcoholic"],
  },

  // Classic Cocktails
  {
    id: "mojito",
    name: "Mojito",
    category: "Classic Cocktails",
    price: "₦7,000",
    description: "White rum, fresh mint, lime, and soda over crushed ice.",
    image: { alt: "Mojito" },
    tags: ["Popular", "Alcoholic"],
  },
  {
    id: "margarita",
    name: "Margarita",
    category: "Classic Cocktails",
    price: "₦7,500",
    description: "Tequila, triple sec, and fresh lime — served with a salt rim.",
    image: { alt: "Margarita" },
    tags: ["Alcoholic"],
  },
  {
    id: "whiskey-sour",
    name: "Whiskey Sour",
    category: "Classic Cocktails",
    price: "₦7,500",
    description: "Bourbon, fresh lemon, and a silky egg-white foam.",
    image: { alt: "Whiskey Sour" },
    tags: ["Alcoholic"],
  },
  {
    id: "cosmopolitan",
    name: "Cosmopolitan",
    category: "Classic Cocktails",
    price: "₦7,500",
    description: "Vodka, cranberry, lime, and a splash of orange liqueur.",
    image: { alt: "Cosmopolitan" },
    tags: ["Alcoholic"],
  },

  // Mocktail
  {
    id: "virgin-mojito",
    name: "Virgin Mojito",
    category: "Mocktail",
    price: "₦4,500",
    description: "Fresh mint, lime, and soda, muddled and poured over ice.",
    image: { alt: "Virgin Mojito" },
    tags: ["Non-alcoholic"],
  },
  {
    id: "sunrise-fizz",
    name: "Sunrise Fizz",
    category: "Mocktail",
    price: "₦4,000",
    description: "Orange juice, grenadine, and soda layered for a sunrise pour.",
    image: { alt: "Sunrise Fizz" },
    tags: ["Non-alcoholic"],
  },
  {
    id: "berry-bliss",
    name: "Berry Bliss",
    category: "Mocktail",
    price: "₦4,500",
    description: "Mixed berry purée, lime, and soda — bright and fruit-forward.",
    image: { alt: "Berry Bliss Mocktail" },
    tags: ["Non-alcoholic"],
  },
  {
    id: "ginger-cooler",
    name: "Ginger Cooler",
    category: "Mocktail",
    price: "₦4,000",
    description: "Fresh ginger, lime, honey, and soda — a sharp, refreshing kick.",
    image: { alt: "Ginger Cooler" },
    tags: ["Non-alcoholic"],
  },

  // Smoothie
  {
    id: "mango-tango",
    name: "Mango Tango",
    category: "Smoothie",
    price: "₦4,500",
    description: "Mango, banana, and orange juice blended thick and cold.",
    image: { alt: "Mango Tango Smoothie" },
    tags: ["Popular", "Non-alcoholic"],
  },
  {
    id: "berry-burst",
    name: "Berry Burst",
    category: "Smoothie",
    price: "₦4,800",
    description: "Mixed berries, yogurt, and honey blended smooth.",
    image: { alt: "Berry Burst Smoothie" },
    tags: ["Non-alcoholic"],
  },
  {
    id: "green-detox",
    name: "Green Detox",
    category: "Smoothie",
    price: "₦4,500",
    description: "Spinach, pineapple, apple, and a touch of ginger.",
    image: { alt: "Green Detox Smoothie" },
    tags: ["Non-alcoholic"],
  },
  {
    id: "tropical-punch",
    name: "Tropical Punch",
    category: "Smoothie",
    price: "₦4,800",
    description: "Pineapple, mango, and coconut milk blended tropical-thick.",
    image: { alt: "Tropical Punch Smoothie" },
    tags: ["Non-alcoholic"],
  },

  // Juices
  {
    id: "fresh-orange",
    name: "Fresh Orange",
    category: "Juices",
    price: "₦3,500",
    description: "Chilled, hand-pressed orange juice — nothing added.",
    image: { alt: "Fresh Orange Juice" },
    tags: ["Non-alcoholic"],
  },
  {
    id: "watermelon-cooler",
    name: "Watermelon Cooler",
    category: "Juices",
    price: "₦3,500",
    description: "Fresh watermelon juice with a hint of mint.",
    image: { alt: "Watermelon Cooler Juice" },
    tags: ["Non-alcoholic"],
  },
  {
    id: "pineapple-ginger",
    name: "Pineapple Ginger",
    category: "Juices",
    price: "₦3,800",
    description: "Pineapple juice sharpened with fresh ginger.",
    image: { alt: "Pineapple Ginger Juice" },
    tags: ["Non-alcoholic"],
  },
  {
    id: "zobo",
    name: "Zobo",
    category: "Juices",
    price: "₦3,000",
    description: "House hibiscus drink with pineapple, ginger, and cloves.",
    image: { alt: "Zobo" },
    tags: ["Popular", "Non-alcoholic"],
  },

  // Shots
  {
    id: "tequila-slammer",
    name: "Tequila Slammer",
    category: "Shots",
    price: "₦2,500",
    description: "Tequila, lime, and salt — down in one.",
    image: { alt: "Tequila Slammer" },
    tags: ["Alcoholic"],
  },
  {
    id: "b-52",
    name: "B-52",
    category: "Shots",
    price: "₦3,000",
    description: "Layered coffee liqueur, Irish cream, and orange liqueur.",
    image: { alt: "B-52 Shot" },
    tags: ["Alcoholic"],
  },
  {
    id: "kamikaze",
    name: "Kamikaze",
    category: "Shots",
    price: "₦2,500",
    description: "Vodka, triple sec, and fresh lime, shaken hard and cold.",
    image: { alt: "Kamikaze Shot" },
    tags: ["Alcoholic"],
  },
  {
    id: "jagerbomb",
    name: "Jägerbomb",
    category: "Shots",
    price: "₦3,500",
    description: "A shot of Jägermeister dropped straight into an energy drink.",
    image: { alt: "Jägerbomb" },
    tags: ["Popular", "Alcoholic"],
  },

  // Drinks
  {
    id: "chilled-beer",
    name: "Chilled Beer",
    category: "Drinks",
    price: "₦2,000",
    description: "Ice-cold lager served in a frosted mug.",
    image: { alt: "Chilled Beer" },
    tags: ["Popular", "Alcoholic"],
  },
  {
    id: "house-red-wine",
    name: "House Red Wine",
    category: "Drinks",
    price: "₦4,500",
    description: "A glass of the house red — smooth and easy to sip.",
    image: { alt: "House Red Wine" },
    tags: ["Alcoholic"],
  },
  {
    id: "house-white-wine",
    name: "House White Wine",
    category: "Drinks",
    price: "₦4,500",
    description: "A glass of the house white, chilled and crisp.",
    image: { alt: "House White Wine" },
    tags: ["Alcoholic"],
  },
  {
    id: "sparkling-water",
    name: "Sparkling Water",
    category: "Drinks",
    price: "₦1,500",
    description: "Chilled sparkling water with a wedge of lime.",
    image: { alt: "Sparkling Water" },
    tags: ["Non-alcoholic"],
  },
];
