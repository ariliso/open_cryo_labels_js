function createLabelElement(
  labelName,
  labelSet,
  labelOwner,
  labelDate,
  specialLabels = true
) {
  let new_label = document.createElement("div");
  new_label.classList.add("label");
  if (specialLabels & (labelSet.charAt(0) == "#")) {
    let lblPar = document.createElement("p");
    let printPar = true;
    switch (labelSet) {
      case "#QRonly":
        printPar = false;
      case "#QR":
        var QR = QRCode.generateSVG(labelName, {
          ecclevel: "M",
          margin: 0.002,
        });
        QR.style.height = "100%";
        QR.style.minHeight = "100%";
        QR.style.flexShrink = 0;
        printPar &&
          (lblPar.innerHTML = `${labelName} ${
            labelOwner && "<br/>" + labelOwner
          }`);
        lblPar.style.paddingRight = "1em";
        new_label.appendChild(lblPar);
        new_label.appendChild(QR);
        return new_label;

      default:
        break;
    }
  }
  new_label.innerHTML =
    "<p>" +
    labelSet +
    "<br/> <b>" +
    labelName +
    "</b> <br/> " +
    labelOwner +
    "   " +
    labelDate +
    "</p>";
  return new_label;
}
function populateLabels(
  labelNames,
  labelSets,
  labelOwner,
  labelDate = new Date().toISOString().slice(0, 10),
  skip_start = 0,
  page_break_set = false,
  specialLabels = false
) {
  const labelsPerPage = 85;

  //remove any existing labels
  const labelContainer = document.getElementById("labels");
  labelContainer.textContent = "";

  //create a first page
  const firstPage = document.createElement("div");
  firstPage.classList.add("labelgrid");
  labelContainer.appendChild(firstPage);

  for (let empty_i = 0; empty_i < skip_start % 85; empty_i++) {
    let emptyDiv = document.createElement("div");
    emptyDiv.classList.add("label");
    firstPage.appendChild(emptyDiv);
  }

  //loop over label sets
  for (let label_i = 0; label_i < labelSets.length; label_i++) {
    const label_set = labelSets[label_i];

    for (let name_i = 0; name_i < labelNames.length; name_i++) {
      const label_name = labelNames[name_i];

      // create new label
      let new_label = createLabelElement(
        label_name,
        label_set,
        labelOwner,
        labelDate,
        specialLabels
      );

      // figure out if we need to do a page break (too many labels)
      if (labelContainer.lastElementChild.childElementCount >= labelsPerPage) {
        let new_label_page = document.createElement("div");
        new_label_page.classList.add("labelgrid");
        labelContainer.appendChild(new_label_page);
      }

      // attach new label
      labelContainer.lastElementChild.appendChild(new_label);
    }

    //check if we are breaking pages (for new sets/colors)
    // page break set and `(i+1) < length` (not on last set)
    if (page_break_set & (label_i + 1 < labelSets.length)) {
      let new_label_page = document.createElement("div");
      new_label_page.classList.add("labelgrid");
      labelContainer.appendChild(new_label_page);
    }
  }
}
