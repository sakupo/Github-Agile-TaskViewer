'use strict';

const state_e = document.getElementById("state");
const taskview_e = document.getElementById("taskview");

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.msg === "calculating") {
      console.log(request.data.subject);
      console.log(request.data.content);
      state_e.textContent = "Calculating...";
    }
    if (request.msg === "done") {
      createTaskView(request.data.content);
      state_e.textContent = "Latest";
    }
    sendResponse();
  }
);

function createTaskView(data) {
  let tags = data["tags"];
  let backlogs = data["backlogs"];
  while(taskview_e.firstChild){
    taskview_e.removeChild(taskview_e.firstChild);
   }
  Object.keys(tags).forEach((key) => {
    if (key === "No tags") return;
    // items
    let tasks = tags[key].items.concat();
    createTaskColumn(tasks, key, tags[key].desc);
  });
  createTaskColumn(tags["No tags"].items.concat(), "No tags", tags["No tags"].desc);
}

function createTaskColumn(tasks, key, desc) {
  let sp = 0;
  let flexitem_e = document.createElement("div");
  let hcol_e = document.createElement("div");
  let col_e = document.createElement("div");
  
  sortTasksWithLabelAsc(tasks, key);
  tasks.forEach(item => {
    let content = item.content;
    let card_e = document.createElement("div");
    switch (item.label_i) {
      case 0: card_e.setAttribute("class", "card todo"); break;
      case 1: card_e.setAttribute("class", "card inprogress"); break;
      case 2: card_e.setAttribute("class", "card done"); break;
      default: card_e.setAttribute("class", "card");
    }
    card_e.textContent = "["+item.sp+"pt] "+content;
    col_e.appendChild(card_e);
    sp += item.sp;
  });
  // column title
  hcol_e.setAttribute("class", "column-title");
  col_e.setAttribute("class", "column");
  let card_e = document.createElement("h3");
  card_e.setAttribute("class", "card");
  card_e.textContent = key + ": " + desc + " ["+sp+"pt]";
  hcol_e.appendChild(card_e);
  flexitem_e.appendChild(hcol_e);
  flexitem_e.appendChild(col_e);
  taskview_e.appendChild(flexitem_e);
}

// 現在アクティブなタブからポップアップのレンダーに必要な情報を要求．(tabs権限を使用)
chrome.tabs.executeScript({code:"sendResultMessage()"});

function sortTasksWithLabelAsc(tasks) {
  tasks.sort((a, b) => {
    if (a.label_i > b.label_i) return 1;
    if (a.label_i < b.label_i) return -1;
    if (a.sp > b.sp) return 1;
    if (a.sp < b.sp) return -1;
    return 0;
  });
}
