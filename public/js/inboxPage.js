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
function creatChatHtml(chatItem) {
  let chatName = getChatName(chatItem); // to do later
  let lastestMessages = getlastestMessage(chatItem.lastestMessage);
  let image = getChatImageElement(chatItem); // to do later
  return `
        <a class="resultsListItem" href="/messages/${chatItem._id}">
            ${image}
            <div class="resultsDetailsContainer ellipsis">
                <span class="heading ellipsis">${chatName}</span>
                <span class="subText ellipsis">${lastestMessages}</span>
            </div>
        </a>`;
}
function getlastestMessage(message) {
  if (message !== undefined) {
    const sender = message.sender;
    return `${sender.firstname} ${sender.lastname}: ${message.content}`;
  } else {
    return "New chat";
  }
}
function getChatImageElement(chatItem) {
  let otherChatUsers = getOtherChatUsers(chatItem.users);
  let groupChatClass = "";
  let chatImage = getUserChatImageElement(otherChatUsers[0]);
  if (otherChatUsers.length > 1) {
    groupChatClass = "groupChatImage";
    chatImage += getUserChatImageElement(otherChatUsers[1]);
  }
  return `<div class="resultsImageContainer ${groupChatClass}">${chatImage}</div>`;
}
function getUserChatImageElement(user) {
  if (!user || !user.profilePic) {
    return alert("user passed invalid");
  } else {
    return `<img src ="${user.profilePic}" alt="user profile pic"/>`;
  }
}
