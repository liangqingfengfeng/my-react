import React from "react";

function createElement(type, props, ...children) {
    return {
        type,
        props: {
            ...props,
            children: children.map(child => 
                typeof child === 'object'
                ? child
                : createTextElement(child)
            ),
        }
    }
}

function createTextElement(text) {
    return {
        type: 'TEXT_ELEMENT',
        props: {
            nodeValue: text,
            children: [],
        },
    }
}

function myTypeof(obj) {
    return Object.prototype.toString.call(obj).slice(8, -1);
}

function render(element, continer) {
    console.log(element)
    const dom =
        element.type === 'TEXT_ELEMENT'
            ? document.createTextNode('')
            : document.createElement(element.type);
    
    const isProperty = key => key !== 'children';
    Object.keys(element.props)
        .filter(isProperty)
        .forEach(name => {
            dom[name] = element.props[name]
        })
    
    if (myTypeof(element.props.children) === 'Array') {
        element.props.children.forEach(child => render(child, dom))
    } else {
        const element = document.createTextNode(element.props.children);
        dom.appendChild(element);
    }
    

    continer.appendChild(dom);
}

const Didact = {
    createElement,
    render,
}

const element = (
    <div style="background: salmon">
      <h1>Hello World</h1>
      <h2 style="text-align:right">from Didact</h2>
    </div>
);

const root = document.getElementById('root');
Didact.render(element, root)