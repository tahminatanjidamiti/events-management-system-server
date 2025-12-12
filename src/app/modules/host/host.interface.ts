import { HostUpdateStatus } from "@prisma/client";

export interface IHostCreate {
  message?: string;
}

export interface IHostUpdate {
  status?: HostUpdateStatus;
  reviewedAt?: Date;
}