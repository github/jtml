### @GitHub/jtml 

This library is designed as a layer on top of [@github/template-parts](https://github.com/github/template-parts/) to provide declarative, JavaScript based HTML template tags.

This library is heavily inspired by [`lit-html`](https://github.com/Polymer/lit-html), which GitHub has used in production for a while. This was created independently from `lit-html` for the following reasons:

 - To re-use code we're using with [@github/template-parts](https://github.com/github/template-parts/) which is in production at GitHub.
 - To align closer to the `Template Parts` whatwg proposal. By using [@github/template-parts](https://github.com/github/template-parts/) we aim to closely align to the Template Parts proposal, hopefully one day dropping the dependency on [@github/template-parts](https://github.com/github/template-parts/).


