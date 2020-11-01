'use strict';

window.addEventListener("load", main, false);
window.addEventListener("submit", update, false);

const NOTAGS = "No tags"
const labels = [/To do/, /In progress/, /Done/, /Backlog/];
const sp_pattern = /\[[1-9]\d*pt\]/g;
const tag_pattern = /\[\w+\.\]/gu;

let no_of_tasks  = [0, 0, 0];
let story_points = [0, 0, 0];
let tags;
let backlogs;
let is_ready = false;

// get DOM elements
let p_es = document.getElementsByClassName('progress');
let done_bar_e = p_es[0];// as HTMLElement;
let in_progress_bar_e = p_es[1];// as HTMLElement;
let task_text_e = p_es[0].parentNode.parentNode;// as HTMLElement;
let task_abstract_e = task_text_e.parentNode.parentNode.parentNode;//for ts as HTMLElement;
task_text_e.parentNode.removeAttribute("class"); // Stop original update

function init() {
  no_of_tasks.fill(0);
  story_points.fill(0);
  tags         = {"No tags": {"items": [], "desc": "Uncategorized"}};
  backlogs     = {};
}

function main() {
  sendCalculatingMessage("main");
  createProgressBarText();
  window.setTimeout(createProgressBar, 3000);
}

function update() {
  sendCalculatingMessage("update");
  setStatusText("Calculating story points...");
  window.setTimeout(createProgressBar, 5000);
}

function getContent(card) {
  return card.firstElementChild.nextElementSibling.firstElementChild.firstElementChild.firstElementChild.nextElementSibling.nextElementSibling.firstElementChild.firstElementChild.firstElementChild.textContent;
}

function formatContent(content) {
  return content.replace(sp_pattern, '').replace(tag_pattern, '').replace(/\[\"/g, '').replace(/\"\]/g, '').replace(/\",\"/g, '').trim();
}

function getColumn() {
  init();
  let c_es = document.getElementsByClassName('project-column');
  for (let i = 0; i < c_es.length; i++) { // Each column
    let name = c_es[i].getElementsByClassName('js-add-note-container')[0].childNodes[1].getElementsByTagName('h3')[0].textContent.trim();
    let label_i = -1; 
    for (let j = 0; j < labels.length; j++) { 
      let is_match = name.match(labels[j]);
      if (is_match != null) {
        label_i = j;
        break;
      }
    } 
    if (label_i >= 0) {
      console.log(name);
      let items = c_es[i].getElementsByClassName('js-project-column-cards')[0].getElementsByTagName('article')
      switch (label_i) {
        case 0: case 1: case 2: // To do or In progress or Done
          let sp = 0;
          for (let j = 0; j < items.length; j++) { // Each tasks
            let content = getContent(items[j]);
            let content_f = formatContent(content);
            let pt_str = content.match(sp_pattern);
            let pt = (pt_str == null) ? 1 : Number(pt_str[0].substr(1, pt_str[0].length-4));
            sp += pt;
            // tags
            let tag_str = content.match(tag_pattern);
            if (tag_str !== undefined && tag_str !== null) {
              tag_str.forEach(t => {
                let t_f = t.substr(1, tag_str[0].length-3);
                if (tags[t_f] !== undefined && tags[t[0]] !== null) {
                  console.log(content_f);
                  tags[t_f]["items"].push({"content": content_f, "sp": pt, "label_i": label_i});
                } else {
                  tags[t_f] = {"items": [content_f], "desc": "No description"}
                }
              });
            } else {
              tags[NOTAGS]["items"].push({"content": content_f, "sp": pt});
            }
          }
          no_of_tasks[label_i] += items.length;
          story_points[label_i] += sp;
          break;
        case 3: // Backlog
          for (let j = 0; j < items.length; j++) { // Each tasks           
            let content = getContent(items[j]);
            let content_f = formatContent(content);
            let tag_str = content.match(tag_pattern);
            if (tag_str !== undefined && tag_str !== null) {
              let tag_str_f = tag_str[0].substr(1, tag_str[0].length-3);
              if (tags[tag_str_f] !== undefined && tags[tag_str_f] !== null) {
                tags[tag_str_f]["desc"] = content_f;
              } else {
                tags[tag_str_f] = {"items": [], "desc": content_f};
              }
            }
          }
          break;
      }
    }
  }
}

function createProgressBar() {
  getColumn();
  // calculate total sp
  let total_story_points = 0;
  for (let i = 0; i < story_points.length; i++) {
    total_story_points += story_points[i];
  }
  if (total_story_points == 0) {
    total_story_points = 1; // avoid division by zero
  }

  // calculate sp ratio
  let in_progress_ratio = story_points[1] / total_story_points * 100;
  let done_ratio = story_points[2] / total_story_points * 100;

  // create progress bar
  done_bar_e.style.width = done_ratio + "%";
  in_progress_bar_e.style.width = in_progress_ratio + "%";

  // create text
  let task_raw_text = no_of_tasks[2] + " done / " + no_of_tasks[1] + " in progress / " + no_of_tasks[0] + " to do";
  task_text_e.setAttribute("aria-label", task_raw_text + "\n(story-point: " + story_points[2] + "pt done / "
                                                                            + story_points[1] + "pt in progress / "
                                                                            + story_points[0] + "pt to do)");
  
  
  is_ready = true;
  sendResultMessage()
  setStatusText("Stoty Point Bar");

  // debug
  console.log(tags);
}

function createProgressBarText() {
  let bar_text_e = document.createElement("h2");
  bar_text_e.setAttribute("class", "d-inline f5");
  bar_text_e.textContent = "Calculating story points..."
  task_abstract_e.appendChild(bar_text_e);
}

function setStatusText(text) {
  let p_e = task_abstract_e.getElementsByTagName("h2");
  p_e[1].textContent = text;
}

function sendMessage(msg, subj, cont) {
  chrome.runtime.sendMessage({
    msg: msg, 
    data: {
        subject: subj,
        content: cont
    }
  });
}

function sendCalculatingMessage(cont) {
  sendMessage("calculating", "Calculating story points...", cont);
}

function sendResultMessage() {
  if (is_ready) {
    sendMessage("done", "Stoty Point Bar", {"tags": tags, "backlogs": backlogs});
  }
}

/*
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.msg === "getTaskView") {
      sendMessage("done", "Stoty Point Bar", {"tags": tags, "backlogs": backlogs});
    }
    sendResponse();
  }
);*/
