
chrome.runtime.onInstalled.addListener(() => {
  console.log('Moomask installed successfully');
});

// Called when the user clicks on the browser action.
chrome.browserAction.onClicked.addListener(function(tab) {
  // Send a message to the active tab
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    var activeTab = tabs[0];
    chrome.tabs.sendMessage(activeTab.id, {"message": "clicked_browser_action"});
  });

});

//listen for message from content script
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if( request.message === "open_new_tab" ) {
      
    }
  }
);


// TODO open popup window with this
// chrome.tabs.create({"url": "http://google.com"});
