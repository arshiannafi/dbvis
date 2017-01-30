/*
 * Project Storing Adapter
 *
 * Purpose: Write and fetch project data
 *
 * List of functions:
 *      createProject
 *      getAllProjects
 *      getProjectInfo
 *      
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
        // Create file name
        if(projectParams.name === undefined) {
            callback_failure('Project does not have a name.');
            return;
        }
        
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
            } else {
                var projects = [];
                var filesDone = 0;
                files.forEach(function(listItem, index) {
                    module.exports.getProjectInfo(listItem.replace('.json', ''), function(project) {
                        projects.push(project);
                        filesDone = filesDone + 1;
                        if(filesDone == files.length) {
                            callback_success(projects);
                        }
                    }, function(err) {
                        console.log('Could not load project: ' + listItem + ' because of error:');
                        console.log(err);
                        filesDone = filesDone + 1; 
                        if(filesDone == files.length-1) {
                            callback_success(projects);
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
        
        // get project file name
        filename = './Projects/'.concat(name.concat('.json')); // may want to sanatize inputs
        
        fileSystem.readFile(filename, (err, data) => {
            if (err) {
                console.log('Could not get project: '.concat(name));
                console.log(err);
                callback_failure(err); 
            } else {
                
                try{
                    project = JSON.parse(data);
                }catch(e){
                    console.log('Could not parse file: '.concat(name));
                    callback_failure(e);
                }
                
                console.log('Got project: '.concat(name));
                callback_success(project);
            }
        });
    }
}