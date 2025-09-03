const API_BASE = "/api"

export class ApiClient {
    private async request(endpoint: string, options: RequestInit = {}) {
        const url = `${API_BASE}${endpoint}`
        const config = {
            headers: {
                "Content-Type": "application/json",
                ...options.headers,
            },
            ...options,
        }
        const response = await fetch(url, config)
        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: "Network error" }))
            throw new Error(error.error || "Request failed")
        }

        return response.json()
    }

    // Users
    async getUsers(params?: { role?: string; status?: string }) {
        const searchParams = new URLSearchParams(params as any)
        return this.request(`/users?${searchParams}`)
    }

    async getUser(id: string) {
        return this.request(`/users/${id}`)
    }

    async createUser(userData: any) {
        return this.request("/users", {
            method: "POST",
            body: JSON.stringify(userData),
        })
    }

    async updateUser(id: string, userData: any) {
        return this.request(`/users/${id}`, {
            method: "PUT",
            body: JSON.stringify(userData),
        })
    }

    async deleteUser(id: string) {
        return this.request(`/users/${id}`, {
            method: "DELETE",
        })
    }
    // Restaurants
    async getRestaurants(params?: { status?: string; cuisine?: string; limit?: number; page?: number }) {
        const searchParams = new URLSearchParams(params as any)
        return this.request(`/restaurants?${searchParams}`)
    }

    async getRestaurant(id: string) {
        return this.request(`/restaurants/${id}`)
    }

    async createRestaurant(restaurantData: any) {
        return this.request("/restaurants", {
            method: "POST",
            body: JSON.stringify(restaurantData),
        })
    }

    async updateRestaurant(id: string, restaurantData: any) {
        return this.request(`/restaurants/${id}`, {
            method: "PUT",
            body: JSON.stringify(restaurantData),
        })
    }

    async deleteRestaurant(id: string) {
        return this.request(`/restaurants/${id}`, {
            method: "DELETE",
        })
    }

    // Dishes
    async getDishes(params?: {
        restaurantId?: string
        cuisine?: string
        category?: string
        available?: boolean
        dietaryTags?: string
        limit?: number
        page?: number
    }) {
        const searchParams = new URLSearchParams(params as any)
        return this.request(`/dishes?${searchParams}`)
    }

    async getDish(id: string) {
        return this.request(`/dishes/${id}`)
    }

    async createDish(dishData: any) {
        return this.request("/dishes", {
            method: "POST",
            body: JSON.stringify(dishData),
        })
    }

    async updateDish(id: string, dishData: any) {
        return this.request(`/dishes/${id}`, {
            method: "PUT",
            body: JSON.stringify(dishData),
        })
    }

    async deleteDish(id: string) {
        return this.request(`/dishes/${id}`, {
            method: "DELETE",
        })
    }

}
export const api = new ApiClient()
