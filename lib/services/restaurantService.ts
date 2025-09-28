import Restaurant from "@/models/Restaurant";
import { generateEmbedding } from "@/lib/embedding";

export async function createRestaurant(data: any) {
  const text = `${data.name} ${data.description || ""} ${data.cuisineTypes?.join(",")} ${data.location || ""}`;
  const embedding = await generateEmbedding(text);

  const restaurant = new Restaurant({
    ...data,
    embedding,
  });

  return restaurant.save();
}
