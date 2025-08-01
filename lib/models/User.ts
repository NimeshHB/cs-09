import type { ObjectId } from "mongodb"

export interface User {
  _id?: ObjectId
  name: string
  email: string
  password: string
  role: "user" | "admin" | "attendant"
  phone?: string
  vehicleNumber?: string
  vehicleType?: string
  adminLevel?: "manager" | "super"
  permissions?: string[]
  status: "active" | "inactive"
  isVerified: boolean              // ✅ new field
  verificationToken?: string       // ✅ new field
  verificationTokenExpires?: Date  // ✅ optional
  lastLogin?: Date
  createdAt: Date
  updatedAt: Date
}

export interface CreateUserData {
  name: string
  email: string
  password: string
  role: "user" | "admin" | "attendant"
  phone?: string
  vehicleNumber?: string
  vehicleType?: string
  adminLevel?: "manager" | "super"
  permissions?: string[]
  status?: "active" | "inactive"
  isVerified?: boolean             // ✅ optional if default is false
}
