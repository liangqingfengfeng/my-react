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
        },
        alternate: currentRoot,
    }
    deletions = []
    nextUnitOfWork = wipRoot
}
const isEvent = key => key.startsWith('on');
const isProperty = key => key !== 'children' && !isEvent(key);
const isNew = (prev, next) => key => prev[key] !== next[key];
const isGone = (prev, next) => key => !(key in next);
function updateDom(dom, prevProps, nextProps) {
    // 删除旧事件监听
    Object.keys(prevProps)
        .filter(isEvent)
        .filter(
            key =>
                !(key in nextProps) ||
                isNew(prevProps, nextProps)(key)
        )
        .forEach(name => {
            const eventType = name.toLocaleLowerCase().substring(2);
            dom.removeEventListener(eventType, prevProps[name])
        })
    // 删除旧props
    Object.keys(prevProps)
        .filter(isProperty)
        .filter(isGone(prevProps. nextProps))
        .forEach(name => {
            dom[name] = ''
        })
    // 新增或修改props
    Object.keys(nextProps)
        .filter(isProperty)
        .filter(isNew(prevProps. nextProps))
        .forEach(name => {
            dom[name] = nextProps[name]
        });
    // 新增事件监听
    Object.keys(nextProps)
        .filter(isEvent)
        .filter(isNew(prevProps, nextProps))
        .forEach(name => {
            const eventType = name.toLowerCase().substring(2);
            dom.addEventListener(eventType, nextProps[name]);
        })
}

function commitRoot() {
    // 遍历需要删除的fiber
    deletions.forEach(commitWork);
    // 递归地将child dom加到parent dom
    commitWork(wipRoot.child);
    // 保存最后一次提交的fiber tree
    currentRoot  = wipRoot;
    wipRoot = null
}

function commitDeletion(fiber, domParent) {
    if (fiber.dom) {
        domParent.removeChild(fiber.dom)
    } else {
        commitDeletion(fiber.child, domParent);
    }
}

function commitWork(fiber) {
    if (!fiber) {
        return
    }
    // 向上找到有dom节点的fiber
    let domParentFiber = fiber.parent;
    while (!domParentFiber.dom) {
        domParentFiber = domParentFiber.parent
    }
    const domParent = domParentFiber.dom;
    if (fiber.effectTag === 'PALCEMENT' &&
        fiber.dom != null
    ) {
        domParent.appendChild(fiber.dom);
    } else if (fiber.effectTag === 'UPDATE' &&
        fiber.dom != null
    ) {
        updateDom(fiber.dom, fiber.alternate.props, fiber.props);
    } else if (fiber.effectTag === 'DELETION') {
        commitDeletion(fiber, domParent);
    }
    
    commitWork(fiber.child);
    commitWork(fiber.sibling);
}

let nextUnitOfWork = null;
let currentRoot = null; // 当前fiber tree，即最后一次提交的fiber tree
let wipRoot = null; // 正在内存构建的fiber tree， wipRoot.alternate连接currentRoot
let deletions = null; // 保存需要删除的fiber

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
    // 先判断是否是函数组件
    const isFuncitionComponent = fiber.type instanceof Function;
    if (isFuncitionComponent) {
        updateFunctionComponent(fiber);
    } else {
        updateHostComponent(fiber);
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

let wipFiber = null;
let hookIndex = null;

function updateFunctionComponent(fiber) {
    wipFiber = fiber;
    hookIndex = 0;
    wipFiber.hooks = [];
    const children = [fiber.type(fiber.props)];
    reconcileChildren(fiber, children);
}

function useState(initial) {
    // 如果存在旧hook就是用旧hook的state
    const oldHook = 
        wipFiber.alternate &&
        wipFiber.alternate.hooks &&
        wipFiber.alternate.hooks[hookIndex]
    // 新建hook
    const hook = {
        state: oldHook ? oldHook.state : initial,
        queue: [], // 更新列表
    }
    // 遍历更新列表，执行更新操作
    const actions = oldHook ? oldHook.queue : [];
    actions.forEach(action => {
        hook.state = action(hook.state);
    })
    const setState = action => { 
        // 将更新操作加入到更新数组，然后执行类似render函数的操作
        hook.queue.push(action);
        wipRoot = {
            dom: currentRoot.dom,
            props: currentRoot.props,
            alternate: currentRoot,
        }
        nextUnitOfWork = wipRoot
        deletions = []
    }
    // 将新hook加入到fiber
    wipFiber.hooks.push(hook);
    hookIndex++
    return [hook.state, setState]
}

function updateHostComponent(fiber) {
    // add dom node
    // 创建dom
    if (!fiber.dom) {
        fiber.dom = createDom(fiber);
    }

    // create new fibers
    // 遍历创建child fiber
    const elements = fiber.props.children;
    reconcileChildren(fiber, elements);
}

function reconcileChildren(wipFiber, elements) {
    let index = 0;
    let oldFiber =
        wipFIber.alternate &&
        wipFiber.alternate.child;
    let prevSibling = null;

    while (index < elements.length || oldFiber != null) {
        const element = elements[index];
        let newFiber = null;

        const sameType =
            oldFiber &&
            element &&
            element.type === oldFiber.type;

        if (sameType) { // 如果类型相同，可以复用旧dom节点，标记为更新
            newFiber = {
                type: oldFiber.type,
                props: element.props,
                dom: oldFiber.dom,
                parent: wipFiber,
                alternate: oldFiber,
                effectTag: "UPDATE",
            }
        }

        if (element && !sameType) { // 如果类型不同且有新节点，标记为替换
            newFiber = {
                type: element.type,
                props: element.props,
                dom: null,
                parent: wipFiber,
                alternate: null,
                effectTag: "PLACEMENT",
            }
        }

        if (oldFiber && !sameType) { // 如果类型不同且存在旧节点，标记删除
            oldFiber.effectTag = "DELETION";
            deletions.push(oldFiber);
        }

        if (index === 0) {
            wipFiber.child = newFiber;
        } else {
            prevSibling.sibling = newFiber
        }
        prevSibling = newFiber;
        index++
    }
}

const Didact = {
    createElement,
    render,
    useState,
}

const element = (
    <div style="background: salmon">
      <h1>Hello World</h1>
      <h2 style="text-align:right">from Didact</h2>
    </div>
);

const root = document.getElementById('root');
Didact.render(element, root)