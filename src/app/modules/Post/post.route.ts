import { Router } from "express";
import { fileUploader } from "../../../helpars/fileUploader";
import { postController } from "./post.controller";

const router= Router();

// add post 
router.post('/add-post',fileUploader.uploadPost,postController.addPost)



export const PostRouter=router