
/**********************************************************
* function saveProject
*   Saves projectData to the server in a name specified by
*   projectData.name. projectData should be a JSON object
*   calls callback_success() on success, and
*   callback_failure(err) on failure.
*
*
*
**********************************************************/
function saveProject(projectData, host, callback_success, 
                      callback_failure) {
    
    var gotData = function(data) {
        console.log(data);
    }
    
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            callback(xmlHttp.responseText);
    }
    xmlHttp.open("POST", theURL.concat('projects/saveProject'), true); // true for asynchronous 
    xmlHttp.send(JSON.stringify(projectData));
    
    
}

/**********************************************************
* function getAllProjects
*   Gets all of the projects saved in the server
*   calls callback_success(projects) on success, where
*   projects is an array full of JSON objects representing
*   projects. callback_failure(err) is called on failure.
*
*
**********************************************************/
function getAllProjects(callback_success, callback_failure) {
    
}

/**********************************************************
* function getProject
*   Gets the project specified by the projectName
*   calls callback_success(project) on success, where
*   project is a JSON object represnting a project.
*   callback_failure(err) is called on failure.
*
*
*
**********************************************************/
function getProject(projectName, callback_success, callback_failure) {
    
}