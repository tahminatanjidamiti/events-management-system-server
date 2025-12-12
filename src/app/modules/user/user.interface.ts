import { UserStatus, Role } from "@prisma/client";
export interface CityLocation {
  lat: number;
  lng: number;
  formattedAddress?: string;
}
export interface IUser {
  id: string;
  fullName: string;
  email: string;
  password?: string;
  role?: Role;
  interests?: string[];
  phone?: string;
  picture?: string;
  status?: UserStatus;
  isVerified?: boolean;
  bio?: string;
  city?: CityLocation;
}