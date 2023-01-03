$("#searchBox").keydown(function (e) {
  clearTimeout(timer);
  const textBox = $(e.target);
  let value = textBox.val();
  const searchType = textBox.data().search;
  timer = setTimeout(() => {
    value = textBox.val().trim();
    if (value == "") {
      $(".resultsContainer").html("");
    } else {
      search(value, searchType);
    }
  }, 1000);
});
function search(searchTerm, searchType) {
  let url = searchType === "users" ? "/api/users" : "api/posts";
  $.get(url, { search: searchTerm }, (results) => {
    if (searchType === "users") {
      outputUsers(results, $(".resultsContainer"));
    } else {
      outputPosts(results, $(".resultsContainer"));
    }
  });
}
