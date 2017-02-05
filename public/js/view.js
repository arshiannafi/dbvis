class ViewController {

    constructor() {
        this.views = [];
    }

    init() {
        this.add(new View("view-home", 0));
        this.add(new View("view-db-vis", 0));
        this.add(new View("view-select-proj", 1, "view-home"));
        this.add(new View("view-create-proj", 1, "view-home"));
        this.add(new View("view-edit-proj", 1, "view-home"));
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

Views off the same group are mutually exclusive, only one appears at a time

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

class ClickHandler {

    //Attaches handlers to objects that are never created/destroyed
    static initStaticHandlers() {

        //Select Project View
        $("#new-proj-btn").click(this.showCreate);
        $("#edit-proj-btn").click(this.showEdit);
        $("#delete-proj-btn").click(this.delete);
        $("#open-proj-btn").click(this.open);

        //Create Project View
        $("#cancel-create-btn").click(this.cancelCreate);
        $("#create-proj-btn").click(this.create);

        //Edit Project View
        $("#cancel-edit-btn").click(this.cancelEdit);
        $("#save-proj-btn").click(this.save);

        //DBVis View
        $("#back-btn").click(this.back);
        $("#grid-btn").click(this.grid);
        $("#force-dir-btn").click(this.forceDir);
        $("#circ-btn").click(this.circular);
        $("#layered-btn").click(this.layered);

    }

    static attach(id, handler) {
        $("#" + id).click(handler);
    }

/* View switching handlers */
    static showHome(e) {

        VC.show("view-home");
    }

    static showSelect(e) {

        //TODO: Render list of available projects

        VC.show("view-select-proj");
    }

    static showCreate(e) {

        VC.show("view-create-proj");
    }

    static showEdit(e) {

        //TODO: Render existing project details to input fields

        VC.show("view-edit-proj");
    }

    static back() {
        VC.show("view-select-proj");
    }

/* Project manipulation handlers */
    static open(e) {

        //TODO: grab project id, begin rendering

        VC.show("view-db-vis");
    }

    static create(e) {
        e.preventDefault();
        PM.create()
    }

    static save(e) {

        //TODO: create project from input fields
        // INCLUDE INPUT VALIDATION

        VC.show("view-select-proj");
    }

    static delete(e) {

        //TODO: Delete currently selected project

    }

    static cancelEdit(e) {

        //TODO: whipe input fields

        VC.show("view-select-proj");
    }

    static cancelCreate(e) {

        //TODO: whipe input fields

        VC.show("view-select-proj");
    }

/* Database Visualization button handlers */
    static grid(e) {
        //TODO: rerender DBVis with this layout
        console.log("[WARN] Not yet implemented")
    }

    static forceDir(e) {
        //TODO: rerender DBVis with this layout
        console.log("[WARN] Not yet implemented")
    }

    static circular(e) {
        //TODO: rerender DBVis with this layout
        console.log("[WARN] Not yet implemented")
    }

    static layered(e) {
        //TODO: rerender DBVis with this layout
        console.log("[WARN] Not yet implemented")
    }

}
