import { PostRepository } from "../repositories/postRepository";
import { CreatePostInput, UpdatePostInput } from "../validations";
import logger from "../utils/logger";

export class PostService {
  private postRepository: PostRepository;

  constructor() {
    this.postRepository = new PostRepository();
  }

  async createPost(postData: CreatePostInput & { authorId: number }) {
    const slug = this.generateSlug(postData.title);

    const post = await this.postRepository.create({
      ...postData,
      slug,
      publishedAt: postData.isPublished ? new Date() : null,
    });

    return post;
  }

  async getPostById(id: number) {
    const post = await this.postRepository.findById(id);
    if (!post) {
      throw new Error("Post not found");
    }
    return post;
  }

  async getPosts(
    page: number = 1,
    limit: number = 10,
    publishedOnly: boolean = true
  ) {
    return await this.postRepository.findAll(page, limit, publishedOnly);
  }

  async updatePost(id: number, postData: UpdatePostInput, authorId?: number) {
    const existingPost = await this.postRepository.findById(id);
    if (!existingPost) {
      throw new Error("Post not found");
    }

    if (authorId && existingPost.authorId !== authorId) {
      throw new Error("Not authorized to update this post");
    }

    const updateData: any = { ...postData };
    if (postData.isPublished && !existingPost.isPublished) {
      updateData.publishedAt = new Date();
    }

    const post = await this.postRepository.update(id, updateData);
    if (!post) {
      throw new Error("Failed to update post");
    }

    return post;
  }

  async deletePost(id: number, authorId?: number) {
    if (authorId) {
      const existingPost = await this.postRepository.findById(id);
      if (!existingPost) {
        throw new Error("Post not found");
      }
      if (existingPost.authorId !== authorId) {
        throw new Error("Not authorized to delete this post");
      }
    }

    const success = await this.postRepository.delete(id);
    if (!success) {
      throw new Error("Failed to delete post");
    }

    return success;
  }

  async getUserPosts(authorId: number, page: number = 1, limit: number = 10) {
    return await this.postRepository.findByAuthor(authorId, page, limit);
  }

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  }
}
