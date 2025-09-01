"use client"

import { useState, useEffect } from "react"
import { api } from "@/lib/api"

export function useRestaurants(params?: any) {
    const [data, setData] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchData = async () => {
        try {
            setLoading(true)
            const response = await api.getRestaurants(params)
            setData(response.restaurants || [])
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred")
        } finally {
            setLoading(false)
        }
    }
    useEffect(() => {
        fetchData()
    }, [JSON.stringify(params)])

    return { data, loading, error, refetch: () => fetchData() }
}