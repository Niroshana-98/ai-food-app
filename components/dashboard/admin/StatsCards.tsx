import { Card, CardContent } from '@/components/ui/card'
import { Users, ShoppingBag, TrendingUp, MapPin } from 'lucide-react'

interface StatsCardsProps {
  restaurants: any[]
  users: any[]
}

export default function StatsCards({ restaurants, users }: StatsCardsProps) {
  const totalOrders = restaurants.reduce((sum, r) => sum + (r.totalOrders || 0), 0)
  const totalRevenue = restaurants.reduce((sum, r) => sum + (r.revenue || 0), 0)

  const stats = [
    { 
      title: "Total Users", 
      value: users.length.toLocaleString(), 
      icon: Users, 
      color: "bg-blue-500" 
    },
    { 
      title: "Total Orders", 
      value: totalOrders.toLocaleString(), 
      icon: ShoppingBag, 
      color: "bg-green-500" 
    },
    { 
      title: "Revenue", 
      value: `$${totalRevenue.toLocaleString()}`, 
      icon: TrendingUp, 
      color: "bg-purple-500" 
    },
    { 
      title: "Restaurants", 
      value: restaurants.length.toString(), 
      icon: MapPin, 
      color: "bg-orange-500" 
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-full ${stat.color}`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}