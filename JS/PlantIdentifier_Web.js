const source = "../Python/PlantIdentifier_Web/plants.csv";

var plantsCount = 0;
async function PlantIdentifier_Tree() {
    //Obtain plant names
    var plantNames = [];
    const plantSingleInput = document.getElementById("plantSingleInput");
    if (plantSingleInput.value == 0) {
        const plantElements = document.getElementsByClassName("plantListItem");
        Array.from(plantElements).forEach(function (element) {
            plantNames.push(element.value);
        });
    } else {
        plantNames = plantSingleInput.value.split(",");
    }
    plantsCount = plantNames.length;
    //Obtain colors
    const bgcolor = document.getElementById("plantidentifier_bgcolor").value;
    const classcolor = document.getElementById("plantidentifier_classcolor").value;
    const htextcolor = document.getElementById("plantidentifier_htextcolor").value;
    const plantcolor = document.getElementById("plantidentifier_plantcolor").value;
    const ptextcolor = document.getElementById("plantidentifier_ptextcolor").value;
    const errorcolor = document.getElementById("plantidentifier_errorcolor").value;
    const linecolor = document.getElementById("plantidentifier_linecolor").value;
    const colors = {
        bgcolor: bgcolor,
        classcolor: classcolor,
        htextcolor: htextcolor,
        plantcolor: plantcolor,
        ptextcolor: ptextcolor,
        errorcolor: errorcolor,
        linecolor: linecolor
    };

    //Obtain spacing
    const hspacing = document.getElementById("plantidentifier_hspacing").value;
    const vspacing = document.getElementById("plantidentifier_vspacing").value;
    const spacing = {
        hspacing: hspacing,
        vspacing: vspacing
    };

    const plantData = await obtainData(plantNames);
    generateTree(plantData, colors, spacing, plantsCount);
}

function downloadPlantTree() {
    var link = document.createElement('a');
    link.download = "PhylogeneticTree.png";
    link.href = document.getElementById("plantsOutputImage").toDataURL();
    link.click();
}

var vspacing = 0;
var hspacing = 0;
var boxWidth = 0;
var boxHeight = 0;
var canvasWidth = 0;
// var row = 1;
// var column = 1;
function generateTree(speciesArray, colors, spacing) {
    //Reset and prepare canvas
    const canvas = document.getElementById("plantsOutputImage");
    const context = canvas.getContext("2d");
    context.webkitImageSmoothingEnabled = false;
    context.mozImageSmoothingEnabled = false;
    context.imageSmoothingEnabled = false;
    canvasWidth = canvas.width;
    context.clearRect(0, 0, canvasWidth, canvas.height);

    context.fillStyle = colors["bgcolor"];
    context.fillRect(0, 0, canvasWidth, canvas.height);

    //Initialize values
    vspacing = Number(spacing["vspacing"]);
    hspacing = Number(spacing["hspacing"]);
    const xBoxes = 7;
    const yBoxes = plantsCount;
    boxWidth = (canvas.width / xBoxes) - (hspacing + hspacing/xBoxes);
    boxHeight = Math.min((canvas.height / yBoxes) - (vspacing + vspacing/yBoxes), 150);
    // let boxWidth = 30;

    drawSpeciesTree(context, colors, speciesArray);
    console.log(speciesArray);
}

function drawSpeciesTree(context, colors, speciesArray) {
    var row = 1.5;
    //Fill headers
    drawRectangle(context, colors["errorcolor"], colors["classcolor"], colors["htextcolor"], "Kingdom", row, 7);
    drawRectangle(context, colors["errorcolor"], colors["classcolor"], colors["htextcolor"], "Phylum", row, 6);
    drawRectangle(context, colors["errorcolor"], colors["classcolor"], colors["htextcolor"], "Class", row, 5);
    drawRectangle(context, colors["errorcolor"], colors["classcolor"], colors["htextcolor"], "Order", row, 4);
    drawRectangle(context, colors["errorcolor"], colors["classcolor"], colors["htextcolor"], "Family", row, 3);
    drawRectangle(context, colors["errorcolor"], colors["classcolor"], colors["htextcolor"], "Genus", row, 2);
    drawRectangle(context, colors["errorcolor"], colors["classcolor"], colors["htextcolor"], "Species", row, 1);
    row = 2;

    // function countDepth(data, count = 1) {
    //     for (const key of Object.keys(data)) {
    //         if (typeof data[key] === "object") {
    //             return(countDepth(data[key], count + 1));
    //         } else {
    //             return(count + 1);
    //         }
    //     }
    // }

    function countRootKids(data) {
        if (typeof data !== "object") {
            return 1;
        }
        var returnCount = 0;
        for (const key of Object.keys(data)) {
            if (typeof data[key] === "object") {
                returnCount += countRootKids(data[key]);
            } else if (Array.isArray(data[key])) {
                returnCount += data[key].length;
            } else {
                returnCount++;
            }
        }
        return(returnCount);
    }

    function evaluateCategories(data, level = 7) {
        if (level === 0) {
            return;
        }
        var dictList = {};
        var rowOffset = row;
        var childRowOffset = row;
        if (typeof data === "object" && typeof Object.values(data) === "object") {
            for (const key of Object.keys(data)) {
                var rootKids = countRootKids(data[key]);
                if (typeof data[key] === "object") {
                    dictList = Object.assign(dictList, data[key]);
                } else {
                    drawRectangle(context, colors["errorcolor"], colors["plantcolor"], colors["ptextcolor"], data[key], Math.round(rootKids/2) + rowOffset, 1);
                    drawLine(context, level, Math.round(rootKids/2) + rowOffset, 1, Math.round(rootKids/2) + rowOffset, colors["linecolor"]);
                }

                if (typeof data[key] === "object") {
                    for (const child of Object.keys(data[key])) {
                        var childRootKids = countRootKids(data[key][child]);
                        drawLine(context, level, Math.round(rootKids/2) + rowOffset, level - 1, Math.round(childRootKids/2) + childRowOffset, colors["linecolor"]);
                        childRowOffset += childRootKids;
                    }
                }
                drawRectangle(context, colors["errorcolor"], colors["plantcolor"], colors["ptextcolor"], key, Math.round(rootKids/2) + rowOffset, level);
                rowOffset += rootKids;
            }
        }
        evaluateCategories(dictList, level - 1);
        return;
    }

    evaluateCategories(speciesArray);
}

function loopOverDicts(inputDict) {
    if (typeof inputDict !== "object") {
        return inputDict;
    }
    // const returnDict = Object.assign({}, A);
    for (const [key, value] of Object.entries(inputDict)) {
        if (typeof value !== "object") {
            return value;
        } else {
            return loopOverDicts(value);
        }
    }
}

function drawRectangle(context, errorColor, color, textcolor, text, row, column) {
    const x1 = canvasWidth - ((boxWidth + hspacing) * column);
    const y1 = ((boxHeight + vspacing) * row) - boxHeight;
    var fillText = text;
    var fillColor = color;
    if (text == undefined || text == "undefined") {
        fillText = "-";
        fillColor = errorColor;
    }
    context.globalCompositeOperation = 'source-over';
    context.fillStyle = fillColor;
    context.fillRect(x1, y1, boxWidth, boxHeight);
    // console.log(text + " at: " + x1 + ";" + y1);
    context.fillStyle = textcolor;
    context.font = "30px sans-serif";
    context.textAlign = "center";
    context.fillText(fillText, x1 + boxWidth/2, y1 + boxHeight/2 + vspacing, boxWidth - 10);
}

function drawLine(context, xL, yL, xR, yR, lineColor) {
    const lineXL = canvasWidth - ((boxWidth + hspacing) * xL) + boxWidth;
    const lineYL = ((boxHeight + vspacing) * yL) - boxHeight/2;

    const lineXR = canvasWidth - ((boxWidth + hspacing) * xR);
    const lineYR = ((boxHeight + vspacing) * yR) - boxHeight;
    context.globalCompositeOperation = 'source-over';
    context.beginPath();
    context.moveTo(lineXL, lineYL);
    context.lineTo(lineXR, lineYR + boxHeight/2);
    // console.log(" at: " + lineXL + ";" + lineYL);
    context.strokeStyle = lineColor;
    context.lineWidth = 10;
    context.stroke();
}

async function obtainData(speciesArray) {
    result = new Object();
    for (const speciesName of speciesArray) {
        //Obtain canonical name
        const parser_url = "https://api.gbif.org/v1/parser/name?name=" + speciesName;
        const canonical_json = await getHttpRequest(parser_url);
        const canonical_name = canonical_json[0]["canonicalName"];

        //Obtain all other information
        const match_url = "https://api.gbif.org/v1/species/match?name=" + canonical_name;
        const match_json = await getHttpRequest(match_url);

        const kingdom = match_json["kingdom"];
        if (kingdom == undefined) {
            console.log(speciesName + " is not a species!");
            plantsCount -= 1;
            continue;
        }

        if (kingdom == "Animalia") {
            console.log(speciesName + " has been identified as an animal... please check it again");
            plantsCount -= 1;
            continue;
        }
        const phylum = extractFromJson(match_json, "phylum");
        const species_class = extractFromJson(match_json, "class");
        const order = extractFromJson(match_json, "order");
        const family = extractFromJson(match_json, "family");
        const genus = extractFromJson(match_json, "genus");
        const species = extractFromJson(match_json, "species");

        const plantData = {[kingdom]: {[phylum]: {[species_class]: {[order]: {[family]: {[genus]: species}}}}}};
        result = mergeNestedDicts(result, plantData);
    }
    return(result);
}

function extractFromJson(json, index) {
    if (json[index] === undefined) {
        return("-");
    } else {
        return(json[index]);
    }
}

function getHttpRequest(url) {
    const http = new XMLHttpRequest();
    http.open("GET", url);

    return new Promise(function (resolve, reject) {
        http.onload = function() {
            if (http.status == 200) {
                var responseData = JSON.parse(http.responseText);
                resolve(responseData);
            } else {
                reject("Request failed with status: " + http.status);
            }
        };
        http.send();
    });
}

function mergeNestedDicts(A, B) {
    if (typeof A !== "object" || typeof B !== "object") {
        return [A, B];
    }
    const returnDict = Object.assign({}, A);
    for (const [key, value] of Object.entries(B)) {
        if (Object.keys(returnDict).includes(key) && returnDict[key].constructor == Object) {
            returnDict[key] = mergeNestedDicts(returnDict[key], value);
        }
        else {
            returnDict[key] = value;
        }
    }
    return(Object.assign({}, returnDict));
}

function extractData(json, key) {
    try {
        return(json[key]);
    } catch (error) {
        return("-")
    }
}

function addPlant() {
    const plantsList = document.getElementById("plantsList");
    const input = document.createElement("input");
    const li = document.createElement("li");
    input.spellcheck = false;
    input.type = Text;
    input.className = "plantListItem";

    const removeButton = document.createElement("button");
    removeButton.setAttribute("onclick", "removePlant()");
    removeButton.textContent = "-"

    li.appendChild(input);
    li.appendChild(removeButton);
    plantsList.appendChild(li);

    const plantCounter = document.getElementById("plantsListCount");
    plantCounter.textContent = "(" + plantsList.childElementCount + ")";
}

function removePlant() {
    const li = event.target.parentElement;
    const plantsList = document.getElementById("plantsList");
    plantsList.removeChild(li);

    const plantCounter = document.getElementById("plantsListCount");
    plantCounter.textContent = "(" + plantsList.childElementCount + ")";
}