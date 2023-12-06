 // < 18
// import ReactDom from "react-dom";
import ReactDom from "react-dom/client";

import isPotentialCustomElementName from "is-potential-custom-element-name";

const disallowedNames = [
  "annotation-xml",
  "color-profile",
  "font-face",
  "font-face-src",
  "font-face-uri",
  "font-face-format",
  "font-face-name",
  "missing-glyph",
];

function validateElementName(elementName) {
  return (
    !disallowedNames.includes(elementName) &&
    isPotentialCustomElementName(elementName)
  );
}

export default function defineCustomElement(
  elementName,
  Component,
  options = {},
) {
  class ComponentElement extends HTMLElement {
    constructor() {
      const { attrs = {}, shadow = false, shadowMode = "open" } = options;

      super();

      this.attributeMapping = attrs;
       // < 18
      // this.container = shadow ? this.attachShadow({ mode: shadowMode }) : this;

      this.root = ReactDom.createRoot(
        shadow ? this.attachShadow({ mode: shadowMode }) : this,
      );
    }

    connectedCallback() {
      this.mutationObserver = new MutationObserver(
        this.mutationObserverCallback.bind(this),
      );
      this.mutationObserver.observe(this, {
        attributes: true,
      });

      this.renderComponent();
    }

    disconnectedCallback() {
      this.mutationObserver.disconnect();
    }

    mutationObserverCallback(mutationList) {
      for (const mutation of mutationList) {
        if (mutation.type === "attributes") {
          this.renderComponent();
        }
      }
    }

    renderComponent() {
      const attrs = this.getAttributeNames().reduce((obj, attrName) => {
        const val = this.getAttribute(attrName);

        obj[attrName] = this.attributeMapping[attrName]
          ? this.attributeMapping[attrName](val)
          : val;

        return obj;
      }, {});

      // < 18
      // ReactDom.render(<Component {...attrs} />, this.container);

      this.root.render(<Component {...attrs} />);
    }
  }

  if (validateElementName(elementName)) {
    customElements.define(elementName, ComponentElement);
  } else {
    console.log("nope");
  }
}
