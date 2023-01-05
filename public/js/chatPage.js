$(document).ready(() => {
  $.ajax({
    url: "/api/chats/" + chatId,
    type: "GET",
    success: (data, status, xhr) => {
      $("#chatName").text(getChatName(data));
    },
  });
  $.ajax({
    url: `/api/chats/${chatId}/messages`,
    type: "GET",
    success: (data, status, xhr) => {
      const messages = [];
      data.forEach((message) => {
        const html = createMessageHtml(message);
        messages.push(html);
      });
      const messageHtml = messages.join("");
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
      if (xhr.status != 201) {
        $("#chatMessageFeild").val(content);
        return;
      }
      outputMessageHtml(message);
    },
  });
}
function outputMessageHtml(message) {
  if (!message || !message._id) {
    console.log("message is not Valid");
    return;
  }
  let messageDiv = createMessageHtml(message);
  $(".chatMessages").append(messageDiv);
}
function createMessageHtml(message) {
  let isMine = message.sender._id === user._id;
  let liClassName = isMine ? "mine" : "theirs";
  return `<li class="message ${liClassName}">
              <div class="messageContainer">
                  <span class="messageBody">
                       ${message.content}
                  </span>
              </div>
          </li>`;
}
