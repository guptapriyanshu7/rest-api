import { body } from "express-validator";

import feedController from "../controllers/feed.js";
import isAuth from "../middlewares/isAuth.js";

export default (router) => {
  router.get("/posts", isAuth, feedController.getPosts);

  router.post(
    "/post",
    isAuth,
    [
      body("title").trim().isLength({ min: 5 }),
      body("content").trim().isLength({ min: 5 }),
    ],
    feedController.createPost
  );

  router
    .route("/post/:postId")
    .get(isAuth, feedController.getPost)
    .put(
      isAuth,
      [
        body("title").trim().isLength({ min: 5 }),
        body("content").trim().isLength({ min: 5 }),
      ],
      feedController.updatePost
    )
    .delete(isAuth, feedController.deletedPost);

  return router;
};
