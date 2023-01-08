$(document).ready(() => {
  $.ajax({
    url: "/api/chats/" + chatId,
    type: "GET",
    success: (data, status, xhr) => {
      console.log(data);
      $("#chatName").text(getChatName(data));
    },
  });
  $.ajax({
    url: `/api/chats/${chatId}/messages`,
    type: "GET",
    success: (data, status, xhr) => {
      console.log(data);
      const messages = [];
      let lastestSenderId = "";
      data.forEach((message, index) => {
        const html = createMessageHtml(
          message,
          data[index + 1],
          lastestSenderId
        );
        messages.push(html);
        lastestSenderId = message.sender._id;
      });
      const messageHtml = messages.join("");
      addmMessageHtmlToPage(messageHtml);
      scrollToBottom(false);
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
    return;
  }
  createMessageHtml(message, null, "");
}
function addmMessageHtmlToPage(html) {
  $(".chatMessages").append(html);
  scrollToBottom(true);
  // scroll to bottom
}
function createMessageHtml(message, nextMessage, lastSenderId) {
  let sender = message.sender;

  let senderName = sender.firstname + " " + sender.lastname;
  let currentSenderId = sender._id;
  let nextSenderId = nextMessage !== null ? nextMessage?.sender?._id : "";
  let isFirst = lastSenderId != currentSenderId;
  let isLast = nextSenderId != currentSenderId;
  let isMine = message.sender._id === user._id;
  console.log(currentSenderId, lastSenderId, nextSenderId);
  let liClassName = isMine ? "mine" : "theirs";
  let nameElement = "";
  if (isFirst) {
    liClassName += " first";
    if (!isMine) {
      nameElement = `<span class="senderName">${senderName}</span>`;
    }
  }
  let profileImage = "";
  if (isLast) {
    liClassName += " last";
    profileImage = `<img src="${sender.profilePic}">`;
  }
  let imageContainer = "";
  if (!isMine) {
    imageContainer = `<div class="imageContainer">${profileImage}</div>`;
  }

  return `<li class="message ${liClassName}">
              ${imageContainer}
              <div class="messageContainer">
              ${nameElement}
                  <span class="messageBody">
                       ${message.content}
                  </span>
              </div>
          </li>`;
}
function scrollToBottom(animated) {
  const container = $(".chatMessages");
  const scrollNum = container[0].scrollHeight;
  console.log(scrollNum);
  if (animated) {
    container.animate({ scrollTop: scrollNum }, "slow");
  } else {
    container.scrollTop(scrollNum);
  }
}
