/*
    Copyright (c) 2013, Adriano Alves de Lima

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
    THE SOFTWARE.
*/

strXml = "<?xml version=\"1.0\" encoding=\"UTF-8\"?><kaos></kaos>";
if (window.DOMParser)
    xmlDoc = new DOMParser().parseFromString(strXml, "text/xml");
else // Internet Explorer
{
    xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
    xmlDoc.async = false;
    xmlDoc.loadXML(strXml);
}
$(function () {
	$( ".draggable" ).draggable({ scroll: true, cursor: "move", helper: "clone", tolerance: "fit" });
	intI = 0, intIdRequirement = 1, intIdObstacle = 1, intIdGoal = 1;

	window.jsPlumbDemo = {
		init : function() {

			jsPlumb.importDefaults({
				DragOptions : { cursor: 'move', zIndex:2000 },
				EndpointStyles : [{ fillStyle:'#225588' }, { fillStyle:'#558822' }],
				Endpoints : [ [ "Dot", {radius:7} ], [ "Dot", { radius:11 } ]],
				ConnectionOverlays : [
					[ "Arrow", { location:1 } ],
					[ "Label", { 
						location:0.1,
						id:"label",
						cssClass:"aLabel"
					}]
				]
			});		

			var connectorPaintStyle = {
				lineWidth:4,
				strokeStyle:"#deea18",
				joinstyle:"round",
				outlineColor:"#eaedef",
				outlineWidth:2
			},
			connectorHoverStyle = {
				lineWidth:4,
				strokeStyle:"#5C96BC",
				outlineWidth:2,
				outlineColor:"white"
			},
			endpointHoverStyle = {fillStyle:"#5C96BC"},
			sourceEndpoint = {
				endpoint:"Dot",
				paintStyle:{ 
					strokeStyle:"#1e8151",
					fillStyle:"transparent",
					radius:7,
					lineWidth:2 
				},				
				isSource:true,
				connector:[ "Flowchart", { stub:[40, 60], gap:10, cornerRadius:5, alwaysRespectStubs:true } ],								                
				connectorStyle:connectorPaintStyle,
				hoverPaintStyle:endpointHoverStyle,
				connectorHoverStyle:connectorHoverStyle,
                dragOptions:{},
				paintStyle:{ fillStyle:"#000",radius:5 },
                overlays:[
                	[ "Label", { 
	                	location:[0.5, 1.5], 
	                	label:"",
	                	cssClass:"endpointSourceLabel" 
	                } ]
                ]
			},
			targetEndpoint = {
				endpoint:"Dot",					
				paintStyle:{ 
					strokeStyle:"#000",
					fillStyle:"transparent",
					radius:7,
					lineWidth:3 
				},
				hoverPaintStyle:endpointHoverStyle,
				maxConnections:-1,
				dropOptions:{ hoverClass:"hover", activeClass:"active" },
				isTarget:true,			
                overlays:[
                	[ "Label", { location:[0.5, -0.5], label:"", cssClass:"endpointTargetLabel" } ]
                ]
			},			
			init = function(connection) {
				connection.getOverlay("label").setLabel(connection.sourceId.substring(6) + "-" + connection.targetId.substring(6));
				connection.bind("editCompleted", function(o) {
					if (typeof console != "undefined")
						console.log("connection edited. path is now ", o.path);
				});
			};			

			var _addEndpoints = function(toId, sourceAnchors, targetAnchors) {
				for (var intN = 0; intN < sourceAnchors.length; intN++) {
					var sourceUUID = toId + sourceAnchors[intN];
					jsPlumb.addEndpoint(toId, sourceEndpoint, { anchor:sourceAnchors[intN], uuid:sourceUUID });						
				}
				for (var intJ = 0; intJ < targetAnchors.length; intJ++) {
					var targetUUID = toId + targetAnchors[intJ];
					jsPlumb.addEndpoint(toId, targetEndpoint, { anchor:targetAnchors[intJ], uuid:targetUUID });						
				}
			};

			jsPlumb.bind("connection", function(connInfo, originalEvent) { 
				init(connInfo.connection);
			});			

			jsPlumb.draggable(jsPlumb.getSelector(".objects"), { grid: [20, 20] });

			$( "#containment-wrapper" ).droppable({
				drop: function( event, ui ) {
					if($( ui.draggable).attr("class").indexOf("discharged") < 0)
					{
						var addedElement = ui.helper.clone();
						addedElement.attr("id", intI++);
						ui.helper.remove();

						if (addedElement.hasClass("requirement")) {
							var requirement = xmlDoc.createElement("requisito");
							requirement.setAttribute("id", intIdRequirement);
							requirement.setAttribute("novo", true);
							requirement.setAttribute("texto", "Requisito");
							xmlDoc.getElementsByTagName("kaos")[0].appendChild(requirement);
						    addedElement.data("id-requirement", intIdRequirement++);
						}
						else if (addedElement.hasClass("goal")) {
							var goal = xmlDoc.createElement("meta");
							goal.setAttribute("id", intIdGoal);
							goal.setAttribute("novo", true);
							goal.setAttribute("texto", "Meta");
							xmlDoc.getElementsByTagName("kaos")[0].appendChild(goal);
						    addedElement.data("id-goal", intIdGoal++);
						}
						else {
							var obstacle = xmlDoc.createElement("obstaculo");
							obstacle.setAttribute("id", intIdObstacle);
							obstacle.setAttribute("novo", true);
							obstacle.setAttribute("texto", "Obstáculo");
							xmlDoc.getElementsByTagName("kaos")[0].appendChild(obstacle);
						    addedElement.data("id-obstacle", intIdObstacle++);
						}
						$("#txtXML").html(new XMLSerializer().serializeToString(xmlDoc));

						addedElement.removeClass("margin-left-40px").draggable({ helper: 'original', containment: "#containment-wrapper", scroll: true, cursor: "move", tolerance: "fit" }).addClass("discharged").appendTo("#containment-wrapper");
						_addEndpoints(addedElement.attr("id"), ["TopCenter", "BottomCenter", "LeftMiddle", "RightMiddle"], ["TopLeft", "TopRight", "BottomLeft", "BottomRight"]);
						addedElement.dblclick(function () {
							var strText = prompt("Informe a descrição do objeto", $(this).html()), strAttribute = "";
							$(this).html(strText);
							var elements = null;
							if($(this).hasClass("obstacle"))
							{
								strAttribute = "id-obstacle";
								elements = xmlDoc.getElementsByTagName("obstaculo");
							}
							else if($(this).hasClass("requirement"))
							{
								strAttribute = "id-requirement";
								elements = xmlDoc.getElementsByTagName("requisito");
							}
							else
							{
								strAttribute = "id-goal";
								elements = xmlDoc.getElementsByTagName("meta");
							}

							for(var intT = 0; intT < elements.length; intT++)
								if(elements[intT].getAttribute("id") == $(this).data(strAttribute))
									elements[intT].setAttribute("texto", strText);

							$("#txtXML").html(new XMLSerializer().serializeToString(xmlDoc));
						});
						addedElement.on("click", function () {
						    if ($(this).hasClass("item-selected"))
							{
							    $(this).removeClass("item-selected");
								$("._jsPlumb_endpoint").show();
							}
							else
							{
							    $(this).addClass("item-selected");
								$("._jsPlumb_endpoint").hide();
							}
							jsPlumb.repaintEverything();
						});
						addedElement.on("blur", function () {
						    $(this).removeClass("item-selected");
							$("._jsPlumb_endpoint").hide();
							jsPlumb.repaintEverything();
						});

						addedElement.mouseover(function () {
							$("._jsPlumb_endpoint").show();
							jsPlumb.repaintEverything();
						});
					}
					$("._jsPlumb_endpoint").hide();
					jsPlumb.repaintEverything();
				}
			});
			
			jsPlumb.bind("click", function (conn, originalEvent) {
			    var $target = $("#" + conn.targetId);
			    var kaosNode = xmlDoc.getElementsByTagName("kaos")[0];
			    if ($target.hasClass("goal")) {
			        var goals = xmlDoc.getElementsByTagName("meta");
			        for (var intT = 0; intT < goals.length; intT++)
			            if (goals[intT].getAttribute("id") == $target.data("id-goal")) {
			                var parentNode = goals[intT].parentNode;
			                while (goals[intT].hasChildNodes()) {
			                    var clonedNode = goals[intT].lastChild.cloneNode(true);
			                    goals[intT].removeChild(goals[intT].lastChild);
			                    kaosNode.appendChild(clonedNode);
			                }
			                parentNode.removeChild(goals[intT]);
			            }
			    }
			    else if ($target.hasClass("requirement")) {
			        var requirements = xmlDoc.getElementsByTagName("requisito");
			        for (var intT = 0; intT < requirements.length; intT++)
			            if (requirements[intT].getAttribute("id") == $target.data("id-requirement")) {
			                var parentNode = requirements[intT].parentNode;
			                while (requirements[intT].hasChildNodes()) {
			                    var clonedNode = requirements[intT].lastChild.cloneNode(true);
			                    requirements[intT].removeChild(requirements[intT].lastChild);
			                    kaosNode.appendChild(clonedNode);
			                }
			                parentNode.removeChild(requirements[intT]);
			            }
			    }
			    else {
			        var obstacles = xmlDoc.getElementsByTagName("obstaculo");
			        for (var intT = 0; intT < obstacles.length; intT++)
			            if (obstacles[intT].getAttribute("id") == $target.data("id-obstacle")) {
			                var parentNode = obstacles[intT].parentNode;
			                while (obstacles[intT].hasChildNodes()) {
			                    var clonedNode = obstacles[intT].lastChild.cloneNode(true);
			                    obstacles[intT].removeChild(obstacles[intT].lastChild);
			                    kaosNode.appendChild(clonedNode);
			                }
			                parentNode.removeChild(obstacles[intT]);
			            }
			    }
			    $("#txtXML").html(new XMLSerializer().serializeToString(xmlDoc));
				jsPlumb.detach(conn);
			});	

			jsPlumb.bind("connectionDrag", function(connection) {
				console.log("connection " + connection.id + " is being dragged. suspendedElement is ", connection.suspendedElement, " of type ", connection.suspendedElementType);
			});		

			jsPlumb.bind("connectionDragStop", function(connection) {
				var $source = $("#" + connection.sourceId), $target = $("#" + connection.targetId), intQtyConnections = 0;
				if ($source.hasClass("goal") && $target.hasClass("requirement"))
				{
					alert("Uma meta não pode ser \"filha\" de um requisito no modelo KAOS");
					jsPlumb.detach(connection);
					return;
				}
				else if ($source.hasClass("goal") && $target.hasClass("obstacle"))
				{
					alert("Uma meta não pode ser \"filha\" de um obstáculo no modelo KAOS");
					jsPlumb.detach(connection);
					return;
				}
				else if($source.hasClass("requirement") && $target.hasClass("obstacle"))
				{
					alert("Um requisito não pode ser \"filho\" de um obstáculo no modelo KAOS");
					jsPlumb.detach(connection);
					return;
				}
				$.each(jsPlumb.getAllConnections(), function(index, item){
					if(item.sourceId == connection.sourceId && item.targetId == connection.targetId)
					    intQtyConnections++;

					if (intQtyConnections > 1)
					{
						alert("O modelo KAOS não contempla duas conexões entre os mesmos objetos");
						jsPlumb.detach(connection);
						return;
					}
				});

				if ($source.hasClass("requirement") && $target.hasClass("goal"))
				{
					var requirements = xmlDoc.getElementsByTagName("requisito");
					var requirement = null;
					for(var intT = 0; intT < requirements.length; intT++)
						if(requirements[intT].getAttribute("id") == $source.data("id-requirement"))
						{
							var parentNode = requirements[intT].parentNode;
							requirement = requirements[intT].cloneNode(true);
							parentNode.removeChild(requirements[intT]);
							break;
						}
					var goals = xmlDoc.getElementsByTagName("meta");
					for(var intT = 0; intT < goals.length; intT++)
						if(goals[intT].getAttribute("id") == $target.data("id-goal"))
						{
							goals[intT].appendChild(requirement);
							break;
						}
				}
				else if ($source.hasClass("goal") && $target.hasClass("goal")) {
					var goals = xmlDoc.getElementsByTagName("meta");
					var goal = null;
					for(var intT = 0; intT < goals.length; intT++)
						if(goals[intT].getAttribute("id") == $source.data("id-goal"))
						{
							var parentNode = goals[intT].parentNode;
							goal = goals[intT].cloneNode(true);
							parentNode.removeChild(goals[intT]);
							break;
						}
					var goalsParents = xmlDoc.getElementsByTagName("meta");
					for(var intT = 0; intT < goalsParents.length; intT++)
						if(goalsParents[intT].getAttribute("id") == $target.data("id-goal"))
						{
							goalsParents[intT].appendChild(goal);
							break;
						}
				}
				else if ($source.hasClass("obstacle")) {
				    var obstacles = xmlDoc.getElementsByTagName("obstaculo");
					var obstacle = null;
					for(var intT = 0; intT < obstacles.length; intT++)
						if(obstacles[intT].getAttribute("id") == $source.data("id-obstacle"))
						{
							var parentNode = obstacles[intT].parentNode;
							obstacle = obstacles[intT].cloneNode(true);
							parentNode.removeChild(obstacles[intT]);
						}

				    if($target.hasClass("goal")) {
						var goals = xmlDoc.getElementsByTagName("meta");
						for(var intT = 0; intT < goals.length; intT++)
							if(goals[intT].getAttribute("id") == $target.data("id-goal"))
							{
								goals[intT].appendChild(obstacle);
								break;
							}
				    }
				    else if ($target.hasClass("requirement")) {
						var requirements = xmlDoc.getElementsByTagName("requisito");
						for(var intT = 0; intT < requirements.length; intT++)
							if(requirements[intT].getAttribute("id") == $target.data("id-requirement"))
							{
								requirements[intT].appendChild(obstacle);
								break;
							}
				    }
				}
				$("#txtXML").html(new XMLSerializer().serializeToString(xmlDoc));
			});
		}
	};

	jsPlumb.bind("ready", function() {
		var resetRenderMode = function(desiredMode) {
			var newMode = jsPlumb.setRenderMode(desiredMode);
			$(".rmode").removeClass("selected");
			$(".rmode[mode='" + newMode + "']").addClass("selected");		

			$(".rmode[mode='svg']").attr("disabled", !jsPlumb.isSVGAvailable());

			jsPlumbDemo.init();
		};

		$(".rmode").bind("click", function() {
			var desiredMode = $(this).attr("mode");
			if (jsPlumbDemo.reset) jsPlumbDemo.reset();
			jsPlumb.reset();
			resetRenderMode(desiredMode);					
		});	

		resetRenderMode(jsPlumb.SVG);
	});

	$('html').on("keyup", function(e){
	    if (e.keyCode == 46) {
	        $.each($("*[class*=item-selected]"), function (index, item) {
				var kaosNode = xmlDoc.getElementsByTagName("kaos")[0];
	            if ($(item).hasClass("goal")) {
					var goals = xmlDoc.getElementsByTagName("meta");
					for(var intT = 0; intT < goals.length; intT++)
						if(goals[intT].getAttribute("id") == $(item).data("id-goal"))
						{
							var parentNode = goals[intT].parentNode;
							while(goals[intT].hasChildNodes())
							{
								var clonedNode = goals[intT].lastChild.cloneNode(true);
								goals[intT].removeChild(goals[intT].lastChild);
								kaosNode.appendChild(clonedNode);
							}
							parentNode.removeChild(goals[intT]);
						}
	            }
	            else if ($(item).hasClass("requirement")) {
	                var requirements = xmlDoc.getElementsByTagName("requisito");
					for(var intT = 0; intT < requirements.length; intT++)
						if(requirements[intT].getAttribute("id") == $(item).data("id-requirement"))
						{
							var parentNode = requirements[intT].parentNode;
							while(requirements[intT].hasChildNodes())
							{
								var clonedNode = requirements[intT].lastChild.cloneNode(true);
								requirements[intT].removeChild(requirements[intT].lastChild);
								kaosNode.appendChild(clonedNode);
							}
							parentNode.removeChild(requirements[intT]);
						}
	            }
	            else {
	                var obstacles = xmlDoc.getElementsByTagName("obstaculo");
					for(var intT = 0; intT < obstacles.length; intT++)
						if(obstacles[intT].getAttribute("id") == $(item).data("id-obstacle"))
						{
							var parentNode = obstacles[intT].parentNode;
							while(obstacles[intT].hasChildNodes())
							{
								var clonedNode = obstacles[intT].lastChild.cloneNode(true);
								obstacles[intT].removeChild(obstacles[intT].lastChild);
								kaosNode.appendChild(clonedNode);
							}
							parentNode.removeChild(obstacles[intT]);
						}
	            }
	            jsPlumb.removeAllEndpoints($(item).attr("id")); jsPlumb.repaintEverything();
	        });
			$("#txtXML").html(new XMLSerializer().serializeToString(xmlDoc));
			$("*[class*=item-selected]").remove();
	    }
	});
});

function exportXML() {
    window.open('data:text/xml;charset=utf-8,' + new XMLSerializer().serializeToString(xmlDoc));
}
