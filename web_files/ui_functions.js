const default_sample_sets = JSON.parse(document.getElementById('data-label-sets').innerText);
let labelsLoaded;


// --------- Set Management Functions ----------------

// ## file management

function loadLabels(contents) {
  labelsLoaded = contents.split(/\r?\n/);
  updateLabels()
}


function readLabelFile(e) {
  var file = e.target.files[0];
  if (!file) {
    return;
  }
  var reader = new FileReader();
  reader.onload = function(e) {
    var contents = e.target.result;
    loadLabels(contents);
  };
  reader.readAsText(file);
}

function getCurrentLabelSet() {

  if (document.getElementById('label-set-box').value == 'custom'){
    return  new Array(
      document.getElementById('txt-custom-label-set').value
    );
  } else{
    //TODO extract checkbox here
    return default_sample_sets[document.getElementById('label-set-box').value];
  }
}

//-------------- Initial Setup of UI ----------------------

function populateUI(){

  // Fill combo box
  
  const set_selector = document.getElementById('label-set-box');

  for (set_name in default_sample_sets) {
    const set_sel_option = document.createElement("option");
    set_sel_option.text = set_name;
    set_sel_option.value = set_name;
    set_selector.add(set_sel_option);
  }

  

  // fix date
  document.getElementById('in-date-select').value =
    new Date().toISOString().split('T')[0];

  // ###Event Listeners:####


  document.getElementById('label-set-box')
    .addEventListener('change', updateSampleSettings, false);
  // add file listener
  
  document.getElementById('label-input')
    .addEventListener('change', readLabelFile, false);

  // add event listener by class
  let updating_controls =  document.getElementsByClassName("update_on_change")

  for (let control_i = 0; control_i < updating_controls.length; control_i++) {
    let control_selected = updating_controls[control_i];
      control_selected.addEventListener('change', updateLabels, false)
  }

}


// --------------- UI Updating Functions ----------------------------------
function updateSampleSettings(e) {
  
  //check if we should show or hide the custom text box (Custom Label)
  if (document.getElementById('label-set-box').value == 'custom'){

    document.getElementById('in-set-custom-label').style.display = "block";
    updateLabels();
    return;
  
  }
  // if a sample set is selected we can continue

  // hide custom box;
  document.getElementById('in-set-custom-label').style.display = "none"
  
  //look at all available samples in set selected
  let full_selected_sample_set =
    default_sample_sets[document.getElementById('label-set-box').value];

  
  // id multiselect div
  let multiselect_div = document.getElementById("in-set-multi-check")

  // if there are multiple label sets in selection, show selector block
  if (full_selected_sample_set.length>1){
    multiselect_div.style.display = "block"
    populateLabelSetSelector(full_selected_sample_set)
  } else{
    multiselect_div.style.display = "none"
    multiselect_div.lastElementChild.textContent = ''
  }
  updateLabels()
}

function  populateLabelSetSelector(labelSets) {

  let selectorList = document.getElementById('in-set-multi-check-list');
  
  // wipe all elements inside
  selectorList.textContent = ''

  //iterate over sample list
  for (let set_i = 0; set_i < labelSets.length; set_i++) {
    let label_set_name = labelSets[set_i];

    let new_label = document.createElement("label");
    let new_checkbox = document.createElement("input");
    let new_li = document.createElement("li")

    new_checkbox.type = "checkbox"
    new_checkbox.checked = labelSets.length< 2; //defaults to off if too many label types
    new_checkbox.value = label_set_name;
    new_checkbox.name = "in-set-chk-boxes";
    new_checkbox.id = "in-set-chk-box-" + set_i+1;

    new_label.classList.add("in-set-check-label");
    new_label.textContent = label_set_name;
    new_label.htmlFor = "in-set-chk-box-" + set_i+1;

    new_li.appendChild(new_checkbox);
    new_li.appendChild(new_label);

    selectorList.appendChild(new_li);

  }
}


function updateLabels(e) {

  if (typeof(labelsLoaded) == "undefined"){
    return;
  };

  //update based on document
  let name_list = labelsLoaded;
  let label_set = getCurrentLabelSet();
  let attn = document.getElementById("in-txt-attn").value;
  let date = document.getElementById('in-date-select').value;
  let skip_start = document.getElementById("in-skip-start").value
  let page_break_set = document.getElementById("in-bool-sets-break").checked;

  //fill labels

  populateLabels(
    name_list,
    label_set,
    attn, //TODO: Replace placeholder
    date,
    skip_start,
    page_break_set
  )
}


populateUI()

