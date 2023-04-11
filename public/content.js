let activity = false;

document.addEventListener("mousemove", function (event) {
  activity = true;
});

document.addEventListener("keydown", function (event) {
  activity = true;
});

document.addEventListener("click", function (event) {
  activity = true;
});

setInterval(function () {
  chrome.runtime.sendMessage({ activity: activity });
  activity = false;
}, 10000);
