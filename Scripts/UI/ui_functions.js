let default_label_sets;

//#region Set/Array Management

// -------  file management ---- file acquisition
//#region  File Management
function readLabelFile(e) {
  var file = e.target.files[0];
  if (!file) {
    return;
  }
  var reader = new FileReader();
  reader.onload = function (e) {
    var contents = e.target.result;
    loadSamplesFile(contents);
  };
  reader.readAsText(file);
}

function readConfigFile(e) {
  var file = e.target.files[0];
  if (!file) {
    return;
  }
  var reader = new FileReader();
  reader.onload = function (e) {
    var contents = e.target.result;
    setCurrentState(JSON.parse(contents));
  };
  reader.readAsText(file);
}

var getJSON = function (url, callback) {
  var xhr = new XMLHttpRequest();
  xhr.open("GET", url, true);
  xhr.responseType = "json";
  xhr.onload = function () {
    var status = xhr.status;
    if (status === 200) {
      callback(null, xhr.response);
    } else {
      callback(status, xhr.response);
    }
  };
  xhr.send();
};

//--------file management ---- parsers and handlers -----

//loads remote JSON
getJSON("Config/default_label_sets.json", function (err, data) {
  if (err !== null) {
    //TODO code fallback here
    alert("Something went wrong: " + err);
  } else {
    default_label_sets = data;
    populateUI();
  }
});

function downloadStateObject(
  e,
  save_type = document.querySelector("#select-conf-save-type").value
) {
  let stateObj = getCurrentState();

  switch (save_type) {
    case "inc_labels":
      delete stateObj["current_label_set_name"];
      break;

    case "inc_labels&selection":
      break;

    default:
      delete stateObj["current_label_set_name"];
      delete stateObj["default_label_sets"];
      break;
  }

  out_txt = JSON.stringify(stateObj, null, 2);
  downloadToFile(
    out_txt,
    stateObj.date + "_label_settings" + ".json",
    "mime/JSON",
    true
  );
}

//#endregion

function loadSamplesFile(contents) {
  // splits new input in to lines
  linesLoaded = contents.split(/\r?\n/);
  let current_samples = getCurrentSampleSet();

  // is there samples loaded?
  if (current_samples.length > 0) {
    // do you want to overwrite or append
    if (
      !confirm(
        "There are " +
          current_samples.length +
          " sample names loaded." +
          "Overwrite (ok|yes|confirm|accept...) or append (no|cancel)"
      )
    ) {
      // append
      setCurrentSampleSet(current_samples.concat(linesLoaded));
      return;
    }
  }

  // overwrite if exists or empty
  setCurrentSampleSet(linesLoaded);
}
//#endregion

// ## State Management ##
function getCurrentState() {
  let stateObj = {
    default_label_sets: default_label_sets,
    current_label_sets: getCurrentLabelSet(),
    current_sample_set: getCurrentSampleSet(),
    attn: document.getElementById("in-txt-attn").value,
    date: document.getElementById("in-date-select").value,
    skip_start: document.getElementById("in-skip-start").value,
    page_break_set: document.getElementById("in-bool-sets-break").checked,
    current_label_set_name: document.getElementById("label-set-box").value,
  };
  return stateObj;
}

function setCurrentState(stateObj) {
  let replaced_default_label_set = false;
  // Adjust default label sets if assigned.
  if (stateObj.hasOwnProperty("default_label_sets")) {
    default_label_sets = stateObj["default_label_sets"];
    replaced_default_label_set = true;
    updateLabelSelectorBox(default_label_sets);
  }

  // Checks if we have a named set selected & if its in the sample
  if (stateObj.hasOwnProperty("current_label_set_name")) {
    // is the named set in our current
    if (default_label_sets.hasOwnProperty(stateObj["current_label_set_name"])) {
      //TODO: re-select checkboxes based on content
      setCurrentLabelSet(
        stateObj["current_label_sets"],
        stateObj["current_label_set_name"]
      );
    } else {
      setCurrentLabelSet(stateObj["current_label_sets"], "custom");
      console.log("Label set specified but not found, defaulting to custom");
    }
    if (stateObj["current_label_set_name"] == "custom") {
      setCurrentLabelSet(stateObj["current_label_sets"], "custom");
    }
  } else {
    // load custom label set
    setCurrentLabelSet(stateObj["current_label_sets"], "custom");
  }
  // Sample Set Settings
  if (stateObj.hasOwnProperty("current_sample_set")) {
    setCurrentSampleSet(stateObj["current_sample_set"]);
  }

  //attn
  if (stateObj.hasOwnProperty("attn")) {
    document.getElementById("in-txt-attn").value = stateObj["attn"];
  }
  if (stateObj.hasOwnProperty("date")) {
    document.getElementById("in-date-select").value = stateObj["date"];
  }
  if (stateObj.hasOwnProperty("skip_start")) {
    document.getElementById("in-skip-start").value = stateObj["skip_start"];
  }
  if (stateObj.hasOwnProperty("page_break_set")) {
    document.getElementById("in-bool-sets-break").value =
      stateObj["page_set_break"];
  }
  updateLabels();
}

function setCurrentLabelSet(new_label_set, set_name) {
  let label_set_box = document.getElementById("label-set-box");
  let possible_values = Array.from(label_set_box.options).map((e) => e.value);

  if (set_name != undefined) {
    if (possible_values.includes(set_name)) label_set_box.value = set_name;
  } else {
    if (label_set_box.value != "custom") {
      console.log(
        "attempting to set values of non-custom label set, this is experimental at best"
      );
    }
  }
  if (new_label_set == undefined) {
    console.log(
      `Attempted to set labels with undefined set, unless this is to update the selection box to {set_name} this could be an error`
    );
  } else {
    updateLabelSettingsPanel(undefined, new_label_set);
  }
}

function getCurrentLabelSet() {
  if (document.getElementById("label-set-box").value == "custom") {
    return readTextAreaLines(document.getElementById("txt-custom-label-set"));
  } else {
    let current_labelset = new Array();

    // check if we're using checkboxes
    const multi_selectorList = document.getElementById(
      "in-set-multi-check-list"
    );

    if (multi_selectorList.childElementCount > 0) {
      // code to read buttons
      let selected_set_btns =
        multi_selectorList.querySelectorAll("option:checked");

      //if no buttons are checked empy set
      if (selected_set_btns.length < 1) {
        return [""];
      }

      for (let box_i = 0; box_i < selected_set_btns.length; box_i++) {
        const btn_on = selected_set_btns[box_i];
        current_labelset[box_i] = btn_on.value;
      }
      return current_labelset;
    } else {
      return new Array(document.getElementById("label-set-box").value);
    }
  }
}

function getCurrentSampleSet() {
  return readTextAreaLines("#in-txt-custom-sample-names");
}

function setCurrentSampleSet(sample_set) {
  fillTextArea("#in-txt-custom-sample-names", sample_set);
}

//-------------- Initial Setup of UI ----------------------

function populateUI() {
  // Fill combo box
  updateLabelSelectorBox(default_label_sets);

  // fix date
  document.getElementById("in-date-select").value = new Date()
    .toISOString()
    .split("T")[0];

  // ###Event Listeners:####

  refreshEventHandlers();

  updateAdvancedSettingState();
}

function refreshEventHandlers() {
  document
    .getElementById("label-set-box")
    .addEventListener("change", updateLabelSettingsPanel, false);
  // add file listeners
  document
    .getElementById("label-input")
    .addEventListener("change", readLabelFile, false);

  // add event listener by class
  let updating_controls = document.getElementsByClassName("update_on_change");

  for (let control_i = 0; control_i < updating_controls.length; control_i++) {
    let control_selected = updating_controls[control_i];
    control_selected.addEventListener("input", updateLabels, false);
  }
  //using a generic event listener for checkboxes
  document
    .getElementById("in-set-multi-check-list")
    .addEventListener("change", updateLabels, true);

  /// for proper advanced settings functionality
  document
    .querySelector("#toggle-adv-settings")
    .addEventListener("change", updateAdvancedSettingState, false);

  document
    .querySelector("#bt-save-conf")
    .addEventListener("click", downloadStateObject, false);

  document
    .querySelector("#bt-load-conf")
    .addEventListener("change", readConfigFile, false);
}

// --------------- UI Updating Functions ----------------------------------

//#region Sample Panels
function updateLabelSettingsPanel(e, selected_samples = ["all"]) {
  // id multiselect div
  let multiselect_div = document.getElementById("in-set-multi-check");
  //check if we should show or hide the custom text box (Custom Label)

  if (document.getElementById("label-set-box").value == "custom") {
    multiselect_div.style.display = "none";
    document.getElementById("in-set-custom-label").style.display = "block";
    if (selected_samples != ["all"]) {
      fillTextArea("#txt-custom-label-set", selected_samples);
    }
    document.getElementById("btn-customize-label-set").style.display = "none";
    updateLabels();
    return;
  }
  // if a sample set is selected we can continue

  // hide custom box & show customize button;
  document.getElementById("in-set-custom-label").style.display = "none";
  document.getElementById("btn-customize-label-set").style.display = "block";

  //look at all available samples in set selected
  let full_selected_sample_set =
    default_label_sets[document.getElementById("label-set-box").value];

  // if there are multiple label sets in selection, show selector block
  if (full_selected_sample_set.length > 1) {
    multiselect_div.style.display = "block";
    populateLabelSetSelector(full_selected_sample_set, selected_samples);
  } else {
    multiselect_div.style.display = "none";
    multiselect_div.lastElementChild.textContent = "";
  }
  updateLabels();
}

//#endregion

//#region Label Sets Panel

function updateLabelSelectorBox(sel_label_set) {
  let set_selector = document.getElementById("label-set-box");
  // delete everything
  set_selector.innerText = "";

  let set_sel_custom_option = document.createElement("option");
  set_sel_custom_option.text = "Custom";
  set_sel_custom_option.value = "custom";
  set_selector.add(set_sel_custom_option);

  for (set_name in sel_label_set) {
    const set_sel_option = document.createElement("option");
    set_sel_option.text = set_name;
    set_sel_option.value = set_name;
    set_selector.add(set_sel_option);
  }
}

function populateLabelSetSelector(labelSets, selectedSets) {
  let selectorList = document.getElementById("in-set-multi-check-list");
  if (selectedSets == undefined || selectedSets == "all")
    selectedSets = labelSets;

  // wipe all elements inside
  selectorList.textContent = "";

  //iterate over sample list
  for (label_name of labelSets) {
    const set_sel_option = document.createElement("option");
    set_sel_option.text = label_name;
    set_sel_option.value = label_name;
    selectorList.add(set_sel_option);
    set_sel_option.selected = selectedSets.includes(label_name);
  }
}

function customizeLabelSet() {
  // set the label to custom based on loaded set
  let current_labelset = getCurrentLabelSet();
  // fill custom with current settings
  fillTextArea("#txt-custom-label-set", current_labelset);
  // set box to custom
  document.getElementById("label-set-box").value = "custom";
  updateLabelSettingsPanel(null, current_labelset);
}
//#endregion

function updateAdvancedSettingState(e) {
  let settings_panel = document.getElementById("ui-adv-config");
  let toggle_state = document.querySelector("#toggle-adv-settings").checked;
  if (toggle_state) {
    settings_panel.style.display = null;
  } else {
    settings_panel.style.display = "none";
  }
}

//#region Text Area Helpers
function fillTextArea(textArea, text) {
  let target_text_area;

  if (typeof textArea == "string") {
    target_text_area = document.querySelector(textArea);
  } else {
    target_text_area = textArea;
  }

  if (typeof text == "string") {
    target_text_area.value = text;
  } else {
    if (Array.isArray(text)) {
      target_text_area.value = text.join("\n");
    } else {
      alert("Something went wrong: invalid textarea update");
    }
  }
}

function readTextAreaLines(textArea) {
  let target_text_area;

  if (typeof textArea == "string") {
    target_text_area = document.querySelector(textArea);
  } else {
    target_text_area = textArea;
  }
  if (target_text_area.value == "") {
    return new Array();
  }

  return target_text_area.value.split("\n");
}

//#endregion Text Area Helpers

// --- Label Set Update Functions ---
function updateLabels(e) {
  if (getCurrentSampleSet().length < 1) {
    return;
  }

  //update based on document

  let name_list = getCurrentSampleSet();
  let label_set = getCurrentLabelSet();
  let attn = document.getElementById("in-txt-attn").value;
  let date = document.getElementById("in-date-select").value;
  let skip_start = document.getElementById("in-skip-start").value;
  let page_break_set = document.getElementById("in-bool-sets-break").checked;
  let include_QR = document.getElementById("chk-spec-lbl").checked;

  //fill labels

  populateLabels(
    name_list,
    label_set,
    attn,
    date,
    skip_start,
    page_break_set,
    include_QR
  );
  updateInfoLine(name_list.length, label_set.length, skip_start);
}

function updateInfoLine(n_names, n_sets, skip_start) {
  let n_pages = document.getElementsByClassName("labelgrid").length;
  let n_labels = n_names * n_sets;
  let n_blanks = 85 * n_pages - n_labels;
  let info_str =
    "Created " +
    n_pages +
    " Pages with " +
    n_labels +
    " labels on them (" +
    n_names +
    " sample names × " +
    n_sets +
    " sets) there are " +
    n_blanks +
    " blank spaces ( " +
    skip_start +
    " skipped on the first page and " +
    (n_blanks - skip_start) +
    " from page breaks)";
  let infoline = document.getElementById("infoline");
  infoline.innerHTML = info_str;
}
populateUI();
