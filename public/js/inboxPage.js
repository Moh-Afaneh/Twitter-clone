$(document).ready(() => {
  $.get("/api/chats", (Data, status, xhr) => {
    if (xhr.status === 404) {
      console.log("something went wrong");
    } else {
      outputChats(Data, $(".resultsContainer"));
    }
  });
});
function outputChats(results, container) {
  results.forEach((chatItem) => {
    let html = creatChatHtml(chatItem);
    container.append(html);
  });
  if (results.length === 0) {
    container.append("<span class='.noResults'></span>");
  }
}
