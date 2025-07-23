"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BarChart3, Users, Car, TrendingUp, AlertTriangle } from "lucide-react"
import { AdminManagement } from "./admin-management"
import { SlotManagement } from "./slot-management"
import { useState, useEffect } from "react"
import { LoginForm } from "./login-form" // Adjust path as needed
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog" // Ensure @radix-ui/react-dialog is installed

export function AdminDashboard({ parkingSlots, onSlotsUpdate }) {
  const occupiedSlots = parkingSlots.filter((slot) => slot.status === "occupied").length
  const availableSlots = parkingSlots.filter((slot) => slot.status === "available").length
  const blockedSlots = parkingSlots.filter((slot) => slot.status === "blocked").length
  const occupancyRate = Math.round((occupiedSlots / parkingSlots.length) * 100)

  const recentBookings = parkingSlots
    .filter((slot) => slot.bookedAt)
    .sort((a, b) => new Date(b.bookedAt) - new Date(a.bookedAt))
    .slice(0, 5)

  const handleExportReport = () => {
    const headers = ["Slot Number,Status,Vehicle Number,Booked By,Booked At"]
    const rows = parkingSlots.map((slot) =>
      `${slot.number},${slot.status},${slot.vehicleNumber || ""},${slot.bookedBy || ""},${
        slot.bookedAt ? new Date(slot.bookedAt).toLocaleString() : ""
      }`
    )
    const csvContent = [headers, ...rows].join("\n")
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `parking_report_${new Date().toISOString().split("T")[0]}.csv`
    link.click()
    window.URL.revokeObjectURL(url)
  }

  // State to manage the list of users
  const [users, setUsers] = useState([
    { id: 1, name: "John Doe", email: "john@example.com", role: "user", status: "Active", vehicleNumber: "ABC123" },
    { id: 2, name: "Jane Smith", email: "jane@parking.com", role: "attendant", status: "Active" },
    { id: 3, name: "Admin User", email: "admin@parking.com", role: "admin", status: "Active", adminLevel: "manager" },
  ])
  const [isAddUserOpen, setIsAddUserOpen] = useState(false)

  // Handle new user addition
  const handleUserAdded = (newUser) => {
    setUsers((prevUsers) => [
      ...prevUsers,
      { ...newUser, id: Date.now(), status: "Active" }, // Assign a unique ID and default status
    ])
    setIsAddUserOpen(false) // Close modal
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Admin Dashboard</h2>
        <Button variant="outline" onClick={handleExportReport}>
          <BarChart3 className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Slots</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{parkingSlots.length}</div>
            <p className="text-xs text-muted-foreground">Parking capacity</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Occupied</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{occupiedSlots}</div>
            <p className="text-xs text-muted-foreground">Currently parked</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{availableSlots}</div>
            <p className="text-xs text-muted-foreground">Ready for booking</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Occupancy Rate</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{occupancyRate}%</div>
            <p className="text-xs text-muted-foreground">Current utilization</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="slots">Slot Management</TabsTrigger>
          <TabsTrigger value="admins">Admin Management</TabsTrigger>
          <TabsTrigger value="bookings">Recent Bookings</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Manage vehicle users and attendants</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Registered Users</h4>
                  <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm">Add New User</Button>
                    </DialogTrigger>
                    <DialogContent className="max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <CardTitle>Add New User</CardTitle>
                        <DialogDescription>Create a new user account</DialogDescription>
                      </DialogHeader>
                      <LoginForm
                        onLogin={handleUserAdded}
                        initialTab="register"
                        isModal={true}
                        onClose={() => setIsAddUserOpen(false)}
                      />
                    </DialogContent>
                  </Dialog>
                </div>
                <div className="space-y-2">
                  {users.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Users className="h-5 w-5 text-gray-500" />
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </div>
                      <Badge variant={user.role === "admin" ? "secondary" : "default"}>
                        {user.role === "user" && user.vehicleNumber
                          ? `${user.role} (${user.vehicleNumber})`
                          : user.role}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Slot Status Distribution</CardTitle>
                <CardDescription>Current status of all parking slots</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm">Available</span>
                    </div>
                    <Badge variant="outline">{availableSlots} slots</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="text-sm">Occupied</span>
                    </div>
                    <Badge variant="outline">{occupiedSlots} slots</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                      <span className="text-sm">Blocked</span>
                    </div>
                    <Badge variant="outline">{blockedSlots} slots</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>System Alerts</CardTitle>
                <CardDescription>Important notifications and warnings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {occupancyRate > 80 && (
                    <div className="flex items-center gap-2 p-2 bg-yellow-50 rounded-lg">
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm text-yellow-800">High occupancy rate: {occupancyRate}%</span>
                    </div>
                  )}
                  {blockedSlots > 0 && (
                    <div className="flex items-center gap-2 p-2 bg-red-50 rounded-lg">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <span className="text-sm text-red-800">{blockedSlots} slots blocked for maintenance</span>
                    </div>
                  )}
                  {occupancyRate < 30 && (
                    <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-green-800">Low occupancy - good availability</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="slots" className="space-y-4">
          <SlotManagement parkingSlots={parkingSlots} onSlotsUpdate={onSlotsUpdate} />
        </TabsContent>

        <TabsContent value="admins" className="space-y-4">
          <AdminManagement currentUser={{ id: 1, name: "Admin User", role: "admin" }} />
        </TabsContent>

        <TabsContent value="bookings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Bookings</CardTitle>
              <CardDescription>Latest parking slot bookings and activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentBookings.map((slot) => (
                  <div key={slot.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Car className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="font-medium">Slot {slot.number}</p>
                        <p className="text-sm text-gray-500">
                          {slot.vehicleNumber} - {slot.bookedBy}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{new Date(slot.bookedAt).toLocaleTimeString()}</p>
                      <p className="text-xs text-gray-500">{new Date(slot.bookedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
              <CardDescription>Configure parking system parameters</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Default Time Limit (hours)</label>
                    <input
                      type="number"
                      defaultValue="2"
                      className="w-full mt-1 px-3 py-2 border rounded-md"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Hourly Rate ($)</label>
                    <input
                      type="number"
                      defaultValue="5"
                      className="w-full mt-1 px-3 py-2 border rounded-md"
                    />
                  </div>
                </div>
                <Button>Save Settings</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}