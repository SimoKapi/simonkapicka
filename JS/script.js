$(document).ready(function () {
    const headerHeight = document.getElementById("header").offsetHeight;
    const contentChildDiv = document.querySelector(".applicationsContent").querySelector("div");
    const extraPadding = parseFloat(window.getComputedStyle(contentChildDiv, null).getPropertyValue('padding-top'))
    const scrollPadding = Number(headerHeight) + Number(extraPadding);

    document.documentElement.style.setProperty("--scroll_padding", scrollPadding + "px");
})