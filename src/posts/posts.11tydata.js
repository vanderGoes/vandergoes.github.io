export default {
  layout: "post",
  permalink: (data) => `/${data.page.date.getUTCFullYear()}/${data.slug || data.page.fileSlug}/`,
};
