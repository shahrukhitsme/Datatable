//let fs = require("fs");
//let data = [];
let currentPage = 1;

function init() {
    loadData();
}

async function loadData() {
    let readDataPromise = await fetch("data.json");
    let readConfigPromise = await fetch("config.json");
    let data = await readDataPromise.json();
    let config = await readConfigPromise.json();
    if (data.length == 0)
        return;
    window.data = data;
    window.config = config;
    removeIrrelevantData(data);
    initTable(config);
    fillTable();
    initButtons();
}

function removeIrrelevantData(data) {
    if (!data)
        return;
    config = window.config;
    let selectedColumms = config["selectedColumns"];
    let newData = [];
    for (let index in data) {
        let dataItem = data[index];
        let newObj = {};
        for (let colIndex in selectedColumms) {
            let column = selectedColumms[colIndex];
            if (dataItem[column]) {
                newObj[column] = dataItem[column];
            }
        }
        newData.push(newObj);
    }
    window.data = newData;
}

function initTable(config) {
    if (!config)
        return;
    setHeader();
    headerFixInit(config);
    applySortableColumns();
    applyFilters();
}

function setHeader() {
    data = window.data;
    config = window.config;
    let selectedColumns = config["selectedColumns"];
    let table = document.getElementById("data-table");
    let tableHeader = table.getElementsByTagName("tr")[0];
    let filterInputs = document.getElementsByClassName("filterInput");
    filterInputsIndex = 0;
    for (let index in selectedColumns) {
        let column = selectedColumns[index];
        if (data[0][column]) {
            tableHeader.appendChild(createElem("th", null, column.toUpperCase(), null, column.toUpperCase()));
            filterInputs[filterInputsIndex].setAttribute("id", column + "Filter");
            filterInputsIndex++;
        }
    }
    for (filterInputsIndex = 0; filterInputsIndex < 5; filterInputsIndex++)
        filterInputs[filterInputsIndex].style.display = 'none';
}

function initButtons() {
    data = window.data;
    config = window.config;
    let buttonSection = document.getElementById("buttons");
    let prevButton = document.getElementById("prev");
    let page1Button = document.getElementById("page1");
    let page2Button = document.getElementById("page2");
    let page3Button = document.getElementById("page3");
    let page4Button = document.getElementById("page4");
    let page5Button = document.getElementById("page5");
    let nextButton = document.getElementById("next");
    prevButton.style.display = 'none'
    page1Button.style.display = 'none'
    page2Button.style.display = 'none'
    page3Button.style.display = 'none'
    page4Button.style.display = 'none'
    page5Button.style.display = 'none'
    nextButton.style.display = 'none'
    if (config["isPaginated"]) {
        buttonSection.style.display = '';
        if (currentPage > 1)
            prevButton.style.display = '';
        else
            prevButton.style.display = 'none';

        let totalPages = Math.ceil(data.length / 10);
        if (totalPages >= 1)
            page1Button.style.display = '';
        if (totalPages >= 2)
            page2Button.style.display = '';
        if (totalPages >= 3)
            page3Button.style.display = '';
        if (totalPages >= 4)
            page4Button.style.display = '';
        if (totalPages >= 5)
            page5Button.style.display = '';

        if (currentPage < totalPages)
            nextButton.style.display = '';
        else
            nextButton.style.display = 'none';

        clearActiveButton();

        if (totalPages >= 5) {
            if (currentPage > 2 && currentPage <= totalPages - 2) {
                page1Button.value = parseInt(currentPage) - 2;
                page2Button.value = parseInt(currentPage) - 1;
                page3Button.value = currentPage;
                page4Button.value = parseInt(currentPage) + 1;
                page5Button.value = parseInt(currentPage) + 2;
                page3Button.classList.add('active');
            }
            else if (currentPage > 2 && currentPage >= totalPages - 2) {
                if (currentPage == totalPages - 1) {
                    page1Button.value = parseInt(currentPage) - 3;
                    page2Button.value = parseInt(currentPage) - 2;
                    page3Button.value = parseInt(currentPage) - 1;
                    page4Button.value = currentPage;
                    page5Button.value = parseInt(currentPage) + 1;
                    page4Button.classList.add('active');
                } else {
                    page1Button.value = parseInt(currentPage) - 4;
                    page2Button.value = parseInt(currentPage) - 3;
                    page3Button.value = parseInt(currentPage) - 2;
                    page4Button.value = parseInt(currentPage) - 1;
                    page5Button.value = currentPage;
                    page5Button.classList.add('active');
                }
            }
            else if (currentPage <= 2) {
                if (currentPage == 1) {
                    page1Button.value = currentPage;
                    page2Button.value = parseInt(currentPage) + 1;
                    page3Button.value = parseInt(currentPage) + 2;
                    page4Button.value = parseInt(currentPage) + 3;
                    page5Button.value = parseInt(currentPage) + 4;
                    page1Button.classList.add('active');
                } else {
                    page1Button.value = parseInt(currentPage) - 1;
                    page2Button.value = currentPage;
                    page3Button.value = parseInt(currentPage) + 1;
                    page4Button.value = parseInt(currentPage) + 2;
                    page5Button.value = parseInt(currentPage) + 3;
                    page2Button.classList.add('active');
                }
            }
        }
        else {
            document.getElementById("page" + currentPage).classList.add('active');
        }
    }
    else
        buttonSection.style.display = 'none';
}

function clearActiveButton() {
    let page1Button = document.getElementById("page1");
    let page2Button = document.getElementById("page2");
    let page3Button = document.getElementById("page3");
    let page4Button = document.getElementById("page4");
    let page5Button = document.getElementById("page5");
    page1Button.classList.remove('active');
    page2Button.classList.remove('active');
    page3Button.classList.remove('active');
    page4Button.classList.remove('active');
    page5Button.classList.remove('active');
}

function headerFixInit(config) {
    let tableHeaders = document.getElementsByTagName("th");
    if (config["isHeaderFixed"])
        Object.values(tableHeaders).map(tableHeader => tableHeader.style.position = "stcky");
    else
        Object.values(tableHeaders).map(tableHeader => tableHeader.style.position = "static");
}

function applySortableColumns() {
    config = window.config;
    let sortableColumns = config["sortableColumns"];
    for (let index in sortableColumns) {
        let column = sortableColumns[index];
        let columnHeader = document.getElementById(column.toUpperCase());
        if (columnHeader) {
            columnHeader.appendChild(createElem("i", "fas fa-sort", null, null, null));
            columnHeader.classList.add("clickable");
            columnHeader.addEventListener("click", () => sortData(column));
        }
    }
}

function applyFilters() {
    config = window.config;
    let filterableColumns = config["filterableColumns"];
    for (let index in filterableColumns) {
        let column = filterableColumns[index];
        let filterInput = document.getElementById(column + "Filter");
        filterInput.style.display = '';
    }
}

function sortData(column) {
    let columnHeader = document.getElementById(column.toUpperCase());
    let isAscending = columnHeader.getAttribute("sorted-ascending");
    if (isAscending == "true")
        isAscending = true;
    else
        isAscending = false;
    columnHeader.setAttribute("sorted-ascending", !isAscending);
    window.data.sort(sortByProperty(column, !isAscending));
    fillTable();
}

function sortByProperty(property, asc) {
    return function (a, b) {
        if (a[property] > b[property])
            return asc ? 1 : -1;
        else if (a[property] < b[property])
            return asc ? -1 : 1;

        return 0;
    }
}

function fillTable() {
    data = window.data;
    config = window.config;
    console.log(data.length);
    addRows(currentPage);
}

function addRows(pageNum) {
    data = window.data;
    config = window.config;
    document.getElementById("table-body").innerHTML = "";
    let initialIndex = (pageNum - 1) * 10;
    let selectedColumns = config["selectedColumns"];
    for (let index = initialIndex; index < data.length; index++) {
        let rowData = [];
        for (let columnIndex in selectedColumns) {
            let column = selectedColumns[columnIndex];
            rowData.push(data[index][column]);
        }
        addRow(rowData);
        if (config["isPaginated"] && index >= initialIndex + 9)
            break;
    }
}

function addRow(rowData) {
    let newRow = createElem("tr", null, null, null, null);
    for (let index in rowData)
        newRow.appendChild(createElem("td", null, null, null, rowData[index]));
    document.getElementById("table-body").appendChild(newRow);
}

function createElem(elemName, className, id, value, innerText) {
    let elem = document.createElement(elemName);
    if (className)
        elem.setAttribute("class", className);
    if (id)
        elem.setAttribute("id", id);
    if (value)
        elem.setAttribute("value", value);
    if (innerText)
        elem.innerText = innerText;
    return elem;
}

function changePage(e) {
    let id = e.target.id;
    switch (id) {
        case 'prev':
            currentPage--;
            break;
        case 'next':
            currentPage++;
            break;
        case 'page1':
        case 'page2':
        case 'page3':
        case 'page4':
        case 'page5':
            currentPage = e.target.value;
    }
    initButtons();
    addRows(currentPage);
}

function filter(e) {
    let filterInputs = document.getElementsByClassName("filterInput");
    if (window.originalData)
        window.data = window.originalData;
    else
        window.originalData = window.data;
    let filteredData = window.data;
    for (let index = 0; index < filterInputs.length; index++) {
        let filterInput = filterInputs[index];
        let filterId = filterInput.getAttribute("id");
        let filterValue = filterInput.value;
        if (filterValue) {
            let column = filterId.substring(0, filterId.length - 6);
            filteredData = filterByColumn(filteredData, column, filterValue);
        }
    }
    window.data = filteredData;
    fillTable();
    initButtons();
}

function filterByColumn(data, column, text) {
    let filteredData = [];
    for (let index = 0; index < data.length; index++) {
        let dataItem = data[index];
        if (dataItem[column] && dataItem[column].toUpperCase().startsWith(text.toUpperCase()))
            filteredData.push(dataItem);
    }
    return filteredData;
}