module.exports = function(app) {

    var projects = require('./ProjectStoringAdapter.js');

    app.post('/projects/saveProject', function(req, res) {

        var projectParams = req.body; // getting data out of request params

        // Success callback function
        var callback_success = function() {
            res.json(''); // Respond with nothing
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

    app.post('/projects/deleteProject', function(req, res) {
        var callback_success = function() {
            res.send('');
        }
        var callback_failure = function(err) {
            res.status(400); // Setting HTTP status to Error
            res.json({
                'error': err
            });
        }
        projects.deleteProject(req.body.name, callback_success, callback_failure);
    });

}
