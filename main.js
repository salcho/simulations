// Simulation elements use a simple template that creates a self-contained canvas and a bottom and right control bar.
// Simulations must be given a name and optionally a list of functions that will be bound to the window object.
// Every simulation must have a corresponding script module in the modules folder that exports a start and reset function
// with the same name as the simulation. The scripts are loaded automatically when the simulation element is rendered.
// Simulation come with start and reset buttons in the control bar by default.
// To add controls to the right bar, add children to the simulation element and use the slot element with the name "control".
// Example:
//  <simulation-elem name="sound" functions="playNote,stopNote">
//      <button id="play" slot="control">Play</button>
//      <label id="stop" slot="control">Stop</label>
//  </simulation-elem>
// Binding functions to the window object makes them available to inline scripts in index.html.
class Simulation extends HTMLElement {
    constructor() {
        super();
        const template = document.getElementById("simulation-template");
        const shadowRoot = this.attachShadow({ mode: 'open' });
        shadowRoot.appendChild(template.content.cloneNode(true));
    }
    with
    connectedCallback() {
        // propagate the name of the simulation to all needed attributes
        const name = this.getAttribute("name");
        const container = this.shadowRoot.querySelector("#container");
        container.classList.add(name);

        const functions = [...(this.getAttribute("functions") || "").split(',')]
            .filter(f => f.length > 0);

        const code = `
        import { start${name}, reset${name} ${functions.length ? ',' + functions.join(',') : ''} } from './modules/${name}.js';
        window['start${name}'] = start${name};
        window['reset${name}'] = reset${name};
        ${functions.map(f => `window['${f}'] = ${f};`).join('\n')}
        `;
        this.shadowRoot.querySelector("#logic").innerText = code;

        const startButton = container.querySelector("#start");
        startButton.setAttribute('onclick', `start${name}(); this.blur();`);
        const resetButton = container.querySelector("#reset");
        resetButton.setAttribute('onclick', `reset${name}(); this.blur();`);

        // move the control elements to the control bar
        const slot = this.shadowRoot.querySelector('slot[name="control"]');
        const controls = this.shadowRoot.querySelector('.controls');
        while (slot.assignedElements().length > 0) {
            const child = slot.assignedElements()[0];
            controls.insertBefore(child, controls.lastElementChild);
        }
    }
}

class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

function load() {
    customElements.define('simulation-elem', Simulation);

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
    tabs.forEach(tab => tab.classList.add("hidden"));
    const firstTab = tabs[3];
    firstTab.classList.add("active");
    firstTab.classList.remove("hidden");
}

function openTab(_, tabName) {
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

function getShadowRoot(name) {
    return document.querySelector(`simulation-elem[name="${name}"]`).shadowRoot;
}

window.onload = load;

export { load, openTab, Point, getShadowRoot }