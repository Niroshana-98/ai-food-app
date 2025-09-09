"use client";

import { useState, useEffect } from "react";
import { Badge } from '@/components/ui/badge';

export default function OrderTab() {

    const recentOrders = [
        {
        id: 1,
        customer: "John Doe",
        dish: "Chicken Tikka Masala",
        restaurant: "Spice Garden",
        status: "Delivered",
        amount: "$21.58",
        time: "2 hours ago"
        },
        {
        id: 2,
        customer: "Jane Smith",
        dish: "Pad Thai",
        restaurant: "Thai Basil",
        status: "Preparing",
        amount: "$18.99",
        time: "30 minutes ago"
        }
    ]

    return(
        <div className="space-y-4">
            {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-100">
                    <div>
                        <h3 className="font-semibold">{order.customer}</h3>
                        <p className="text-sm text-gray-600">{order.dish} from {order.restaurant}</p>
                        <p className="text-sm text-gray-500">{order.time}</p>
                    </div>
                    <div className="text-right">
                        <div className="font-medium text-lg">{order.amount}</div>
                        <Badge variant={order.status === 'Delivered' ? 'default' : 'secondary'}>
                        {order.status}
                        </Badge>
                    </div>
                </div>
            ))}
        </div>
    );
}