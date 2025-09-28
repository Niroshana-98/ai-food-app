import mongoose from 'mongoose';
import { OpenAI } from 'openai';
import Restaurant, { IRestaurant } from '../models/Restaurant';
import Dish, { IDish } from '../models/Dish';

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: "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",
});

// Function to generate embeddings using OpenAI
async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: text,
    });
    return response.data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    // Fallback to mock embedding if API fails
    return Array.from({ length: 1536 }, () => Math.random() * 2 - 1);
  }
}

// Helper function to create searchable text for dish embeddings
function createDishSearchableText(dish: any): string {
  return [
    dish.name,
    dish.description,
    dish.category,
    dish.cuisineType,
    dish.ingredients.join(' '),
    dish.dietaryTags.join(' ')
  ].filter(Boolean).join(' ');
}

// Comprehensive dish data organized by cuisine type
const dishTemplates = {
  "American": {
    categories: ["Appetizers", "Main Course", "Desserts", "Beverages"],
    dishes: [
      {
        name: "Classic Caesar Salad",
        category: "Appetizers",
        price: { min: 12, max: 16 },
        description: "Crisp romaine lettuce with house-made Caesar dressing, aged parmesan cheese, garlic croutons, and anchovies",
        preparationTime: 10,
        ingredients: ["romaine lettuce", "parmesan cheese", "croutons", "anchovies", "caesar dressing", "black pepper"],
        dietaryTags: ["vegetarian"]
      },
      {
        name: "Buffalo Chicken Wings",
        category: "Appetizers", 
        price: { min: 14, max: 18 },
        description: "Crispy chicken wings tossed in tangy buffalo sauce, served with celery sticks and blue cheese dip",
        preparationTime: 20,
        ingredients: ["chicken wings", "buffalo sauce", "celery", "blue cheese", "butter", "hot sauce"],
        dietaryTags: ["gluten-free", "spicy"]
      },
      {
        name: "Grilled Ribeye Steak",
        category: "Main Course",
        price: { min: 32, max: 45 },
        description: "Prime 12oz ribeye steak grilled to perfection, served with garlic mashed potatoes and seasonal vegetables",
        preparationTime: 25,
        ingredients: ["ribeye steak", "garlic", "potatoes", "butter", "seasonal vegetables", "herbs"],
        dietaryTags: ["gluten-free"]
      },
      {
        name: "Classic Cheeseburger",
        category: "Main Course",
        price: { min: 16, max: 22 },
        description: "Juicy beef patty with aged cheddar, lettuce, tomato, onion, and special sauce on a brioche bun",
        preparationTime: 15,
        ingredients: ["ground beef", "cheddar cheese", "lettuce", "tomato", "onion", "brioche bun", "special sauce"],
        dietaryTags: []
      },
      {
        name: "New York Cheesecake",
        category: "Desserts",
        price: { min: 8, max: 12 },
        description: "Rich and creamy New York style cheesecake with graham cracker crust and berry compote",
        preparationTime: 5,
        ingredients: ["cream cheese", "graham crackers", "sugar", "eggs", "vanilla", "mixed berries"],
        dietaryTags: ["vegetarian"]
      }
    ]
  },
  "Italian": {
    categories: ["Antipasti", "Pasta", "Pizza", "Main Course", "Desserts"],
    dishes: [
      {
        name: "Bruschetta Trio",
        category: "Antipasti",
        price: { min: 12, max: 16 },
        description: "Three varieties of toasted bread topped with fresh tomatoes, basil, mozzarella, and prosciutto",
        preparationTime: 10,
        ingredients: ["bread", "tomatoes", "basil", "mozzarella", "prosciutto", "olive oil", "balsamic vinegar"],
        dietaryTags: []
      },
      {
        name: "Spaghetti Carbonara",
        category: "Pasta",
        price: { min: 18, max: 24 },
        description: "Classic Roman pasta with pancetta, eggs, pecorino romano, and black pepper",
        preparationTime: 15,
        ingredients: ["spaghetti", "pancetta", "eggs", "pecorino romano", "black pepper", "olive oil"],
        dietaryTags: []
      },
      {
        name: "Margherita Pizza",
        category: "Pizza",
        price: { min: 16, max: 20 },
        description: "Traditional pizza with San Marzano tomatoes, fresh mozzarella, basil, and extra virgin olive oil",
        preparationTime: 12,
        ingredients: ["pizza dough", "san marzano tomatoes", "fresh mozzarella", "basil", "olive oil"],
        dietaryTags: ["vegetarian"]
      },
      {
        name: "Osso Buco Milanese",
        category: "Main Course",
        price: { min: 28, max: 36 },
        description: "Braised veal shanks in white wine with saffron risotto and gremolata",
        preparationTime: 35,
        ingredients: ["veal shanks", "white wine", "arborio rice", "saffron", "lemon zest", "parsley", "garlic"],
        dietaryTags: ["gluten-free"]
      },
      {
        name: "Tiramisu",
        category: "Desserts",
        price: { min: 9, max: 13 },
        description: "Classic Italian dessert with coffee-soaked ladyfingers, mascarpone, and cocoa powder",
        preparationTime: 8,
        ingredients: ["ladyfingers", "espresso", "mascarpone", "eggs", "sugar", "cocoa powder", "marsala wine"],
        dietaryTags: ["vegetarian"]
      }
    ]
  },
  "Japanese": {
    categories: ["Sushi", "Appetizers", "Noodles", "Main Course", "Desserts"],
    dishes: [
      {
        name: "Salmon Avocado Roll",
        category: "Sushi",
        price: { min: 14, max: 18 },
        description: "Fresh salmon and creamy avocado wrapped in seasoned sushi rice and nori seaweed",
        preparationTime: 10,
        ingredients: ["salmon", "avocado", "sushi rice", "nori", "wasabi", "soy sauce"],
        dietaryTags: ["gluten-free"]
      },
      {
        name: "Chicken Gyoza",
        category: "Appetizers",
        price: { min: 10, max: 14 },
        description: "Pan-fried chicken dumplings with ginger soy dipping sauce",
        preparationTime: 12,
        ingredients: ["ground chicken", "cabbage", "ginger", "garlic", "dumpling wrappers", "soy sauce"],
        dietaryTags: []
      },
      {
        name: "Tonkotsu Ramen",
        category: "Noodles",
        price: { min: 16, max: 22 },
        description: "Rich pork bone broth with fresh ramen noodles, chashu pork, soft-boiled egg, and green onions",
        preparationTime: 15,
        ingredients: ["ramen noodles", "pork broth", "chashu pork", "soft-boiled egg", "green onions", "nori"],
        dietaryTags: []
      },
      {
        name: "Teriyaki Chicken Bento",
        category: "Main Course",
        price: { min: 18, max: 24 },
        description: "Grilled chicken with teriyaki glaze, steamed rice, pickled vegetables, and miso soup",
        preparationTime: 20,
        ingredients: ["chicken thigh", "teriyaki sauce", "steamed rice", "pickled vegetables", "miso paste"],
        dietaryTags: ["gluten-free"]
      },
      {
        name: "Mochi Ice Cream",
        category: "Desserts",
        price: { min: 8, max: 12 },
        description: "Sweet rice cake filled with premium ice cream in green tea, red bean, and vanilla flavors",
        preparationTime: 5,
        ingredients: ["mochi", "green tea ice cream", "red bean ice cream", "vanilla ice cream"],
        dietaryTags: ["vegetarian", "gluten-free"]
      }
    ]
  },
  "French": {
    categories: ["Hors d'oeuvres", "Soups", "Main Course", "Desserts"],
    dishes: [
      {
        name: "Escargots de Bourgogne",
        category: "Hors d'oeuvres",
        price: { min: 16, max: 22 },
        description: "Classic Burgundian snails in garlic herb butter with crusty French bread",
        preparationTime: 15,
        ingredients: ["escargots", "butter", "garlic", "parsley", "shallots", "white wine", "bread"],
        dietaryTags: []
      },
      {
        name: "French Onion Soup",
        category: "Soups",
        price: { min: 12, max: 16 },
        description: "Caramelized onion soup with beef broth, topped with gruyère cheese and baked crouton",
        preparationTime: 20,
        ingredients: ["yellow onions", "beef broth", "gruyère cheese", "bread", "butter", "thyme"],
        dietaryTags: ["vegetarian"]
      },
      {
        name: "Coq au Vin",
        category: "Main Course",
        price: { min: 26, max: 34 },
        description: "Braised chicken in red wine with pearl onions, mushrooms, and bacon lardons",
        preparationTime: 45,
        ingredients: ["chicken", "red wine", "pearl onions", "mushrooms", "bacon", "carrots", "herbs"],
        dietaryTags: []
      },
      {
        name: "Beef Bourguignon",
        category: "Main Course",
        price: { min: 32, max: 42 },
        description: "Slow-braised beef in Burgundy wine with carrots, onions, and mushrooms",
        preparationTime: 50,
        ingredients: ["beef chuck", "burgundy wine", "carrots", "onions", "mushrooms", "bacon", "herbs"],
        dietaryTags: []
      },
      {
        name: "Crème Brûlée",
        category: "Desserts",
        price: { min: 10, max: 14 },
        description: "Rich vanilla custard with caramelized sugar crust and fresh berries",
        preparationTime: 8,
        ingredients: ["heavy cream", "vanilla beans", "egg yolks", "sugar", "fresh berries"],
        dietaryTags: ["vegetarian", "gluten-free"]
      }
    ]
  },
  "Indian": {
    categories: ["Appetizers", "Curry", "Tandoor", "Rice & Biryani", "Desserts"],
    dishes: [
      {
        name: "Samosa Chaat",
        category: "Appetizers",
        price: { min: 8, max: 12 },
        description: "Crispy samosas topped with chickpeas, yogurt, mint chutney, and tamarind sauce",
        preparationTime: 10,
        ingredients: ["samosas", "chickpeas", "yogurt", "mint chutney", "tamarind sauce", "onions"],
        dietaryTags: ["vegetarian", "spicy"]
      },
      {
        name: "Butter Chicken",
        category: "Curry",
        price: { min: 18, max: 24 },
        description: "Tender chicken in rich tomato-based curry with cream, butter, and aromatic spices",
        preparationTime: 25,
        ingredients: ["chicken", "tomatoes", "cream", "butter", "garam masala", "ginger", "garlic"],
        dietaryTags: ["gluten-free"]
      },
      {
        name: "Tandoori Mixed Grill",
        category: "Tandoor",
        price: { min: 24, max: 32 },
        description: "Assorted meats marinated in yogurt and spices, cooked in traditional clay oven",
        preparationTime: 30,
        ingredients: ["chicken tikka", "lamb kebab", "prawns", "yogurt", "spices", "mint chutney"],
        dietaryTags: ["gluten-free", "spicy"]
      },
      {
        name: "Hyderabadi Biryani",
        category: "Rice & Biryani",
        price: { min: 20, max: 28 },
        description: "Aromatic basmati rice layered with spiced mutton, saffron, and fried onions",
        preparationTime: 35,
        ingredients: ["basmati rice", "mutton", "saffron", "fried onions", "yogurt", "biryani spices"],
        dietaryTags: ["gluten-free", "spicy"]
      },
      {
        name: "Gulab Jamun",
        category: "Desserts",
        price: { min: 6, max: 10 },
        description: "Soft milk dumplings in cardamom-scented sugar syrup, served warm",
        preparationTime: 5,
        ingredients: ["milk powder", "flour", "sugar", "cardamom", "rose water", "ghee"],
        dietaryTags: ["vegetarian"]
      }
    ]
  },
  "Mexican": {
    categories: ["Antojitos", "Tacos", "Main Course", "Desserts"],
    dishes: [
      {
        name: "Guacamole Tradicional",
        category: "Antojitos",
        price: { min: 10, max: 14 },
        description: "Fresh avocado mashed with lime, onions, tomatoes, cilantro, and jalapeños",
        preparationTime: 8,
        ingredients: ["avocados", "lime", "onions", "tomatoes", "cilantro", "jalapeños", "salt"],
        dietaryTags: ["vegetarian", "vegan", "gluten-free", "spicy"]
      },
      {
        name: "Tacos Al Pastor",
        category: "Tacos",
        price: { min: 14, max: 18 },
        description: "Marinated pork with pineapple, onions, and cilantro on corn tortillas",
        preparationTime: 12,
        ingredients: ["pork shoulder", "pineapple", "corn tortillas", "onions", "cilantro", "achiote paste"],
        dietaryTags: ["gluten-free", "spicy"]
      },
      {
        name: "Mole Poblano",
        category: "Main Course",
        price: { min: 22, max: 30 },
        description: "Chicken in complex mole sauce with chocolate, chilies, and over 20 spices",
        preparationTime: 40,
        ingredients: ["chicken", "poblano peppers", "chocolate", "tomatoes", "onions", "various spices"],
        dietaryTags: ["gluten-free", "spicy"]
      },
      {
        name: "Cochinita Pibil",
        category: "Main Course",
        price: { min: 20, max: 26 },
        description: "Slow-roasted pork in banana leaves with achiote and sour orange marinade",
        preparationTime: 35,
        ingredients: ["pork shoulder", "achiote paste", "sour orange", "banana leaves", "red onions"],
        dietaryTags: ["gluten-free", "spicy"]
      },
      {
        name: "Tres Leches Cake",
        category: "Desserts",
        price: { min: 8, max: 12 },
        description: "Sponge cake soaked in three types of milk with cinnamon and vanilla",
        preparationTime: 10,
        ingredients: ["sponge cake", "evaporated milk", "condensed milk", "heavy cream", "cinnamon", "vanilla"],
        dietaryTags: ["vegetarian"]
      }
    ]
  },
  "Thai": {
    categories: ["Appetizers", "Soups", "Curry", "Stir-Fry", "Desserts"],
    dishes: [
      {
        name: "Fresh Spring Rolls",
        category: "Appetizers",
        price: { min: 9, max: 13 },
        description: "Rice paper rolls with fresh herbs, vegetables, and shrimp, served with peanut sauce",
        preparationTime: 12,
        ingredients: ["rice paper", "shrimp", "lettuce", "herbs", "carrots", "cucumber", "peanut sauce"],
        dietaryTags: ["gluten-free"]
      },
      {
        name: "Tom Yum Goong",
        category: "Soups",
        price: { min: 14, max: 18 },
        description: "Spicy and sour soup with prawns, mushrooms, lemongrass, and lime leaves",
        preparationTime: 15,
        ingredients: ["prawns", "mushrooms", "lemongrass", "lime leaves", "chili paste", "lime juice"],
        dietaryTags: ["gluten-free", "spicy"]
      },
      {
        name: "Green Curry Chicken",
        category: "Curry",
        price: { min: 16, max: 22 },
        description: "Aromatic green curry with chicken, Thai eggplant, bamboo shoots, and basil",
        preparationTime: 20,
        ingredients: ["chicken", "green curry paste", "coconut milk", "thai eggplant", "bamboo shoots", "basil"],
        dietaryTags: ["gluten-free", "spicy"]
      },
      {
        name: "Pad Thai",
        category: "Stir-Fry",
        price: { min: 14, max: 18 },
        description: "Classic stir-fried rice noodles with shrimp, tofu, bean sprouts, and tamarind sauce",
        preparationTime: 12,
        ingredients: ["rice noodles", "shrimp", "tofu", "bean sprouts", "eggs", "tamarind sauce", "peanuts"],
        dietaryTags: ["gluten-free"]
      },
      {
        name: "Mango Sticky Rice",
        category: "Desserts",
        price: { min: 8, max: 12 },
        description: "Sweet sticky rice with fresh mango slices and coconut cream",
        preparationTime: 8,
        ingredients: ["glutinous rice", "mango", "coconut milk", "sugar", "salt"],
        dietaryTags: ["vegetarian", "vegan", "gluten-free"]
      }
    ]
  },
  "Brazilian": {
    categories: ["Appetizers", "Churrasco", "Main Course", "Desserts"],
    dishes: [
      {
        name: "Pão de Açúcar",
        category: "Appetizers",
        price: { min: 8, max: 12 },
        description: "Brazilian cheese bread balls, crispy outside and chewy inside",
        preparationTime: 10,
        ingredients: ["tapioca flour", "cheese", "eggs", "milk", "oil"],
        dietaryTags: ["vegetarian", "gluten-free"]
      },
      {
        name: "Picanha",
        category: "Churrasco",
        price: { min: 28, max: 38 },
        description: "Premium Brazilian top sirloin cap grilled over open flame with coarse salt",
        preparationTime: 20,
        ingredients: ["picanha beef", "coarse salt", "garlic"],
        dietaryTags: ["gluten-free"]
      },
      {
        name: "Moqueca de Peixe",
        category: "Main Course",
        price: { min: 22, max: 28 },
        description: "Brazilian fish stew with coconut milk, dendê oil, peppers, and cilantro",
        preparationTime: 25,
        ingredients: ["white fish", "coconut milk", "dendê oil", "bell peppers", "onions", "cilantro", "lime"],
        dietaryTags: ["gluten-free"]
      },
      {
        name: "Feijoada Completa",
        category: "Main Course",
        price: { min: 24, max: 32 },
        description: "Traditional black bean stew with assorted pork cuts, served with rice and farofa",
        preparationTime: 35,
        ingredients: ["black beans", "pork shoulder", "sausage", "bacon", "rice", "farofa", "oranges"],
        dietaryTags: []
      },
      {
        name: "Brigadeiro Gourmet",
        category: "Desserts",
        price: { min: 6, max: 10 },
        description: "Premium chocolate truffles rolled in cocoa powder and chocolate sprinkles",
        preparationTime: 5,
        ingredients: ["condensed milk", "cocoa powder", "butter", "chocolate sprinkles"],
        dietaryTags: ["vegetarian", "gluten-free"]
      }
    ]
  }
};

// Helper functions
function getRandomPrice(priceRange: { min: number; max: number }): number {
  return Math.floor(Math.random() * (priceRange.max - priceRange.min + 1)) + priceRange.min;
}

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function addVariationToName(baseName: string, index: number): string {
  const variations = [
    "",
    "Special",
    "Deluxe",
    "Premium",
    "Chef's",
    "House",
    "Signature",
    "Traditional"
  ];
  
  if (index === 0) return baseName;
  
  const variation = getRandomElement(variations.slice(1));
  return `${variation} ${baseName}`;
}

function addVariationToDescription(baseDescription: string, restaurantName: string): string {
  const endings = [
    "",
    ` A signature dish at ${restaurantName}.`,
    ` Prepared with locally sourced ingredients.`,
    ` A customer favorite since our opening.`,
    ` Made with our chef's special recipe.`,
    ` Served with complimentary bread and butter.`
  ];
  
  return baseDescription + getRandomElement(endings);
}

function generatePhotoUrl(dishName: string): string {
  const timestamp = Date.now() + Math.floor(Math.random() * 100000);
  const cleanName = dishName.toLowerCase().replace(/[^a-z0-9]/g, '-');
  return `https://images.unsplash.com/photo-${timestamp}?w=400&h=300&fit=crop&q=80&auto=format&keyword=${cleanName}`;
}

// Main seed function
async function seedDishes() {
  try {
    // Connect to MongoDB
    const MONGODB_URI = "mongodb+srv://niroshanthirimadura:8NgZqOIA1j0NWOUX@cluster0.2dgfuqo.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
    if (!MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is required');
    }
    
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get all restaurants
    const restaurants = await Restaurant.find({ status: 'active' });
    if (restaurants.length === 0) {
      throw new Error('No restaurants found. Please seed restaurants first.');
    }

    console.log(`Found ${restaurants.length} restaurants`);

    // Clear existing dishes (optional)
    await Dish.deleteMany({});
    console.log('Cleared existing dishes');

    const dishesToCreate: Partial<IDish>[] = [];
    const dishesPerRestaurant = Math.ceil(150 / restaurants.length);
    let totalDishesCreated = 0;

    for (const [restaurantIndex, restaurant] of restaurants.entries()) {
      // Determine how many dishes this restaurant should get
      const numDishes = restaurantIndex === restaurants.length - 1 
        ? 150 - totalDishesCreated // Last restaurant gets remaining dishes
        : Math.min(dishesPerRestaurant, 150 - totalDishesCreated);

      if (numDishes <= 0) break;

      console.log(`Creating ${numDishes} dishes for ${restaurant.name}...`);

      // Get cuisine types for this restaurant
      const restaurantCuisines = restaurant.cuisineTypes || [];
      
      // Find matching dish templates based on cuisine
      let availableTemplates: any[] = [];
      for (const cuisine of restaurantCuisines) {
        if (dishTemplates[cuisine as keyof typeof dishTemplates]) {
          availableTemplates = availableTemplates.concat(
            dishTemplates[cuisine as keyof typeof dishTemplates].dishes
          );
        }
      }

      // If no specific templates found, use American as fallback
      if (availableTemplates.length === 0) {
        availableTemplates = dishTemplates.American.dishes;
      }

      // Create dishes for this restaurant
      for (let i = 0; i < numDishes; i++) {
        const template = getRandomElement(availableTemplates);
        const cuisineType = (getRandomElement(restaurantCuisines) as string) || 'American';
        
        const dish: Partial<IDish> = {
          restaurant: restaurant._id,
          name: addVariationToName(template.name, i),
          price: getRandomPrice(template.price),
          description: addVariationToDescription(template.description, restaurant.name),
          category: template.category,
          cuisineType: cuisineType,
          preparationTime: template.preparationTime + Math.floor(Math.random() * 10) - 5, // ±5 minutes variation
          dietaryTags: template.dietaryTags,
          ingredients: template.ingredients,
          available: Math.random() < 0.95, // 95% available
          photo: generatePhotoUrl(template.name)
        };

        // Generate embedding for the dish
        const searchableText = createDishSearchableText(dish);
        console.log(`Generating embedding for: ${dish.name} at ${restaurant.name}`);
        dish.embedding = await generateEmbedding(searchableText);

        dishesToCreate.push(dish);
        totalDishesCreated++;

        // Add small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    console.log('Inserting dishes into database...');
    // Insert dishes in batches to avoid memory issues
    const batchSize = 50;
    const createdDishes: any[] = [];
    
    for (let i = 0; i < dishesToCreate.length; i += batchSize) {
      const batch = dishesToCreate.slice(i, i + batchSize);
      const batchResult = await Dish.insertMany(batch);
      createdDishes.push(...batchResult);
      console.log(`Inserted batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(dishesToCreate.length/batchSize)} (${batchResult.length} dishes)`);
    }

    console.log(`Successfully created ${createdDishes.length} dishes`);

    // Log summary by restaurant
    const summary = await Restaurant.aggregate([
      {
        $lookup: {
          from: 'dishes',
          localField: '_id',
          foreignField: 'restaurant',
          as: 'dishes'
        }
      },
      {
        $project: {
          name: 1,
          dishCount: { $size: '$dishes' }
        }
      }
    ]);

    console.log('\nDishes created by restaurant:');
    summary.forEach(restaurant => {
      console.log(`${restaurant.name}: ${restaurant.dishCount} dishes`);
    });

    // Log summary by cuisine type
    const cuisineSummary = await Dish.aggregate([
      {
        $group: {
          _id: '$cuisineType',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    console.log('\nDishes created by cuisine type:');
    cuisineSummary.forEach(cuisine => {
      console.log(`${cuisine._id}: ${cuisine.count} dishes`);
    });

    // Log summary by category
    const categorySummary = await Dish.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    console.log('\nDishes created by category:');
    categorySummary.forEach(category => {
      console.log(`${category._id}: ${category.count} dishes`);
    });

  } catch (error) {
    console.error('Error seeding dishes:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the seed function
if (require.main === module) {
  seedDishes().catch(console.error);
}

export default seedDishes;