/*
 * List of functions:
 *      initDiagramCanvas()
 *      render()
 *      downloadImage()
 *      getRelatedTables()
 *      cluster()
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
var myDiagram;
var dictionary_cols = [];
var dictionary_tables = [];

/**
 * Abstract Entity (AE) and Abstract Relation (AR) data structure property:
 * AR[x] relates AE[2x] and AE[2x+1]
 *
 *    +--------+     ^      +----------+
 *   | AE[2r] |---< AR >---| AE[2r+1] |
 *  +--------+      v     +----------+
 */
var cluster_all_entities;
var cluster_all_relations;

var nodes = [];
var links = [];
var __relationText_from = '0..N';
var __relationText_to = '1';
// End of globar variables

// Init canvas
initDiagramCanvas(-1);

// When window loads
function visualizeSchema(project) {

    dictionary_cols = [];
    dictionary_tables = [];
    nodes = [];
    links = [];

    // If there the project has already saved data/layout, load it
    if(project.data != undefined) {
        nodes = project.data.nodeData;
        links = project.data.linkData;
        // Using the given data from file, make objects for data binding
        for(var i = 0; i < nodes.length; i++) {
            nodes[i].location = new go.Point(nodes[i].location.J, nodes[i].location.K);
        }
        for(var i = 0; i < links.length; i++) {
            var pointsList = new go.List(go.Point);
            for(var j = 0; j < links[i].points.o.length; j++) {
                pointsList.add(new go.Point(links[i].points.o[j].J, links[i].points.o[j].K));
            }
            links[i].points = pointsList;
        }
        // Render the data
        render(nodes, links);
        return;
    }
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
                'visible': true,
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
                'visible': true,
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
 * $$param {Array} nodeDataArray
 * $$param {Array} linkDataArray
 */
function render(nodeDataArray, linkDataArray) {
    myDiagram.model = new go.GraphLinksModel(nodeDataArray, linkDataArray);
    makeList();
}

/**
 * This function downloads an image of
 * what is visible in the diagram in client's browser
 */
function downloadImage() {
    var link = document.createElement('a');
    link.download = 'diagram.png';
    link.href = myDiagram.makeImage().src;
    link.click();
}




/**
 * Given a table name, this function returns all related tables.
 * Returns only outgoing edges.
 *
 * $$param {String} tableName - The name of the table
 * $$returns {Array} List of related tables
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

/**
 * Initializes the diagram based on the selected layout
 *
 * $$param {Number} layoutID - The name of the table
 * Values:
 *  1 = Grid
 *  2 = Force Directed
 *  3 = Circular
 *  4 = Layered
 */
function initDiagramCanvas(layoutID) {

    var $$ = go.GraphObject.make; // for conciseness in defining templates

    //dissociates the diagram from the div, necessary for rerendering
    if(myDiagram !== undefined && myDiagram.div !== null) {
        myDiagram.div = null;
    }

    var layout;

    if(layoutID === 1) {
        layout = $$(go.GridLayout);
    }
    else if(layoutID === 2) {
        layout = $$(go.ForceDirectedLayout);
    }
    else if(layoutID === 3) {
        layout = $$(go.CircularLayout);
    }
    else if(layoutID === 4) {
        layout = $$(go.LayeredDigraphLayout);
    }  else
        layout = new go.Layout();



    // if (window.goSamples) goSamples(); // init for these samples -- you don't need to call this
    myDiagram =
        $$(go.Diagram, "myDiagramDiv", // must name or refer to the DIV HTML element
            {
                initialContentAlignment: go.Spot.Center,
                allowDelete: false,
                allowCopy: false,
                layout: layout,
                "undoManager.isEnabled": true
            });
    // the template for each attribute in a node's array of item data
    var itemTempl =
        $$(go.Panel, "Horizontal",
            $$(go.Shape, {
                    desiredSize: new go.Size(10, 10)
                },
                new go.Binding("figure", "figure"),
                new go.Binding("fill", "color")),
            $$(go.TextBlock, {
                    stroke: "#333333",
                    font: "bold 14px sans-serif"
                },
                new go.Binding("text", "name"))
        );
    // define the Node template, representing an entity
    myDiagram.nodeTemplate =
        $$(go.Node, "Auto", // the whole node panel
            {
                selectionAdorned: true,
                resizable: true,
                layoutConditions: go.Part.LayoutStandard & ~go.Part.LayoutNodeSized,
                fromSpot: go.Spot.AllSides,
                toSpot: go.Spot.AllSides,
                isShadowed: true,
                shadowColor: "#C5C1AA"
            },
            new go.Binding("keyForButton", "key"),
            new go.Binding("location", "location").makeTwoWay(),
            new go.Binding("visible", "visible").makeTwoWay(),
            // define the node's outer shape, which will surround the Table
            $$(go.Shape, "Rectangle", {
                fill: 'white',
                stroke: "#756875",
                strokeWidth: 3
            }),
            $$(go.Panel, "Table", {
                    margin: 8,
                    stretch: go.GraphObject.Fill
                },
                $$(go.RowColumnDefinition, {
                    row: 0,
                    sizing: go.RowColumnDefinition.None
                }),
                // the table header
                $$(go.TextBlock, {
                        row: 0,
                        alignment: go.Spot.Center,
                        margin: new go.Margin(0, 14, 0, 2), // leave room for Button
                        font: "bold 16px sans-serif",
                        editable: true
                    },
                    new go.Binding("text", "key").makeTwoWay()),
                // the collapse/expand button
                $$("PanelExpanderButton", "LIST", // the name of the element whose visibility this button toggles
                    {
                        row: 0,
                        alignment: go.Spot.TopRight
                    }),
                $$("Button",
                    { row: 1,
                        alignment: go.Spot.TopRight,
                        click: expand },
                    $$(go.TextBlock, "+")),
                $$("Button",
                    { row: 2,
                        alignment: go.Spot.TopRight,
                        click: toggleVisibility },
                    $$(go.TextBlock, "-")),
                // the list of Panels, each showing an attribute
                $$(go.Panel, "Vertical", {
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
        $$(go.Link, // the whole link panel
            {
                selectionAdorned: true,
                layerName: "Foreground",
                reshapable: true,
                routing: go.Link.AvoidsNodes,
                corner: 5,
                curve: go.Link.JumpOver,
            },
            new go.Binding("points", "points").makeTwoWay(),
            new go.Binding("visible","visible"),
            $$(go.Shape, // the link shape
                {
                    stroke: "#303B45",
                    strokeWidth: 2.5
                }),
            $$(go.TextBlock, "transition",  // the label text
                {
                  textAlign: "center",
                  font: "9pt helvetica, arial, sans-serif",
                  margin: 4,
                  editable: true  // enable in-place editing
                },
                // editing the text automatically updates the model data
                new go.Binding("text", "name").makeTwoWay()),
            $$(go.TextBlock, // the "from" label
                {
                    textAlign: "center",
                    font: "bold 14px sans-serif",
                    stroke: "#1967B3",
                    segmentIndex: 0,
                    segmentOffset: new go.Point(NaN, NaN),
                    segmentOrientation: go.Link.OrientUpright
                },
                new go.Binding("text", "text")),
            $$(go.TextBlock, // the "to" label
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

/**
 * Toggle whether or not a node is visible
 *
 * $$param {Event} Event of button being clicked
 * $$param {Object} Button that was clicked
 */
function toggleVisibility(e, obj) {
    var node = obj.part;
    node.diagram.startTransaction("visible");
    node.visible = !node.visible;
    node.diagram.commitTransaction("visible");
}

/**
 * Expand out a node to show all related entities
 *
 * $$param {Event} Event of button being clicked
 * $$param {Object} Button that was clicked
 */
function expand(e, obj) {
    var node = obj.part;
    node.diagram.startTransaction("expand");
    var iterator = node.findLinksConnected();
    while(iterator.next()) {
        var link = iterator.value;
        link.getOtherNode(node).visible = true;
    }

    node.diagram.commitTransaction("expand");
}

/**
 * Make a list of all of the entites to toggle whether
 * they are on or off
 */
function makeList() {

    var it = myDiagram.nodes;
    var list = $('#entity-list');
    list.empty();
    while(it.next()) {
        var node = it.value;
        var button = $(document.createElement('button')).text(node.keyForButton)
            .addClass('btn')
            .addClass('btn-visibility');
        setHandler(node, button);
        list.append(button);


    }
}

/**
 * Helper function of makeList
 */
function setHandler(node, button) {
    button.click(function(e){
        toggleVisibility(e, node);
    });
}

/**
 * Save all of the layout information currently on the screen
 */
function saveLayoutInformation() {
    PM.saveProjectData({nodeData: nodes,
                        linkData: links});
}

/**
 * This function implments a clustering algorithm that is similar to the
 * algorithm discussed in "Clustering relations into abstract ER schemas
 * for database reverse engineering" by P. Sousa et al.
 *
 * Preconditions:
 *      "dictionary_tables" must be populated
 * Postconditions:
 *      "cluster_all_entities" and "cluster_all_relations" are populated
 *      cluster_all_entities = [ [AE1],[AE2], ... ,[AEN] ]
 *      cluster_all_relations = [ [AR1],[AR2], ... ,[AR(N/2)] ]
 *          where AR[x] relates AE[2x] and AE[2x+1]
 *
 */
function cluster() {

    // Init
    cluster_all_entities = [];
    cluster_all_relations = [];

    // For one iteration of clustering
    var cluster_a;
    var cluster_b;
    var cluster_rel;
    var list_keys_pri = [];
    var list_keys_pri_prev = [];
    var tableName;

    // 1
    // Transforming dictionary_tables into string of the form:
    // var str = "col1.col2.[...].tableName";
    var str;
    for (var t in dictionary_tables) {
        str = "";
        for (var col in dictionary_tables[t].cols) {
            if (dictionary_tables[t].cols[col].isKey) {
                str += dictionary_tables[t].cols[col].name + ".";
            }
        }
        str += t;
        list_keys_pri.push(str);
    }

    // 2
    // sort the list of primary keys
    list_keys_pri.sort();

    // Until all tables are classified
    while (list_keys_pri.length !== 0) {

        // 3
        // Get starting point
        // Starting point 1 "str_start" is first key in the list
        // Starting point 2 "str_start2" is first key in the list
        //     that does not contian "str_start"
        var str_start = list_keys_pri[0].split(".")[0];
        var str_start2;
        for(var key = 1; key < list_keys_pri.length; key++){
            if (!list_keys_pri[key].includes(str_start)) {
                str_start2 = list_keys_pri[key].split(".")[0]; // first token (pri key)
                break;
            }
        }

        // Setting up this iteration

        // prev = curr
        list_keys_pri_prev = list_keys_pri;
        list_keys_pri = [];

        // clearing out clusters
        cluster_a = [];
        cluster_b = [];
        cluster_rels = [];

        // for all tables
        for(var i = 0; i < list_keys_pri_prev.length; i++){

            // get table name from "col1.col2.[...].tableName"
            tableName = list_keys_pri_prev[i].split(".");
            tableName = tableName[tableName.length - 1];

            // evaluate which cluster they belong in
            var isInA = list_keys_pri_prev[i].includes(str_start);
            var isInB = list_keys_pri_prev[i].includes(str_start2);

            // Append to appropriate cluster
            if (isInA && isInB) {
                // belongs in abstract relationship
                cluster_rels.push(tableName);
            } else if (isInA && !isInB) {
                // belongs in abstract entity 1
                cluster_a.push(tableName);
            } else if (!isInA && isInB) {
                // belongs in abstract entity 2
                cluster_b.push(tableName);
            } else {
                // belongs elsewhere
                list_keys_pri.push(list_keys_pri_prev[i]);
            }
        }

        // Append clusters to main data structure
        cluster_all_entities.push(cluster_a);
        cluster_all_entities.push(cluster_b);
        cluster_all_relations.push(cluster_rels);

    }

    console.log(cluster_all_entities);
    console.log(cluster_all_relations); // todo delte before commit

}
