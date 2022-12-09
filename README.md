### @github/jtml 

This library is designed as a layer on top of [@github/template-parts](https://github.com/github/template-parts/) to provide declarative, JavaScript based HTML template tags.

This library is heavily inspired by [`lit-html`](https://github.com/Polymer/lit-html), which GitHub has used in production for a while. This was created independently from `lit-html` for the following reasons:

 - To re-use code we're using with [@github/template-parts](https://github.com/github/template-parts/) which is in production at GitHub.
 - To align closer to the `Template Parts` whatwg proposal. By using [@github/template-parts](https://github.com/github/template-parts/) we aim to closely align to the Template Parts proposal, hopefully one day dropping the dependency on [@github/template-parts](https://github.com/github/template-parts/).

### Basic Usage

This library comes with a set of exports, the main two being `html` and `render`.

`html` is a ["tagged template" function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals#tagged_templates). Rather than calling it, you "tag" a template string with `html` and it will return a `TemplateResult` which can be used to render HTML safely, on the client side.

```js
import {html, render} from '@github/jtml'

const greeting = 'Hello'
render(html`<h1>${greeting} World</h1>`, document.body)
```

The benefit of this over, say, setting `innerHTML` is that the tagged template can be re-used efficiently, causing less mutations in the DOM:

```js
import {html, render} from '@github/jtml'

const theTime = date => html`<p>The time is ${date.toString()}</p>`
setInterval(() => render(theTime(new Date()), document.body), 1000)
```

### Expressions

jtml interpolates placeholder expressions in special ways across the template. Depending on where you put a placeholder expression (the `${}` syntax is a placeholder expression) depends on what it does. _Importantly_ "Attributes" behave differently to "Nodes". Here is a comprehensive list:

#### Attributes

HTML Attributes can contain placeholder expressions, but these _must_ be inside the quoted part of the attribute. The name of an Attribute cannot use placeholder expressions, only the value.

```js
import {html, render} from '@github/jtml'

const className = `red-box`

html`<p class="${className}"></p>` // This is valid

html`<p class=${className}></p>` // !! This is INVALID!
html`<p ${attr}="test"></p>` // !! This is INVALID!
```

##### Boolean Values

If an attribute maps to a ["boolean attribute"](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes#boolean_attributes), and the attribute value consists _solely_ of a placeholder expression which evaluates to a boolean, then this can be used to toggle the attribute on or off. For example:

```js
import {html, render} from '@github/jtml'

const input = (required = false) => html`<input required="${required}" />`
const div = (hidden = false) => html`<div hidden="${hidden}"></div>`

render(input(false), document.body) // Will render `<input />`
render(input(true), document.body) // Will render `<input required />`

render(div(true), document.body) // Will render `<div></div>`
render(div(false), document.body) // Will render `<div></div>`
```

##### Multiple values, whitespace

If an attribute consists of multiple placeholder expressions, these will all be mapped to strings. Any included whitespace is also rendered as you might expect. Here's an example:

```js
import {html, render} from '@github/jtml'

const p = ({classOne, classTwo, classThree}) => html`<p class="${classOne} ${classTwo} ${classThree}"></p>`

render(p({classOne: 'red', classTwo: 'box', classThree: ''}), document.body)
// ^ Renders `<p class="red box  "></p>`

const i = ({classOne, classTwo}) => html`<i class="${classOne}-${classTwo}"></i>`

render(i({classOne: 'red', classTwo: 'box'}), document.body)
// ^ Renders `<i class="red-box"></i>`
```

##### Iterables (like Arrays)

Any placeholder expression which evaluates to an Array/Iterable is joined with spaces (`Array.from(value).join(' ')`). This means you can pass in an Array of strings and it'll be rendered as a space separated list. These can still be mixed with other placeholder expressions or static values. An example:

```js
import {html, render} from '@github/jtml'

const p = ({classes, hidden = false}) => html`<p class="bold ${classes} ${hidden ? 'd-none' : ''}"></p>

render(p({classes: ['red', 'box'], hidden: true}), document.body)
// ^ Renders `<p class="bold red box d-none"></p>`

render(p({classes: ['red', 'box'], hidden: false}), document.body)
// ^ Renders `<p class="bold red box "></p>`
```

##### Events

If an attributes name begins with `on`, and the value consists of a single placeholder expression that evaluates to a function, then this will become an Event Listener, where the event name is the attribute name without the `on`, so for example:

```js
import {html, render} from '@github/jtml'

const handleClick = e => console.log('User clicked!')

render(html`<button onclick="${handleClick}"></button>`, document.body)
// ^ Renders `<button></button>`
// Effectively calls `button.addEventListener('click', handleClick)`
```

The event name can be any event name that is also possible as an attribute, for example `onloaded` will listen for the `loaded` event, `onwill-load` will bind to the `will-load` event. Special characters such as `:`s are not allowed as attribute names, and as such you cannot bind to an event name with these special characters using this pattern.

#### Nodes

Placeholder expressions can also be put where an HTML node might be - in other words inside a tag, rather than inside an attribute. These behave differently to placeholder expressions inside attribute values:

##### HTML Escaping

Any HTML inside a string is automatically escaped. Values get added as `Text` nodes, meaning it is impossible to inject HTML unless you explicitly want to, making them safe for XSS. This is not manually handled by the library, but is core to the design - meaning the browser handles this escaping! An example:

```js
import {html, render} from '@github/jtml'

const unsafe = '<script>alert(1)</script>'

render(html`<div>${unsafe}</div>`, document.body)
// ^ Renders `<div>&lt;script&gt;alert(1)&lt;/script&gt;</div>`
```

##### Sub Templates

If a placeholder expression evaluates to a sub template, then that sub template will be rendered and added to as a child to the node, in the position you'd expect:

```js
import {html, render} from '@github/jtml'

const embolden = word => html`<strong>${word}</strong>`

render(html`<div>Hello ${embolden('world')}!</div>`, document.body)
// ^ Renders `<div>Hello <strong>world</strong>!</div>`
```

#### Document Fragments

You can also pass document fragments in, and they will be rendered as you might expect. This is useful for mixing-and-matching template libraries:

```js
import {html, render} from '@github/jtml'

const vanillaEmbolden = word => {
  const frag = document.createDocumentFragment()
  const strong = document.createElement('strong')
  strong.append(String(word))
  frag.append(strong)
  return frag
}

render(html`<div>Hello ${vanillaEmbolden('world')}!</div>`, document.body)
// ^ Renders `<div>Hello <strong>world</strong>!</div>`
```

##### Iterables (like Arrays)

Any placeholder expression which evaluates to an Array/Iterable is evaluated per-item. If a single item is a Document Fragment or Sub Template then it will be rendered as you might expect, otherwise it is treated as a String and gets added as a `Text` node. All of the contents of the Array will be rendered as one. Some examples:

```js
import {html, render} from '@github/jtml'

const data = [ { name: 'Spanner', value: 5 }, { name: 'Wrench', value: 5 } ]

const row = ({name, value}) => html`<tr><td>${name}</td><td>${value}</td></td>`
const table = rows => html`<table>${rows.map(row)}</table>`

render(table(data), document.body)
// ^ Renders 
// <table>
//   <tr><td>Spanner</td><td>5</td></tr>
//   <tr><td>Wrench</td><td>5</td></tr>
// </table>
```

### Directives

For more advanced behaviours, a function can be wrapped with the `directive` function to create a `Directive` which gets to customize the rendering flow. jtml also includes some built in directives (see below). 

A directive must follow the following signature. It can take any number of arguments (which are ignored) and must return a function which receives the TemplatePart:

```typescript
type Directive = (...values: unknown[]) => (part: TemplatePart) => void
```

Here's an example of how a directive might work:

```js
import {html, render, directive} from '@github/jtml'

// A directive can take any number of arguments, and must return a function that takes a `TemplatePart`.
const renderLater = directive((text, ms) => part => {
  // A parts value can be set using `.value`
  part.value = 'Loading...'
  setTimeout(() => part.value = text, ms)
})

render(html`<div>${renderLater('Hello world', 1000)}`, document.body)
// ^ Renders <div>Loading...</div>
// After 1000ms, changes to `<div>Hello world</div>`
```

### Built in Directives

### until

jtml ships with a built-in directive for handling Promise values, called `until`. `until` takes any number of Promises, and will render them, right to left, as they resolve. This is useful for passing in asynchronous values as the first arguments, timeout messages as the middle value, and synchronous values for the placeholder values, like so:


```js
import {html, render, until} from '@github/jtml'

const delay = (ms, value) => new Promise(resolve => setTimeout(resolve, ms, value))

const request = delay(1000, 'Hello World')
const loading = 'Loading...'
const timeout = delay(2000, 'Failed to load')

render(html`<div>${until(request, timeout, loading)}</div>`)
// ^ renders <div>Loading...</div>
// After 1000ms will render <div>Hello World</div>
```

```js
import {html, render, until} from '@github/jtml'

const delay = (ms, value) => new Promise(resolve => setTimeout(resolve, ms, value))

const request = delay(3000, 'Hello World') // Request takes longer than the timeout
const loading = 'Loading...'
const timeout = delay(2000, 'Failed to load')

render(html`<div>${until(request, timeout, loading)}</div>`)
// ^ renders <div>Loading...</div>
// After 2000ms will render <div>Failed to load</div>
```

### CSP Trusted Types

You can call `TemplateResult.setCSPTrustedTypesPolicy(policy: TrustedTypePolicy | Promise<TrustedTypePolicy> | null)` from JavaScript to set a [CSP trusted types policy](https://web.dev/trusted-types/), which can perform (synchronous) filtering or rejection of the rendered template:

```ts
import {TemplateResult} from "@github/jtml";
import DOMPurify from "dompurify"; // Using https://github.com/cure53/DOMPurify

// This policy removes all HTML markup except links.
const policy = trustedTypes.createPolicy("links-only", {
  createHTML: (htmlText: string) => {
    return DOMPurify.sanitize(htmlText, {
      ALLOWED_TAGS: ["a"],
      ALLOWED_ATTR: ["href"],
      RETURN_TRUSTED_TYPE: true,
    });
  },
});
TemplateResult.setCSPTrustedTypesPolicy(policy);
```

Note that:

- Only a single policy can be set, shared by all `render` and `unsafeHTML` calls.
- You should call `TemplateResult.setCSPTrustedTypesPolicy()` ahead of any other call of `@github/jtml` in your code.
- Not all browsers [support the trusted types API in JavaScript](https://caniuse.com/mdn-api_trustedtypes). You may want to use the [recommended tinyfill](https://github.com/w3c/trusted-types#tinyfill) to construct a policy without causing issues in other browsers.
