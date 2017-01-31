module.exports = function(app) {

    var projects = require('./ProjectStoringAdapter.js');
    
    app.post('/projects/saveProject', function(req, res) {

        var projectParams = req.body; // getting db data out of request params
        
        // Success callback function
        var callback_success = function() {
            res.json(""); // Respond with the data
        };

        // Failure callback function
        var callback_failure = function(errMsg) {
            res.status(400); // Setting HTTP status to Error
            res.json({
                'error': errMsg
            }); // responding with a message
        };
        
        projects.createProject(projectParams, callback_success, callback_failure)

    });
    
    app.post('/projects/getProject', function(req, res) {
        
        var projectName = req.body.name; // get project name
        
        // Success callback function
        var callback_success = function(project) {
            res.json(project); // Respond with the data
        };

        // Failure callback function
        var callback_failure = function(errMsg) {
            res.status(400); // Setting HTTP status to Error
            res.json({
                'error': errMsg
            }); // responding with a message
        };
        
        projects.getProjectInfo(projectName, callback_success, callback_failure)

    });
    
    app.get('/projects/getAllProjects', function(req, res) {
        
        // Success callback function
        var callback_success = function(projects) {
            res.json(projects); // Respond with the data
        };

        // Failure callback function
        var callback_failure = function(errMsg) {
            res.status(400); // Setting HTTP status to Error
            res.json({
                'error': errMsg
            }); // responding with a message
        };
        
        projects.getAllProjects(callback_success, callback_failure)

    });

}