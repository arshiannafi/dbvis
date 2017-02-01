
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
            if(xmlHttp.responseText == "") {
                callback_success();
            } else {
                callback_failure();
            }
        } else
            callback_failure();
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
        else
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
    
    var projecData = [];
    projectData.name = projectName;
    
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            callback_success(JSON.parse(xmlHttp.responseText));
        else
            callback_failure();
    }
    
    xmlHttp.open("POST", host.concat('/projects/getProject'), true); // true for asynchronous 
    xmlHttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xmlHttp.send(JSON.stringify(projectData));
}