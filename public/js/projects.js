
/**********************************************************
* function saveProject
*   Saves projectData to the server in a name specified by
*   projectData.name. projectData should be a JSON object
*   calls callback_success() on success, and
*   callback_failure() on failure.
*
*
*
**********************************************************/
function saveProject(projectData, host, callback_success,
                      callback_failure) {

    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() {
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
            callback_success();
        } else if (xmlHttp.readyState == 4) {
            callback_failure();
        }
    }
    xmlHttp.open("POST", host.concat('/projects/saveProject'), true); // true for asynchronous
    console.log("Saving: " + JSON.stringify(projectData));
    xmlHttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xmlHttp.send(JSON.stringify(projectData));


}

/**********************************************************
* function getAllProjects
*   Gets all of the projects saved in the server
*   calls callback_success(projects) on success, where
*   projects is an array full of JSON objects representing
*   projects. callback_failure() is called on failure.
*
*
**********************************************************/
function getAllProjects(host, callback_success, callback_failure) {

    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() {
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            callback_success(JSON.parse(xmlHttp.responseText));
        else if (xmlHttp.readyState == 4)
            callback_failure();
    }
    xmlHttp.open("GET", host.concat('/projects/getAllProjects'), true); // true for asynchronous
    xmlHttp.send();
}

/**********************************************************
* function getProject
*   Gets the project specified by the projectName
*   calls callback_success(project) on success, where
*   project is a JSON object represnting a project.
*   callback_failure() is called on failure.
*
*
*
**********************************************************/
function getProject(projectName, host, callback_success, callback_failure) {

    var projectData = {};
    projectData.name = projectName;

    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() {
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            callback_success(JSON.parse(xmlHttp.responseText));
        else if (xmlHttp.readyState == 4) {
            callback_failure();
        }

    }

    xmlHttp.open("POST", host.concat('/projects/getProject'), true); // true for asynchronous
    xmlHttp.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
    xmlHttp.send(JSON.stringify(projectData));
}

/**********************************************************
* function deleteProject
*   Deletes the project specified by the projectName
*   calls callback_success() on success.
*   callback_failure(err) is called on failure.
*
*
*
**********************************************************/
function deleteProject(projectName, host, callback_success, callback_failure) {

    var projectData = {};
    projectData.name = projectName;

    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() {
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            callback_success();
        else if (xmlHttp.readyState == 4)
            callback_failure();
    }

    xmlHttp.open("POST", host.concat('/projects/deleteProject'), true); // true for asynchronous
    xmlHttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xmlHttp.send(JSON.stringify(projectData));
}

class ProjectManager {

    constructor() {
        this.projects = [];
        this.activeProj = null;
        this.host = "//localhost:3000";
    }

    __getProjIndex(name) {
        return this.projects.find(
            function(proj){
                proj.name === name;
            });
    }

    __populateList() {

        var that = this;

        $("#project-list").empty();

        this.projects.forEach(
            function(project){
                var elementProj = $(document.createElement("div")).addClass("project");
                var elementName = $(document.createElement("div")).addClass("project-name").text(project.name);
                var elementIP   = $(document.createElement("div")).addClass("project-address").text(project.IPaddress + ":" + project.port);
                elementProj.append(elementName, elementIP);
                $("#project-list").append(elementProj);

                elementProj.click(
                    function(e){

                        /* This anonuymous function triggers when a project in the
                         * project list is clicked, making it both visually, and
                         * functionally, the active project.
                         */

                        that.activeProj = project;
                        $(".project").removeClass("project-active");
                        $(e.currentTarget).addClass("project-active");

                    });
            });

    }

    load() {
        console.log('[INFO] PM.load called');
        var that = this;

        getAllProjects(this.host,
            function(json){
                that.projects = json;
                console.log("[INFO] Projects loaded successfully");
                that.__populateList();
                that.activeProj = null;
                VC.show("view-select-proj");
            },
            function(){
                console.log("[ERROR] Failed to load projects");
            });
    }

    create() {

        var that = this;

        //TODO: add input validation here

        var json = {
            name:       $("#create-form input[name^='projectName']").val(),
            IPaddress:  $("#create-form input[name^='address']").val(),
            port:       $("#create-form input[name^='port']").val(),
            db:         $("#create-form input[name^='database']").val(),
            username:   $("#create-form input[name^='username']").val(),
            password:   $("#create-form input[name^='password']").val()
        }

        saveProject(json, this.host,
            function() {
                console.log("[INFO] Project saved");
                VC.clearFormInput("create-form");
                that.load();
            },
            function() {
                console.log("[ERROR] Failed to save project");
            });
    }

    edit() {

        var that = this;

        var json = {
            name:       $("#edit-form input[name^='projectName']").val(),
            IPaddress:  $("#edit-form input[name^='address']").val(),
            port:       $("#edit-form input[name^='port']").val(),
            db:         $("#edit-form input[name^='database']").val(),
            username:   $("#edit-form input[name^='username']").val(),
            password:   $("#edit-form input[name^='password']").val()
        }

        //Save project to server
        saveProject(json, this.host,
            function(){

                console.log("[INFO] Project saved");

                // If the names has been changed, the project by the old name
                // needs to be deleted.
                if (that.activeProj.name !== json.name) {

                    console.log("[INFO] Deleting old project: " + that.activeProj.name);

                    deleteProject(that.activeProj.name, that.host,
                        function(){
                            console.log("[INFO] Successfully delete: " + that.activeProj.name);
                            that.load();
                        },
                        function(){
                            console.log("[ERROR] Failed to delete project: " + that.activeProj.name);
                        });
                } else {
                    that.load();
                }


            },
            function() {
                console.log("[ERROR] Failed to save project");
            });

    }

    delete() {

        var that = this;

        deleteProject(that.activeProj.name, that.host,
            function(){
                console.log("[INFO] Successfully delete: " + that.activeProj.name);
                that.load();
            },
            function(){
                console.log("[ERROR] Failed to delete project: " + that.activeProj.name);
            });
    }

    loadEditForm() {
        console.log("[INFO] loadEditForm called");
        $("#edit-form input[name^='projectName']").first().val(this.activeProj.name);
        $("#edit-form input[name^='address']").first().val(this.activeProj.IPaddress);
        $("#edit-form input[name^='database']").first().val(this.activeProj.db);
        $("#edit-form input[name^='port']").first().val(this.activeProj.port);
        $("#edit-form input[name^='username']").first().val(this.activeProj.username);
        $("#edit-form input[name^='password']").first().val(this.activeProj.password);
    }

}
