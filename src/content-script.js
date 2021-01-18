console.log('Moomask - Content script');

// listen for message from background
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if( request.message === "clicked_browser_action" ) {
      //send message from content to background script
      chrome.runtime.sendMessage({"message": "open_new_tab", "url": firstHref});
    }
  }
);