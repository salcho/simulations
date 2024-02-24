function load() {
    // Load the navbar
    const navbar = document.getElementById("navbar");
    Array.from(document.getElementsByClassName("tab")).forEach(tab => {
        const button = document.createElement("button");
        button.classList.add("tablinks");
        button.onclick = function () { openTab(event, tabName) };
        const tabName = tab.classList[1];
        button.innerText = tabName.charAt(0).toUpperCase() + tabName.slice(1);
        navbar.appendChild(button);
    });

}

function openTab(evt, tabName) {
    Array.from(document.getElementsByClassName("tab")).forEach(tab => {
        tab.classList.remove("active");
        tab.classList.add("hidden");
    });

    var active = document.getElementsByClassName(tabName)[0];
    active.classList.add("active");
    active.classList.remove("hidden");
}

// sets the first tab as active and hides the rest
Array.from(document.getElementsByClassName("tab")).forEach(tab => tab.classList.add("hidden"));
const firstTab = document.getElementsByClassName("tab")[2];
firstTab.classList.add("active");
firstTab.classList.remove("hidden");