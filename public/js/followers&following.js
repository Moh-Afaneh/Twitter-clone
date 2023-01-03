$(document).ready(() => {
  if (selectedTab === "followers") {
    loadData(true, "followers");
  } else {
    loadData(false, "following");
  }
});
function loadData(cond, Status) {
  $.get(
    `/api/users/${profileUserId}/${Status}`,
    { postedBy: profileUserId, isReply: cond },
    (postData, status, xhr) => {
      outputUsers(
        Status === "following" ? postData.following : postData.followers,
        $(".resultsContainer")
      );
    }
  );
}
