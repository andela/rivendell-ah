const createArticleResponse = (article, username, bio, image, slug) => ({
  id: article.id,
  title: article.title,
  description: article.description,
  body: article.body,
  slug,
  image: article.image,
  createdAt: article.createdAt,
  updatedAt: article.updatedAt,
  author: {
    username,
    bio,
    image,
  },
});
export default {
  createArticleResponse,
};
