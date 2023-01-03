$(document).ready(() => {
  $.ajax({
    url: "/api/chats/" + chatId,
    type: "GET",
    success: (data, status, xhr) => {
      $("#chatName").text(getChatName(data));
    },
  });
});
$(document).ready(() => {
  $("#chatNameModelButton").click((event) => {
    let name = $("#chatNameModelTextBox").val().trim();
    $.ajax({
      url: "/api/chats/" + chatId,
      type: "PUT",
      data: { chatName: name },
      success: (data, status, xhr) => {
        location.reload();
        console.log(xhr.status);
      },
    });
  });
});
$("#chatMessageFeild").keydown((event) => {
  if (event.which === 13) {
    submitSendMessage();
    return false;
  }
});
$(".sendMessageButton").click((event) => {
  submitSendMessage();
});
function submitSendMessage() {
  let content = $("#chatMessageFeild").val().trim();
  if (content) {
    sendMessage(content);
    $("#chatMessageFeild").val("");
  }
}
function sendMessage(content) {
  $.ajax({
    url: "/api/messages",
    type: "POST",
    data: { content: content, chatId: chatId },
    success: (message, status, xhr) => {
      console.log(message, xhr.status);
      outputMessageHtml(message);
    },
  });
}
function outputMessageHtml(message) {
  if (!message || !message._id) {
    console.log("message is not Valid");
    return;
  }
  let messageDiv = createMessageHtml();
}
