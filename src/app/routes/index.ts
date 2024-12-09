import express from "express";
import { userRoutes } from "../modules/User/user.route";
import { AuthRoutes } from "../modules/Auth/auth.routes";
import { PostRouter } from "../modules/Post/post.route";
import { productsRoutes } from "../modules/product/product.routes";
import { reviewRoutes } from "../modules/review/review.route";
import { cartRoutes } from "../modules/cart/cart.routes";
import { favouriteRoutes } from "../modules/favourite/favourite.route";
import { paymentRoutes } from "../modules/stripe/stripe.routes";
import { orderRoutes } from "../modules/order/order.routes";
import { ShareRoutes } from "../modules/Share/Share.routes";
import { FollowRoutes } from "../modules/Follow/Follow.routes";
import { awardRoutes } from "../modules/Award/award.routes";
import { educationRoutes } from "../modules/Education/education.route";
import { LikeRouter } from "../modules/Like/like.routes";
import { CommentRoutes } from "../modules/Comment/Comment.routes";
import { CommentLikeRoutes } from "../modules/CommentLike/CommentLike.routes";

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
  {
    path: "/cart",
    route: cartRoutes,
  },
  {
    path: "/favorites",
    route: favouriteRoutes,
  },
  {
    path: "/stripe",
    route: paymentRoutes,
  },
  {
    path: "/orders",
    route: orderRoutes,
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
    route: LikeRouter,
  },
  {
    path: "/comments",
    route: CommentRoutes,
  },
  {
    path: "/comments-like",
    route: CommentLikeRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
