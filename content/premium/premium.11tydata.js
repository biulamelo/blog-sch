module.exports = {
  layout: "layouts/post.njk",
  permalink: (data) => `premium/${data.slug || data.page.fileSlug}.html`,
  premium: true
};