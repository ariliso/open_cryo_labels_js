const default_sample_sets = JSON.parse(document.getElementById('data-label-sets').innerText);
let labelsLoaded = [""];


function loadLabels(contents) {
  labelsLoaded = contents[0].split(/\?r\n/);
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


function populateUI(){

  // Fill combo box
  
  const set_selector = document.getElementById('label-set-box');

  for (set_name in default_sample_sets) {
    const set_sel_option = document.createElement("option");
    set_sel_option.text = set_name;
    set_sel_option.value = set_name;
    set_selector.add(set_sel_option);
  }

  document.getElementById('label-set-box')
  .addEventListener('change', updateSampleSet, false);

  // fix date
  document.getElementById('in-date-select').value =
    new Date().toISOString().split('T')[0];

  // add file listener
  
  document.getElementById('label-input')
  .addEventListener('change', readLabelFile, false);

}

function updateSampleSet(e) {

  //check if we should show or hide the custom text box
  if (document.getElementById('label-set-box').value == 'custom'){
    document.getElementById('txt-custom-label-set').style.display = "block"
  } else{
    document.getElementById('txt-custom-label-set').style.display = "none"
  }
  updateLabels()
}

function getCurrentLabelSet() {

  if (document.getElementById('label-set-box').value == 'custom'){
    return  new Array(
      document.getElementById('txt-custom-label-set').value
    );
  } else{
    return default_sample_sets[document.getElementById('label-set-box').value];
  }
}

function updateLabels(e) {

  populateLabels(
    labelsLoaded,
    getCurrentLabelSet(),
    "Ari", //TODO: Replace placeholder
    document.getElementById('in-date-select').value
  )
}


populateUI()

