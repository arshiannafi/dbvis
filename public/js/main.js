//Initialize View Structure
var VC = new ViewController();
VC.init();

//Initialize Click Handlers
ClickHandler.initStaticHandlers();

//start-up view
VC.show("view-select-proj");

var PM = new ProjectManager();
PM.load();
