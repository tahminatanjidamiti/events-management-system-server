export interface IFriendRequestPayload {
  receiverId: string;
}

export interface IFriendUpdatePayload {
  requestId: string;
  action: "accept" | "reject";
}

export interface IFollowPayload {
  followingId: string;
}

export interface ISaveEventPayload {
  eventId: string;
}

export interface IReviewPayload {
  eventId: string;
  rating: number;
  comment?: string;
}