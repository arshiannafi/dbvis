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

            if (v.parentId !== undefined) {
                //recursively show parent elements
                this.show(v.parentId);
            }

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

Groups:
0 - Home (group 1 collectively), DB Schema visualization
1 - Existing Projects, New Project, Edit Project

*/
class View {

    constructor(id, group, parentId) {
        this.id         = id;
        this.parentId   = parentId
        this.group      = group;
        this.jqref      = $("#" + id);
    }

}

//TESTING
vc = new ViewController();

view = new View("view-home", 0);
vc.add(view);
view = new View("view-db-vis", 0);
vc.add(view);

view = new View("view-select-proj", 1, "view-home");
vc.add(view);
view = new View("view-create-proj", 1, "view-home");
vc.add(view);
view = new View("view-edit-proj", 1, "view-home");
vc.add(view);

vc.show("view-db-vis");
