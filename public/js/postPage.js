$(document).ready(() => {
  $.get("/api/posts/" + postId, (postData, status, xhr) => {
    outputPostsWithReplies(postData, $(".postContainer"));
  });
});
