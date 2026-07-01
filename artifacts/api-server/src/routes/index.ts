import { Router, type IRouter } from "express";
import { authMiddleware } from "../middleware/auth";
import healthRouter from "./health";
import authRouter from "./auth";
import profileRouter from "./profile";
import contactsRouter from "./contacts";
import chatsRouter from "./chats";
import messagesRouter from "./messages";
import storiesRouter from "./stories";
import callsRouter from "./calls";
import mediaRouter from "./media";
import searchRouter from "./search";
import notificationsRouter from "./notifications";
import blockRouter from "./block";
import settingsRouter from "./settings";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);

// All routes below require auth
router.use(authMiddleware);
router.use(profileRouter);
router.use(contactsRouter);
router.use(chatsRouter);
router.use(messagesRouter);
router.use(storiesRouter);
router.use(callsRouter);
router.use(mediaRouter);
router.use(searchRouter);
router.use(notificationsRouter);
router.use(blockRouter);
router.use(settingsRouter);

export default router;
