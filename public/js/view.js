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
        this.add(new View("visualization", 2, "view-db-vis"));
        this.add(new View("drilldown-vis", 2, "view-db-vis"));
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

    clearFormInput(id) {
        $("#" + id + " input").val('');
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
        $("#exportImage-btn").click(this.exportImage);
        $("#grid-btn").click(this.grid);
        $("#force-dir-btn").click(this.forceDir);
        $("#circ-btn").click(this.circular);
        $("#layered-btn").click(this.layered);
        $("#save-layout-btn").click(this.saveLayout);
        $("#drill-up-btn").click(this.drillUp);

    }

    static attach(id, handler) {
        $("#" + id).click(handler);
    }

/* View switching handlers */
    static showHome(e) {
        VC.show("view-home");
    }

    static showSelect(e) {
        VC.show("view-select-proj");
    }

    static showCreate(e) {

        VC.show("view-create-proj");
    }

    static showEdit(e) {

        if(PM.activeProj) {
            PM.loadEditForm()
            VC.show("view-edit-proj");
        } else {
            console.log("[ERROR] No project selected");
            //TODO: Display Error message to screen explaining that no project
            // was selected
        }
    }

    static back() {
        VC.show("view-select-proj");
    }

    static saveLayout(e) {
        e.preventDefault();
        saveLayoutInformation();
    }

    static drillUp() {
        VC.show("visualization");
    }

    static drillDown() {
        VC.show("drilldown-vis");
    }

    static exportImage() {
        // downloadImage function exist in visualizer.js
        // visualizer.js must be loaded before this
        downloadImage();
    }

/* Project manipulation handlers */
    static open(e) {

        e.preventDefault();
        if(PM.activeProj) {
            PM.open();
            VC.show("visualization");
        } else {
            console.log("[ERROR] No project selected");
            //TODO: Display Error message to screen explaining that no project
            // was selected
        }

    }

    static create(e) {
        e.preventDefault();
        PM.create()
    }

    static save(e) {
        e.preventDefault();
        PM.edit();
        //TODO: INCLUDE INPUT VALIDATION

        VC.show("view-select-proj");
    }

    static delete(e) {
        PM.delete();
    }

    static cancelEdit(e) {
        e.preventDefault();
        VC.show("view-select-proj");
    }

    static cancelCreate(e) {
        e.preventDefault();
        VC.show("view-select-proj");
    }

/* Database Visualization button handlers */
    static grid(e) {
        e.preventDefault();
        if(nodes && links) {
            initDiagramCanvas(1);
            render(nodes, links, false);
        }
        else {
            console.log("[ERROR] schema data not present");
        }
    }

    static forceDir(e) {
        e.preventDefault();
        if(nodes && links) {
            initDiagramCanvas(2);
            render(nodes, links, false);
        }
        else {
            console.log("[ERROR] schema data not present");
        }
    }

    static circular(e) {
        e.preventDefault();
        if(nodes && links) {
            initDiagramCanvas(3);
            render(nodes, links, false);
        }
        else {
            console.log("[ERROR] schema data not present");
        }
    }

    static layered(e) {
        e.preventDefault();
        if(nodes && links) {
            initDiagramCanvas(4);
            render(nodes, links, false);
        }
        else {
            console.log("[ERROR] schema data not present");
        }
    }

}
