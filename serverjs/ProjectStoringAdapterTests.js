/* ProjectStoringAdapterTests.js
*
*   This script is specifically for testing ProjectSotringAdapter
*   
*
*
*/
var ProjectStoringAdapter = require('./ProjectStoringAdapter.js');
var projectParams = {hello: 'goodbye',
                     dog: 'cat',
                    IPaddress: 4};

ProjectStoringAdapter.createProject(projectParams, function(){
    console.log('Test adding bad parameters: failed.');
}, function(err) {
    console.log('Test adding bad parameters: passed.');
});

projectParams = {name: 'test1',
                 IPaddress: 4};

ProjectStoringAdapter.createProject(projectParams, function(){
    console.log('Test creating good project parameters: passed.');
}, function(err) {
    console.log('Test creating good project parameters: failed.');
});

ProjectStoringAdapter.getProjectInfo(projectParams.name, function(project) {
    console.log('Test loading good project parameters: passed.');
}, function(err) {
    console.log('Test loading good project parameters: passed.');
});

projectParams = {name: 'test2',
                 otherStuff: 'other stuff'};

ProjectStoringAdapter.createProject(projectParams, function(){
    console.log('Test creating second good project parameters: passed.');
}, function(err) {
    console.log('Test creating second good project paramters: failed.');
});


ProjectStoringAdapter.getAllProjects(function(projects) {
    console.log('Test getting all projects: passed.');
}, function(err) {
    console.log('Test getting all projects: failed.');
});

var callback_success = function() {
    console.log('Successfully deleted test1');
}

var callback_success2 = function() {
    console.log
}

ProjectStoringAdapter.deleteProject('test1', function(){
    console.log('Test deleteing test project 1: passed.');
}, function(err) {
    console.log('Test deleteing test project 1: failed.')
});
ProjectStoringAdapter.deleteProject('test2', function(){
    console.log('Test deleteing test project 2: passed.');
}, function(err) {
    console.log('Test deleteing test project 2: failed.')
});
ProjectStoringAdapter.deleteProject('test3', function(){
    console.log('Test deleteing non-existent project: failed.');
}, function(err) {
    console.log('Test deleteing non-existent project: passed.')
});
