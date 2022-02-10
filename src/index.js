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

function createDom(fiber) {
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

    return dom;
}

function render(element, continer) {
    wipRoot = {
        dom: continer,
        props: {
            children: [element]
        }
    }
    nextUnitOfWork = wipRoot
}

function commitRoot() {
    
}

let nextUnitOfWork = null;
let wipRoot = null

function wookLoop(deadLine) {
    let shouldYield = false;

    while (nextUnitOfWork && !shouldYield) {
        nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    }
    shouldYield = deadLine.timeRemaining() < 1;

    if (!nextUnitOfWork && wipRoot) {
        commitRoot()
    }
    requestIdleCallback(wookLoop);
}

requestIdleCallback(wookLoop)

function performUnitOfWork(fiber) {
    // add dom node
    // 创建dom
    if (!fiber.dom) {
        fiber.dom = createDom(fiber);
    }

    // create new fibers
    // 遍历创建child fiber
    const elements = fiber.props.children;
    let index = 0;
    let prevSibling = null;

    while (index < elements.length) {
        const element = elements[index];
        const newFiber = {
            type: element.type,
            props: element.props,
            parent: fiber,
            dom: null,
        }
        if (index === 0) {
            fiber.child = newFiber;
        } else {
            prevSibling.sibling = newFiber
        }
        prevSibling = newFiber;
        index++
    }
    
    // return next unit of work
    if (fiber.child) {
        return fiber.child;
    }
    let nextFiber = fiber;
    while (nextFiber) {
        if (nextFiber.sibling) {
            return nextFiber.sibling;
        }
        nextFiber = nextFiber.parent
    }
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