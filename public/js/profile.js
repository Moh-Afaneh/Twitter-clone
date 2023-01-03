$(document).ready(() => {
  if (selectedTab === "replies") {
    loadData(true);
  } else {
    loadData(false);
  }
});
function loadData(cond) {
  $.get(
    "/api/posts",
    { postedBy: profileUserId, isReply: cond, pinned: true },
    (postData, status, xhr) => {
      outputPinned(postData, $(".pinnedPostContainer"));
    }
  );
  $.get(
    "/api/posts",
    { postedBy: profileUserId, isReply: cond },
    (postData, status, xhr) => {
      outputPosts(postData, $(".postContainer"));
    }
  );
}
function outputPinned(results, container) {
  if (!results.length) return container.hide();
  container.html("");
  results.forEach((element) => {
    const html = createPostHtml(element);
    container.append(html);
  });
}
