/*
 * List of functions:
 *      initDiagramCanvas()
 *      render()
 *      downloadImage()
 *      getRelatedTables()
 *
 * Usage:
 *   To render a diagram:
 *       initDiagramCanvas();
 *       // get data
 *       // parse data into nodes and links
 *       render(nodes, links);
 *
 */


// Global variables
var dictionary_cols = []
var dictionary_tables = [];
var nodes = [];
var links = [];
var __relationText_from = '0..N';
var __relationText_to = '1';
// End of globar variables

// Init canvas
initDiagramCanvas();

// When window loads
function visualizeSchema(project) {

    // AJAX 1 - Fetfhing database details (all column information)
    var ajax_fetchDatabaseDetails = $.ajax({
        url: 'http://localhost:3000/sqldb/fetchDatabaseDetails',
        type: 'POST',
        dataType: 'json',
        contentType: 'application/json; charset=UTF-8',
        data: JSON.stringify({
            host: project.IPaddress,
            port: project.port,
            user: project.username,
            password: project.password,
            database: project.db
        })
    });

    // AJAX 2 - Fetching table links
    var ajax_fetchTableLinks = $.ajax({
        url: 'http://localhost:3000/sqldb/fetchTableLinks',
        type: 'POST',
        dataType: 'json',
        contentType: 'application/json; charset=UTF-8',
        data: JSON.stringify({
            host: project.IPaddress,
            port: project.port,
            user: project.username,
            password: project.password,
            database: project.db
        })
    });

    // When both AJAX calls are finished
    $.when(ajax_fetchDatabaseDetails, ajax_fetchTableLinks).done(function(jqxhr1, jqxhr2) {

        // parse columns' data to JSON object
        data = JSON.parse(ajax_fetchDatabaseDetails.responseText);

        for (var i in data) {
            dictionary_cols[data[i].table_name + '.' + data[i].column_name] = data[i];
        }

        for (c in dictionary_cols) {

            // evaluating if column is primary key
            var isKey = dictionary_cols[c].column_key === 'PRI';

            // setting the icon (on the left of name) of the attribute
            // blue cube by default
            var figure = 'Cube1';
            var color = 'blue';
            if (isKey) {
                // yellow dimond if is primary key
                figure = 'Decision';
                color = 'yellow';
            }

            // Extract column information
            var col = {
                'name': dictionary_cols[c].column_name,
                'isKey': isKey, // (boolean) primary key
                'figure': figure,
                'color': color
            }

            // If the dictionary variable doesn not have the table,
            if (dictionary_tables[dictionary_cols[c].table_name] === undefined) {
                // add new
                dictionary_tables[dictionary_cols[c].table_name] = {
                    'cols': [col]
                };
            } else {
                // add column to existing
                dictionary_tables[dictionary_cols[c].table_name].cols.push(col);
            }

        } // End of for each column

        // For each table in the dictionary variable
        for (var k in dictionary_tables) {
            // Add entity
            nodes.push({
                'key': k, // table name
                'items': dictionary_tables[k].cols, // cols of the table
            });
        }

        // End of entity processing (table / node on the graph)



        data = JSON.parse(ajax_fetchTableLinks.responseText);

        for (d in data) {
            var outgoingKey = data[d].table_name + '.' + data[d].column_name;
            var isPrimaryKey = (dictionary_cols[outgoingKey].column_key === 'PRI');
            if (isPrimaryKey) {
                // one to one relationship
                __relationText_from = '1';
            }

            links.push({
                'from': data[d].table_name,
                'to': data[d].referenced_table_name,
                'text': __relationText_from,
                'toText': __relationText_to
            });
        }

        render(nodes, links);

    }); // End of function that exectues when 2 AJAX calls are done

} // end of onLoad


/**
 * This function renders/re-renders the given set of nodes and links.
 *
 * @param {Array} nodeDataArray
 * @param {Array} linkDataArray
 */
function render(nodeDataArray, linkDataArray) {

    console.log(nodeDataArray);
    console.log(linkDataArray);

    myDiagram.model = new go.GraphLinksModel(nodeDataArray, linkDataArray);
}

/**
 * This function downloads an image of
 * what is visible in the diagram in client's browser
 */
function downloadImage() {
    var url = myDiagram.makeImage().src.replace(/^data:image\/[^;]/, 'data:application/octet-stream');
    window.open(url);
}

/**
 * Given a table name, this function returns all related tables.
 * Returns only outgoing edges.
 *
 * @param {String} tableName - The name of the table
 * @returns {Array} List of related tables
 */
function getRelatedTables(tableName) {
    var relatedTables = [];
    for (var i in links) {
        if (links[i].from === tableName) {
            relatedTables.push(links[i].to);
        }
    }
    return relatedTables;
}

function initDiagramCanvas() {
    // if (window.goSamples) goSamples(); // init for these samples -- you don't need to call this
    var $ = go.GraphObject.make; // for conciseness in defining templates
    myDiagram =
        $(go.Diagram, "myDiagramDiv", // must name or refer to the DIV HTML element
            {
                initialContentAlignment: go.Spot.Center,
                allowDelete: false,
                allowCopy: false,
                layout: $(go.ForceDirectedLayout),
                "undoManager.isEnabled": true
            });
    // the template for each attribute in a node's array of item data
    var itemTempl =
        $(go.Panel, "Horizontal",
            $(go.Shape, {
                    desiredSize: new go.Size(10, 10)
                },
                new go.Binding("figure", "figure"),
                new go.Binding("fill", "color")),
            $(go.TextBlock, {
                    stroke: "#333333",
                    font: "bold 14px sans-serif"
                },
                new go.Binding("text", "name"))
        );
    // define the Node template, representing an entity
    myDiagram.nodeTemplate =
        $(go.Node, "Auto", // the whole node panel
            {
                selectionAdorned: true,
                resizable: true,
                layoutConditions: go.Part.LayoutStandard & ~go.Part.LayoutNodeSized,
                fromSpot: go.Spot.AllSides,
                toSpot: go.Spot.AllSides,
                isShadowed: true,
                shadowColor: "#C5C1AA"
            },
            new go.Binding("location", "location").makeTwoWay(),
            // define the node's outer shape, which will surround the Table
            $(go.Shape, "Rectangle", {
                fill: 'white',
                stroke: "#756875",
                strokeWidth: 3
            }),
            $(go.Panel, "Table", {
                    margin: 8,
                    stretch: go.GraphObject.Fill
                },
                $(go.RowColumnDefinition, {
                    row: 0,
                    sizing: go.RowColumnDefinition.None
                }),
                // the table header
                $(go.TextBlock, {
                        row: 0,
                        alignment: go.Spot.Center,
                        margin: new go.Margin(0, 14, 0, 2), // leave room for Button
                        font: "bold 16px sans-serif"
                    },
                    new go.Binding("text", "key")),
                // the collapse/expand button
                $("PanelExpanderButton", "LIST", // the name of the element whose visibility this button toggles
                    {
                        row: 0,
                        alignment: go.Spot.TopRight
                    }),
                // the list of Panels, each showing an attribute
                $(go.Panel, "Vertical", {
                        name: "LIST",
                        row: 1,
                        padding: 3,
                        alignment: go.Spot.TopLeft,
                        defaultAlignment: go.Spot.Left,
                        stretch: go.GraphObject.Horizontal,
                        itemTemplate: itemTempl
                    },
                    new go.Binding("itemArray", "items"))
            ) // end Table Panel
        ); // end Node
    // define the Link template, representing a relationship
    myDiagram.linkTemplate =
        $(go.Link, // the whole link panel
            {
                selectionAdorned: true,
                layerName: "Foreground",
                reshapable: true,
                routing: go.Link.AvoidsNodes,
                corner: 5,
                curve: go.Link.JumpOver
            },
            $(go.Shape, // the link shape
                {
                    stroke: "#303B45",
                    strokeWidth: 2.5
                }),
            $(go.TextBlock, // the "from" label
                {
                    textAlign: "center",
                    font: "bold 14px sans-serif",
                    stroke: "#1967B3",
                    segmentIndex: 0,
                    segmentOffset: new go.Point(NaN, NaN),
                    segmentOrientation: go.Link.OrientUpright
                },
                new go.Binding("text", "text")),
            $(go.TextBlock, // the "to" label
                {
                    textAlign: "center",
                    font: "bold 14px sans-serif",
                    stroke: "#1967B3",
                    segmentIndex: -1,
                    segmentOffset: new go.Point(NaN, NaN),
                    segmentOrientation: go.Link.OrientUpright
                },
                new go.Binding("text", "toText"))
        );
}
