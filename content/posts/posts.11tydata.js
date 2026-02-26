module.exports = {
  layout: "layouts/post.njk",
  permalink: (data) => `posts/${data.slug || data.page.fileSlug}.html`,
  premium: false
};