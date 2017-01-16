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



module.exports = function (app) {


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
     * @param {function} callback_faileure
     */
    function query(dbParams, queryString, callback_success, callback_faileure) {

        // MySQL library
        var mysql = require('mysql');

        // Creating a connection
        var connection = mysql.createConnection(dbParams);
        connection.connect();

        // Querying the database
        connection.query(queryString, function (err, rows) {
            if (err) {
                // Error
                console.error('error connecting: ' + err.stack);
                callback_faileure(err.code);
            } else {
                // Success
                callback_success(JSON.stringify(rows));
            }
        });

        // Closing connection to the database
        connection.end();
    }

    /**
     * This endpoint returns a list of all available databases
     * in the host server.
     */
    app.get('/sqldb/fetchDatabases', function (req, res) {

        var dbParams = req.query; // getting db data out of request params

        // SQL query string
        var queryString = 'select distinct TABLE_SCHEMA from information_schema.columns';

        // Success callback function
        var callback_success = function (data) {
            res.end(data); // Respond with the data
        };

        // Faileure callback function
        var callback_faileure = function (errMsg) {
            res.status(400); // Setting HTTP status to Error
            res.end(errMsg); // responding with a message
        };

        // Executing the query
        query(dbParams, queryString, callback_success, callback_faileure);

    });

    /**
     * This endpoint returns column names, column position, and isPrimaryKey
     * of each table of a given database.
     */
    app.get('/sqldb/fetchDatabaseDetails', function (req, res) {

        var dbParams = req.query; // getting db data out of request params

        // SQL query string
        var queryString = 'select TABLE_NAME, COLUMN_NAME, ORDINAL_POSITION, COLUMN_KEY'
                + ' from information_schema.columns'
                + ' where table_schema = "' + dbParams.database + '"'
                + ' order by table_name,ordinal_position';

        // Success callback function
        var callback_success = function (data) {
            res.end(data); // Respond with the data
        };

        // Faileure callback function
        var callback_faileure = function (errMsg) {
            res.status(400); // Setting HTTP status to Error
            res.end(errMsg); // responding with a message
        };

        // Executing the query
        query(dbParams, queryString, callback_success, callback_faileure);

    });


};
