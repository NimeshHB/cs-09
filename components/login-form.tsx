"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Car, QrCode, CheckCircle, AlertTriangle, Clock, Search } from "lucide-react"
import { useState } from "react"

export function LoginForm({ onLogin, initialTab = "login", isModal = false, onClose }) {
  const [activeTab, setActiveTab] = useState(initialTab)
  const [showPassword, setShowPassword] = useState(false)
  const [loginData, setLoginData] = useState({ email: "", password: "" })
  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    vehicleNumber: "",
    vehicleType: "",
    role: "user",
    adminLevel: "manager", // Default for admins, optional based on role
    permissions: [], // Optional for admins
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isModal) {
      document.body.style.overflow = "hidden"
      return () => {
        document.body.style.overflow = "auto"
      }
    }
  }, [isModal])

  useEffect(() => {
    if (isModal && initialTab === "register") {
      setActiveTab("register")
    }
  }, [isModal, initialTab])

  const vehicleTypes = [
    { value: "car", label: "Car" },
    { value: "suv", label: "SUV" },
    { value: "motorcycle", label: "Motorcycle" },
    { value: "truck", label: "Truck" },
    { value: "van", label: "Van" },
    { value: "electric", label: "Electric Vehicle" },
  ]

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrors({})

    console.log("Login attempt:", loginData)
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginData),
      })
      const data = await response.json()
      console.log("Login response:", data)
      if (data.success) {
        onLogin(data.user)
      } else {
        setErrors({ login: data.error || "Login failed" })
      }
    } catch (error) {
      console.error("Login error:", error)
      setErrors({ login: "Network error. Please try again." })
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrors({})

    // Prepare data to send, excluding confirmPassword
    const registrationData = {
      name: registerData.name,
      email: registerData.email,
      password: registerData.password,
      phone: registerData.phone || undefined,
      vehicleNumber: registerData.vehicleNumber || undefined,
      vehicleType: registerData.vehicleType || undefined,
      role: registerData.role,
      adminLevel: registerData.role === "admin" ? registerData.adminLevel : undefined,
      permissions: registerData.role === "admin" ? registerData.permissions : undefined,
    }

    console.log("Register attempt:", registrationData)
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registrationData),
      })
      const data = await response.json()
      console.log("Register response:", data)
      if (data.success) {
        onLogin(data.user) // Log in the user immediately after registration
        if (onClose) onClose()
      } else {
        setErrors({ register: data.error || "Registration failed" })
      }
    } catch (error) {
      console.error("Registration error:", error)
      setErrors({ register: "Network error. Please try again." })
    } finally {
      setLoading(false)
    }
  }

  const handleQuickLogin = async (email) => {
    setLoading(true)
    setErrors({})

    const demoCredentials = {
      "admin@parking.com": "admin123",
      "manager@parking.com": "manager123",
      "attendant@parking.com": "attendant123",
      "john@example.com": "password123",
    }

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: demoCredentials[email] }),
      })
      const data = await response.json()
      if (data.success) {
        onLogin(data.user)
      } else {
        setErrors({ login: data.error || "Quick login failed" })
      }
    } catch (error) {
      console.error("Quick login error:", error)
      setErrors({ login: "Network error. Please try again." })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Attendant Dashboard</h2>
        <Badge variant="outline" className="text-sm">
          On Duty
        </Badge>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Occupied Slots</CardTitle>
            <Car className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{occupiedSlots.length}</div>
            <p className="text-xs text-muted-foreground">Currently parked</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overstays</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {occupiedSlots.filter((slot) => getOverstayStatus(slot.bookedAt)).length}
            </div>
            <p className="text-xs text-muted-foreground">Need attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Check-outs Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">8</div>
            <p className="text-xs text-muted-foreground">Completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Duration</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">1.5h</div>
            <p className="text-xs text-muted-foreground">Today's average</p>
          </CardContent>
        </Card>
      </div>

      

      {/* Active Bookings */}
      <Card>
        <CardHeader>
          <CardTitle>Active Bookings</CardTitle>
          <CardDescription>Currently occupied slots requiring attention</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {occupiedSlots.map((slot) => (
              <div
                key={slot.id}
                className={`flex items-center justify-between p-4 border rounded-lg ${
                  getOverstayStatus(slot.bookedAt) ? "border-orange-300 bg-orange-50" : "border-gray-200"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
                    <Car className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">Slot {slot.number}</p>
                    <p className="text-sm text-gray-600">{slot.vehicleNumber}</p>
                    <p className="text-xs text-gray-500">{slot.bookedBy}</p>
                  </div>
                  {errors.login && <p className="text-sm text-red-600">{errors.login}</p>}
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing In...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register" className="space-y-4">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-role">Account Type</Label>
                    <Select
                      value={registerData.role}
                      onValueChange={(value) => {
                        setRegisterData({
                          ...registerData,
                          role: value,
                          vehicleNumber: value === "user" ? registerData.vehicleNumber : "",
                          vehicleType: value === "user" ? registerData.vehicleType : "",
                          phone: value === "user" ? registerData.phone : "",
                          adminLevel: value === "admin" ? registerData.adminLevel : "manager",
                          permissions: value === "admin" ? registerData.permissions : [],
                        })
                      }}
                      disabled={loading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select account type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">Vehicle User</SelectItem>
                        <SelectItem value="attendant">Parking Attendant</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {getOverstayStatus(slot.bookedAt) && (
                    <Badge variant="destructive" className="text-xs">
                      Overstay
                    </Badge>
                  )}

                  <Button size="sm" variant="outline" onClick={() => handleCheckOut(slot.id)}>
                    Check Out
                  </Button>
                </div>
              </div>
            ))}

            {occupiedSlots.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Car className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No active bookings at the moment</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Manual Operations */}
      <Card>
        <CardHeader>
          <CardTitle>Manual Operations</CardTitle>
          <CardDescription>Handle walk-in customers and special cases</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              variant="outline"
              className="h-20 flex flex-col items-center justify-center bg-transparent"
              onClick={() => {
                const availableSlot = parkingSlots.find((slot) => slot.status === "available")
                if (availableSlot) {
                  handleManualCheckIn(availableSlot.id)
                }
              }}
            >
              <Car className="h-6 w-6 mb-2" />
              Manual Check-in
            </Button>

            <Button variant="outline" className="h-20 flex flex-col items-center justify-center bg-transparent">
              <AlertTriangle className="h-6 w-6 mb-2" />
              Report Issue
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
