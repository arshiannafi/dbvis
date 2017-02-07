/*
 * Project Storing Adapter
 *
 * Purpose: Write and fetch project data
 *
 * List of functions:
 *      createProject
 *      getAllProjects
 *      getProjectInfo
 *      deleteProjects
 */
var fileSystem = require('fs');
module.exports = {



    /**
     * This function creates a project and saves the data
     *
     * @param {object} projectParams - an object with following key and values
     *     {
     *         name: string
     *         ipAddress: string
     *         port: int (optional. 3306 by default)
     *         user: string
     *         password: string
     *         database: string
     *     }
     *
     * @param {function} callback_success
     * @param {function} callback_failure: returns the error
     */
    createProject: function(projectParams, callback_success, callback_failure) {
// <<<<<<< HEAD

        var createProjects = function() {

            // Create file name
            if(projectParams.name === undefined) {
                callback_failure('Project does not have a name.');
                return;
            }

            // appened json to filename to specify that it's a json file
            var filename = projectParams.name.concat('.json');

            // Write to file
            fileSystem.writeFile('./Projects/'.concat(filename), JSON.stringify(projectParams) , 'utf-8', function(err) {
                // if error...
                if(err) {
                    // send error back
                    callback_failure(err);
                } else {
                    // Success!
                    console.log('Saved project: '.concat(projectParams.name));
                    callback_success();
                }

            });
        };

        if(!fileSystem.existsSync("./Projects")) {
            fileSystem.mkdir("./Projects", function() {
                createProjects();
            });
        } else {
            createProjects();
        }
    },

    /**
     * This function gets all of the projects
     *
     *
     * @param {function} callback_success: returns array of projects
     * @param {function} callback_failure: returns the error
     */
    getAllProjects: function(callback_success, callback_failure) {
        fileSystem.readdir("./Projects/", function(err, files) {
           if(err) {
               console.log('Could not read projects directory');
               callback_failure(err);
               return;
            } else {
                var projects = [];
                if(files.length == 0) {
                    callback_success(projects);
                }

                var filesDone = 0;
                files.forEach(function(listItem, index) {
                    module.exports.getProjectInfo(listItem.replace('.json', ''), function(project) {
                        projects.push(project);
                        filesDone = filesDone + 1;
                        if(filesDone == files.length) {
                            callback_success(projects);
                            return;
                        }
                    }, function(err) {
                        console.log('Could not load project: ' + listItem + ' because of error:' + err);
                        filesDone = filesDone + 1;
                        if(filesDone == files.length) {
                            callback_success(projects);
                            return;
                        }
                    });
                });
           }
        });
    },

    /**
     * This function gets all of the projects
     *
     *
     * @param {function} callback_success: returns the project
     * @param {function} callback_failure: returns the error
     */
    getProjectInfo: function(name, callback_success, callback_failure) {

        // Make sure name is valid
        if(!(typeof name == 'string' || name instanceof String)) {
            callback_failure('Project name is not a string');
            return;
        }

        // get project file name
        filename = './Projects/'.concat(name.concat('.json')); // may want to sanatize inputs

        // Read the file using file system
        fileSystem.readFile(filename, function (err, data) {
            // Check if there's an error
            if (err) {
                // Log the error
                console.log('Could not get project: '.concat(name));
                console.log(err);
                // Callback the error
                callback_failure(err);
            } else {

                try{
                    // Try parsing the data
                    project = JSON.parse(data);
                }catch(e){
                    // If not able to parse, callback with failure
                    console.log('Could not parse file: '.concat(name));
                    callback_failure(e);
                    return;
                }
                // Return the project
                console.log('Got project: '.concat(name));
                callback_success(project);
            }
        });
    },

    deleteProject: function(name, callback_success, callback_failure) {

        if(!(typeof name == 'string' || name instanceof String)) {
            callback_failure('Provided name is invalid');
            return;
        }

        filename = './Projects/'.concat(name.concat('.json'));
        fileSystem.unlink(filename, function(err) {
            if(err) {
                callback_failure(err);
                return;
            } else {
                callback_success();
                return;
            }
        });
    }
}
