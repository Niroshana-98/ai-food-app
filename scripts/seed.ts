import mongoose from 'mongoose';
import { OpenAI } from 'openai';
import Restaurant, { IRestaurant } from '../models/Restaurant';

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: "",
});

// Function to generate embeddings using OpenAI
async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small", // More cost-effective than ada-002
      input: text,
    });
    return response.data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    // Fallback to mock embedding if API fails
    return Array.from({ length: 1536 }, () => Math.random() * 2 - 1);
  }
}

// Helper function to create searchable text for embeddings
function createSearchableText(restaurant: any): string {
  return [
    restaurant.name,
    restaurant.description,
    restaurant.cuisines.join(' '),
    restaurant.address,
  ].filter(Boolean).join(' ');
}

// Comprehensive restaurant data with unique names, addresses, and rich descriptions
const restaurantData = {
  "United States": {
    restaurants: [
      {
        name: "Midnight Moon Steakhouse",
        cuisines: ["American", "Steakhouse"],
        address: "1847 Broadway Avenue, Manhattan, New York, NY 10019",
        description: "An upscale steakhouse featuring prime aged beef, intimate lighting with exposed brick walls, and an extensive wine cellar. Perfect for romantic dinners and business meetings with panoramic city views."
      },
      {
        name: "Coastal Harvest",
        cuisines: ["Seafood", "American"],
        address: "2156 Pacific Coast Highway, Santa Monica, CA 90405",
        description: "Fresh Pacific seafood restaurant with sustainable sourcing, outdoor ocean-view patio, and daily catch specials. Known for their lobster rolls, grilled salmon, and craft cocktails with sea salt rim."
      },
      {
        name: "The Copper Kettle Diner",
        cuisines: ["American", "Comfort Food"],
        address: "892 Lincoln Street, Chicago, IL 60614",
        description: "Classic American diner serving hearty comfort food since 1952. Famous for all-day breakfast, homemade pies, thick milkshakes, and generous portions in a nostalgic 1950s atmosphere."
      },
      {
        name: "Spice Route Kitchen",
        cuisines: ["Indian", "Vegetarian"],
        address: "3421 SW 8th Street, Little Havana, Miami, FL 33135",
        description: "Authentic Indian cuisine with extensive vegetarian options, aromatic spices, tandoor oven specialties, and traditional curry dishes. Features live sitar music on weekends and spice level customization."
      },
      {
        name: "Dragon Palace",
        cuisines: ["Chinese", "Asian Fusion"],
        address: "567 Fremont Street, Las Vegas, NV 89101",
        description: "Elegant Chinese restaurant blending traditional recipes with modern presentation. Specializes in Peking duck, dim sum brunch, hand-pulled noodles, and authentic Szechuan dishes with adjustable heat levels."
      },
      {
        name: "Lone Star BBQ Pit",
        cuisines: ["BBQ", "American"],
        address: "1234 6th Street, Austin, TX 78701",
        description: "Texas-style barbecue joint with slow-smoked meats, secret dry rub recipes, live country music, and outdoor seating. Famous for brisket, ribs, pulled pork, and homemade bourbon sauce."
      },
      {
        name: "Pike Place Chowder House",
        cuisines: ["Seafood", "American"],
        address: "95 Pike Street, Seattle, WA 98101",
        description: "Waterfront seafood restaurant featuring award-winning clam chowder, Dungeness crab, Pacific Northwest salmon, and fresh oysters. Offers harbor views and locally-sourced ingredients."
      },
      {
        name: "Mountain View Brewery",
        cuisines: ["American", "Pub Food"],
        address: "2890 Colfax Avenue, Denver, CO 80205",
        description: "Craft brewery and gastropub serving artisanal beers, gourmet burgers, loaded nachos, and Rocky Mountain oysters with panoramic mountain views and live rock music on weekends."
      },
      {
        name: "Southern Comfort Kitchen",
        cuisines: ["Southern", "Comfort Food"],
        address: "1567 Bourbon Street, New Orleans, LA 70116",
        description: "Authentic Southern cuisine with jambalaya, gumbo, fried chicken and waffles, and beignets served in historic French Quarter atmosphere with jazz music and Mardi Gras decorations."
      }
    ],
    phoneFormat: "+1-XXX-XXX-XXXX"
  },
  "Italy": {
    restaurants: [
      {
        name: "Nonna's Secret Garden",
        cuisines: ["Italian", "Mediterranean"],
        address: "Via del Babuino 150, Rome, Lazio 00187",
        description: "Family-owned trattoria hidden in a charming courtyard garden, serving traditional Roman recipes passed down through generations. Specializes in handmade pasta, osso buco, and tiramisu with outdoor herb garden dining."
      },
      {
        name: "Osteria Luna Piena",
        cuisines: ["Italian", "Seafood"],
        address: "Fondamenta delle Zattere 924, Venice, Veneto 30123",
        description: "Romantic canal-side restaurant with gondola views, specializing in Venetian seafood cuisine, fresh risotto, and local wines. Features candlelit tables, live Italian guitar, and sunset dining on the water."
      },
      {
        name: "La Bottega del Sapore",
        cuisines: ["Italian", "Wine Bar"],
        address: "Via Brera 28, Milan, Lombardy 20121",
        description: "Sophisticated wine bar and restaurant in Milan's fashion district, offering artisanal Italian cheeses, cured meats, truffle dishes, and over 300 Italian wines with knowledgeable sommelier service."
      },
      {
        name: "Pizzeria del Vesuvio",
        cuisines: ["Pizza", "Italian"],
        address: "Via dei Tribunali 94, Naples, Campania 80138",
        description: "Authentic Neapolitan pizzeria with wood-fired brick oven, traditional Margherita and Marinara pizzas, San Marzano tomatoes, and buffalo mozzarella. Family recipes from 1889 in historic Naples."
      },
      {
        name: "Trattoria Ponte Vecchio",
        cuisines: ["Italian", "Tuscan"],
        address: "Via de' Bardi 62, Florence, Tuscany 50125",
        description: "Tuscan countryside cuisine in the heart of Florence, featuring wild boar ragu, Chianti wine pairings, fresh bread baked daily, and panoramic Arno River views with Renaissance architecture backdrop."
      },
      {
        name: "Il Convivio Siciliano",
        cuisines: ["Sicilian", "Mediterranean"],
        address: "Via Etnea 45, Catania, Sicily 95131",
        description: "Vibrant Sicilian restaurant celebrating island flavors with fresh arancini, caponata, cannoli, and Mount Etna wine selections. Features traditional Sicilian music and colorful ceramic decor."
      },
      {
        name: "Ristorante Al Dente",
        cuisines: ["Italian", "Pasta"],
        address: "Corso Buenos Aires 234, Milan, Lombardy 20124",
        description: "Contemporary Italian restaurant specializing in handcrafted pasta, fresh pesto, creamy risotto, and northern Italian wines in sleek modern setting with open kitchen concept."
      },
      {
        name: "Osteria del Porto",
        cuisines: ["Seafood", "Italian"],
        address: "Via Chiaia 147, Naples, Campania 80132",
        description: "Neapolitan seafood osteria overlooking the harbor, serving fresh mussels, grilled branzino, seafood pasta, and limoncello with nautical-themed decor and fishing boat views."
      }
    ],
    phoneFormat: "+39-XXX-XXX-XXXX"
  },
  "Japan": {
    restaurants: [
      {
        name: "Sakura No Hana Sushi",
        cuisines: ["Sushi", "Japanese"],
        address: "3-15-7 Ginza, Chuo City, Tokyo 104-0061",
        description: "Master sushi chef with 30 years experience crafting omakase experiences with daily Tsukiji market fish, traditional Edomae techniques, and intimate 8-seat counter dining with sake pairings."
      },
      {
        name: "Ramen Yokocho Alley",
        cuisines: ["Ramen", "Japanese"],
        address: "1-2-3 Dotonbori, Osaka, Osaka Prefecture 542-0071",
        description: "Cozy ramen shop in historic alley serving rich tonkotsu broth simmered 24 hours, handmade noodles, chashu pork, and soft-boiled eggs. Known for late-night dining and authentic Osaka flavors."
      },
      {
        name: "Kyoto Kaiseki Garden",
        cuisines: ["Kaiseki", "Japanese"],
        address: "465 Kiyomizu, Higashiyama Ward, Kyoto 605-0862",
        description: "Traditional multi-course kaiseki dining in restored machiya townhouse with private tatami rooms, seasonal ingredients, artistic presentation, and views of bamboo gardens and temple grounds."
      },
      {
        name: "Hokkaido Snow Crab",
        cuisines: ["Seafood", "Japanese"],
        address: "7-8-15 Susukino, Chuo Ward, Sapporo, Hokkaido 064-0804",
        description: "Premium seafood restaurant specializing in Hokkaido snow crab, sea urchin, fresh scallops, and regional sake. Features ice bar seating and views of snow-covered mountains."
      },
      {
        name: "Izakaya Matsuri Festival",
        cuisines: ["Izakaya", "Japanese"],
        address: "2-4-6 Nakasu, Hakata Ward, Fukuoka 810-0801",
        description: "Lively izakaya with festival atmosphere, sharing plates, grilled yakitori, takoyaki, draft beer, and shochu cocktails. Features traditional lanterns, group seating, and karaoke rooms upstairs."
      },
      {
        name: "Zen Temple Kitchen",
        cuisines: ["Vegetarian", "Buddhist"],
        address: "1234 Koyasan, Koya, Wakayama 648-0211",
        description: "Buddhist temple cuisine (shojin ryori) featuring seasonal vegetables, tofu preparations, mountain herbs, and meditation garden views. Offers spiritual dining experience with monks' blessing ceremony."
      },
      {
        name: "Tokyo Teppanyaki House",
        cuisines: ["Teppanyaki", "Japanese"],
        address: "5-7-2 Roppongi, Minato City, Tokyo 106-0032",
        description: "Interactive teppanyaki restaurant with skilled chefs preparing wagyu beef, lobster, and vegetables on iron griddles tableside with theatrical cooking demonstrations and premium sake pairings."
      },
      {
        name: "Osaka Takoyaki Corner",
        cuisines: ["Street Food", "Japanese"],
        address: "3-6-18 Shinsekai, Naniwa Ward, Osaka 556-0002",
        description: "Authentic takoyaki specialist in vibrant Shinsekai district, serving crispy octopus balls, okonomiyaki, and draft beer in retro carnival atmosphere with neon lights and arcade games."
      }
    ],
    phoneFormat: "+81-XX-XXXX-XXXX"
  },
  "France": {
    restaurants: [
      {
        name: "L'Atelier des Saveurs",
        cuisines: ["French", "Fine Dining"],
        address: "12 Place Vendôme, 1st Arrondissement, Paris 75001",
        description: "Michelin-starred French cuisine with innovative techniques, seasonal ingredients from local markets, wine cellar with over 500 French vintages, and elegant dining room with crystal chandeliers."
      },
      {
        name: "Bistrot du Marché",
        cuisines: ["Bistro", "French"],
        address: "28 Cours Mirabeau, Aix-en-Provence, Provence 13100",
        description: "Charming Provençal bistro with outdoor terrace, daily blackboard specials, bouillabaisse, coq au vin, regional wines, and lavender-scented dining under plane trees."
      },
      {
        name: "Bouchon Lyonnais Tradition",
        cuisines: ["Lyonnaise", "French"],
        address: "15 Rue des Marronniers, Lyon, Auvergne-Rhône-Alpes 69002",
        description: "Traditional Lyonnaise bouchon serving authentic regional dishes like quenelles, saucisson, coq au vin, and local Beaujolais wines in historic checkered tablecloth setting with accordion music."
      },
      {
        name: "Café de la Côte d'Azur",
        cuisines: ["Mediterranean", "French"],
        address: "89 Promenade des Anglais, Nice, Côte d'Azur 06000",
        description: "Seaside café with Mediterranean cuisine, fresh bouillabaisse, salade niçoise, rosé wine, and panoramic views of the French Riviera with outdoor terrace dining and sea breeze."
      },
      {
        name: "Le Petit Château",
        cuisines: ["French", "Wine Bar"],
        address: "42 Rue du Château, Bordeaux, Nouvelle-Aquitaine 33000",
        description: "Intimate wine bar in historic Bordeaux featuring local vintages, cheese platters, duck confit, foie gras, and guided wine tastings in 18th-century stone cellar with candlelit ambiance."
      },
      {
        name: "Crêperie Bretonne Authentique",
        cuisines: ["Crêpes", "Breton"],
        address: "67 Rue de la Monnaie, Saint-Malo, Brittany 35400",
        description: "Traditional Breton crêperie near medieval ramparts, serving sweet and savory galettes with local cider, buckwheat flour, fresh seafood, and homemade caramel beurre salé in rustic maritime setting."
      }
    ],
    phoneFormat: "+33-X-XX-XX-XX-XX"
  },
  "India": {
    restaurants: [
      {
        name: "Royal Maharaja Palace",
        cuisines: ["North Indian", "Mughlai"],
        address: "47 Khan Market, New Delhi, Delhi 110003",
        description: "Opulent restaurant serving royal Mughlai cuisine with rich curries, tandoor specialties, biryani preparations, and traditional live ghazal music in palace-inspired setting with ornate décor and marble fountains."
      },
      {
        name: "Spice Garden of Kerala",
        cuisines: ["South Indian", "Vegetarian"],
        address: "123 Brigade Road, Bangalore, Karnataka 560001",
        description: "Authentic South Indian vegetarian cuisine featuring coconut-based curries, dosa varieties, sambar, rasam, and banana leaf dining with aromatic spices from Kerala's spice gardens and classical Carnatic music."
      },
      {
        name: "Calcutta Street Food Junction",
        cuisines: ["Bengali", "Street Food"],
        address: "89 Park Street, Kolkata, West Bengal 700016",
        description: "Vibrant street food hall celebrating Bengali culture with puchka, kathi rolls, fish curry, rosogulla sweets, and masala chai served in bustling market atmosphere with rickshaw-themed seating."
      },
      {
        name: "Bombay Chaat Company",
        cuisines: ["Maharashtrian", "Chaat"],
        address: "156 Linking Road, Bandra West, Mumbai, Maharashtra 400050",
        description: "Popular chaat destination serving Mumbai's famous vada pav, bhel puri, sev puri, and pav bhaji with tangy chutneys, fresh garnishes, and outdoor seating with Bollywood music and street art murals."
      },
      {
        name: "Rajasthani Haveli Restaurant",
        cuisines: ["Rajasthani", "Vegetarian"],
        address: "78 MG Road, Pune, Maharashtra 411001",
        description: "Traditional Rajasthani dining in haveli-style architecture with dal baati churma, gatte ki sabzi, ker sangri, and folk dance performances. Features colorful Rajasthani textiles, puppet shows, and rooftop dining."
      },
      {
        name: "Himalayan Flavors",
        cuisines: ["Tibetan", "Nepali"],
        address: "234 Mall Road, Shimla, Himachal Pradesh 171001",
        description: "Mountain cuisine restaurant serving momos, thukpa, yak cheese dishes, and butter tea with stunning Himalayan views, prayer flags decoration, and cozy fireplace seating in hill station atmosphere."
      }
    ],
    phoneFormat: "+91-XXXXX-XXXXX"
  },
  "Mexico": {
    restaurants: [
      {
        name: "Casa de los Abuelos",
        cuisines: ["Mexican", "Traditional"],
        address: "145 Av. Insurgentes Sur, Roma Norte, Mexico City, CDMX 06700",
        description: "Family-owned restaurant serving grandmother's recipes with mole poblano, cochinita pibil, handmade tortillas, and live mariachi music in colorful courtyard with murals depicting Mexican history and culture."
      },
      {
        name: "Playa del Carmen Mariscos",
        cuisines: ["Seafood", "Coastal Mexican"],
        address: "88 5ta Avenida, Playa del Carmen, Quintana Roo 77710",
        description: "Beachfront seafood restaurant with fresh ceviche, grilled whole fish, coconut shrimp, and tropical cocktails served in palapa-style setting with white sand floors and Caribbean Sea views."
      },
      {
        name: "Guadalajara Tequila Cantina",
        cuisines: ["Mexican", "Tequila Bar"],
        address: "67 Av. Chapultepec, Guadalajara, Jalisco 44140",
        description: "Traditional cantina featuring over 200 premium tequilas, authentic tacos al pastor, pozole rojo, and live banda music with hand-painted tiles, leather equipales chairs, and century-old bar atmosphere."
      },
      {
        name: "Border Fusion Kitchen",
        cuisines: ["Tex-Mex", "Fusion"],
        address: "234 Avenida Revolución, Tijuana, Baja California 22010",
        description: "Innovative border cuisine blending Mexican and American flavors with craft beer pairings, fusion tacos, loaded nachos, and rooftop dining with views of both sides of the international border."
      },
      {
        name: "Puerto Vallarta Sunset Grill",
        cuisines: ["Mexican", "Seafood"],
        address: "456 Malecón, Puerto Vallarta, Jalisco 48300",
        description: "Romantic oceanfront dining with Pacific sunset views, fresh red snapper, lobster thermidor, and tropical fruit margaritas served on elevated terrace with gentle ocean breeze and traditional guitar serenades."
      },
      {
        name: "Oaxaca Mezcal & Mole",
        cuisines: ["Oaxacan", "Regional Mexican"],
        address: "321 Calle de Alcalá, Oaxaca de Juárez, Oaxaca 68000",
        description: "Artisanal mezcal bar and restaurant celebrating Oaxacan culture with seven types of mole, grasshopper tacos, mezcal tastings, and indigenous art gallery showcasing Zapotec textiles and pottery."
      }
    ],
    phoneFormat: "+52-XX-XXXX-XXXX"
  },
  "Thailand": {
    restaurants: [
      {
        name: "Golden Buddha Thai Kitchen",
        cuisines: ["Thai", "Royal Thai"],
        address: "234 Sukhumvit Road, Khlong Toei, Bangkok 10110",
        description: "Elegant Thai restaurant serving royal palace cuisine with intricate fruit carvings, tom yum goong, pad thai, and traditional dance performances in ornate golden décor with Buddha statues and lotus pond."
      },
      {
        name: "Floating Market Café",
        cuisines: ["Thai", "Street Food"],
        address: "67 Pattaya Beach Road, Pattaya, Chonburi 20150",
        description: "Authentic floating market experience with boat-served som tam, mango sticky rice, coconut ice cream, and fresh tropical fruits in water-themed setting with traditional longtail boat seating."
      },
      {
        name: "Chiang Mai Hill Tribe Kitchen",
        cuisines: ["Northern Thai", "Ethnic"],
        address: "123 Nimmanhaemin Road, Chiang Mai 50200",
        description: "Northern Thai mountain cuisine featuring khao soi, sai ua sausage, nam prik ong, and hill tribe specialties with traditional Lanna architecture, teak wood furnishing, and mountain valley views."
      },
      {
        name: "Phuket Seafood Paradise",
        cuisines: ["Seafood", "Southern Thai"],
        address: "89 Patong Beach Road, Phuket 83150",
        description: "Beachfront seafood restaurant with live lobster tanks, grilled whole fish, curry crab, and Thai-style barbecue served on sand-floor dining with torchlight ambiance and Andaman Sea waves."
      },
      {
        name: "Koh Samui Coconut Grove",
        cuisines: ["Thai", "Tropical"],
        address: "456 Fisherman's Village, Koh Samui 84320",
        description: "Tropical paradise dining in coconut palm grove with fresh coconut curry, grilled prawns, papaya salad, and sunset cocktails served in bamboo huts with hammocks and traditional Thai spa treatments."
      },
      {
        name: "Bangkok Street Food Alley",
        cuisines: ["Street Food", "Thai"],
        address: "78 Khao San Road, Bangkok 10200",
        description: "Authentic street food experience with vendor stalls serving pad see ew, green curry, mango sticky rice, and Thai iced tea in bustling night market atmosphere with neon lights and live music."
      }
    ],
    phoneFormat: "+66-X-XXX-XXXX"
  },
  "Brazil": {
    restaurants: [
      {
        name: "Copacabana Churrascaria Ipanema",
        cuisines: ["Brazilian", "Churrasco"],
        address: "2547 Avenida Atlântica, Copacabana, Rio de Janeiro 22070-001",
        description: "Premium rodizio steakhouse with endless grilled meats, extensive salad bar, traditional feijoada, and caipirinha cocktails served with live samba music, beachfront views, and carnival-themed décor."
      },
      {
        name: "Vila Madalena Boteco",
        cuisines: ["Brazilian", "Bar Food"],
        address: "189 Rua Aspicuelta, Vila Madalena, São Paulo 05433-011",
        description: "Trendy neighborhood boteco with craft beer, pastéis, coxinhas, and live MPB music in artistic bohemian district known for street art, nightlife, and creative atmosphere with outdoor sidewalk seating."
      },
      {
        name: "Pelourinho African Heritage",
        cuisines: ["Bahian", "Afro-Brazilian"],
        address: "67 Largo do Pelourinho, Salvador, Bahia 40026-280",
        description: "Cultural dining celebrating African-Brazilian heritage with acarajé, vatapá, moqueca de camarão, and capoeira performances in colorful colonial square with cobblestone streets and historic architecture."
      },
      {
        name: "Amazonian River Fish House",
        cuisines: ["Amazonian", "Fish"],
        address: "234 SCLS 109, Brasília, DF 70372-520",
        description: "Sustainable Amazonian cuisine featuring tucumã palm, açaí bowls, grilled pirarucu fish, and exotic fruits with rainforest-themed décor, indigenous art, and environmental conservation education displays."
      },
      {
        name: "Recife Coastal Cuisine",
        cuisines: ["Northeastern", "Seafood"],
        address: "456 Avenida Boa Viagem, Recife, Pernambuco 51021-000",
        description: "Coastal Northeastern restaurant with coconut-based seafood stews, tapioca crepes, cashew fruit dishes, and forró music with ocean breeze dining, hammock lounging, and traditional ceramic pottery décor."
      },
      {
        name: "Gaúcho Pampa Grill",
        cuisines: ["Southern Brazilian", "Gaucho"],
        address: "789 Rua da Praia, Porto Alegre, Rio Grande do Sul 90010-001",
        description: "Traditional gaucho barbecue with chimarrão tea ceremony, grilled lamb, beef ribs, and regional wines served in ranch-style setting with gaucho cultural performances and leather craftsmanship displays."
      }
    ],
    phoneFormat: "+55-XX-XXXXX-XXXX"
  }
};

// Helper functions
function generatePhoneNumber(format: string): string {
  return format.replace(/X/g, () => Math.floor(Math.random() * 10).toString());
}

function generateOperatingHours() {
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const hours: Record<string, { open: string; close: string; closed: boolean }> = {};
  
  days.forEach(day => {
    const isClosed = Math.random() < 0.1; // 10% chance of being closed
    if (isClosed) {
      hours[day] = { open: "00:00", close: "00:00", closed: true };
    } else {
      const openHour = Math.floor(Math.random() * 12) + 6; // 6 AM to 5 PM
      const closeHour = Math.floor(Math.random() * 6) + 18; // 6 PM to 11 PM
      hours[day] = {
        open: `${openHour.toString().padStart(2, '0')}:00`,
        close: `${closeHour.toString().padStart(2, '0')}:00`,
        closed: false
      };
    }
  });
  
  return hours;
}

// Helper function to get a random restaurant from a country's data
function getRandomRestaurant(countryRestaurants: any[]) {
  const baseRestaurant = countryRestaurants[Math.floor(Math.random() * countryRestaurants.length)];
  return { ...baseRestaurant }; // Return a copy
}

// Helper function to generate a varied address
function generateVariedAddress(baseAddress: string, country: string): string {
  // Add a random suite/floor or number to the address for variation
  const suffixes = [
    "Suite " + (Math.floor(Math.random() * 100) + 1),
    "Floor " + (Math.floor(Math.random() * 10) + 1),
    "Unit " + (Math.floor(Math.random() * 50) + 1),
    "Apt " + (Math.floor(Math.random() * 200) + 1),
    ""
  ];
  const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
  return suffix ? `${baseAddress}, ${suffix}` : baseAddress;
}

// Helper function to generate a varied description
function generateVariedDescription(baseDescription: string, restaurantName: string): string {
  const variations = [
    `This branch of ${restaurantName} offers a unique twist on the original menu.`,
    `Experience the signature flavors of ${restaurantName} with a local touch.`,
    `Enjoy a cozy atmosphere and exclusive specials at this ${restaurantName} location.`,
    `Discover new culinary delights inspired by ${restaurantName}'s classic dishes.`,
    `A fresh take on ${restaurantName}'s renowned cuisine awaits you here.`
  ];
  const variation = variations[Math.floor(Math.random() * variations.length)];
  return `${baseDescription} ${variation}`;
}

// Main seed function
async function seedRestaurants() {
  try {
    // Connect to MongoDB
    const MONGODB_URI = "";
    if (!MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is required');
    }
    
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing restaurants (optional)
    await Restaurant.deleteMany({});
    console.log('Cleared existing restaurants');

    const countries = Object.keys(restaurantData);
    const restaurantsToCreate: Partial<IRestaurant>[] = [];
    const restaurantsPerCountry = Math.ceil(50 / countries.length);

    // Generate restaurants for each country
    for (const [countryIndex, country] of countries.entries()) {
      const countryData = restaurantData[country as keyof typeof restaurantData];
      
      const numRestaurants = countryIndex === countries.length - 1 
        ? 50 - (restaurantsPerCountry * (countries.length - 1)) // Last country gets remaining restaurants
        : restaurantsPerCountry;

      console.log(`Generating ${numRestaurants} restaurants for ${country}...`);

      // Create a shuffled array of all restaurants for this country to ensure uniqueness
      const availableRestaurants = [...countryData.restaurants];
      const usedRestaurants: any[] = [];

      for (let i = 0; i < numRestaurants; i++) {
        let restaurantTemplate;
        
        // If we have more restaurants needed than available templates, reuse with variations
        if (i < availableRestaurants.length) {
          // Use each restaurant template once first
          restaurantTemplate = availableRestaurants[i];
        } else {
          // If we need more restaurants than templates, reuse but with variations
          const baseTemplate = availableRestaurants[i % availableRestaurants.length];
          restaurantTemplate = {
            ...baseTemplate,
            name: `${baseTemplate.name} Branch`, // Add variation to avoid duplicates
            address: generateVariedAddress(baseTemplate.address, country),
            description: generateVariedDescription(baseTemplate.description, baseTemplate.name)
          };
        }

        const restaurant: Partial<IRestaurant> = {
          name: restaurantTemplate.name, // No numbers added to names
          description: restaurantTemplate.description,
          phone: generatePhoneNumber(countryData.phoneFormat),
          email: `contact@${restaurantTemplate.name.toLowerCase().replace(/[^a-z0-9]/g, '')}${Date.now()}.com`,
          website: `https://www.${restaurantTemplate.name.toLowerCase().replace(/[^a-z0-9]/g, '')}-restaurant.com`,
          address: restaurantTemplate.address,
          cuisineTypes: restaurantTemplate.cuisines,
          operatingHours: generateOperatingHours(),
          status: Math.random() < 0.8 ? "active" : "pending", // 80% active, 20% pending
          photo: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 100000000)}?w=400&h=300&fit=crop`,
        };

        // Generate embedding for the restaurant
        const searchableText = createSearchableText(restaurantTemplate);
        console.log(`Generating embedding for: ${restaurant.name}`);
        restaurant.embedding = await generateEmbedding(searchableText);

        restaurantsToCreate.push(restaurant);
        usedRestaurants.push(restaurantTemplate);
        
        // Add small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    console.log('Inserting restaurants into database...');
    // Insert restaurants
    const createdRestaurants = await Restaurant.insertMany(restaurantsToCreate);
    console.log(`Successfully created ${createdRestaurants.length} restaurants`);

    // Log summary by country
    const summary = countries.reduce((acc, country, index) => {
      const numRestaurants = index === countries.length - 1 
        ? 50 - (restaurantsPerCountry * (countries.length - 1))
        : restaurantsPerCountry;
      acc[country] = numRestaurants;
      return acc;
    }, {} as Record<string, number>);

    console.log('Restaurants created by country:', summary);

  } catch (error) {
    console.error('Error seeding restaurants:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the seed function
if (require.main === module) {
  seedRestaurants().catch(console.error);
}

export default seedRestaurants;