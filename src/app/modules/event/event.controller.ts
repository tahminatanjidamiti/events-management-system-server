import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import httpStatus from "http-status";
import { EventService } from "./event.service";
import pick from "../../helper/pick";
import { eventFilterableFields } from "./event.constant";


const createEvent = catchAsync(
  async (req: Request, res: Response) => {
    const result = await EventService.createEvent(req);

    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "Event created successfully",
      data: result,
    });
  }
);

const updateEvent = catchAsync(async (req: Request, res: Response) => {
  const result = await EventService.updateEvent(req.params.id, req);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Event updated",
    data: result,
  });
});
const getAISuggestions = catchAsync(async (req: Request, res: Response) => {
    const result = await EventService.getAISuggestions(req.body);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'AI suggestions fetched successfully',
        data: result,
    });
});
const getEvent = catchAsync(async (req: Request, res: Response) => {
  const result = await EventService.getEventById(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Event fetched",
    data: result,
  });
});

const listEvents = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, eventFilterableFields);
  const options = pick(req.query, ["page", "limit", "sortBy", "sortOrder"]);
  const result = await EventService.listEvents(filters, options);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Events fetched successfully",
    meta: result.meta,
    data: result.data,
  });
});

const deleteEvent = catchAsync(async (req: Request, res: Response) => {
  const result = await EventService.deleteEvent(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Event deleted",
    data: result,
  });
});

export const EventController = {
  createEvent,
  updateEvent,
  getAISuggestions,
  getEvent,
  listEvents,
  deleteEvent,
};