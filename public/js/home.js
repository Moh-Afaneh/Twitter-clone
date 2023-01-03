$.get("/api/posts", { followingOnly: true }, (postData, status, xhr) => {
  outputPosts(postData, $(".postContainer"));
});
