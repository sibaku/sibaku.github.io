/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
function newApply(func) {
    var obj = Object.create(func.prototype);
    var args = [].slice.call(arguments, 1)[0];

    func.apply(obj, args);
    return obj;
}
;

function createTreeFromGraph()
{
    var target = plumbInstance.select({target: "progRoot"});
    console.log(target);

    if (target.length === 0)
    {
        return null;
    }

    var first = target.get(0);
    try {
        op = buildTreeFromGraphRecursive(first.source);
    } catch (e)
    {
        console.log(e);

        var o = $(e.element);
        var container = $('<div>');


        var msg = $('<div>' + e.msg + '</div>');
        msg.appendTo(container);

        var headerText = $(o).find('h3').text();
        msg = $('<div>Element: ' + headerText + '</div>');
        msg.appendTo(container);

        container.dialog({title: "Error", modal: true});
        return;
    }
    updateCode();
    initShaders();
    changed = true;




}

var nodeFuncs = {};

function showAddNodeDialog()
{
    var buttons = [];

    var container = $('<div>');
    container.css("width", "200px");
//    for (var i in nodeFuncs)
//    {
//
//        buttons.push({
//            text: i,
//            click: function (i) {
//                return function () {
//
//                    createWidgetFromFunc(nodeFuncs[i]);
//                    container.dialog("destroy").remove();
//                };
//            }(i)
//        });
//    }

    var objectContainer = $('<div>');
    var operationContainer = $('<div>');

    objectContainer.append("<h3>Objects</h3>");
    operationContainer.append("<h3>Operations</h3>");

    for (var i in nodeFuncs)
    {

        var button = $('<button>' + i + '</button>');
        button.css('margin', "5px");
        button.click(function (i) {
            return function () {

                createWidgetFromFunc(nodeFuncs[i]);
                container.dialog("destroy").remove();
            };
        }(i));
        if (nodeFuncs[i].prototype instanceof DistanceEstimator)
        {
            objectContainer.append(button);
        } else
        {
            operationContainer.append(button);
        }

    }
    container.append(objectContainer);
    container.append(operationContainer);

//    container.dialog({title: "Nodes", modal: true,
//        buttons: buttons});
    container.dialog({title: "Nodes", modal: true});
}

function setObjectColor(r, g, b)
{
    function toValue(v)
    {
        return Math.min(255, Math.max(0, Math.floor(v)));
    }
    $('#objectR').val(toValue(r));
    $('#objectG').val(toValue(g));
    $('#objectB').val(toValue(b));


}
function setBackgroundColor(r, g, b)
{
    function toValue(v)
    {
        return Math.min(255, Math.max(0, Math.floor(v)));
    }
    $('#backgroundR').val(toValue(r));
    $('#backgroundG').val(toValue(g));
    $('#backgroundB').val(toValue(b));
}
var examples = [];
function createExamples()
{
    var examples = [];
    var op, op2, op3;


    op = new Box(1, 1, 1);
    op = new opRepitition(op, "8", "8", "8 + exp(5*sin(t*2*pi/10)^2)");
    examples.push({op: op,
        displayName: "Vertigo",
        name: "Vertigo",
        buildFunc: function ()
        {
            cam.setPosition(vec3.fromValues(0, 0, 0));
            cam.setLookAt(vec3.fromValues(0, 0, -1));
        },
        description: "This example creates vertigo like effect using a 3D repition with a time based function"});


    op = new ImplicitSurface("(2*x^2 + z^2 + y^2 -1)^3 - 0.2*x^2*y^3 - z^2*y^3 ");
    op = new opRotate(op, 0, 1, 0, "pi/2");
    examples.push({op: op,
        displayName: "<3",
        name: "<3",
        buildFunc: function ()
        {
            setObjectColor(255, 0, 0);
            setBackgroundColor(255,255,153)
            cam.setPosition(vec3.fromValues(0, 0, 5));
            cam.setLookAt(vec3.fromValues(0, 0, 0));
        },
        description: "This example creates an implicit Taubin Heart surface"});

    op = new ImplicitSurface("y- 15*(sin(2*pi*t/20)^2 + 0.01) *sin(sqrt(x^2 +z^2)) /sqrt(x^2 + z^2)");
    op = new opIntersection(op, new Sphere(20));

    op2 = new Sphere(1);
    op2 = new opTranslate(op2, "0", "25*(sin(2*pi*t/20)^2)-5", "0");
    op = new opSmoothUnion(op, op2, 0.8);
    examples.push({op: op,
        displayName: "Splash",
        name: "Splash",
        buildFunc: function ()
        {
            setObjectColor(0, 100, 255);
            cam.setPosition(vec3.fromValues(40, 40, 40));
            cam.setLookAt(vec3.fromValues(0, 0, 0));
        },
        description: 'This example kinda looks like water in a glass making a splash in slow motion'});

    op = new Mandelbulb(7, 10);
    op2 = new Box(0.35, 0.35, 0.35);
    op2 = new opRotate(op2, 1, 1, 1, "2*pi/20*t");
    op = new opSmoothUnion(op, op2, 0.7);
    examples.push({op: op,
        displayName: "Living broccoli",
        name: "Living broccoli",
        buildFunc: function ()
        {
            setObjectColor(0, 255, 0);
            cam.setPosition(vec3.fromValues(-0.8, 1, 2.7));
            cam.setLookAt(vec3.fromValues(0, 0, 0));
        },
        description: "This example creates a wobbling mandelbulb, which kinda looks like broccoli"});




    var opTower1 =
            new opSmoothUnion(
                    new opSmoothUnion(
                            new Box(1, 3, 1),
                            new opTranslate(
                                    new opScale(
                                            new Torus(1, 0.5, 1)
                                            , 1.2, 0.2, 1)
                                    , 0, 3, 0)
                            )
                    , new opTranslate(
                            new opScale(
                                    new Torus(1, 0.5, 1)
                                    , 1.2, 0.2, 1
                                    )
                            , 0, 2.5, 0
                            )

                    );

    var bottom = new Box(2, 0.2, 2);
    bottom = new opUnion(new opTranslate(new Box(1.5, 0.2, 1.5), 0, 0.4, 0), bottom);
    bottom = new opUnion(new opTranslate(new Box(1.25, 0.2, 1.25), 0, 0.8, 0), bottom);
    bottom = new opUnion(new opTranslate(new Box(1, 0.2, 1), 0, 1.2, 0), bottom);


    var top = new opTranslate(new opRotate(bottom, 1, 0, 0, "pi"), 0, 12, 0);

    var mid = new CappedCylinder(0.8, 6);
    mid = new opTranslate(mid, 0, 6, 0);
    mid = new opSubtraction(new opTranslate(new CappedCylinder(0.2, 40), 0.0, 0.0, 0.9), mid);
    mid = new opSubtraction(new opTranslate(new CappedCylinder(0.2, 40), 0.0, 0.0, -0.9), mid);
    mid = new opSubtraction(new opTranslate(new CappedCylinder(0.2, 40), -0.9, 0.0, 0.0), mid);
    mid = new opSubtraction(new opTranslate(new CappedCylinder(0.2, 40), 0.9, 0.0, 0.0), mid);

    var diagonalValue = Math.sin(Math.PI / 4) * 0.9;
    mid = new opSubtraction(new opTranslate(new CappedCylinder(0.2, 40), diagonalValue, 0.0, diagonalValue), mid);
    mid = new opSubtraction(new opTranslate(new CappedCylinder(0.2, 40), diagonalValue, 0.0, -diagonalValue), mid);
    mid = new opSubtraction(new opTranslate(new CappedCylinder(0.2, 40), -diagonalValue, 0.0, diagonalValue), mid);
    mid = new opSubtraction(new opTranslate(new CappedCylinder(0.2, 40), -diagonalValue, 0.0, -diagonalValue), mid);

    var opTower2 = new opSubtraction(new opTranslate(new Sphere(1.1), 0, 0, 0), opTower1);
    opTower2 = new opSubtraction(new opTranslate(new Sphere(0.5), -1, 1.5, 1), opTower2);
    opTower2 = new opSubtraction(new opTranslate(new Sphere(0.5), -1, 1.5, -1), opTower2);
    opTower2 = new opSubtraction(new opTranslate(new Sphere(0.5), 1, 1.5, 1), opTower2);
    opTower2 = new opSubtraction(new opTranslate(new Sphere(0.5), 1, 1.5, -1), opTower2);
//opTower2 = new opTwist(opTower2,1);
    opTower2 = new opPlaneRepitition(opTower2, "xz", 15, 15);
    opTower2 = new opUnion(opTower2, new opTranslate(new Box(1000, 0.1, 1000), 0, -1.5, 0));
    op = opTower2;
    op = new opUnion(mid, new opUnion(top, bottom));
    op = new opPlaneRepitition(op, "xz", 10, 10);
    op = new opUnion(op, new opTranslate(new Box(10000, 0.1, 10000), 0, -0.3, 0));
    examples.push({op: op,
        displayName: "Pillars of infinity",
        name: "Pillars of infinity",
        buildFunc: function ()
        {
            setBackgroundColor(255,255,255);
            setObjectColor(128, 128, 128);
            cam.setPosition(vec3.fromValues(2, 2, 1));
            cam.setLookAt(vec3.fromValues(6, 4, -5));
        },
        description: "This example creates an infinite floor of pillars"});


    op = new Sphere(10);
    op2 = new Box(0.1, 0.1, 0.1);
    op2 = new opRepitition(op2, "0.5", "0.5", "0.5");
    op2 = new opRotate(op2, 1, 1, 1, "2*pi*t/20");
    op = new opIntersection(op, op2);

    examples.push({op: op,
        displayName: "Sliced ball",
        name: "Sliced ball",
        buildFunc: function ()
        {
            setObjectColor(255, 255, 0);
            cam.setPosition(vec3.fromValues(0, 0, 30));
            cam.setLookAt(vec3.fromValues(0, 0, 0));
        },
        description: "This example creates a continuously sliced ball"
    });

    op = new ImplicitSurface("15*((x-1.2)*x^2*(x+1.2) + y^2)^2 + 0.8*(z-1)*z^2*(z+1) - 0.1*z^2 + 20*((y-0.8)*y^2*(y+0.8) + z^2)^2 + 0.8*(x-1)*z^2*(x+1) - 0.1*x^2");

    examples.push({op: op,
        displayName: "Bow tie",
        name: "Bow tie",
        buildFunc: function ()
        {
            setObjectColor(255, 0, 0);
            setBackgroundColor(255, 255, 255);
            cam.setPosition(vec3.fromValues(2, 1.5, 2.5));
            cam.setLookAt(vec3.fromValues(0, 0, 0));
        },
        description: "This example creates a bow tie like implicit surface"
    });

    op = new ImplicitSurface("(x-2)^2*(x+2)^2 + (y-2)^2*(y+2)^2 +(z-2)^2*(z+2)^2 + 3*(x^2*y^2 + x^2*z^2 + y^2*z^2) + 6*x*y*z - 10*(x^2 + y^2 +z^2) +22");

    examples.push({op: op,
        displayName: "Implicit example",
        name: "Implicit example",
        buildFunc: function ()
        {
            cam.setPosition(vec3.fromValues(0, 0, 10));
            cam.setLookAt(vec3.fromValues(0, 0, 0));
        },
        description: "This example creates a surface for the implicit function </br> (x-2)^2*(x+2)^2 + (y-2)^2*(y+2)^2 +(z-2)^2*(z+2)^2 + 3*(x^2*y^2 + x^2*z^2 + y^2*z^2) + 6*x*y*z - 10*(x^2 + y^2 +z^2) +22"
    });

    op = new MengerSponge(10);
    op2 = new Sphere(0.1);
//     op2 = new opSmoothUnion(new opTranslate(new Sphere(0.01),0.16,0,0),op2,0.5);
    op2 = new opRepitition(op2, "0.3", "0.25", "0.4");
    op2 = new opRotate(op2, 1, 2, 1, "0.4");
    op = new opIntersection(op, op2);
    op = new opIntersection(new Sphere(0.9), op);


    examples.push({op: op,
        displayName: "Spaceship rubble",
        name: "Spaceship rubble",
        buildFunc: function ()
        {
            setObjectColor(100, 100, 100);
            setBackgroundColor(5, 5, 5);
            cam.setPosition(vec3.fromValues(0.8216473460197449, -0.23533189296722412, 0.6251183152198792));
            cam.setLookAt(vec3.fromValues(0.06134158372879028, 0.17538651823997498, 0.1218833327293396));
        },
        description: "This example is slightly inspired by a destroyed death star"
    });


    return examples;

}
function buildTreeFromGraphRecursive(o)
{

    var jo = $(o);
    var optype = jo.data("type");
    var doc = optype.getDoc();
    if (jo.data("buildFunc"))
    {
        jo.data("buildFunc")();
    }
    var endpoints = plumbInstance.getEndpoints(jo);
    console.log(endpoints);
    var incoming = [];
    for (var i = 0; i < endpoints.length; i++)
    {
        if (endpoints[i].isTarget)

        {
            incoming.push(endpoints[i]);
        }
    }

    var paramprio = [];
    var params = jo.find('.paramBox div');
    for (var i = 0; i < params.length; i++)

    {
        var pbox = $(params[i]);
        var prio = pbox.data("priority");
        var name = $(pbox.find('span')[0]).text();
        var value = $(pbox.find('input')[0]).val();
        var docparam = doc.getParam(name);
        if (value === "")
        {
            value = docparam.defaultValue;
            $(pbox.find('input')[0]).val(value);
        }

        console.log(docparam.type);
        if (docparam.type === Number)
        {
            value = parseFloat(value);
            console.log(value);

            if (isNaN(value))
            {
                value = docparam.defaultValue;
                $(pbox.find('input')[0]).val(value);
            }
        }

        paramprio.push([prio, value]);
    }
    console.log(paramprio);
    if (incoming.length === 0)
    {
        var retparam = [];
        for (var i = 0; i < paramprio.length; i++)
        {
            retparam.push(paramprio[i][1]);
        }
        if (optype === opCombineFunction)
        {
            return jo.data("combineObject");
        } else
        {

            return  newApply(optype, retparam);
        }
    }

    for (var i = 0; i < incoming.length; i++)
    {
        var con = incoming[i];
        var prio = con.priority;
        var connection = con.connections[0];
        // Error
        if (!connection)
        {
            throw {msg: "Not fully connected", element: o};
        }
        var conop = buildTreeFromGraphRecursive(connection.source);

        paramprio.push([prio, conop]);
    }

    var paramsorted = paramprio.sort(function (a, b) {
        return a[0] - b[0];
    });
    var retparam = [];
    for (var i = 0; i < paramsorted.length; i++)
    {
        retparam.push(paramsorted[i][1]);
    }

    if (optype === opCombineFunction)
    {
        return jo.data("combineObject");
    } else
    {

        return  newApply(optype, retparam);
    }

    console.log("incoming: ");
    console.log(incoming);
    console.log(o);
    console.log(optype);
}

var buildInterfaceShowing = false;

function createWidgetFromOp(op, name, description, buildFunc)
{
    var box = $('<div></div>').addClass("ui-widget-content ui-corner-all").zIndex(100)
            .css({minWidth: "50px", minHeight: "50px", width: "200px", margin: "auto", position: "absolute", padding: "10px"});
//    var box = $('<div></div>');
    box.append($('<h3>' + name + '</h3>'));
    box.append($('<div>' + description + '</div>'));

    var obj = new opCombineFunction(op);

    box.data("type", opCombineFunction);
    box.data("combineObject", obj);
    if (buildFunc)
        box.data("buildFunc", buildFunc);


    var closeButton = $('<button>Close</button>');
    closeButton.click(function ()
    {
        plumbInstance.remove(box);
        plumbInstance.repaintEverything();
    });
    var temp = $('<div>');
    closeButton.appendTo(temp);
    temp.appendTo(box);
    box.appendTo($('#plumbContainer'));
    plumbInstance.draggable(box);

    plumbInstance.addEndpoint(box, {endpoint: ["Rectangle", {}], isSource: true, isTarget: false, anchor: "Top"});
    
    box.position({my:"center", at:"center", of:window});
     plumbInstance.repaintEverything();
//    plumbInstance.repaintEverything();
//    box.zIndex(100);
//    box.css("position","absolute");
//    box.dialog({title: "ads", resizable: false, dialogClass: "no-close", closeOnEscape: false, width: "auto", height: "auto"});
    return box;
}

function createWidgetFromFunc(func)
{
    var doc = func.getDoc();
    if (!doc)
        return;
    var box = $('<div></div>').addClass("ui-widget-content ui-corner-all").zIndex(100)
            .css({minWidth: "50px", minHeight: "50px", width: "200px", margin: "auto", position: "absolute", padding: "10px"});
//    var box = $('<div></div>');
    box.append($('<h3>' + doc.name + '</h3>'));
    box.append($('<div>' + doc.description + '</div>'));

    var params = $('<div class="paramBox"></div>');
    box.data("type", func);
    var num = 0;
    console.log(doc.params);
    var i = 0;
    var endpointPrios = [];
    for (var pid in doc.params)
    {
        var p = doc.params[pid];
        if (p.type === DistanceFieldObject)
        {
            num++;
            endpointPrios.push(i);
            i++;
            continue;
        }
        console.log(p);
        var pbox = $('<div></div>');
        pbox.append('<span>' + p.name + '</span>');
        pbox.append(document.createTextNode(": "));
        pbox.append($('<input type="text" value=' + p.defaultValue + '></input>'));
        pbox.data("priority", i);
        i++;
        params.append(pbox);
    }

    box.append(params);

    var closeButton = $('<button>Close</button>');
    closeButton.click(function ()
    {
        plumbInstance.remove(box);
        plumbInstance.repaintEverything();
    });
    var temp = $('<div>');
    closeButton.appendTo(temp);
    temp.appendTo(box);
    box.appendTo($('#plumbContainer'));
    plumbInstance.draggable(box);

    plumbInstance.addEndpoint(box, {endpoint: ["Rectangle", {}], isSource: true, isTarget: false, anchor: "Top"});
    if (num === 1)
    {

        var point = plumbInstance.addEndpoint(box, {isSource: false, isTarget: true, anchor: "Bottom"});
        console.log(point);
        point.priority = endpointPrios[0];
    } else if (num === 2)
    {
        var point = plumbInstance.addEndpoint(box, {isSource: false, isTarget: true, anchor: "BottomLeft"});
        point.priority = endpointPrios[0];

        point = plumbInstance.addEndpoint(box, {isSource: false, isTarget: true, anchor: "BottomRight"});
        point.priority = endpointPrios[1];
    }
    box.position({my:"center", at:"center", of:window});
     plumbInstance.repaintEverything();
    
//    box.zIndex(100);
//    box.css("position","absolute");
//    box.dialog({title: "ads", resizable: false, dialogClass: "no-close", closeOnEscape: false, width: "auto", height: "auto"});
    return box;


}

function showExampleDialog()
{
    var buttons = [];


    var container = $('<div>');
    container.css("width", "200px");
//    for (var i in nodeFuncs)
//    {
//
//        buttons.push({
//            text: i,
//            click: function (i) {
//                return function () {
//
//                    createWidgetFromFunc(nodeFuncs[i]);
//                    container.dialog("destroy").remove();
//                };
//            }(i)
//        });
//    }



    for (var i in examples)
    {

        var example = examples[i];
        var button = $('<button>' + example.displayName + '</button>');
        button.css('margin', "5px");
        button.click(function (i) {
            var ex = example;

            return function () {

                createWidgetFromOp(ex.op, ex.name, ex.description, ex.buildFunc);
                container.dialog("destroy").remove();
            };
        }(i));

        container.append(button);


    }
//    container.append(objectContainer);
//    container.append(operationContainer);
//
////    container.dialog({title: "Nodes", modal: true,
////        buttons: buttons});
//    container.dialog({title: "Nodes", modal: true});
//
//
//    var container = $('<div>');
//    for (var i in examples)
//    {
//        var example = examples[i];
//
//        buttons.push({
//            text: example.displayName,
//            click: function (i) {
//                var ex = example;
//                return function () {
//
//                    createWidgetFromOp(ex.op, ex.name, ex.description, ex.buildFunc);
//                    container.dialog("destroy").remove();
//                };
//            }(i)
//        });
//    }


    container.dialog({title: "Examples", modal: true});
}

function createBuildDialog()
{
    
      
   if($('#buildBox').length)
   {
       $('#buildBox').dialog('open');
       return;
   }
   
   
    var container = $('<div id="buildBox"></div>');



    var button = $('<button>Build</button>');
    button.click(createTreeFromGraph);
    button.appendTo(container);

    button = $('<button>Add Node</button>');
    button.click(showAddNodeDialog);
    button.appendTo(container);


    button = $('<button>Add example</button>');
    button.click(showExampleDialog);
    button.appendTo(container);
    container.dialog({
        title: "Tools",
        resizable: false, 
        dialogClass: "no-close",
        closeOnEscape: false,
        width: "200px",
        height: "auto",
    position: {my:"right top",at:"right top",of:window,collision:"fit"}});

}
function createBoxWidget()
{
    var box = $('<div>Box</div>').addClass("ui-widget-content ui-corner-all").zIndex(1000)
            .css({width: "50px", height: "50px", margin: "auto", position: "fixed"});

    box.appendTo($('#plumbContainer'));

    plumbInstance.draggable(box);
    plumbInstance.addEndpoint(box, {isSource: false, isTarget: true, anchor: "TopLeft"});
    plumbInstance.addEndpoint(box, {endpoint: ["Rectangle", {}], isSource: false, isTarget: true, anchor: "TopRight"});
}

var showingHelpDialog = false;
function showHelpWindow()
{
    showingHelpDialog = true;
    $('#help').dialog({title: "Help", resizable: false, modal: true, width: "80%", height: "auto",
        close: function () {
            showingHelpDialog = false;
        }});
}
function showBuildWindow()
{
    if (buildInterfaceShowing)
    {
        return;
    }
    buildInterfaceShowing = true;

//    plumbInstance.repaintEverything();
    var overlay = $('<div id="overlay"></div>');
    overlay.css(
            {
                position: "fixed",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                backgroundColor: "rgba(0,0,0,0.85)"

            });
    overlay.zIndex(1);
    overlay.appendTo($('body'));
    createBuildDialog();
    $('#plumbContainer').show();
}
function hideBuildWindow()
{
    buildInterfaceShowing = false;
    $('#buildBox').dialog('close');
    $('#overlay').remove();
    $('#plumbContainer').hide();
}

var plumbInstance;
jsPlumb.bind("ready", function () {

    $('#help').hide();
    var container = $('<div id="plumbContainer"></div>');
    container.zIndex(100);
//     container.css({position:"absolute",width:"100%",height:"100%"});
    $('body').append(container);
    var prog = $('<div id="progRoot">Program</div>').
            addClass("ui-widget-content ui-corner-all").zIndex(100).
            css({minWidth: "50px", minHeight: "50px", position: "absolute", margin: "auto"});
    prog.css({top: "5px", left: '50%', 'margin-left': -prog.outerWidth() / 2});



    prog.appendTo(container);
    $("<style type='text/css'> ._jsPlumb_endpoint{ z-index:100;} </style>").appendTo("head");
    $("<style type='text/css'> ._jsPlumb_connector{ z-index:100;} </style>").appendTo("head");
    $('<style> .no-close .ui-dialog-titlebar-close {display: none;}</style>').appendTo("head");
    $('body').css({position: "absolute", width: "100%"});
//    prog.position({my: "center top", of: $('body'), at: "center top"});
    plumbInstance = jsPlumb.getInstance({
        // default drag options
        DragOptions: {cursor: 'pointer', zIndex: 3000},
        // the overlays to decorate each connection with.  note that the label overlay uses a function to generate the label text; in this
        // case it returns the 'labelText' member that we set on each connection in the 'init' method below.
        ConnectionOverlays: [
            ["Arrow", {location: 1}],
            ["Label", {
                    location: 0.1,
                    id: "label",
                    cssClass: "aLabel"
                }]
        ],
        Container: container
    });
    plumbInstance.importDefaults({
        Connector: ["Bezier", {curviness: 100}],
        Anchors: ["TopCenter", "BottomCenter"],
        ConnectorZIndex: 1000
    });

//  $('#plumb1').draggable();
    plumbInstance.addEndpoint(prog, {isSource: false, isTarget: true});
//    createBoxWidget();
//    createWidgetFromFunc(Box);
//    createWidgetFromFunc(Box);
//    createWidgetFromFunc(opScale);
//    createWidgetFromFunc(opTranslate);
//    createWidgetFromFunc(opUnion);

    var button;
    var buttonContainer;

    var renderOptionContainer = $('<div></div>');
    var objectColorContainer = $('<div></div>');
    var backgroundColorContainer = $('<div></div>');
    var lightingContainer = $('<div></div>');
    
    function toByte(v)
    {
        return Math.floor(255 * v);
    }
    var rInput = $('<input id="objectR" size="3" type="text" value=' + toByte(objectColor[0]) + '></input>');
    var gInput = $('<input id="objectG" size="3" type="text" value=' + toByte(objectColor[1]) + '></input>');
    var bInput = $('<input id="objectB" size="3" type="text" value=' + toByte(objectColor[2]) + '></input>');


    objectColorContainer.append($('<div><b> Object color</b></div>').css("margin","5px"));
    objectColorContainer.append(rInput);
    objectColorContainer.append(gInput);
    objectColorContainer.append(bInput);

    rInput = $('<input id="backgroundR" size="3" type="text" value=' + toByte(backgroundColor[0]) + '></input>');
    gInput = $('<input id="backgroundG" size="3" type="text" value=' + toByte(backgroundColor[1]) + '></input>');
    bInput = $('<input id="backgroundB" size="3" type="text" value=' + toByte(backgroundColor[2]) + '></input>');


    backgroundColorContainer.append($('<div><b>Background color</b></div>').css("margin","5px"));
    backgroundColorContainer.append(rInput);
    backgroundColorContainer.append(gInput);
    backgroundColorContainer.append(bInput);

    lightingContainer.append($('<div><b>Lighting</b></div>').css("margin","5px"));
    lightingContainer.append('<div> Diffuse: <input type="checkbox" name="doLighting" checked="true" value="lighting" id="doLightingBox"> </div>');
    lightingContainer.append('<div> Specular:<input type="checkbox" name="doSpecular" checked="true" value="specular" id="doSpecularBox"></div>');
    lightingContainer.append('<div>Light direction:</div>');
    lightingContainer.append('<input id="lightX" size="2" type="text" value=' + lightDirection[0] + '></input>');
    lightingContainer.append('<input id="lightY" size="2" type="text" value=' + lightDirection[1] + '></input>');
    lightingContainer.append('<input id="lightZ" size="2" type="text" value=' + lightDirection[2] + '></input>');

    
    lightingContainer.append($('<div><b>Other</b></div>').css("margin","5px"));
    lightingContainer.append($('<button>Reset Time</button>').click(function()
    {
        drawTime = Date.now();
        changed = true;
    }));
    
    function changeCanvasSize()
    {
        var diag = $('<div>');
        var cw = $('<div> Width: <input id="canvasWInput" size="4" type="text" value=' + canvas.width + '></input></div>');
        var ch =$('<div> Height: <input id="canvasHInput" size="4" type="text" value=' + canvas.height + '></input></div>');
        diag.append(cw);
        diag.append(ch);
        diag.append($('<button>Set size</button>').click(function()
        {
            var w = parseInt(cw.find('input').val());
            var h = parseInt(ch.find('input').val());

            if (isNaN(w) || isNaN(h))
            {
                
            }else
            {
                canvas.width = w;
                canvas.height = h;
                changed = true;
                
            }
            diag.dialog("destroy").remove();
        }));
        
        diag.dialog({title: "Examples", modal: true});
        
        
    }
    
    
    lightingContainer.append($('<button>Set canvas size</button>').click(changeCanvasSize));
    
    renderOptionContainer.append(objectColorContainer);
    renderOptionContainer.append(backgroundColorContainer);
    renderOptionContainer.append(lightingContainer);

    renderOptionContainer.find("input").keyup(function () {
        changed = true;
    });

    renderOptionContainer.dialog(
            {title: "Render options",
                resizable: true,
                dialogClass: "no-close",
                closeOnEscape: false,
                width: "200px",
                height: "auto",
            position: {my:"right bottom",at:"right bottom",of:window,collision:"fit"}});


    renderOptionContainer.find("input").bind('change', function () {
        changed = true;
    });

    buttonContainer = $('<div></div>');
    button = $('<button>Show build interface</button>');
    button.click(showBuildWindow);
    button.appendTo(buttonContainer);


    button = $('<button>Hide build interface</button>');
    button.click(hideBuildWindow);
    button.appendTo(buttonContainer);

    button = $('<button>Show Help</button>');
    button.click(showHelpWindow);
    button.appendTo(buttonContainer);



    buttonContainer.appendTo($('#plumbContainer'));

    buttonContainer.zIndex(2000);
    buttonContainer.dialog({
        title: "Menu",
        resizable: true, 
        dialogClass: "no-close", 
        closeOnEscape: false,
        width: "200px", 
        height: "auto",
    position: {my:"right bottom",at:"right center",of:window,collision:"fit"}});
    createBuildDialog();

    examples = createExamples();
    hideBuildWindow();
    showHelpWindow();
//    showBuildWindow();

});
