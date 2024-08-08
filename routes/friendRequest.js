import { Router } from "express";
import FriendRequestController from "../controller/FriendRequestController.js";

const FriendRequestRoute = Router();

FriendRequestRoute.get(
  "/getAllFriendRequest/:userId",
  FriendRequestController.fetchAllFriendRequest
);
FriendRequestRoute.patch(
  "/updateStatus/:friendRequestId",
  FriendRequestController.updateFriendRequestStatus
);

FriendRequestRoute.post(
  "/acceptFriendRequest/",
  FriendRequestController.acceptFriendRequest
);


export default FriendRequestRoute;
