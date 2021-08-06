let labelsLoaded;
let default_label_sets;

// --------- Set Management Functions ----------------

// ## file management ##

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


var getJSON = function(url, callback) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', url, true);
  xhr.responseType = 'json';
  xhr.onload = function() {
    var status = xhr.status;
    if (status === 200) {
      callback(null, xhr.response);
    } else {
      callback(status, xhr.response);
    }
  };
  xhr.send();
};

getJSON('https://ariliso.github.io/open_cryo_labels_js/default_label_sets.json',
function(err, data) {
  if (err !== null) {
    alert('Something went wrong: ' + err);
  } else {
    default_label_sets = data;
    populateUI()
  }
});
// ## State Management ##
function getCurrentLabelSet() {

  if (document.getElementById('label-set-box').value == 'custom'){
    return  new Array(
      document.getElementById('txt-custom-label-set').value
    );
  } else{

    let current_labelset = new Array();

    // check if we're using checkboxes
    const multi_selectorList = document.getElementById('in-set-multi-check-list');

    if (multi_selectorList.childElementCount > 0) {
      // code to read buttons
      let selected_set_btns = multi_selectorList.querySelectorAll('option:checked');
      
      //if no buttons are checked empy set
      if (selected_set_btns.length<1) {
      return [""];
      }

      for (let box_i = 0; box_i < selected_set_btns.length; box_i++) {
        const btn_on = selected_set_btns[box_i];
        current_labelset[box_i] = btn_on.value
      }
      return current_labelset;

    } else {

      return document.getElementById('label-set-box').value;
      
    };
  }
}

//-------------- Initial Setup of UI ----------------------

function populateUI(){

  // Fill combo box
  
  const set_selector = document.getElementById('label-set-box');

  for (set_name in default_label_sets) {
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
  //using a generic event listener for checkboxes
  document.getElementById("in-set-multi-check-list")
    .addEventListener('change',updateLabels,true)

}


// --------------- UI Updating Functions ----------------------------------
function updateSampleSettings(e) {
  
  // id multiselect div
  let multiselect_div = document.getElementById("in-set-multi-check")
  //check if we should show or hide the custom text box (Custom Label)

  if (document.getElementById('label-set-box').value == 'custom'){

    multiselect_div.style.display = "none"
    document.getElementById('in-set-custom-label').style.display = "block";
    updateLabels();
    return;
  
  }
  // if a sample set is selected we can continue

  // hide custom box;
  document.getElementById('in-set-custom-label').style.display = "none"
  
  //look at all available samples in set selected
  let full_selected_sample_set =
    default_label_sets[document.getElementById('label-set-box').value];

  

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
  for (label_name of labelSets) {
    const set_sel_option = document.createElement("option");
    set_sel_option.text = label_name;
    set_sel_option.value = label_name;
    set_sel_option.checked = (labelSets.length<4);
    selectorList.add(set_sel_option);
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
  let skip_start = document.getElementById("in-skip-start").value;
  let page_break_set = document.getElementById("in-bool-sets-break").checked;

  //fill labels

  populateLabels(
    name_list,
    label_set,
    attn,
    date,
    skip_start,
    page_break_set
  );
  updateInfoLine(
    name_list.length,
    label_set.length,
    skip_start
  );
}

function updateInfoLine(n_names,n_sets,skip_start) {
  let n_pages = document.getElementsByClassName("labelgrid").length;
  let n_labels = n_names * n_sets;
  let n_blanks = 85 * n_pages - n_labels;
  let info_str =
    'Created ' + n_pages + ' Pages with ' + n_labels + ' labels on them (' +
     n_names +' sample names × ' + n_sets +' sets) there are ' + n_blanks +
    ' blank spaces ( '+ skip_start +' skipped on the first page and '+
     (n_blanks - skip_start) + ' from page breaks)';
  let infoline = document.getElementById("infoline");
  infoline.innerHTML = info_str;
}
