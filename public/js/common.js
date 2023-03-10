// Globles
let cropper;
let timer;
let selectedUsers = [];
// SIGN IN FORM
$(document).ready(() => {
  refreshMessagesBagde();
  refreshNotificationsBagde();
});
function outputPosts(results, container) {
  container.html("");
  if (!Array.isArray(results)) {
    results = [results];
  }
  results.forEach((element) => {
    const html = createPostHtml(element);
    container.append(html);
  });
  if (!results.length) {
    container.append("<div class='noResults'>Nothing to show.</div>");
  } else {
    container.remove(".noResults");
  }
}
function outputUsers(data, container) {
  container.html("");
  data.forEach((element) => {
    const html = createUserHtml(element, true);
    container.append(html);
  });
  if (data.length == 0) {
    container.append(
      "<div class='noFollowContainer'><span class='noFollow'>There is no one here.</span></div>"
    );
  }
}
function createUserHtml(userData, showFollowButton) {
  const name = userData.firstname + " " + userData.lastname;
  let followButton = "";
  let isFollowing = user.following && user.following.includes(userData._id);
  let text = isFollowing ? "Following" : "Follow";
  let buttonClass = isFollowing ? "followButton following" : "followButton";
  if (showFollowButton && user._id !== userData._id) {
    followButton = `<div class="followButtonContainer">
                      <button class="${buttonClass}" data-user="${userData._id}">${text}</button>
                    </div>`;
  }
  return `<div class="user">  
            <div class="userImageContainer">
              <img src="${userData.profilePic}">
            </div>
            <div class="userDetailsContainer">
            <div class="header">
                <a href="/profile/${userData.username}">${name}</a>
                <span class="username">@${userData.username}</span>
            </div>
         </div>
         ${followButton}
      </div>`;
}

function outputPostsWithReplies(results, container) {
  container.html("");
  if (results.replyTo !== undefined && results.replyTo._id !== undefined) {
    const html = createPostHtml(results.replyTo);
    container.append(html);
  }
  const mainPostHtml = createPostHtml(results.postData, true);
  container.append(mainPostHtml);
  results.replies.forEach((reply) => {
    const html = createPostHtml(reply);
    container.append(html);
  });
}

$("#postTextArea").keyup((event) => {
  const textbox = $(event.target);
  const value = textbox.val().trim();
  const submitButton = $("#submitPostButton");
  if (value == "") {
    submitButton.prop("disabled", true);
    return;
  }
  submitButton.prop("disabled", false);
});
$("#postTextArea,#postReplyArea").keyup((event) => {
  const textbox = $(event.target);
  const value = textbox.val().trim();
  const isModel = textbox.parents(".modal").length === 1;
  const submitButton = isModel
    ? $("#submitReplayButton")
    : $("#submitPostButton");
  if (value == "") {
    submitButton.prop("disabled", true);
    return;
  }
  submitButton.prop("disabled", false);
});
//messages
function outputSelectableUsers(results, container) {
  container.html("");
  results.forEach((result) => {
    if (
      result._id == user._id ||
      selectedUsers.some((u) => {
        return u._id == result._id;
      })
    ) {
      return;
    }
    const html = createUserHtml(result, false);
    let element = $(html);
    element.click(() => userSelected(result));
    container.append(element);
  });
  if (results.length == 0) {
    container.append(
      "<div class='noFollowContainer'><span class='noFollow'>There are no results my friend :( </span></div>"
    );
  }
}
function userSelected(user) {
  selectedUsers.push(user);
  updateSelectedUsersHtml();
  $("#userSearchTextBox").val("").focus();
  $(".resultsContainer").html("");
  $("#createChatButton").prop("disabled", false);
}
function updateSelectedUsersHtml() {
  let elements = [];
  selectedUsers.forEach((user) => {
    let name = user.firstname + " " + user.lastname;
    let userElement = $(`<span class="selectedUser">${name}</span>`);
    elements.push(userElement);
  });
  $(".selectedUser").remove();
  $("#selectedUsers").prepend(elements);
}

//messages
function searchUsers(searchTerm) {
  $.get("/api/users", { search: searchTerm }, (results) => {
    outputSelectableUsers(results, $(".resultsContainer"));
  });
}
$("#userSearchTextBox").keydown(function (e) {
  clearTimeout(timer);
  const textBox = $(e.target);
  let value = textBox.val();
  if (value == "" && e.keyCode == 8) {
    selectedUsers.pop();
    updateSelectedUsersHtml();
    $(".resultsContainer").html("");
    if (selectedUsers.length === 0) {
      $("#createChatButton").prop("disabled", true);
    }
    return;
  }
  timer = setTimeout(() => {
    value = textBox.val().trim();
    if (value == "") {
      $(".resultsContainer").html("");
    } else {
      searchUsers(value);
    }
  }, 1000);
});
$("#createChatButton").click((event) => {
  let data = JSON.stringify(selectedUsers);
  $.post("/api/chats", { users: data }, (chat) => {
    if (!chat || !chat._id) return alert("no chat");
    window.location.href = `/messages/${chat._id}`;
  });
});
// Reply button
$("#submitPostButton , #submitReplayButton").click((event) => {
  const btn = $(event.target);
  const isModel = btn.parents(".modal").length === 1;
  const textbox = isModel ? $("#postReplyArea") : $("#postTextArea");

  const data = {
    content: textbox.val(),
  };
  if (isModel) {
    const id = btn.data().id;
    data.replyTo = id;
  }
  $.post("/api/posts", data, (postData) => {
    if (postData) $(".noResults").remove();
    if (postData.replyTo) {
      emitNotification(postData.replyTo.postedBy);
      location.reload();
    } else {
      const html = createPostHtml(postData);
      $(".postContainer").prepend(html);
      textbox.val("");
      btn.prop("disabled", true);
    }
  });
});
$("#replyModal").on("show.bs.modal", (event) => {
  const btn = $(event.relatedTarget);
  const postId = getPostIdFromElemenet(btn);
  $("#submitReplayButton").data("id", postId);
  $.get("/api/posts/" + postId, (results) => {
    outputPosts(results.postData, $("#originalPostContainer"));
  });
});
$("#PinnedModel").on("show.bs.modal", (event) => {
  const btn = $(event.relatedTarget);
  const postId = getPostIdFromElemenet(btn);
  $("#PinnedModelButton").data("id", postId);
});
$("#unpinnedModel").on("show.bs.modal", (event) => {
  const btn = $(event.relatedTarget);
  const postId = getPostIdFromElemenet(btn);
  $("#unpinnedModelButton").data("id", postId);
});
$("#deletePostModel").on("show.bs.modal", (event) => {
  const btn = $(event.relatedTarget);
  const postId = getPostIdFromElemenet(btn);
  $("#deletePostButton").data("id", postId);
});

$("#PinnedModelButton").click((event) => {
  const postId = $(event.target).data("id");

  $.ajax({
    url: `/api/posts/${postId}`,
    data: { pinned: true },
    type: "PUT",
    success: () => {
      location.reload();
    },
  });
});
$("#editPostModel").on("show.bs.modal", (event) => {
  const btn = $(event.relatedTarget);
  const postId = getPostIdFromElemenet(btn);
  $("#editPostButton").data("id", postId);

  const textbox = $("#editPostArea");
  $("#editPostButton").data("post", postId);
  $("#submitReplayButton").data("id", postId);
  $.get("/api/posts/" + postId, (results) => {
    textbox.val(results.postData.content);
  });
});
$("#editPostButton").click((event) => {
  const postId = $(event.target).data("id");
  if (!postId) return;
  const textbox = $("#editPostArea");

  const data = {
    content: textbox.val(),
  };

  $.ajax({
    url: `/api/posts/${postId}`,
    type: "PUT",
    data: data,
    success: (postData) => {
      location.reload();
    },
  });
});
$("#unpinnedModelButton").click((event) => {
  const postId = $(event.target).data("id");

  $.ajax({
    url: `/api/posts/${postId}`,
    data: { pinned: false },
    type: "PUT",
    success: () => {
      location.reload();
    },
  });
});
$("#deletePostButton").click((event) => {
  const postId = $(event.target).data("id");

  $.ajax({
    url: `/api/posts/${postId}`,
    type: "DELETE",
    success: () => {
      location.reload();
    },
  });
});

$("#filePhoto").change((event) => {
  const input = event.target;
  const image = document.getElementById("imagePreview");

  if (input.files && input.files[0]) {
    const reader = new FileReader();
    reader.onload = (e) => {
      image.src = e.target.result;
      if (cropper !== undefined) {
        cropper.destory();
      }
      cropper = new Cropper(image, {
        aspectRatio: 1 / 1,
        background: false,
      });
    };
    reader.readAsDataURL(input.files[0]);
  }
});
$("#coverPhoto").change((event) => {
  const input = event.target;
  const image = document.getElementById("coverPreview");

  if (input.files && input.files[0]) {
    const reader = new FileReader();
    reader.onload = (e) => {
      image.src = e.target.result;
      if (cropper !== undefined) {
        cropper.destory();
      }
      cropper = new Cropper(image, {
        aspectRatio: 3 / 1,
        background: false,
      });
    };
    reader.readAsDataURL(input.files[0]);
  }
});
$("#UploadCoverButton").click((event) => {
  const canvas = cropper.getCroppedCanvas();
  if (!canvas) {
    alert("Not an image");
  }
  canvas.toBlob((blob) => {
    const formData = new FormData();
    formData.append("croppedImage", blob);

    $.ajax({
      url: "/api/users/coverPhoto",
      type: "POST",
      data: formData,
      processData: false,
      contentType: false,
      success: (data) => {
        location.reload();
      },
    });
  });
});
$("#UploadImageButton").click((event) => {
  const canvas = cropper.getCroppedCanvas();
  if (!canvas) {
    alert("Not an image");
  }
  canvas.toBlob((blob) => {
    const formData = new FormData();
    formData.append("croppedImage", blob);

    $.ajax({
      url: "/api/users/profilePicture",
      type: "POST",
      data: formData,
      processData: false,
      contentType: false,
      success: (data) => {
        console.log(data);
        location.reload();
      },
    });
  });
});
$("#replyModal").on("hidden.bs.modal", (event) => {
  $("#originalPostContainer").empty();
});
$(document).on("click", ".likeButton", (event) => {
  const btn = $(event.target);
  const postId = getPostIdFromElemenet(btn);
  if (!postId) return;
  $.ajax({
    url: `/api/posts/${postId}/like`,
    type: "PUT",
    success: (postData) => {
      btn.find("span").text(postData.likes.length || "");
      if (postData.likes.includes(user._id)) {
        btn.addClass("active");
        emitNotification(postData.postedBy);
      } else {
        btn.removeClass("active");
      }
    },
  });
});
$(document).on("click", ".followButton", (event) => {
  const btn = $(event.target);
  const id = btn.data().user;

  $.ajax({
    url: `/api/users/${id}/follow`,
    type: "PUT",
    success: (userData) => {
      let diff = 1;
      if (userData.following && userData.following.includes(id)) {
        btn.addClass("following");
        btn.text("Following");
        emitNotification(id);
      } else {
        btn.removeClass("following");
        btn.text("Follow");
        diff = -1;
      }
      const followingValue = $("#followersValue");

      if (followingValue.length !== 0) {
        let followingText = followingValue.text();
        followingValue.text(parseInt(followingText) + diff);
      }
    },
  });
});
$(document).on("click", ".retweetButton", (event) => {
  const btn = $(event.target);
  const postId = getPostIdFromElemenet(btn);
  if (!postId) return;
  $.ajax({
    url: `/api/posts/${postId}/retweet`,
    type: "POST",
    success: (postData) => {
      btn.find("span").text(postData.retweetsUsers.length || "");
      if (postData.retweetsUsers.includes(user._id)) {
        btn.addClass("active");
        emitNotification(postData.postedBy);
      } else {
        btn.removeClass("active");
      }
      location.reload();
    },
  });
});

$(document).on("click", ".view", (event) => {
  const element = $(event.target);
  const postId = getPostIdFromElemenet(element);
  if (postId !== undefined && !element.is("button")) {
    window.location.href = "/posts/" + postId;
  }
});

// chatname
function getChatName(chatData) {
  let chatName = chatData.chatName;
  if (!chatName) {
    let otherChatUsers = getOtherChatUsers(chatData.users);
    let names = otherChatUsers.map((u) => u.firstname + " " + u.lastname);
    chatName = names.join(", ");
  }
  return chatName;
}
function getOtherChatUsers(users) {
  if (users.length === 1) return users;
  return users.filter((u) => {
    return u._id !== user?._id;
  });
}

function getPostIdFromElemenet(element) {
  let isRoot = element.hasClass("post");
  let rootElement = isRoot ? element : element.closest(".post");
  let postId = rootElement.data()?.id;
  if (!postId) {
    alert("post id undefinded");
  }
  return postId;
}
function createPostHtml(postData, largeFont = false) {
  const postedBy = postData?.postedBy;

  if (postData === null) return;
  let href = "";
  if (user._id === postedBy._id) {
    href = "";
  } else {
    href = "/" + postedBy.username;
  }
  const isRetweet = postData.retweetsData !== undefined;
  const retweetedBy = isRetweet ? postData.postedBy.username : null;
  postData = isRetweet ? postData.retweetsData : postData;
  if (!postedBy?._id) {
    return console.log("User object popluated");
  }
  const displayName = postedBy.firstname + " " + postedBy.lastname;
  const timestamp = timeDifference(new Date(), new Date(postData?.createdAt));
  const likeButtonActiveClass = postData?.likes?.includes(user._id)
    ? "active"
    : "";
  const retweetButtonActiveClass = postData?.retweetsUsers?.includes(user._id)
    ? "active"
    : "";
  const largeFontClass = largeFont === true ? "largeFont" : "";
  let retweetText = "";
  if (isRetweet) {
    retweetText = `<span>
                       <i class="fas fa-retweet"></i>
                       Retweeted by <a href="/profile/${retweetText}">@${retweetedBy}</a>
                    </span>`;
  }
  let replyToFlag = "";
  if (postData?.replyTo && postData?.replyTo._id) {
    const replyToUsername = postData?.replyTo?.postedBy?.username;
    replyToFlag = !replyToUsername
      ? ""
      : `<div class="replyFlag">
           <p class="replyText"> Replying to <a href="/profile/${replyToUsername}">@${replyToUsername}</a></p>
        </div>`;
  }
  let buttons = "";
  let pinnedClass = "";
  let dataTarget = "#PinnedModel";
  let pinnedPost = "";
  if (postData?.pinned == true) {
    pinnedClass = "active";
    dataTarget = "#unpinnedModel";
    pinnedPost = `<i class="fa-solid fa-thumbtack"></i> <span>Pinned post</span>`;
  }
  if (postData?.postedBy?._id === user?._id) {
    buttons = `<div class="dropdown">
                  <div class="menu" data-bs-toggle="dropdown" aria-expanded="false">
                  <i class="fa-solid fa-ellipsis"></i>
                  </div>
                  <ul class="dropdown-menu">
                    <li class="fontBigger delete" data-id=${postData._id} data-bs-toggle="modal" data-bs-target="#deletePostModel"><button ><i class="fa-solid fa-trash delete"></i></button><p>Delete</p></li>
                    <li class="fontBigger" data-id=${postData._id} data-bs-toggle="modal" data-bs-target="${dataTarget}"><button><i class="fa-solid fa-thumbtack"></i></button><p>Pin post</p></li>
                    <li class="fontBigger" data-post=${postData} data-bs-toggle="modal" data-bs-target="#editPostModel"><button ><i class="fa-solid fa-pen-to-square"></i></button><p>Edit post</p></li>
                    <li class="fontBigger"><button ><i class="fa-solid fa-eye"></i></button><p class="view">View post</p></li>
                  </ul>
                </div> `;
  }
  return `<div class="post ${largeFontClass}" data-id="${postData?._id}">
              <div class="postActionContainer"> ${retweetText}</div>
              <div class="mainContentContainer">
                  <div class="userImageContainer">
                      <img src="${postedBy.profilePic}" />
                  </div>
                  <div class="postContentContainer">
                      <div class="pinnedPost">${pinnedPost}</div>
                      <div class="header">
                          <a class="displayName" href="/profile${href}">${displayName}</a>
                          <span class="username">@${postedBy.username}</span>
                          <span class="date">${timestamp}</span>
                          </div>
                          ${buttons}
                      ${replyToFlag}
                      <div class="postBody">
                        <span>
                          ${postData?.content}
                        </span>
                      </div>
                      <div class="postFooter">
                        <div class="postBtnContainer">
                              <button type="button" data-bs-toggle="modal" data-bs-target="#replyModal">
                              <i class="far fa-comment"></i>
                              </button>
                        </div>  
                        <div class="postBtnContainer green">
                              <button class="retweetButton ${retweetButtonActiveClass}">
                              <i class="fas fa-retweet"></i>
                                <span>
                                  ${postData.retweetsUsers.length || ""} 
                                </span>
                              </button>
                        </div>  
                        <div class="postBtnContainer red">
                              <button class="likeButton ${likeButtonActiveClass}">
                              <i class="far fa-heart"></i>
                              <span>${postData.likes.length || ""}</span>
                              </button>
                        </div>  
                    </div>
                  </div>
              </div>
          </div>`;
}
function timeDifference(current, previous) {
  let msPerMinute = 60 * 1000;
  let msPerHour = msPerMinute * 60;
  let msPerDay = msPerHour * 24;
  let msPerMonth = msPerDay * 30;
  let msPerYear = msPerDay * 365;
  let elapsed = current - previous;
  if (elapsed < msPerMinute) {
    if (elapsed / 1000 < 30) return "Just now";
    return Math.round(elapsed / 1000) + " seconds ago";
  } else if (elapsed < msPerHour) {
    return Math.round(elapsed / msPerMinute) + " minutes ago";
  } else if (elapsed < msPerDay) {
    return Math.round(elapsed / msPerHour) + " hours ago";
  } else if (elapsed < msPerMonth) {
    return Math.round(elapsed / msPerDay) + " days ago";
  } else if (elapsed < msPerYear) {
    return Math.round(elapsed / msPerMonth) + " months ago";
  } else {
    return Math.round(elapsed / msPerYear) + " years ago";
  }
}

function markNotificationsAsOpened(notificationId = null, callback = null) {
  if (callback === null) {
    callback = () => location.reload();
  }
  let url =
    notificationId !== null
      ? `/api/notifications/${notificationId}/markAsOpened`
      : `/api/notifications/markAsOpened`;
  $.ajax({
    url,
    type: "PUT",
    success: () => callback(),
  });
}
$(document).on("click", ".notification.active", (e) => {
  const container = $(e.target);
  const notificationId = container.data().id;
  const href = container.attr("href");
  e.preventDefault();
  const callback = () => (window.location = href);
  markNotificationsAsOpened(notificationId, callback);
});
$("#marknotificationsAsRead").click(() => {
  markNotificationsAsOpened();
});
function messageReceived(message) {
  if ($(`[data-room="${message.chat._id}"]`).length === 0) {
    // show popup window
    showMessagePop(message);
  } else {
    outputMessageHtml(message);
  }
  refreshMessagesBagde();
}
function refreshMessagesBagde() {
  $.get("/api/chats", { unreadOnly: true }, (data) => {
    let numResults = data.length;

    if (numResults > 0) {
      $("#messagesBadge").text(numResults).addClass("active");
    } else {
      $("#messagesBadge").text("").removeClass("active");
    }
  });
}
function refreshNotificationsBagde() {
  $.get("/api/notifications", { unreadOnly: true }, (data) => {
    let notificationArray = [];
    data.forEach((notification) => {
      if (notification.userForm._id === notification.userTo._id) {
        return;
      }
      notificationArray.push(notification);
    });
    let numResults = notificationArray.length;
    if (notificationArray > 0) {
      $("#notificationsBadge").text(numResults).addClass("active");
    } else {
      $("#notificationsBadge").text("").removeClass("active");
      //notificationsBadge
    }
  });
}

function toastNotification(data) {
  const html = creatNotifcationHtml(data);
  const element = $(html);
  element.hide().prependTo("#notificationList").slideDown("fast");
  setTimeout(() => {
    element.fadeOut(400);
  }, 4000);
}
function showMessagePop(data) {
  if (!data.chat.lastestMessage._id) {
    data.chat.lastestMessage = data;
  }
  const html = creatChatHtml(data.chat);
  const element = $(html);
  element.hide().prependTo("#notificationList").slideDown("fast");
  setTimeout(() => {
    element.fadeOut(400);
  }, 4000);
}
function creatNotifcationHtml(notification) {
  const userForm = notification.userForm;
  const className = notification.opened ? "" : "active";
  return `<a href="${getNotifcationUrl(
    notification
  )}" class="resultsListItem notification ${className}" data-id=${
    notification._id
  }>
            <div class="resultsImageContainer">
              <img src ="${userForm.profilePic}">
              
            </div>
            <div class="resultsDetailsContainer ellipsis">
                <span class="ellipsis">${getNotifcationText(
                  notification
                )}</span>
              </div>
          </a>`;
}
function getNotifcationUrl(notification) {
  let url;
  if (
    notification.notificationType === "like" ||
    notification.notificationType === "retweet" ||
    notification.notificationType === "reply"
  ) {
    url = `/posts/${notification.entityId}`;
  } else if (notification.notificationType === "follow") {
    url = `/profile/${notification.entityId}`;
  }
  return url;
}

function getNotifcationText(notification) {
  let userForm = notification.userForm;
  if (!userForm.firstname || !userForm.lastname) {
    console.log("user not popluated");
  }
  let text;
  let userFormName = userForm.firstname + " " + userForm.lastname;
  switch (notification.notificationType) {
    case "retweet":
      text = `${userFormName} retweeted your post`;
      break;
    case "like":
      text = `${userFormName} liked your post`;
      break;
    case "reply":
      text = `${userFormName} replyed to your post`;
      break;
    case "follow":
      text = `${userFormName} followed you`;
      break;
    default:
      text = "this is a dummy text";
      break;
  }
  return `<span class="ellipsis">${text}</span>`;
}
function creatChatHtml(chatItem) {
  let chatName = getChatName(chatItem); // to do later
  let lastestMessages = getlastestMessage(chatItem.lastestMessage);
  let image = getChatImageElement(chatItem); // to do later
  let chatActive =
    !chatItem.lastestMessage ||
    chatItem.lastestMessage.readBy.includes(user._id)
      ? ""
      : "active";
  return `
        <a class="resultsListItem ${chatActive}" href="/messages/${chatItem._id}">
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
