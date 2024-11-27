import express from "express";
import { userRoutes } from "../modules/User/user.route";
import { AuthRoutes } from "../modules/Auth/auth.routes";
import { PostRouter } from "../modules/Post/post.route";
import { productsRoutes } from "../modules/product/product.routes";
import { reviewRoutes } from "../modules/review/review.route";


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
    path: "/product",
    route: productsRoutes,
  },
  {
    path: "/review",
    route: reviewRoutes,
  },

];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
