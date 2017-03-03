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
var myDiagram;
var dictionary_cols = [];
var dictionary_tables = [];
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
    
    if(project.data != undefined) {
        nodes = project.data.nodeData;
        links = project.data.linkData;
        // Set up node data for 
        for(var i = 0; i < nodes.length; i++) {
            nodes[i].location = new go.Point(nodes[i].location.J, nodes[i].location.K);
        }
        for(var i = 0; i < links.length; i++) {
            var pointsList = new go.List(go.Point);
            console.log(links[i]);
            for(var j = 0; j < links[i].points.o.length; j++) {
                console.log(links[i].points.o[j]);
                pointsList.add(new go.Point(links[i].points.o[j].J, links[i].points.o[j].K)); 
            }
            links[i].points = pointsList;
        }
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
    if(nodeDataArray[0].location) {
        updatePositions(nodeDataArray);
    }
}

function updatePositions(nodeDataArray) {
    
    var link;
    myDiagram.startTransaction("moving links");
    for(var i = 0 ; i < myDiagram.model.linkDataArray.length; i++){
        data = myDiagram.model.linkDataArray[i]; 
        link = myDiagram.findLinkForData(data);
        var linkList = link.points.copy();
        linkList.clear();
        for(var j = 0 ; j < data.points.o.length; j++) {
            linkList.add(data.points.o[j]);
        }
        link.points = linkList;
    }
    myDiagram.commitTransaction("moving links");
}

/**
 * This function downloads an image of
 * what is visible in the diagram in client's browser
 */
function downloadImage() {
    saveLayoutInformation();
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
                        font: "bold 16px sans-serif"
                    },
                    new go.Binding("text", "key")),
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

function toggleVisibility(e, obj) {
    var node = obj.part;
    node.diagram.startTransaction("visible");
    node.visible = !node.visible;
    node.diagram.commitTransaction("visible");
}

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

function setHandler(node, button) {
    button.click(function(e){
        toggleVisibility(e, node);
    });
}

function saveLayoutInformation() {
    PM.saveProjectData({nodeData: nodes,
                        linkData: links});
}