function createLabelElement(
  labelName,
  labelSet,
  labelOwner,
  labelDate,
  specialLabels = true
) {
  let new_label = document.createElement("div");
  new_label.classList.add("label");
  const lbltxt = document.createElement("div");
  lbltxt.classList.add("label-text");

  if (specialLabels & (labelSet.charAt(0) == "#")) {
    // const specialType = /(?<=^#\**)[^\*].+ ?/.exec(labelSet)[0];
    let {
      groups: {
        altType,
        lblType: specialType,
        subset: namedSpecialSubset,
        subsetSep,
        subsetLoc,
      },
    } = /(?<=^#)(?<altType>\**)?(?<lblType>.[^\*].*?)(?:(?: *\/(?:(?<subsetLoc>[an])\/)?(?:(?<subsetSep>.*)\/)? *)(?<subset>.*)?)?$/gm.exec(
      labelSet
    ) || {
      groups: {
        altType: "",
        lblType: "",
        subset: "",
        subsetSep: "",
        subsetLoc: "",
      },
    };
    const altVersion = altType && altType.length;
    new_label.classList.add(
      "label-special",
      altVersion ? "alt-" + altVersion : "default-version"
    );
    if (namedSpecialSubset) {
      if (altVersion && ! (subsetLoc)) {subsetLoc = "n"}
      switch (subsetLoc) {
        case "n": // add subset in name field
          labelName += (subsetSep || " - ") + namedSpecialSubset;
          break;
        case "a": // add subset in ATTN field
        default:
          labelOwner += (subsetSep || "/") + namedSpecialSubset;
      }
    }
    switch (specialType) {
      case "QR":
        var QR = QRCode.generateSVG(labelName, {
          ecclevel: "M",
          margin: 0.004,
        });
        QR.style.height = "100%";
        QR.style.minHeight = "100%";
        QR.style.flexShrink = 0;
        new_label.appendChild(QR);
        QR.classList.add("label-image", "barcode-2d");
        new_label.classList.add("label-QR", "label-horiz");
        break;
      case "C128":
        if (!labelName) {return new_label;}
        var barcode = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "svg"
        );
        new_label.appendChild(barcode);
        barcode.classList.add("jsbarcode", "horiz-barcode", "label-image");
        new_label.classList.add("label-vert");
        barcode.setAttribute("preserveAspectRatio", "none");
        barcode.setAttribute("jsbarcode-value", labelName);
        barcode.setAttribute("jsbarcode-width", 2);
        barcode.setAttribute("jsbarcode-height", 10);
        barcode.setAttribute("jsbarcode-textmargin", 0);
        barcode.setAttribute("jsbarcode-margin", 0);
        barcode.setAttribute("jsbarcode-displayvalue", false);
        break;
      default:
        break;
    }
  }
  const labelTxtContent = {
    "txt-set": labelSet,
    "txt-name": labelName,
    "txt-owner": labelOwner,
    "txt-date": labelDate,
  };
  for (const txtProp in labelTxtContent) {
    let txtSection = document.createElement("span");
    txtSection.classList.add(txtProp);
    txtSection.textContent = labelTxtContent[txtProp];
    lbltxt.appendChild(txtSection);
  }
  new_label.appendChild(lbltxt);
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
