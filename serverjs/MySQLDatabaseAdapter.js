/*
 * MySQL Database Adapter
 *
 * Purpose: Connect and fetch data from a MySQL database
 *
 * List of functions:
 *      query
 *
 * List of REST endpoints:
 *      /sqldb/fetchDatabases
 *      /sqldb/fetchDatabaseDetails
 */



module.exports = function(app) {


    /**
     * This function executes a SQL query
     *
     * @param {object} dbParams - an object with folloing key and values
     *     {
     *         host: string
     *         port: int (optional. 3306 by default)
     *         user: string
     *         password: string
     *         database: string (optional)
     *     }
     *
     * @param {string} queryString
     * @param {function} callback_success
     * @param {function} callback_failure
     */
    function query(dbParams, queryString, callback_success, callback_failure) {

        // MySQL library
        var mysql = require('mysql');

        // Creating a connection
        var connection = mysql.createConnection(dbParams);
        connection.connect();

        // Querying the database
        connection.query(queryString, function(err, rows) {
            if (err) {
                // Error
                console.error('error connecting: ' + err.stack);
                callback_failure(err.code);
            } else {
                // Success
                callback_success(rows);
            }
        });

        // Closing connection to the database
        connection.end();
    }

    /**
     * This endpoint returns a list of all available databases
     * in the host server.
     */
    app.post('/sqldb/fetchDatabases', function(req, res) {

        var dbParams = req.body; // getting db data out of request params

        // SQL query string
        var queryString = 'select distinct table_schema from information_schema.columns';

        // Success callback function
        var callback_success = function(data) {
            res.json(data); // Respond with the data
        };

        // failure callback function
        var callback_failure = function(errMsg) {
            res.status(400); // Setting HTTP status to Error
            res.json({
                'error': errMsg
            }); // responding with a message
        };

        // Executing the query
        query(dbParams, queryString, callback_success, callback_failure);

    });

    /**
     * This endpoint returns column names, column position, and isPrimaryKey
     * of each table of a given database.
     */
    app.post('/sqldb/fetchDatabaseDetails', function(req, res) {

        var dbParams = req.body; // getting db data out of request params

        // SQL query string
        var queryString = 'select table_name, column_name, ordinal_position, column_key' +
            ' from information_schema.columns' +
            ' where table_schema = "' + dbParams.database + '"';

        // Success callback function
        var callback_success = function(data) {
            res.json(data); // Respond with the data
        };

        // failure callback function
        var callback_failure = function(errMsg) {
            res.status(400); // Setting HTTP status to Error
            res.json({
                'error': errMsg
            }); // responding with a message
        };

        // Executing the query
        query(dbParams, queryString, callback_success, callback_failure);

    });

    app.post('/sqldb/fetchTableLinks', function(req, res) {

        var dbParams = req.body; // getting db data out of request params

        // SQL query string
        var queryString = 'select table_name, column_name, referenced_table_name, referenced_column_name' +
            ' from information_schema.key_column_usage' +
            ' where constraint_schema = "' + dbParams.database + '"' +
            ' and referenced_table_name is not null';

        // Success callback function
        var callback_success = function(data) {
            res.json(data); // Respond with the data
        };

        // failure callback function
        var callback_failure = function(errMsg) {
            res.status(400); // Setting HTTP status to Error
            res.json({
                'error': errMsg
            }); // responding with a message
        };

        // Executing the query
        query(dbParams, queryString, callback_success, callback_failure);

    });

};
