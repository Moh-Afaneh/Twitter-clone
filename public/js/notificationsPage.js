$(document).ready(() => {
  $.get("/api/notifications", (notifications, status, xhr) => {
    outputNotifications(notifications, $(".resultsContainer"));
  });
  console.log(notifications);
});
function outputNotifications(notifications, continer) {
  notifications.forEach((notification) => {
    console.log(notification);
    // if (notification.userForm._id === user._id) {
    //   return;
    // }
    console.log(notification);
    const html = creatNotifcationHtml(notification);
    continer.append(html);
  });
  if (notifications.length === 0) {
    continer.append("<span class='noResults'>Nothing to show</span>");
  }
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
