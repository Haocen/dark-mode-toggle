/**
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// @license © 2019 Google LLC. Licensed under the Apache License, Version 2.0.
const doc = document;
let store = {};
try {
  store = localStorage;
} catch (err) {
  // Do nothing. The user probably blocks cookies.
}
const PREFERS_COLOR_SCHEME = 'prefers-color-scheme';
const MEDIA = 'media';
const LIGHT = 'light';
const DARK = 'dark';
const MQ_DARK = `(${PREFERS_COLOR_SCHEME}:${DARK})`;
const MQ_LIGHT = `(${PREFERS_COLOR_SCHEME}:${LIGHT})`;
const LINK_REL_STYLESHEET = 'link[rel=stylesheet]';
const REMEMBER = 'remember';
const LEGEND = 'legend';
const TOGGLE = 'toggle';
const SWITCH = 'switch';
const SLIDER = 'slider';
const THREE_WAY = 'three-way';
const APPEARANCE = 'appearance';
const PERMANENT = 'permanent';
const MODE = 'mode';
const COLOR_SCHEME_CHANGE = 'colorschemechange';
const PERMANENT_COLOR_SCHEME = 'permanentcolorscheme';
const ALL = 'all';
const NOT_ALL = 'not all';
const NAME = 'dark-mode-toggle';
const DEFAULT_URL = 'https://haocen.github.io/dark-mode-toggle/demo/';

// See https://html.spec.whatwg.org/multipage/common-dom-interfaces.html ↵
// #reflecting-content-attributes-in-idl-attributes.
const installStringReflection = (obj, attrName, propName = attrName) => {
  Object.defineProperty(obj, propName, {
    enumerable: true,
    get() {
      const value = this.getAttribute(attrName);
      return value === null ? '' : value;
    },
    set(v) {
      this.setAttribute(attrName, v);
    },
  });
};

const installBoolReflection = (obj, attrName, propName = attrName) => {
  Object.defineProperty(obj, propName, {
    enumerable: true,
    get() {
      return this.hasAttribute(attrName);
    },
    set(v) {
      if (v) {
        this.setAttribute(attrName, '');
      } else {
        this.removeAttribute(attrName);
      }
    },
  });
};

const template = doc.createElement('template');
// ⚠️ Note: this is a minified version of `src/template-contents.tpl`.
// Compress the CSS with https://cssminifier.com/, then paste it here.
// eslint-disable-next-line max-len
template.innerHTML = `<style>*,::after,::before{box-sizing:border-box}:host{contain:content;display:block}:host([hidden]){display:none}form{background-color:var(--${NAME}-background-color,transparent);color:var(--${NAME}-color,inherit);padding:0}fieldset{border:none;margin:0;padding-block:.25rem;padding-inline:.25rem}legend{font:var(--${NAME}-legend-font,inherit);padding:0}input,label{cursor:pointer}label{white-space:nowrap}input{opacity:0;position:absolute;pointer-events:none}input:focus-visible+label{outline:#e59700 auto 2px;outline:-webkit-focus-ring-color auto 5px}label::before{content:"";display:inline-block;background-size:var(--${NAME}-icon-size,1rem);background-repeat:no-repeat;height:var(--${NAME}-icon-size,1rem);width:var(--${NAME}-icon-size,1rem);vertical-align:middle}label:not(:empty)::before{margin-inline-end:.5rem}[part=lightLabel]::before{background-image:var(--${NAME}-light-icon, url("${DEFAULT_URL}sun.png"))}[part=darkLabel]::before{filter:var(--${NAME}-icon-filter, none);background-image:var(--${NAME}-dark-icon, url("${DEFAULT_URL}moon.png"))}[part=toggleLabel]::before{background-image:var(--${NAME}-checkbox-icon,none)}[part=permanentLabel]::before{background-image:var(--${NAME}-remember-icon-unchecked, url("${DEFAULT_URL}unchecked.svg"))}[part=darkLabel],[part=lightLabel],[part=toggleLabel]{font:var(--${NAME}-label-font,inherit)}[part=darkLabel]:empty,[part=lightLabel]:empty,[part=toggleLabel]:empty{font-size:0;padding:0}[part=permanentLabel]{font:var(--${NAME}-remember-font,inherit)}input:checked+[part=permanentLabel]::before{background-image:var(--${NAME}-remember-icon-checked, url("${DEFAULT_URL}checked.svg"))}input:checked+[part=darkLabel],input:checked+[part=lightLabel]{background-color:var(--${NAME}-active-mode-background-color,transparent)}input:checked+[part=darkLabel]::before,input:checked+[part=lightLabel]::before{background-color:var(--${NAME}-active-mode-background-color,transparent)}input:checked+[part=toggleLabel]::before{filter:var(--${NAME}-icon-filter, none)}input:checked+[part=sliderLabel]~aside [part=permanentLabel]::before{filter:var(--${NAME}-remember-filter, invert(100%))}aside{visibility:hidden;margin-block-start:.15rem}[part=darkLabel]:focus-visible~aside,[part=lightLabel]:focus-visible~aside,[part=sliderLabel]:focus-visible~aside,[part=toggleLabel]:focus-visible~aside{visibility:visible;transition:visibility 0s}aside [part=permanentLabel]:empty{display:none}@media (hover:hover){aside{transition:visibility 3s}aside:hover{visibility:visible}[part=darkLabel]:hover~aside,[part=lightLabel]:hover~aside,[part=sliderLabel]:hover~aside,[part=toggleLabel]:hover~aside{visibility:visible;transition:visibility 0s}}[part=sliderLabel]:not([hidden]){display:inline-block;position:relative;height:calc(var(--${NAME}-icon-size,1rem) * 2);width:calc(var(--${NAME}-icon-size,1rem) * 3.5);background-color:#b7bbbd;border-radius:var(--${NAME}-icon-size,1rem);transition:.4s}[part=sliderLabel]:not([hidden])::before{display:flex;align-items:center;justify-content:center;position:absolute;top:calc(var(--${NAME}-icon-size,1rem) * .25);left:calc(var(--${NAME}-icon-size,1rem) * .25);height:calc(var(--${NAME}-icon-size,1rem) * 1.5);width:calc(var(--${NAME}-icon-size,1rem) * 1.5);border-radius:100%;box-shadow:0 .15em .3em rgb(0 0 0 / 15%),0 .2em .5em rgb(0 0 0 / 30%);background-color:#fff;color:#333;transition:.4s;content:"";background-position:center;background-size:var(--${NAME}-icon-size,1rem);background-image:var(--${NAME}-light-icon, url("${DEFAULT_URL}fa-sun.svg"));box-sizing:border-box}input:checked+[part=sliderLabel]{background-color:#4e5255}input:checked+[part=sliderLabel]:not([hidden])::before{left:calc(100% - var(--${NAME}-icon-size,1rem) * 1.75);border-color:#000;background-color:#ccc;color:#000;background-size:var(--${NAME}-icon-size,1rem);background-image:var(--${NAME}-dark-icon, url("${DEFAULT_URL}fa-moon.svg"));filter:var(--${NAME}-icon-filter, invert(100%));box-shadow:0 .5px hsl(0deg 0% 100% / 16%)}[part=sliderLabel]:not([hidden])::after{display:flex;align-items:center;justify-content:center;position:absolute;top:calc(var(--${NAME}-icon-size,1rem) * .25);left:calc(100% - var(--${NAME}-icon-size,1rem) * 1.75);height:calc(var(--${NAME}-icon-size,1rem) * 1.5);width:calc(var(--${NAME}-icon-size,1rem) * 1.5);border-radius:100%;color:#333;content:"";background-position:center;background-size:var(--${NAME}-icon-size,1rem);background-image:var(--${NAME}-dark-icon, url("${DEFAULT_URL}fa-moon.svg"));background-repeat:no-repeat;box-sizing:border-box;opacity:.5}input:checked+[part=sliderLabel]:not([hidden])::after{left:calc(var(--${NAME}-icon-size,1rem) * .25);background-image:var(--${NAME}-light-icon, url("${DEFAULT_URL}fa-sun.svg"));filter:var(--${NAME}-icon-filter, invert(100%))}[part=darkThreeWayLabel]:not([hidden]),[part=lightThreeWayLabel]:not([hidden]){display:inline-block;position:relative;height:calc(var(--${NAME}-icon-size,1rem) * 2);width:calc(var(--${NAME}-icon-size,1rem) * 2.5);background-color:#b7bbbd;border-radius:var(--${NAME}-icon-size,1rem);transition:.4s;vertical-align:bottom}[part=lightThreeWayLabel]:not([hidden]){margin-right:calc(var(--${NAME}-icon-size,1rem)* -1)}[part=systemThreeWayLabel]:not([hidden]){display:inline-block;position:relative;height:calc(var(--${NAME}-icon-size,1rem) * 2);width:calc(var(--${NAME}-icon-size,1rem) * 2);background-color:#b7bbbd;transition:.4s;margin-right:calc(var(--${NAME}-icon-size,1rem)* -1);vertical-align:bottom;z-index:1}[part=systemThreeWayLabel]:not([hidden])::before{display:flex;align-items:center;justify-content:center;position:absolute;top:calc(var(--${NAME}-icon-size,1rem) * .25);left:calc(var(--${NAME}-icon-size,1rem) * .25);height:calc(var(--${NAME}-icon-size,1rem) * 1.5);width:calc(var(--${NAME}-icon-size,1rem) * 1.5);border-radius:100%;box-shadow:0 .15em .3em rgb(0 0 0 / 15%),0 .2em .5em rgb(0 0 0 / 30%);background-color:#fff;color:#333;transition:.4s;content:"";background-position:center;background-size:var(--${NAME}-icon-size,1rem);box-sizing:border-box;z-index:2;filter:var(--${NAME}-icon-filter, invert(0))}[part=fieldset]:has(input[part=lightThreeWayRadio]:checked) [part=systemThreeWayLabel]:not([hidden])::before{left:calc(var(--${NAME}-icon-size,1rem) * -1.5);background-image:var(--${NAME}-light-icon, url("${DEFAULT_URL}fa-sun.svg"))}[part=fieldset]:has(input[part=systemThreeWayRadio]:checked) [part=systemThreeWayLabel]:not([hidden])::before{left:calc(var(--${NAME}-icon-size,1rem) * .25);background-image:var(--${NAME}-system-icon, url("${DEFAULT_URL}fa-yin-yang.svg"))}[part=fieldset]:has(input[part=darkThreeWayRadio]:checked) [part=systemThreeWayLabel]:not([hidden])::before{left:calc(var(--${NAME}-icon-size,1rem) * 2);background-image:var(--${NAME}-dark-icon, url("${DEFAULT_URL}fa-moon.svg"))}[part=lightThreeWayLabel]:not([hidden])::after{display:flex;align-items:center;justify-content:center;position:absolute;top:calc(var(--${NAME}-icon-size,1rem) * .25);left:calc(100% - var(--${NAME}-icon-size,1rem) * 2);height:calc(var(--${NAME}-icon-size,1rem) * 1.5);width:calc(var(--${NAME}-icon-size,1rem) * 1.5);border-radius:100%;color:#333;content:"";background-position:center;background-size:var(--${NAME}-icon-size,1rem);background-image:var(--${NAME}-light-icon, url("${DEFAULT_URL}fa-sun.svg"));background-repeat:no-repeat;box-sizing:border-box;opacity:.5}[part=systemThreeWayLabel]:not([hidden])::after{display:flex;align-items:center;justify-content:center;position:absolute;top:calc(var(--${NAME}-icon-size,1rem) * .25);left:calc(100% - var(--${NAME}-icon-size,1rem) * 1.75);height:calc(var(--${NAME}-icon-size,1rem) * 1.5);width:calc(var(--${NAME}-icon-size,1rem) * 1.5);border-radius:100%;color:#333;content:"";background-position:center;background-size:var(--${NAME}-icon-size,1rem);background-image:var(--${NAME}-system-icon, url("${DEFAULT_URL}fa-yin-yang.svg"));background-repeat:no-repeat;box-sizing:border-box;opacity:.5}[part=darkThreeWayLabel]:not([hidden])::after{display:flex;align-items:center;justify-content:center;position:absolute;top:calc(var(--${NAME}-icon-size,1rem) * .25);left:calc(100% - var(--${NAME}-icon-size,1rem) * 1.75);height:calc(var(--${NAME}-icon-size,1rem) * 1.5);width:calc(var(--${NAME}-icon-size,1rem) * 1.5);border-radius:100%;color:#333;content:"";background-position:center;background-size:var(--${NAME}-icon-size,1rem);background-image:var(--${NAME}-dark-icon, url("${DEFAULT_URL}fa-moon.svg"));background-repeat:no-repeat;box-sizing:border-box;opacity:.5}[part=fieldset]:has(input[part=sliderCheckbox]:checked) [part$=ThreeWayLabel]:not([hidden]){background-color:#4e5255}[part=fieldset]:has(input[part=sliderCheckbox]:checked) [part$=ThreeWayLabel]:not([hidden])::after{filter:var(--${NAME}-icon-filter, invert(100%))}[part=fieldset]:has(input[part=sliderCheckbox]:checked) [part=systemThreeWayLabel]:not([hidden])::before{border-color:#000;background-color:#ccc;color:#000;filter:var(--${NAME}-icon-filter, invert(100%));box-shadow:0 .5px hsl(0deg 0% 100% / 16%)}</style><form part=form><fieldset part=fieldset><legend part=legend></legend><input id=l part=lightRadio type=radio name=mode> <label for=l part=lightLabel></label> <input id=d part=darkRadio type=radio name=mode> <label for=d part=darkLabel></label> <input id=t part=toggleCheckbox type=checkbox> <label for=t part=toggleLabel></label> <input id=s part=sliderCheckbox type=checkbox> <label for=s part=sliderLabel></label> <input id=3l part=lightThreeWayRadio type=radio name=mode> <label for=3l part=lightThreeWayLabel></label> <input id=3s part=systemThreeWayRadio type=radio name=mode> <label for=3s part=systemThreeWayLabel></label> <input id=3d part=darkThreeWayRadio type=radio name=mode> <label for=3d part=darkThreeWayLabel></label><aside part=aside><input id=p part=permanentCheckbox type=checkbox> <label for=p part=permanentLabel></label></aside></fieldset></form>`;

export class DarkModeToggle extends HTMLElement {
  static get observedAttributes() {
    return [MODE, APPEARANCE, PERMANENT, LEGEND, LIGHT, DARK, REMEMBER];
  }

  constructor() {
    super();

    installStringReflection(this, MODE);
    installStringReflection(this, APPEARANCE);
    installStringReflection(this, LEGEND);
    installStringReflection(this, LIGHT);
    installStringReflection(this, DARK);
    installStringReflection(this, REMEMBER);

    installBoolReflection(this, PERMANENT);

    this._darkCSS = null;
    this._lightCSS = null;

    doc.addEventListener(COLOR_SCHEME_CHANGE, (event) => {
      this.mode = event.detail.colorScheme;
      this._updateRadios();
      this._updateCheckbox();
      this._updateSlider();
      this._updateThreeWayRadios();
    });

    doc.addEventListener(PERMANENT_COLOR_SCHEME, (event) => {
      this.permanent = event.detail.permanent;
      this._permanentCheckbox.checked = this.permanent;
      this._updateThreeWayRadios();
    });

    this._initializeDOM();
  }

  _initializeDOM() {
    const shadowRoot = this.attachShadow({mode: 'open'});
    shadowRoot.append(template.content.cloneNode(true));

    // We need to support `media="(prefers-color-scheme: dark)"` (with space)
    // and `media="(prefers-color-scheme:dark)"` (without space)
    this._darkCSS = doc.querySelectorAll(`${LINK_REL_STYLESHEET}[${MEDIA}*=${PREFERS_COLOR_SCHEME}][${MEDIA}*="${DARK}"]`);
    this._lightCSS = doc.querySelectorAll(`${LINK_REL_STYLESHEET}[${MEDIA}*=${PREFERS_COLOR_SCHEME}][${MEDIA}*="${LIGHT}"]`);

    // Get DOM references.
    this._lightRadio = shadowRoot.querySelector('[part=lightRadio]');
    this._lightLabel = shadowRoot.querySelector('[part=lightLabel]');
    this._darkRadio = shadowRoot.querySelector('[part=darkRadio]');
    this._darkLabel = shadowRoot.querySelector('[part=darkLabel]');
    this._darkCheckbox = shadowRoot.querySelector('[part=toggleCheckbox]');
    this._checkboxLabel = shadowRoot.querySelector('[part=toggleLabel]');
    this._sliderCheckbox = shadowRoot.querySelector('[part=sliderCheckbox]');
    this._sliderLabel = shadowRoot.querySelector('[part=sliderLabel]');
    this._lightThreeWayRadio =
      shadowRoot.querySelector('[part=lightThreeWayRadio]');
    this._lightThreeWayLabel =
      shadowRoot.querySelector('[part=lightThreeWayLabel]');
    this._systemThreeWayRadio =
      shadowRoot.querySelector('[part=systemThreeWayRadio]');
    this._systemThreeWayLabel =
      shadowRoot.querySelector('[part=systemThreeWayLabel]');
    this._darkThreeWayRadio =
      shadowRoot.querySelector('[part=darkThreeWayRadio]');
    this._darkThreeWayLabel =
      shadowRoot.querySelector('[part=darkThreeWayLabel]');
    this._legendLabel = shadowRoot.querySelector('legend');
    this._permanentAside = shadowRoot.querySelector('aside');
    this._permanentCheckbox =
        shadowRoot.querySelector('[part=permanentCheckbox]');
    this._permanentLabel = shadowRoot.querySelector('[part=permanentLabel]');
  }

  connectedCallback() {
    // Does the browser support native `prefers-color-scheme`?
    const hasNativePrefersColorScheme =
        matchMedia(MQ_DARK).media !== NOT_ALL;
    // Listen to `prefers-color-scheme` changes.
    if (hasNativePrefersColorScheme) {
      matchMedia(MQ_DARK).addListener(({matches}) => {
        if (this.permanent) {
          return;
        }
        this.mode = matches ? DARK : LIGHT;
        this._dispatchEvent(COLOR_SCHEME_CHANGE, {colorScheme: this.mode});
      });
    }
    // Set initial state, giving preference to a remembered value, then the
    // native value (if supported), and eventually defaulting to a light
    // experience.
    let rememberedValue = false;
    try {
      rememberedValue = store.getItem(NAME);
    } catch (err) {
      // Do nothing. The user probably blocks cookies.
    }
    if (rememberedValue && [DARK, LIGHT].includes(rememberedValue)) {
      this.mode = rememberedValue;
      this._permanentCheckbox.checked = true;
      this.permanent = true;
    } else if (hasNativePrefersColorScheme) {
      this.mode = matchMedia(MQ_LIGHT).matches ? LIGHT : DARK;
    }
    if (!this.mode) {
      this.mode = LIGHT;
    }
    if (this.permanent && !rememberedValue) {
      try {
        store.setItem(NAME, this.mode);
      } catch (err) {
        // Do nothing. The user probably blocks cookies.
      }
    }

    // Default to toggle appearance.
    if (!this.appearance) {
      this.appearance = TOGGLE;
    }

    // Update the appearance to toggle, switch or slider.
    this._updateAppearance();

    // Update the radios
    this._updateRadios();

    // Make the checkbox reflect the state of the radios
    this._updateCheckbox();

    // Make the slider reflect the state of the radios
    this._updateSlider();

    // Make the 3 way radio reflect the state of the radios
    this._updateThreeWayRadios();

    // Synchronize the behavior of the radio and the checkbox.
    [this._lightRadio, this._darkRadio].forEach((input) => {
      input.addEventListener('change', () => {
        this.mode = this._lightRadio.checked ? LIGHT : DARK;
        this._updateCheckbox();
        this._updateSlider();
        this._updateThreeWayRadios();
        this._dispatchEvent(COLOR_SCHEME_CHANGE, {colorScheme: this.mode});
      });
    });
    this._darkCheckbox.addEventListener('change', () => {
      this.mode = this._darkCheckbox.checked ? DARK : LIGHT;
      this._updateRadios();
      this._updateSlider();
      this._updateThreeWayRadios();
      this._dispatchEvent(COLOR_SCHEME_CHANGE, {colorScheme: this.mode});
    });
    this._sliderCheckbox.addEventListener('change', () => {
      this.mode = this._sliderCheckbox.checked ? DARK : LIGHT;
      this._updateCheckbox();
      this._updateRadios();
      this._updateThreeWayRadios();
      this._dispatchEvent(COLOR_SCHEME_CHANGE, {colorScheme: this.mode});
    });
    // TODO: call addEventListener for three way radios
    this._lightThreeWayRadio.addEventListener('change', () => {
      this.mode = LIGHT;
      this.permanent = true;
      this._updateCheckbox();
      this._updateRadios();
      this._updateThreeWayRadios();
      this._dispatchEvent(COLOR_SCHEME_CHANGE, {colorScheme: this.mode});
      this._dispatchEvent(PERMANENT_COLOR_SCHEME, {
        permanent: this.permanent,
      });
    });
    this._darkThreeWayRadio.addEventListener('change', () => {
      this.mode = DARK;
      this.permanent = true;
      this._updateCheckbox();
      this._updateRadios();
      this._updateThreeWayRadios();
      this._dispatchEvent(COLOR_SCHEME_CHANGE, {colorScheme: this.mode});
      this._dispatchEvent(PERMANENT_COLOR_SCHEME, {
        permanent: this.permanent,
      });
    });
    this._systemThreeWayRadio.addEventListener('change', () => {
      this.mode = this._getPrefersColorScheme();
      this.permanent = false;
      this._updateCheckbox();
      this._updateRadios();
      this._updateThreeWayRadios();
      this._dispatchEvent(COLOR_SCHEME_CHANGE, {colorScheme: this.mode});
      this._dispatchEvent(PERMANENT_COLOR_SCHEME, {
        permanent: this.permanent,
      });
    });
    // Make remembering the last mode optional
    this._permanentCheckbox.addEventListener('change', () => {
      this.permanent = this._permanentCheckbox.checked;
      this._updateThreeWayRadios();
      this._dispatchEvent(PERMANENT_COLOR_SCHEME, {
        permanent: this.permanent,
      });
    });

    // Finally update the mode and let the world know what's going on
    this._updateMode();
    this._dispatchEvent(COLOR_SCHEME_CHANGE, {colorScheme: this.mode});
    this._dispatchEvent(PERMANENT_COLOR_SCHEME, {
      permanent: this.permanent,
    });
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === MODE) {
      if (![LIGHT, DARK].includes(newValue)) {
        throw new RangeError(`Allowed values: "${LIGHT}" and "${DARK}".`);
      }
      // Only show the dialog programmatically on devices not capable of hover
      // and only if there is a label
      if (matchMedia('(hover:none)').matches && this.remember) {
        this._showPermanentAside();
      }
      if (this.permanent) {
        try {
          store.setItem(NAME, this.mode);
        } catch (err) {
          // Do nothing. The user probably blocks cookies.
        }
      }
      this._updateRadios();
      this._updateCheckbox();
      this._updateSlider();
      this._updateThreeWayRadios();
      this._updateMode();
    } else if (name === APPEARANCE) {
      const allAppearanceOptions = [TOGGLE, SWITCH, SLIDER, THREE_WAY];
      if (!allAppearanceOptions.includes(newValue)) {
        throw new RangeError(`Allowed values are: "${allAppearanceOptions.join(`", "`)}".`);
      }
      this._updateAppearance();
    } else if (name === PERMANENT) {
      if (this.permanent) {
        if (this.mode) {
          try {
            store.setItem(NAME, this.mode);
          } catch (err) {
            // Do nothing. The user probably blocks cookies.
          }
        }
      } else {
        try {
          store.removeItem(NAME);
        } catch (err) {
          // Do nothing. The user probably blocks cookies.
        }
      }
      this._permanentCheckbox.checked = this.permanent;
    } else if (name === LEGEND) {
      this._legendLabel.textContent = newValue;
    } else if (name === REMEMBER) {
      this._permanentLabel.textContent = newValue;
    } else if (name === LIGHT) {
      this._lightLabel.textContent = newValue;
      if (this.mode === LIGHT) {
        this._checkboxLabel.textContent = newValue;
      }
    } else if (name === DARK) {
      this._darkLabel.textContent = newValue;
      if (this.mode === DARK) {
        this._checkboxLabel.textContent = newValue;
      }
    }
  }

  _getPrefersColorScheme() {
    if (window.matchMedia(MQ_DARK).matches) {
      return DARK;
    }
    return LIGHT;
  }

  _dispatchEvent(type, value) {
    this.dispatchEvent(new CustomEvent(type, {
      bubbles: true,
      composed: true,
      detail: value,
    }));
  }

  _updateAppearance() {
    // Hide or show the light-related affordances dependent on the appearance,
    // which can be "switch" , "toggle" , "slider" or "three-way".
    this._lightRadio.hidden = this._lightLabel.hidden =
      this._darkRadio.hidden = this._darkLabel.hidden =
      this._darkCheckbox.hidden = this._checkboxLabel.hidden =
      this._sliderCheckbox.hidden = this._sliderLabel.hidden =
      this._lightThreeWayRadio.hidden = this._lightThreeWayLabel.hidden =
      this._systemThreeWayRadio.hidden = this._systemThreeWayLabel.hidden =
      this._darkThreeWayRadio.hidden = this._darkThreeWayLabel.hidden =
      true;
    switch (this.appearance) {
      case SWITCH:
        this._lightRadio.hidden = this._lightLabel.hidden =
          this._darkRadio.hidden = this._darkLabel.hidden = false;
        break;
      case SLIDER:
        this._sliderCheckbox.hidden = this._sliderLabel.hidden = false;
        break;
      case THREE_WAY:
        this._lightThreeWayRadio.hidden = this._lightThreeWayLabel.hidden =
        this._systemThreeWayRadio.hidden = this._systemThreeWayLabel.hidden =
        this._darkThreeWayRadio.hidden = this._darkThreeWayLabel.hidden =
        false;
        break;
      case TOGGLE:
      default:
        this._darkCheckbox.hidden = this._checkboxLabel.hidden = false;
        break;
    }
  }

  _updateRadios() {
    if (this.mode === LIGHT) {
      this._lightRadio.checked = true;
    } else {
      this._darkRadio.checked = true;
    }
  }

  _updateCheckbox() {
    if (this.mode === LIGHT) {
      this._checkboxLabel.style.setProperty(`--${NAME}-checkbox-icon`,
          `var(--${NAME}-light-icon,url("${DEFAULT_URL}moon.png"))`);
      this._checkboxLabel.textContent = this.light;
      if (!this.light) {
        this._checkboxLabel.ariaLabel = DARK;
      }
      this._darkCheckbox.checked = false;
    } else {
      this._checkboxLabel.style.setProperty(`--${NAME}-checkbox-icon`,
          `var(--${NAME}-dark-icon,url("${DEFAULT_URL}sun.png"))`);
      this._checkboxLabel.textContent = this.dark;
      if (!this.dark) {
        this._checkboxLabel.ariaLabel = LIGHT;
      }
      this._darkCheckbox.checked = true;
    }
  }

  _updateSlider() {
    if (this.mode === LIGHT) {
      this._sliderCheckbox.checked = false;
    } else {
      this._sliderCheckbox.checked = true;
    }
  }

  _updateThreeWayRadios() {
    if (this.permanent) {
      if (this.mode === LIGHT) {
        this._lightThreeWayRadio.checked = true;
      } else {
        this._darkThreeWayRadio.checked = true;
      }
    } else {
      this._systemThreeWayRadio.checked = true;
    }
  }

  _updateMode() {
    if (this.mode === LIGHT) {
      this._lightCSS.forEach((link) => {
        link.media = ALL;
        link.disabled = false;
      });
      this._darkCSS.forEach((link) => {
        link.media = NOT_ALL;
        link.disabled = true;
      });
    } else {
      this._darkCSS.forEach((link) => {
        link.media = ALL;
        link.disabled = false;
      });
      this._lightCSS.forEach((link) => {
        link.media = NOT_ALL;
        link.disabled = true;
      });
    }
  }

  _showPermanentAside() {
    this._permanentAside.style.visibility = 'visible';
    setTimeout(() => {
      this._permanentAside.style.visibility = 'hidden';
    }, 3000);
  }
}

customElements.define(NAME, DarkModeToggle);
