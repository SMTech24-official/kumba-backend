import express from "express";
import { userRoutes } from "../modules/User/user.route";
import { AuthRoutes } from "../modules/Auth/auth.routes";
import { PostRouter } from "../modules/Post/post.route";
import { ShareRoutes } from "../modules/Share/Share.routes";
import { FollowRoutes } from "../modules/Follow/Follow.routes";
import { awardRoutes } from "../modules/Award/award.routes";
import { educationRoutes } from "../modules/Education/education.route";
import { LikeRouter } from "../modules/Like/like.routes";

const router = express.Router();

const moduleRoutes = [
  {
    path: "/users",
    route: userRoutes,
  },
  {
    path: "/auth",
    route: AuthRoutes,
  },
  {
    path: "/post",
    route: PostRouter,
  },
  {
    path: "/share",
    route: ShareRoutes,
  },
  {
    path: "/follow",
    route: FollowRoutes,
  },
  {
    path: "/awards",
    route: awardRoutes,
  },
  {
    path: "/education",
    route: educationRoutes,
  },
  {
    path: "/like",
    route:LikeRouter ,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
