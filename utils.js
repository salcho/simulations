class Simulation extends HTMLElement {
    constructor() {
        super();
        const template = document.getElementById("simulation-template");
        const shadowRoot = this.attachShadow({ mode: 'open' });
        shadowRoot.appendChild(template.content.cloneNode(true));
    }

    connectedCallback() {
        // propagate the name of the simulation to all needed attributes
        const name = this.getAttribute("name");
        const container = this.shadowRoot.querySelector("#container");
        container.classList.add(name);

        const startButton = container.querySelector("#start");
        startButton.setAttribute('onclick', `start${name}(); this.blur();`);

        // move the control elements to the control bar
        const slot = this.shadowRoot.querySelector('slot[name="control"]');
        const controls = this.shadowRoot.querySelector('#controls');
        while (slot.assignedElements().length > 0) {
            const child = slot.assignedElements()[0];
            controls.insertBefore(child, controls.lastElementChild);
        }
    }
}

customElements.define('simulation-elem', Simulation);

function load() {
    // Load the navbar
    const navbar = document.getElementById("navbar");
    const tabs = Array.from(document.getElementsByTagName('simulation-elem'))
        .map(s => s.shadowRoot)
        .map(d => d.querySelector('.tab'));
    tabs.forEach(tab => {
        const button = document.createElement("button");
        button.classList.add("tablinks");
        button.onclick = function () { openTab(event, tabName) };
        const tabName = tab.classList[1];
        button.innerText = tabName.charAt(0).toUpperCase() + tabName.slice(1);
        navbar.appendChild(button);
    });

    // sets the first tab as active and hides the rest
    tabs
        .forEach(tab => tab.classList.add("hidden"));
    const firstTab = tabs[0];
    firstTab.classList.add("active");
    firstTab.classList.remove("hidden");

    let script = document.createElement("script");
    script.src = "./particles.js";
    document.head.appendChild(script);
    script = document.createElement("script");
    script.src = "./gravity.js";
    document.head.appendChild(script);
    script = document.createElement("script");
    script.src = "./chaos.js";
    document.head.appendChild(script);
}

function openTab(evt, tabName) {
    Array.from(document.getElementsByTagName('simulation-elem'))
        .map(s => s.shadowRoot)
        .map(d => d.querySelector('.tab'))
        .forEach(tab => {
            tab.classList.remove("active");
            tab.classList.add("hidden");
        });

    var active = Array.from(document.getElementsByTagName('simulation-elem'))
        .map(s => s.shadowRoot).find(s => s.querySelector(`.${tabName}`)).querySelector(`#container`);
    active.classList.add("active");
    active.classList.remove("hidden");
}

