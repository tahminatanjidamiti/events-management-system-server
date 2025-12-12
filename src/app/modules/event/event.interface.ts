import { EventStatus } from "@prisma/client";
export interface EventLocation {
  lat: number;
  lng: number;
  formattedAddress?: string;
}
export interface IEventCreate {
  title: string;
  eventType?: string | null;
  description: string;
  hostId: string;
  minParticipants?: number | null;
  maxParticipants?: number | null;
  image?: string | null;
  location: EventLocation;
  startDate: string | Date;
  endDate: string | Date;
  joiningFee?: number;
  status?: EventStatus;
}