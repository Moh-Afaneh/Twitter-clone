$(document).ready(() => {
  $.get("/api/notifications", (data, status, xhr) => {
    console.log(data);
  });
});
