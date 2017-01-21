class ViewController {

    constructor() {
        this.views = [];
    }

    add(v) {

        if (this.__getView(v.id) === undefined) {
            this.views.push(v);
        } else {
            console.log("[ERROR] " + v + "is already present in ViewController.views");
        }

    }

    show(id) {
        var v = this.__getView(id);

        if (v !== undefined) {
            this.__getGroup(v.group).map(function (view) {
                if(view.id === id) {
                    view.jqref.show();
                } else {
                    view.jqref.hide();
                }
            });
        } else {
            console.log("[ERROR] view " + id + " not found");
        }

    }

    __getView(id) {
        return this.views.find(function (view) {
            return view.id === id;
        });
    }

    __getGroup(group) {
        return this.views.filter(function (view) {
            return view.group === group;
        });
    }
}


/*
Consider adding attributes:
    hideAnimation
    showAnimation
which store callback functions that can be called from the show/hide functions
of ViewController
*/
class View {

    constructor(id, group) {
        this.id     = id;
        this.group  = group;
        this.jqref  = $("#" + id);
    }

}

//TESTING SCRIPTS
var vc = new ViewController();
