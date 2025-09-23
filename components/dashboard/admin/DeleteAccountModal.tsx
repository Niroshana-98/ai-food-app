"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { api } from "@/lib/api";

interface DeleteAccountModalProps {
  userId: string; // Clerk userId
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (userId: string) => void; 
}

export function DeleteAccountModal({ userId, isOpen, onClose, onSuccess }: DeleteAccountModalProps) {
  const [loading, setLoading] = useState(false);

  const handleDeleteAccount = async () => {
    if (!userId) return;

    const promise = api.deleteUser (userId);
    toast.promise(promise, {
      loading: "Deleting account...",
      success: "Account deleted successfully 👋",
      error: "Failed to delete account",
    });

    try {
      setLoading(true);
      await promise;
      // Call onSuccess instead of redirect (for admin flow)
      onSuccess?.(userId);
    } catch (error) {
      console.error("Delete account error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-red-600 flex items-center">
            <Trash2 className="h-5 w-5 mr-2" />
            Delete Account
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-gray-700">
            Are you sure you want to permanently delete this account? This action cannot be undone.
          </p>
          <div className="flex space-x-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteAccount}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              disabled={loading}
            >
              {loading ? "Deleting..." : "Delete Account"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
