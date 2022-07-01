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
        new_label.classList.add("image-only");
        case "#QR":
          var QR = QRCode.generateSVG(labelName, {
            ecclevel: "M",
            margin: 0.004,
          });
          QR.style.height = "100%";
        QR.style.minHeight = "100%";
        QR.style.flexShrink = 0;
        printPar &&
          (lblPar.innerHTML = `${labelName} ${
            labelOwner && "<br/>" + labelOwner
          } ${labelDate && "<br/>" + labelDate}`);
        lblPar.style.paddingRight = "1em";
        new_label.appendChild(lblPar);
        lblPar.style.fontSize = "6pt";
        new_label.appendChild(QR);
        QR.classList.add("label-image","barcode-2d")
        return new_label;
      case "#C128only":
        printPar = false;
        new_label.classList.add("image-only");
      case "#C128":
        var barcode = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "svg"
        );
        new_label.appendChild(barcode);
        barcode.classList.add("jsbarcode","horiz-barcode", "label-image")
        new_label.classList.add("label-vert")
        barcode.setAttribute("jsbarcode-value",labelName);
        barcode.setAttribute("jsbarcode-width",2);
        barcode.setAttribute("jsbarcode-height", 20);
        barcode.setAttribute("jsbarcode-textmargin",0);
        barcode.setAttribute("jsbarcode-margin",0);
        barcode.setAttribute("jsbarcode-fontSize", 6);
        printPar &&
        (lblPar.innerHTML = `${labelOwner} ${
          labelDate && "<br/>" + labelDate
        }`);
        new_label.appendChild(lblPar);
        return new_label;
      default:
        break;
    }
  }
  new_label.innerHTML =
    "<p>" +
    (labelSet ? labelSet + "<br/>" : "") +
    " <b>" +
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
  skip_start = [0],
  labelsPerPage = 85,
  page_break_set = false,
  specialLabels = false
) {
  let nPages = 0;
  //remove any existing labels
  const labelContainer = document.getElementById("labels");
  labelContainer.textContent = "";

  //create a first page
  const firstPage = document.createElement("div");
  firstPage.classList.add("labelgrid");
  if (skip_start[nPages]) {
    for (
      let empty_i = 0;
      empty_i < skip_start[nPages] % labelsPerPage;
      empty_i++
    ) {
      let emptyDiv = document.createElement("div");
      emptyDiv.classList.add("label");
      firstPage.appendChild(emptyDiv);
    }
  }
  nPages++;
  labelContainer.appendChild(firstPage);
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
        for (
          let empty_i = 0;
          empty_i < skip_start[nPages] % labelsPerPage;
          empty_i++
        ) {
          let emptyDiv = document.createElement("div");
          emptyDiv.classList.add("label");
          new_label_page.appendChild(emptyDiv);
        }
        nPages++;
        labelContainer.appendChild(new_label_page);
      }

      // attach new label
      labelContainer.lastElementChild.appendChild(new_label);
    }

    //check if we are breaking pages (for new sets/colors)
    // page break set and `(i+1) < length` (not on last set)
    if (page_break_set & (label_i + 1 < labelSets.length)) {
      let new_label_page = document.createElement("div");
      for (
        let empty_i = 0;
        empty_i < skip_start[nPages] % labelsPerPage;
        empty_i++
      ) {
        let emptyDiv = document.createElement("div");
        emptyDiv.classList.add("label");
        new_label_page.appendChild(emptyDiv);
      }
      nPages++;
      new_label_page.classList.add("labelgrid");
      labelContainer.appendChild(new_label_page);
    }
  }
}
