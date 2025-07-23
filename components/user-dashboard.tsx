"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Car, Clock, MapPin, CreditCard, History } from "lucide-react"
import { UserProfile } from "./user-profile"
import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function UserDashboard({ parkingSlots, currentUser, onSlotUpdate }) {
  const userBookings = parkingSlots.filter((slot) => slot.bookedBy === currentUser.name)
  const availableSlots = parkingSlots.filter((slot) => slot.status === "available").length
  const currentBooking = userBookings.find((slot) => slot.status === "occupied")

  const handleCheckOut = (slotId) => {
    const updatedSlots = parkingSlots.map((slot) => {
      if (slot.id === slotId) {
        return {
          ...slot,
          status: "available",
          bookedBy: null,
          vehicleNumber: null,
          bookedAt: null,
        }
      }
      return slot
    })
    onSlotUpdate(updatedSlots)
  }

  const getTimeElapsed = (bookedAt) => {
    if (!bookedAt) return null
    const elapsed = Math.floor((new Date() - new Date(bookedAt)) / (1000 * 60))
    if (elapsed < 60) return `${elapsed} minutes`
    return `${Math.floor(elapsed / 60)} hours ${elapsed % 60} minutes`
  }

  // State for Payment & Billing
  const [balance, setBalance] = useState(25.50)
  const [totalSpent, setTotalSpent] = useState(48.75)
  const [paymentMethods, setPaymentMethods] = useState([
    { id: 1, type: "Visa", last4: "1234", expiry: "12/25", cardType: "Credit" },
  ])
  const [billingHistory, setBillingHistory] = useState([
    { id: 1, date: "2025-07-23", amount: 15.25, description: "Slot A05 - 2h 15m" },
    { id: 2, date: "2025-07-20", amount: 33.50, description: "Slot A03 - 1h 45m" },
  ])
  const [addFundsAmount, setAddFundsAmount] = useState("")
  const [newCard, setNewCard] = useState({ cardNumber: "", expiry: "", cvv: "", cardType: "Credit" })
  const [error, setError] = useState("")

  // Handle adding funds
  const handleAddFunds = () => {
    const amount = parseFloat(addFundsAmount)
    if (isNaN(amount) || amount <= 0) {
      alert("Please enter a valid amount")
      return
    }
    setBalance((prev) => prev + amount)
    setAddFundsAmount("")
    alert(`Added $${amount.toFixed(2)} to your balance. New balance: $${balance.toFixed(2)}`)
  }

  // Handle adding a new payment method
  const handleAddPaymentMethod = (e) => {
    e.preventDefault()
    const { cardNumber, expiry, cvv, cardType } = newCard

    // Basic validation
    if (!cardNumber || !expiry || !cvv || !cardType) {
      setError("All fields are required")
      return
    }
    if (!/^\d{12,19}$/.test(cardNumber.replace(/\s/g, ""))) {
      setError("Invalid card number (12-19 digits)")
      return
    }
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry)) {
      setError("Invalid expiry date (MM/YY)")
      return
    }
    if (!/^\d{3,4}$/.test(cvv)) {
      setError("Invalid CVV (3-4 digits)")
      return
    }

    const last4 = cardNumber.slice(-4).padStart(4, "0")
    const newMethod = {
      id: Date.now(),
      type: cardType === "Credit" || cardType === "Debit" ? cardType : "Unknown",
      last4,
      expiry,
      cardType,
    }
    setPaymentMethods((prev) => [...prev, newMethod])
    setNewCard({ cardNumber: "", expiry: "", cvv: "", cardType: "Credit" })
    setError("")
    alert("Payment method added successfully!")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">My Dashboard</h2>
        <Badge variant="outline" className="text-sm">
          Welcome, {currentUser.name}
        </Badge>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Slots</CardTitle>
            <MapPin className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{availableSlots}</div>
            <p className="text-xs text-muted-foreground">Ready for booking</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Booking</CardTitle>
            <Car className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentBooking ? currentBooking.number : "None"}</div>
            <p className="text-xs text-muted-foreground">{currentBooking ? "Currently parked" : "No active booking"}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Vehicle</CardTitle>
            <Car className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentUser.vehicleNumber || "N/A"}</div>
            <p className="text-xs text-muted-foreground capitalize">{currentUser.vehicleType || "Not specified"}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <History className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
      </div>

      {/* Current Booking Status */}
      {currentBooking && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car className="h-5 w-5 text-blue-600" />
              Active Parking Session
            </CardTitle>
            <CardDescription>You are currently parked in slot {currentBooking.number}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">Slot Number</p>
                  <p className="text-lg font-bold text-blue-600">{currentBooking.number}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Vehicle</p>
                  <p className="text-lg font-bold">{currentUser.vehicleNumber}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Duration</p>
                  <p className="text-lg font-bold text-orange-600">{getTimeElapsed(currentBooking.bookedAt)}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
                  Started at {new Date(currentBooking.bookedAt).toLocaleTimeString()}
                </div>
                <Button onClick={() => handleCheckOut(currentBooking.id)} className="bg-red-600 hover:bg-red-700">
                  Check Out
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Book</CardTitle>
            <CardDescription>Find and book an available parking slot</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">{availableSlots} slots available for immediate booking</p>
              <Button className="w-full" disabled={currentBooking || availableSlots === 0}>
                {currentBooking
                  ? "Already Parked"
                  : availableSlots === 0
                    ? "No Slots Available"
                    : "Find Available Slot"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Booking History</CardTitle>
            <CardDescription>View your recent parking sessions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div>
                  <p className="font-medium text-sm">Slot A05</p>
                  <p className="text-xs text-gray-500">Yesterday, 2:30 PM</p>
                </div>
                <Badge variant="outline" className="text-xs">
                  2h 15m
                </Badge>
              </div>
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div>
                  <p className="font-medium text-sm">Slot A03</p>
                  <p className="text-xs text-gray-500">Dec 28, 10:15 AM</p>
                </div>
                <Badge variant="outline" className="text-xs">
                  1h 45m
                </Badge>
              </div>
              <Button variant="outline" size="sm" className="w-full bg-transparent">
                View All History
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment & Billing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment & Billing
          </CardTitle>
          <CardDescription>Manage your payment methods and view billing history</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">Current Balance</h4>
              <p className="text-2xl font-bold text-green-600">${balance.toFixed(2)}</p>
              <p className="text-sm text-gray-500">Available credit</p>
            </div>
            <div>
              <h4 className="font-medium mb-2">This Month</h4>
              <p className="text-2xl font-bold">${totalSpent.toFixed(2)}</p>
              <p className="text-sm text-gray-500">Total spent</p>
            </div>
          </div>

          {/* Add Funds Dialog */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="mt-4">
                Add Funds
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Funds</DialogTitle>
                <DialogDescription>Enter the amount to add to your balance</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="addFunds">Amount ($)</Label>
                  <Input
                    id="addFunds"
                    type="number"
                    placeholder="Enter amount"
                    value={addFundsAmount}
                    onChange={(e) => setAddFundsAmount(e.target.value)}
                    min="0"
                    step="0.01"
                  />
                </div>
                <Button onClick={handleAddFunds} disabled={!addFundsAmount}>
                  Add Funds
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Payment Methods */}
          <div className="mt-4">
            <h4 className="font-medium mb-2">Payment Methods</h4>
            {paymentMethods.map((method) => (
              <div key={method.id} className="flex items-center justify-between p-2 border rounded mb-2">
                <span>
                  {method.type} ({method.cardType}) ending in {method.last4} (Exp: {method.expiry})
                </span>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setPaymentMethods(paymentMethods.filter((m) => m.id !== method.id))}
                >
                  Remove
                </Button>
              </div>
            ))}
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="mt-2">
                  Add Payment Method
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Payment Method</DialogTitle>
                  <DialogDescription>Enter your card details</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddPaymentMethod} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="cardType">Card Type</Label>
                    <Select
                      value={newCard.cardType}
                      onValueChange={(value) => setNewCard({ ...newCard, cardType: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select card type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Credit">Credit</SelectItem>
                        <SelectItem value="Debit">Debit</SelectItem>
                        <SelectItem value="Prepaid">Prepaid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cardNumber">Card Number</Label>
                    <Input
                      id="cardNumber"
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      value={newCard.cardNumber}
                      onChange={(e) => setNewCard({ ...newCard, cardNumber: e.target.value.replace(/\D/g, "") })}
                      maxLength={19}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="expiry">Expiry Date (MM/YY)</Label>
                      <Input
                        id="expiry"
                        type="text"
                        placeholder="MM/YY"
                        value={newCard.expiry}
                        onChange={(e) => setNewCard({ ...newCard, expiry: e.target.value })}
                        maxLength={5}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cvv">CVV</Label>
                      <Input
                        id="cvv"
                        type="text"
                        placeholder="123"
                        value={newCard.cvv}
                        onChange={(e) => setNewCard({ ...newCard, cvv: e.target.value.replace(/\D/g, "") })}
                        maxLength={4}
                      />
                    </div>
                  </div>
                  {error && <p className="text-sm text-red-600">{error}</p>}
                  <Button type="submit" className="w-full">
                    Add Card
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Billing History */}
          <div className="mt-4">
            <h4 className="font-medium mb-2">Billing History</h4>
            {billingHistory.map((bill) => (
              <div key={bill.id} className="flex items-center justify-between p-2 border rounded mb-2">
                <div>
                  <p className="font-medium text-sm">{bill.description}</p>
                  <p className="text-xs text-gray-500">{new Date(bill.date).toLocaleDateString()}</p>
                </div>
                <p className="text-sm font-bold">${bill.amount.toFixed(2)}</p>
              </div>
            ))}
            <Button variant="outline" size="sm" className="w-full mt-2">
              View All History
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* User Profile Management */}
      <UserProfile
        currentUser={currentUser}
        onUserUpdate={(updatedUser) => {
          console.log("User updated:", updatedUser)
        }}
      />
    </div>
  )
}