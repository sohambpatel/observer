var inputTypes = ["dialog", "submit", "text", "password", "file", "datetime", "datetime-local", "date", "month", "time", "week", "number", "range", "email", "url", "search", "tel", "color"];

function clickAction(e) {

    var evt = e || document.event;
    var elem = evt.target ? evt.target : window;
    var tag, nodetype;
    tag = elem.tagName.toLocaleLowerCase();

    if (tag == 'ul') {
        return true;
    }
    if (tag == 'li') {
        return true;
    }
    if (tag == 'iframe') {
        return true;
    }
    if (tag == 'button') {
        return true;
    }
    if (nodetype == 'checkbox') {
        return true;
    }
    if (elem.type && 0 == e.button && e.isTrusted) {
        nodetype = elem.type.toLocaleLowerCase();
        if (inputTypes.indexOf(nodetype) >= 0) {
            return true;
        }
    }
    return false;
}

function changeAction(e) {

    var evt = e || document.event;
    var elem = evt.target ? evt.target : window;

    var tag, nodetype;
    tag = elem.tagName.toLocaleLowerCase();

    if (elem.type) {
        nodetype = elem.type.toLocaleLowerCase();

        if (tag == 'iframe') {
            return true;
        }
        if (tag == 'select') {
            return true;
        }

        if (nodetype == 'checkbox') {
            return false;
        }

        if (nodetype == 'radio') {
            return false;
        }

        if (nodetype == 'file') {
            return true;
        }

        if ("input" == tag && inputTypes.indexOf(nodetype) >= 0) {
            return true;
        }

    }

    if (tag == "textarea") {
        return true;
    }
    return false;

}
function mouseDownAction(e) {

    var evt = e || document.event;
    var elem = evt.target ? evt.target : window;
    var tag, nodetype;
    tag = elem.tagName.toLocaleLowerCase();

    if (elem.type && 0 == e.button && e.isTrusted) {
        nodetype = elem.type.toLocaleLowerCase();

        if (nodetype == 'checkbox') {
            return true;
        }

        if (nodetype == 'radio') {
            return true;
        }

        if (inputTypes.includes(nodetype)) {
            return false;
        }
    }

    if (tag == 'select') {
        return false;
    }

    if (tag == 'ul') {
        return false;
    }
    if (tag == 'li') {
        return false;
    }
    if (tag == 'a') {
        return true;
    }
    if (elem.type == 'button') {
        return false;
    }
    if (tag == 'input') {
        return false;
    }
    if (tag == 'textarea') {
        return false;
    }
    if (elem.nodeName) {
        if (elem.nodeName.toLowerCase())
            if ("option" == elem.nodeName.toLowerCase()) {
                let t = elem.parentNode;
                if (t.multiple) {
                    let e = t.options;
                    for (let t = 0; t < e.length; t++) e[t]._wasSelected = e[t].selected
                }
                return true;
            }
    }



    return true;
}

function keyUpAndDownAction(e) {

    var evt = e || document.event;
    var elem = evt.target ? evt.target : window;
    var tag, nodetype;
    tag = elem.tagName.toLocaleLowerCase();
    if (elem.type) {
        nodetype = elem.type.toLocaleLowerCase();

        if ("input" == tag && inputTypes.indexOf(nodetype) >= 0) {
            return true;
        }

    }

    if ("textarea" == tag) {
        return true;
    }

    return false;
}

function mouseOverAtion(e) {

    var evt = e || document.event;
    var elem = evt.target ? evt.target : window;
    var tag, nodetype;
    tag = elem.tagName.toLocaleLowerCase();
    if (tag) {
        try {
            nodetype = elem.type.toLocaleLowerCase();
            console.log(elem.hasAttribute("onclick"));
            console.log(elem.hasAttribute("href"));
            console.log("button" == tag);
            console.log("input" == tag);

            return elem.hasAttribute("onclick") ||
                elem.hasAttribute("href") ||
                "button" == tag ||
                "input" == tag &&
                ("submit" == nodetype || "button" == nodetype || "image" == nodetype || "radio" == nodetype || "checkbox" == nodetype
                    || "reset" == nodetype) ? elem : null != elem.parentNode ? e(elem.parentNode) : null;
        } catch (error) {

        }
    }

    return false;
}

function dragAndDrop(e) {
    var evt = e || document.event;
    var elem = evt.target ? evt.target : window;
    var tag = elem.tagName.toLocaleLowerCase();
    if (tag !== undefined) {
        return true
    }
    return false;
}

