$(function() {
    var canvas = $('#canvas')[0];
	var context = canvas.getContext('2d');
    var fogCanvas = document.createElement('canvas');
    fogCanvas.height=120;
    fogCanvas.width=120;
    var fogContext = fogCanvas.getContext('2d');
    //document.body.appendChild(fogCanvas);
    
    	
	var mouse = {
	    x:0,
	    y:0,
	    gridX:0,
	    gridY:0,
	    realX:0,
	    realY:0,
	    cursor:null,
	    cursorLoop:0,
	    cursorSpeed:1,
	    panDirection:"",
	    panningThreshold:60,
        panningVelocity:24,
	    loaded:true,
	    totalCount:0,
	    loadedCount:0,
	    insideCanvas:false,
	    cursors:[],
	    loadImg:function(url){
            var img = new Image();
            mouse.totalCount++;
            mouse.loaded = false;
            img.src = url;
            $(img).bind('load',function() {
                mouse.loadedCount++;
                if(mouse.loadedCount == mouse.totalCount){
                    mouse.loaded = true;
                }
                
            });
            return img;      
        },
	    loadCursor: function(name,x,y,count,cursorSpeed){
	        var imageArray= [];
	        if(!count){
	            imageArray.push(this.loadImg('cursors/'+name+'.png'));
	        } else {
	            for (var j=1; j <= count  ; j++) {
                    imageArray.push(this.loadImg('cursors/'+name+'-'+j+'.png'));   
                }
	        }
	        if (!cursorSpeed){
	            cursorSpeed = 1;
	        }
	        if (!x && !y) {
	            x = 0;
	            y = 0;
	        }
	        
	        this.cursors[name] = {x:x,y:y,name:name,images:imageArray,cursorSpeed:cursorSpeed};
	       
	    },
	    loadCursors: function(){
            // simple list no hotspots
            mouse.loadCursor('default');
            mouse.loadCursor('no_default');
            mouse.loadCursor('move',15,12);
            mouse.loadCursor('no_move',15,12);
            

            //Hot spots based on size of 30 24;  30,24
            mouse.loadCursor('pan_top', 15,0);
            mouse.loadCursor('pan_top_right', 30,0);
            mouse.loadCursor('pan_right', 30,12);
            mouse.loadCursor('pan_bottom_right',30,24); 
            mouse.loadCursor('pan_bottom', 15,24); 
            mouse.loadCursor('pan_bottom_left',0,24); 
            mouse.loadCursor('pan_left',0,12); 
            mouse.loadCursor('pan_top_left',0,0);

            mouse.loadCursor('no_pan_top', 15,0);
            mouse.loadCursor('no_pan_top_right', 30,0);
            mouse.loadCursor('no_pan_right', 30,12);
            mouse.loadCursor('no_pan_bottom_right',30,24); 
            mouse.loadCursor('no_pan_bottom', 15,24); 
            mouse.loadCursor('no_pan_bottom_left',0,24); 
            mouse.loadCursor('no_pan_left',0,12); 
            mouse.loadCursor('no_pan_top_left',0,0);
            
            mouse.loadCursor('no_repair',15,0);
            mouse.loadCursor('no_sell',15,12);
            
            // hot spot with multiple images
            mouse.loadCursor('build_command',15,12,8);
            mouse.loadCursor('sell',15,12,24);
            mouse.loadCursor('repair',15,0,24);
            mouse.loadCursor('attack',15,12,8);
            mouse.loadCursor('big_detonate',15,12,3);
            mouse.loadCursor('detonate',15,12,3);
            mouse.loadCursor('load_vehicle',15,12,3);
            mouse.loadCursor('select',15,12,6,1);
            
	    },
	    drawCursor:function(){
	        if (!mouse.insideCanvas){
	            return;
	        }
	        this.cursorLoop ++;
	        if(this.cursorLoop >= mouse.cursor.cursorSpeed*mouse.cursor.images.length){
                this.cursorLoop = 0;
            }
           
            image = this.cursor.images[Math.floor(this.cursorLoop/mouse.cursor.cursorSpeed)];
            context.drawImage(image,mouse.x-mouse.cursor.x,mouse.y-mouse.cursor.y);
            
            
            if (mouse.dragSelect){
			    var x = mouse.dragX-game.viewportX;
			    var y = mouse.dragY-game.viewportY;
			    context.strokeStyle = 'white';
			    context.strokeRect( x,y, mouse.x-x, mouse.y-y);
			}
	    },
	    showAppropriateCursor:function(){
	        var cursorOnUnit = game.pointOverUnit(mouse.realX,mouse.realY);
	        var cursorOnBuilding = game.pointOverBuilding(mouse.realX,mouse.realY);
	        var movablesSelected = false;
	        
	        
	        
	        
	        for (var i = game.selectedItems.length - 1; i >= 0; i--){
	           if(game.selectedItems[i].type == 'infantry' || game.selectedItems[i].type == 'vehicle'){
	               movablesSelected = true;
	               break;
	           }
	        };
	        if (mouse.dragSelect){
	            mouse.cursor = mouse.cursors['default'];
	        } else if (mouse.x > game.viewportWidth){
    	        mouse.cursor = mouse.cursors['default'];
    	    } else if (sidebar.sellMode){
    	        if (cursorOnBuilding){
    	            mouse.cursor = mouse.cursors['sell'];
    	        } else {
    	            mouse.cursor = mouse.cursors['no_sell'];
    	        }
    	    } else if (sidebar.repairMode){
    	        if(cursorOnBuilding){
        	        mouse.cursor = mouse.cursors['repair'];
        	    } else {
        	        mouse.cursor = mouse.cursors['no_repair'];
        	    }
        	} else if (sidebar.deployMode){
        	    var buildingType = buildings.types[sidebar.deployBuilding];
        	    var grid = buildingType.gridShape;
        	    for (var y=0; y < grid.length; y++) {
        	       for (var x=0; x < grid[y].length; x++) {
        	           if(grid[y][x] == 1){
        	               if (game.mapGrid[mouse.gridY+y][mouse.gridX+x] == 1){
        	                   game.highlightGrid(mouse.gridX+x,mouse.gridY+y,1,1,sidebar.placementRed);
        	                } else {
        	                    game.highlightGrid(mouse.gridX+x,mouse.gridY+y,1,1,sidebar.placementWhite);
        	                }
                        }
        	       }
        	    }
        	} else if (cursorOnBuilding){       	    
                if (!cursorOnBuilding.selected){
        	        mouse.cursor = mouse.cursors['select'];
        	    } else {
        	        mouse.cursor = mouse.cursors['default'];
        	    }   
        	} else if (cursorOnUnit){       	    
        	    if(cursorOnUnit.name =='mcv' && cursorOnUnit.selected && game.selectedItems.length == 1
                    && buildings.canConstruct('factory',
                    Math.floor((cursorOnUnit.x-cursorOnUnit.currentImage.width/2)/game.gridSize),
                    Math.floor((cursorOnUnit.y)/game.gridSize))
                    ){
        	        mouse.cursor = mouse.cursors['build_command'];
        	    } /*else if(cursorOnUnit.name =='apc' && cursorOnUnit.selected && game.selectedItems.length == 1){
        	        mouse.cursor = mouse.cursors['load_vehicle'];
        	    } */else if (!cursorOnUnit.selected){
        	        mouse.cursor = mouse.cursors['select'];
        	    } else {
        	        mouse.cursor = mouse.cursors['default'];
        	    }   
        	} else if (game.selectedItems.length>0 && movablesSelected){
         	    if(level.hasObstacle(mouse.gridX,mouse.gridY)){
        	        mouse.cursor = mouse.cursors['no_move'];
        	    } else {
        	        mouse.cursor = mouse.cursors['move'];
        	    }
        	    
        	} else if (mouse.panDirection && mouse.panDirection != ""){
	            mouse.cursor = mouse.cursors[mouse.panDirection];
	        } else {
	            mouse.cursor = mouse.cursors['default'];	            
	        }
	        mouse.drawCursor();
	    },
	    buttonPressed :false,
	    dragX:0,
	    dragY:0,
	    dragSelect:false,
	    listenEvents:function(){
	        // blank out the crappy browser cursor. we will draw our own
	        
	        $('#canvas').mousemove(function(ev) {
	            var offset = $('#canvas').offset();
    			mouse.x = ev.pageX - offset.left;
    			mouse.y = ev.pageY - offset.top;  
    			mouse.gridX = Math.floor((mouse.x +game.viewportX) / game.gridSize);
    			mouse.gridY = Math.floor((mouse.y+ game.viewportY) / game.gridSize);
    			mouse.realX = mouse.x + game.viewportX;
    			mouse.realY = mouse.y + game.viewportY;
    			//mouse.panDirection = mouse.handlePanning();
    			//mouse.showAppropriateCursor();
    			if (mouse.buttonPressed){
    			    if (Math.abs(mouse.dragX -mouse.x - game.viewportX) > 10 ||
    			        Math.abs(mouse.dragY - mouse.y - game.viewportY) > 10){
    			            mouse.dragSelect = true
    			        }
    			} else {
    			    mouse.dragSelect = false;
    			}         

	        });
	        $('#canvas').click(function(ev) {
	            var selectedUnit = game.pointOverUnit(mouse.realX,mouse.realY);
	            var selectedBuilding = game.pointOverBuilding(mouse.realX,mouse.realY);
                if(selectedUnit){
                    units.click(selectedUnit,ev);
                } else if(selectedBuilding){
                    buildings.click(selectedBuilding,ev);
                } else if (mouse.dragSelect && !mouse.buttonPressed){
                    mouse.dragSelect = false;
                } else if (sidebar.deployMode && mouse.x<game.viewportWidth){
                    if (buildings.canConstruct(sidebar.deployBuilding,mouse.gridX,mouse.gridY)){
                        game.addBuilding({name:sidebar.deployBuilding,x:mouse.realX,y:mouse.realY});
                        sidebar.finishDeploying();                        
                    } else {
                        sounds.play('cannot_deploy_here');
                    }
                } else if (mouse.x<game.viewportWidth){
                    for (var i = game.selectedItems.length - 1; i >= 0; i--){
                        var unit = game.selectedItems[i];
                        if ((unit.type == 'infantry' || unit.type == 'vehicle') && !level.hasObstacle(mouse.gridX,mouse.gridY)){
                            unit.destinationX = mouse.realX;
                            unit.destinationY = mouse.realY;
                            sounds.play(unit.type+'_move');
                        } 
                    }
                } else if (mouse.x>game.viewportWidth){
                    sidebar.click(false);
                    // check for button click
                    // create units and stuff 
                    
                }
	            return false;
	        });
	        
	        $('#canvas').mousedown(function(ev) {
	            if(ev.which == 1){
	                mouse.buttonPressed = true;
	                mouse.dragX = mouse.realX;
	                mouse.dragY = mouse.realY;
	                ev.preventDefault();
	            }
	            
	            return false;
	        });
	        
	        $('#canvas').bind('contextmenu',function(ev){
	            sidebar.repairMode = false;
	            sidebar.sellMode = false;
	            sidebar.deployMode = false;
	            if (mouse.x>game.viewportWidth){
                    sidebar.click(true);
                }
	            return false;
	        });
	        $('#canvas').mouseup(function(ev) {
	            if(ev.which ==1){
	                if (mouse.dragSelect){
	                    if (!ev.shiftKey){
    			            game.deselectAll();
    			        }
    			        for (var i = game.units.length - 1; i >= 0; i--){
    			            var unit = game.units[i];
    			            if((unit.x-mouse.dragX)*(unit.x -mouse.realX)<=0 
    			                && (unit.y-mouse.dragY)*(unit.y-mouse.realY)<=0){
    			                unit.selected = true;
    			                sounds.play('unit_select');
    			                game.selectedItems.push(unit);
    			            }
    			        }
	                }
	                mouse.buttonPressed = false;
	                //mouse.dragSelect = true;
	            }
	            return false;
	        });
	        
	        $('#canvas').mouseleave(function(ev) {
	            mouse.insideCanvas = false;
	            //mouse.buttonPressed = false;
	            //mouse.dragSelect = false;
	        });
	        $('#canvas').mouseenter(function(ev) {
	            /*if (ev.which==1){
	                //mouse.buttonPressed = true;
	            } else {
	                mouse.buttonPressed = false;
	            }*/
	            mouse.buttonPressed = false;
	            mouse.insideCanvas = true;
	        });
        },
        handlePanning:function() {
            var panDirection = "";
            if(mouse.insideCanvas){
                if(mouse.y < mouse.panningThreshold && mouse.x < game.viewportWidth) {
        			game.viewportDeltaY = -mouse.panningVelocity;
        			panDirection += "_top";
        		} else if (mouse.y > canvas.height-mouse.panningThreshold && mouse.x < game.viewportWidth){
        			game.viewportDeltaY = mouse.panningVelocity;
        			panDirection += "_bottom";
        		} else {
        			game.viewportDeltaY = 0;
        			panDirection += "";
        		}   
    		
                if(mouse.x < mouse.panningThreshold && mouse.x>0) {
        			game.viewportDeltaX = -mouse.panningVelocity;
        			panDirection += "_left";
        		} else if (mouse.x > game.viewportWidth-mouse.panningThreshold && mouse.x<game.viewportWidth){
        			game.viewportDeltaX = mouse.panningVelocity;
        			panDirection += "_right";
        		} else {
        			game.viewportDeltaX = 0;
        			panDirection += "";
    		    }
		    }
    		
    		if ((game.viewportX+game.viewportDeltaX < 0)
    		    || (game.viewportX+game.viewportDeltaX +game.viewportWidth> level.map.width)){
    			game.viewportDeltaX = 0;
    		} 
    		
    		if ((game.viewportY + game.viewportDeltaY< 0)
    		    || (game.viewportY+game.viewportDeltaY +game.viewportHeight> level.map.height)){
    			game.viewportDeltaY = 0;
    		} 		 	
    		
    		if (panDirection != ""){
    		    if(game.viewportDeltaX == 0 && game.viewportDeltaY == 0){
    		        panDirection = "no_pan"+panDirection; 
    		    } else {
    		        panDirection = "pan"+panDirection;
    		    }
    		}	
    		mouse.panDirection = panDirection;    
        }
    }
    
    var game = {
	    viewportWidth:480,
	    viewportHeight:480,
    	viewportX:0,
    	viewportY:0,
    	viewportDeltaX:0,
    	viewportDeltaY:0,
    	gridSize:24,
    	
    	frames:0,
    	animationLoop:null,
    	animationTimeout:48,

    	setViewport:function(){
    	    context.beginPath();
    	    context.rect(0,0,this.viewportWidth,this.viewportHeight);
    	    context.clip();
    	}, 
    	units:[],
    	selectedItems:[],
    	deselectAll: function(){
    	    for (var i = game.selectedItems.length - 1; i >= 0; i--){
    	       game.selectedItems[i].selected = false;
    	    }
    	    game.selectedItems = [];
    	},
    	movementAdjustment : 12,
    	turnAdjustment : 2,
    	click: function(ev,rightClick){
    	    // do nothing
    	},
    	moveUnits: function(){

    	    for (var i = game.units.length - 1; i >= 0; i--){
    	        var unit = game.units[i];
    	        
    	        if (unit.scripted){
    	            var currentAction = unit.script[0];
	                //alert(currentAction.action);
	                if (currentAction.action=='move'){
	                    
	                    unit.destinationX = currentAction.destinationX;
	                    unit.destinationY = currentAction.destinationY;
	                    unit.deltaX = currentAction.deltaX;
	                    unit.deltaY = currentAction.deltaY;
	                    unit.direction = currentAction.direction;
	                    unit.x += unit.deltaX * unit.speed/game.movementAdjustment;
	                    unit.y += unit.deltaY * unit.speed/game.movementAdjustment;
	                    //alert(unit.x +' '+unit.y + ' '+unit.speed +' '+unit.destinationY)
	                    if (Math.abs(unit.destinationX-unit.x) < unit.speed 
	                    && Math.abs(unit.destinationY-unit.y) < unit.speed){
	                        unit.deltaX = 0;
	                        unit.deltaY = 0;
	                        unit.script.splice(0,1);
	                        //alert (unit.script.length);
	                        
	                    }
	                } else if (currentAction.action == 'destroy'){
	                        //unit.script.splice(0,1);
	                        unit.status = 'destroy';
	                } else if (currentAction.action == 'wait'){
	                    currentAction.counter --;
	                    if (currentAction.counter<=0){
	                        unit.script.splice(0,1);
	                    }
	                }else if (currentAction.action == 'unload'){
	                    for (var j = currentAction.units.length - 1; j >= 0; j--){
	                       game.addUnit(currentAction.units[j]);
	                       delete unit.carrying;
	                    };
	                    unit.script.splice(0,1);
	                } else if( currentAction.action == 'load'){
	                    unit.carrying = currentAction.carrying;
	                    unit.script.splice(0,1);
	                } else if (currentAction.action == 'sound'){
	                    sounds.play(currentAction.sound);
	                    unit.script.splice(0,1);
	                } else {
	                    // get rid of unknown actions
	                    unit.script.splice(0,1);
	                }
	                break;
	            }

        	        if (unit.destinationX != null){
        	            units.pathfind(unit);
        	        } 
        	        unit.currentAngle = Math.round( (90+(unit.direction/32)*360)%360);
        	        /*if (unit.currentAngle > 180){
        	            unit.currentAngle = unit.currentAngle - 360;
        	        }*/
        	        if (unit.deltaX || unit.deltaY){   
        	            unit.destinationAngle = Math.round(Math.atan2(-unit.deltaY,unit.deltaX) * 180/Math.PI);
        	            if (unit.destinationAngle <0 ){
        	                unit.destinationAngle = 360 + unit.destinationAngle;
        	            }
    	            } 
    	            if (unit.status=='build' && unit.name=='mcv'){
    	                unit.destinationAngle = 248;
    	                if ((unit.currentAngle) == (unit.destinationAngle)){
                            unit.status = 'destroy';
                            game.addBuilding({name:'factory',x:unit.x -unit.currentImage.width/2,y:unit.y});
                        }
                    }
	            

	            
        	        var unitType = units.types[unit.type];
        	        if (unit.deltaX || unit.deltaY){    	            
        	            if ((unit.currentAngle == unit.destinationAngle)){
        	                var unitNewPosition = game.pointOverUnit(unit.x+Math.round(unit.deltaX * unit.speed/game.movementAdjustment),
        	                    unit.y +Math.round(unit.deltaY * unit.speed/game.movementAdjustment));
        	                if (!(unitNewPosition && unitNewPosition != unit)){
        	                    var diagonalMove = (unit.deltaX !=0  && unit.deltaY != 0)?1.4:1;
        	                    unit.x += Math.round(unit.deltaX * unit.speed/game.movementAdjustment/diagonalMove);
            	                unit.y += Math.round(unit.deltaY * unit.speed/game.movementAdjustment/diagonalMove);
            	            }
        	            }
        	        }
    	         
                    if ((unit.destinationAngle>unit.currentAngle && unit.destinationAngle - unit.currentAngle <= 180)
                        || (unit.destinationAngle<unit.currentAngle && unit.currentAngle - unit.destinationAngle >= 180)){
                        unit.direction++;
    	                if (unit.direction>31){
    	                    unit.direction = 0;
                        }
                    } else if ((unit.destinationAngle < unit.currentAngle && unit.currentAngle - unit.destinationAngle < 180)
                            ||(unit.destinationAngle>unit.currentAngle && unit.destinationAngle - unit.currentAngle > 180)){
                        unit.direction--;
    	                if (unit.direction<0){
    	                    unit.direction = 31;
                        } 
                    }
                
                
                        
        	        unit.gridX = Math.floor(unit.x/game.gridSize);
        	        unit.gridY = Math.floor(unit.y/game.gridSize);
             
    	    } 
    	},
    	addUnit: function(details){
    	    var unitType = units.types[details.name];
    	    //alert(unitType.type)
    	    var newUnit = {
    	        team:level.team,
    	        x:0,
    	        y:0,
    	        selected:false,
    	        name:details.name,
    	        direction: Math.floor(32*Math.random()),
    	        type:unitType.type,
    	        mode:'GUARD',
    	        destinationX:null,
    	        destinationY:null,
    	        deltaX:0,
    	        deltaY:0,
    	        deltaDirection:0,
    	        health:unitType.hitPoints,
    	        speed:unitType.speed
    	        
    	    };
    	    $.extend(newUnit,details);
    	    newUnit.gridX = Math.floor(newUnit.x/game.gridSize);
	        newUnit.gridY = Math.floor(newUnit.y/game.gridSize);
    	    game.units.push(newUnit);
    	    
    	},
    	buildings:[],
    	addBuilding: function(details){
    	    var buildingType = buildings.types[details.name];
    	    var newBuilding = {
    	        team:level.team,
    	        x:0,
    	        y:0,
    	        selected:false,
    	        name:details.name,
    	        type:'building',
    	        animationSpeed:buildingType.animationSpeed,
    	        gridWidth:buildingType.gridWidth,
    	        gridHeight:buildingType.gridHeight,
    	        animationLoop:0,
    	        status:'build',
    	        health:buildingType.hitPoints,
    	    };
    	    $.extend(newBuilding,details)
    	    
    	    newBuilding.x = newBuilding.x - newBuilding.x % game.gridSize;
    	    newBuilding.y = newBuilding.y - newBuilding.y % game.gridSize;
    	    newBuilding.gridX = newBuilding.x/game.gridSize;
    	    newBuilding.gridY = newBuilding.y/game.gridSize;
    	    game.buildings.push(newBuilding);
    	    if(newBuilding.status == 'build'){
    	        sounds.play('construction');
    	        // shift factory to construct phase
    	        if(newBuilding.name != 'factory'){
        	        for (var i = game.buildings.length - 1; i >= 0; i--){
        	           if(game.buildings[i].name == 'factory'){
        	               game.buildings[i].status = 'construct';
        	               break;
        	           }
        	        };
    	        }
    	    }
    	    
    	},
    	initFog: function(){
    	    fogContext.fillStyle = 'rgba(0,0,0,1)';
    	    fogContext.fillRect(0,0,fogCanvas.width,fogCanvas.height);  
    	},
    	drawFog:function(){
    	    fogContext.save();

    	    fogContext.scale(fogCanvas.width/level.map.width,fogCanvas.height/level.map.height);
    	    
    	    
    	    fogContext.fillStyle = 'rgba(200,200,200,1)';
    	    for (var i = game.units.length - 1; i >= 0; i--){
    	        fogContext.beginPath();
    	        
    	        fogContext.globalCompositeOperation = "destination-out";
    	        fogContext.arc(game.units[i].x,game.units[i].y,units.types[game.units[i].name].sight*game.gridSize,0,2*Math.PI,false);

    	        fogContext.fill()
    	        
    	    };
    	    for (var i = game.buildings.length - 1; i >= 0; i--){
    	        fogContext.beginPath();
    	        var build = game.buildings[i];
    	        
    	        fogContext.globalCompositeOperation = "destination-out";
    	        fogContext.arc(build.x +build.currentImage.width/2,build.y+build.currentImage.height/2,buildings.types[build.name].sight*game.gridSize,0,2*Math.PI,false);
               
    	        fogContext.fill()
    	        
    	    };
            /*
    	    for (var i = game.units.length - 1; i >= 0; i--){
    	        fogContext.beginPath();
    	        fogContext.arc(game.units[i].x-game.viewportX,game.units[i].y-game.viewportY,units.types[game.units[i].name].sight*game.gridSize,0,2*Math.PI,false);
    	        fogContext.fill()
    	        
    	    };
    	    for (var i = game.buildings.length - 1; i >= 0; i--){
    	        fogContext.beginPath();
    	        var build = game.buildings[i];
    	        fogContext.arc(build.x +build.currentImage.width/2-game.viewportX,build.y+build.currentImage.height/2-game.viewportY,buildings.types[build.name].sight*game.gridSize,0,2*Math.PI,false);
    	        fogContext.fill()
    	        
    	    };
    	    */
    	    fogContext.restore();
    	    context.drawImage(fogCanvas,0+game.viewportX*fogCanvas.width/level.map.width,0+game.viewportY*fogCanvas.height/level.map.height,game.viewportWidth*fogCanvas.width/level.map.width,game.viewportHeight*fogCanvas.height/level.map.height,0,0,game.viewportWidth,game.viewportHeight)
    	},
    	drawItems: function(){
    	    var items = [];
    	    for (var i = game.units.length - 1; i >= 0; i--){
    	        if(game.units[i].status == 'destroy'){
    	           game.units.splice(i,1);
    	        }
    	    }
    	    for (var i = game.buildings.length - 1; i >= 0; i--){
    	        if(game.buildings[i].status == 'destroy'){
    	            game.buildings.splice(i,1);
    	        }
    	    }
    	    
    	    $.merge(items,game.units);
    	    $.merge(items,game.buildings);
    	    
    	    items.sort(function(a,b){
    	        return b.y - a.y;
    	    });
    	    
    	    for (var i = items.length - 1; i >= 0; i--){
    	        var item = items[i];
    	        //if (items)
    	        //alert(item.type)
    	        if (item.type == 'infantry' || item.type == 'vehicle'){
    	            units.draw(item);
    	        } else if (item.type == 'building'){
    	            buildings.draw(item);
    	        }
    	    }
    	    
    	},    	
    	pointOverUnit: function(x,y){
    	   for (var i = game.units.length - 1; i >= 0; i--){
    	       var unit = game.units[i];
    	       if(!unit.scripted){
    	           if ( x >= unit.x-unit.currentImage.width/2 && x <= unit.x + unit.currentImage.width/2
    	               && y >= unit.y-unit.currentImage.height/2 && y <= unit.y + unit.currentImage.height/2){
    	               return unit;
    	           }
    	        }
    	   }
    	},
    	pointOverBuilding: function(x,y){
    	   for (var i = game.buildings.length - 1; i >= 0; i--){
    	       var building = game.buildings[i];
    	       if ( x >= building.x && x <= building.x + building.currentImage.width
    	           && y >= building.y && y <= building.y + building.currentImage.height){
    	               return building;
    	           }
    	   }
    	},
    	drawMap:function(){
    	    //First handle panning
    	    mouse.handlePanning();
    	    
    	    game.viewportX += game.viewportDeltaX;
    	    game.viewportY += game.viewportDeltaY;
    	    mouse.gridX = Math.floor((mouse.x +game.viewportX) / game.gridSize);
			mouse.gridY = Math.floor((mouse.y+ game.viewportY) / game.gridSize);
			
    	    // now draw the map
    	    context.drawImage(level.map,
    			this.viewportX,this.viewportY,this.viewportWidth,this.viewportHeight, 
    			0,0,this.viewportWidth,this.viewportHeight);			
    	},
    	debugMode:false,
    	drawGrid: function(){
    	    var gridSize = game.gridSize;
    	    var mapWidth = level.map.width;
    	    var mapHeight = level.map.height;
    	    var viewportX = game.viewportX;
    	    var viewportY = game.viewportY;
    	    
    	    context.beginPath();
    	    context.strokeStyle = 'rgba(0,120,0,.6)';
    	    for (var i=0; i < mapWidth/gridSize; i++) {
    	        context.moveTo(i*gridSize-viewportX,0-viewportY);
    	        context.lineTo(i*gridSize-viewportX,mapHeight-viewportY);
    	    }
    	    for (var i=0; i < mapHeight/gridSize; i++) {
    	        context.moveTo(0-viewportX,i*gridSize-viewportY);
    	        context.lineTo(mapWidth-viewportX,i*gridSize-viewportY);
    	    }
    	    context.stroke();
    	    
    	    /*for (var i=0; i < level.obstacles.length; i++) {
    	       var obs = level.obstacles[i];
    	       game.highlightGrid(obs.x,obs.y,obs.width,obs.height,'rgba(100,0,0,0.5)');
    	    }*/
    	    for (var i = game.mapGrid.length - 1; i >= 0; i--){
    	       for (var j = game.mapGrid[i].length - 1; j >= 0; j--){
    	           if(game.mapGrid[i][j] == 1){
    	               game.highlightGrid(j,i,1,1,'rgba(100,0,0,0.5)');
    	           }
    	       };
    	    };
    	    
    	},
        highlightGrid: function(i,j,width,height,optionalImage){
            //alert('('+i+','+j+')');
            var gridSize = game.gridSize;
            if (optionalImage && $(optionalImage).is('img')){
                context.drawImage(optionalImage,i*gridSize-game.viewportX,j*gridSize - game.viewportY,width*gridSize,height*gridSize);
            } else {
                if (optionalImage){
                    context.fillStyle = optionalImage;
                } else {
                    context.fillStyle = 'rgba(225,225,225,0.5)';
                }
                context.fillRect(i*gridSize-game.viewportX,j*gridSize - game.viewportY,width*gridSize,height*gridSize);
            }
        },
    	showDebugger:function(){
    	    var html = "";
    	    html += "<br>level.loaded : "+level.loaded;
    	    
    	    html += "<br>level.map name/size: "+level.team+" - "+ level.name+' - '+level.map.width+','+level.map.height;
    	    html += "<br>sidebar.loaded : "+sidebar.loaded;
    	    html += "<br>sidebar.powerOut : "+sidebar.powerOut;
    	    html += "<br>sidebar.powerIn : "+sidebar.powerIn;
    	    html += "<br>units.loaded : "+units.loaded;
    	    html += "<br>buildings.loaded : "+buildings.loaded;
    	    html += "<br>viewport.x/y : "+game.viewportX+ ","+game.viewportY;
    	    html += "<br>viewport.DeltaX/Y : "+game.viewportDeltaX +","+game.viewportDeltaY;
    	    html += "<br>viewport.Width/Height : "+game.viewportWidth +","+game.viewportHeight;
    	    html += "<br>mouse.panDirection : "+ mouse.panDirection;
    	    html += "<br>level.map.Width/Height : "+level.map.width +","+level.map.height;
    	    html += "<br>mouse.x/y : "+mouse.x+ ","+mouse.y;
    	    html += "<br>mouse.realX/Y : "+mouse.realX+ ","+mouse.realY;
    	    html += "<br>mouse.gridX/Y : "+mouse.gridX+ ","+mouse.gridY;
    	    html += "<br>mouse.cursor.name : "+mouse.cursor.name+' - '+mouse.cursor.x+','+mouse.cursor.y;
    	    html += "<br>mouse.dragSelect : "+mouse.dragSelect;
    	    html += "<br>game.selectedItems : "+game.selectedItems.length;
    	    
    	    html += "<br>sidebar.deployMode : "+sidebar.deployMode;
    	    html += "<br>sidebar.deployBuilding: "+sidebar.deployBuilding;
    	    
    	    if (game.selectedItems.length ==1){
    	        html += "<br>game.selectedUnit.currentAngle : "+game.selectedItems[0].currentAngle;
    	        
    	        html += "<br>game.selectedUnit.destinationAngle : "+game.selectedItems[0].destinationAngle;
    	        html += "<br>game.selectedUnit.speed : "+game.selectedItems[0].speed;
    	        html += "<br>game.selectedUnit.x/y : "+game.selectedItems[0].x+ ","+game.selectedItems[0].y;
    	        html += "<br>game.selectedUnit.deltax/y : "+game.selectedItems[0].deltaX+ ","+game.selectedItems[0].deltaY;
    	        html += "<br>game.selectedUnit.destinationX/Y : "+game.selectedItems[0].destinationX+ ","+game.selectedItems[0].destinationY;
    	    }
    	    
    	    
    	    
    	    //html += "<br>game.frames : "+game.frames;
    	    $('#debugger').html(html);
    	    
    	    
    	    
    	},
    	mapGrid:[],
    	refreshMapGrid: function(attribute){
    	    game.mapGrid = [];
    	    for (i=0;i<level.mapGrid.length;i++){
    	        var a = [];
    	        for (j=0;j<level.mapGrid[i].length;j++){
    	            a.push(level.mapGrid[i][j]);
    	        }
    	        game.mapGrid.push(a);
    	    }
    	    //game.mapGrid = $.extend([], level.mapGrid);// level.mapGrid.slice();//$.makeArray(level.mapGrid); //merge
    	    //alert(game.mapGrid)
    	    for (var i = game.buildings.length - 1; i >= 0; i--){
    	        var building = game.buildings[i];
    	       for (var j = 0; j < building.gridWidth;j++){
    	           for (var k=0; k < building.gridHeight; k++) {
    	               game.mapGrid[building.gridY+k][building.gridX+j] = 1;
    	           }
    	       }
    	    }
    	    /*
    	    for (var i = game.units.length - 1; i >= 0; i--){
    	        var unit = game.units[i];
    	        //alert(unit.gridX);
                game.mapGrid[unit.gridY][unit.gridX] = 1;

    	    }*/
    	    //alert(game.mapGrid);
    	    
    	},
    	animate: function (){
    	    
    	    
    	    // Do nothing until level and sidebar are loaded
    	    if(!level.loaded || !sidebar.loaded || !mouse.loaded
    	        || !units.loaded || !buildings.loaded){
    	        context.clearRect(0,0,canvas.width,canvas.height);
    	        return;
    	        
    	    }
            //
    	    //game.frames ++;
    	    context.save();
    	    sidebar.draw();
    	    game.setViewport();
			game.refreshMapGrid();
    	    game.drawMap();
    	    
    	    
    	    if(game.debugMode){
        	    game.drawGrid();
    	    }
    	    
    	    game.moveUnits();
    	    
    	    game.drawItems();
    	    //game.drawUnits();
    	    //game.drawBuildings();
    	    //if (!game.debugMode){
    	    //    game.drawFog();
    	    //}
    	    context.restore();
	        mouse.showAppropriateCursor();
	        
	        if (game.debugMode){
        	    game.showDebugger();
        	        //game.highlightGrid(mouse.gridX,mouse.gridY,1,1);
        	        //game.highlightGrid(mouse.gridX+1,mouse.gridY,1,1,sidebar.placementRed);
        	        //game.highlightGrid(mouse.gridX+1,mouse.gridY+1,1,1,sidebar.placementRed);
        	    }
    	},
    	
    	begin: function (){
    	    //maybe show main menu?
    	    // ask which level to load
    	    $(canvas).css("cursor", "cursor:url(cursors/blank.gif),none !important;");
    	    
    	    sidebar.load();
    	    mouse.loadCursors();
    	    level.load('gdi','01');
    	    //level.loaded=true;
    	    units.loadAll();
    	    buildings.loadAll();
    	    sounds.loadAll();
    	    game.initFog();
    	    // loop to add units
    	    //game.addUnit({name:'mcv',x:500,y:600});
    	    //game.addUnit({name:'mcv',x:540,y:540});
    	    //game.addUnit({name:'apc',x:550,y:600});
    	    //game.addUnit({name:'apc',x:450,y:600});
    	    
    	    //game.addUnit({name:'gun-turret',x:400,y:600,status:'',direction:1});
    	    
    	    //game.addUnit();
    	    //game.addUnit({name:'apc',x:590,y:600,direction:0});
    	    //game.addUnit({name:'apc',x:610,y:600,direction:0});
    	    game.addUnit({name:'hovercraft',scripted:true,
    	    x:600,y:800,direction:0,
    	    script:[

    	    {action:'sound',sound:'reinforcements_have_arrived'},
    	    {action:'load',carrying:['mcv']},
    	    {action:'move',destinationX:600,destinationY:600,deltaX:0,deltaY:-1,direction:0},
    	    {action:'wait',counter:10},
    	    {action:'unload',units:[{name:'mcv',x:600,y:570,direction:0},{name:'apc',x:590,y:600,direction:0},{name:'apc',x:610,y:600,direction:0}]},
    	    {action:'wait',counter:2000},
    	    {action:'move',destinationX:600,destinationY:800,deltaX:0,deltaY:1,direction:2},
    	    
    	    {action:'destroy'}]
    	    });
    	   
    	    //game.addBuilding({name:'factory',x:600,y:300,health:200,status:''});*/
    	    /*game.addBuilding({name:'factory',x:600,y:300,health:200,status:''});*/
    	    game.animationLoop = setInterval(game.animate,game.animationTimeout);//96);//)32);
    	    mouse.listenEvents();
    	    $('#debug').click(function() {
    	        game.debugMode = !game.debugMode;
    	    });
    	    
    	},    	
    	end: function(){
    	    clearInterval(game.animationLoop);
    	}
	}
	
	var sidebar = {
	    width: 160,
	    x:480,
	    y:0,
	    loaded:false,   
	    background:null,
	    logo:null,
	    placementRed:null,
	    placementWhite:null,
	    preloadCount : 0,
	    preloadTotal : 0,
	    repairMode : false,
	    sellMode : false,
	    mapMode : false,
	    deployMode:false,
	    leftButtons: [],
	    rightButtons:[],
	    buildList:[],
	    allButtons:[],
	    leftButtonOffset:0,
	    rightButtonOffset:0,
	    clock:[],
	    buildSpeedMultiplier :110, 
	    //
	    //speed = 0.5 means 48*110*2 milliseoncs to build
	    // speed =1 means 48 * 110 milliseconds to build 
	    // speed = 2 means 48*110/2 milliseconds to build
	    // 1000 cost = 48 seconds
	    //100 cost = 4.8
	    //10 cost =.48 seconds
	    //1 cost = 0.048 seconds
	    // *0.048 * cost = 1000*110/speed
	    // x * 0.01 = * 11000
	    // 110/6 =15
	    // 100 should cost 4.8 seconds
	    //100/cost
	    // time == 110*48/speed = 
	    // 48/1000 *cost
	    //speed = 110*1000/cost
	    //
	    click: function(ev,rightClick){
    	    // do nothing
    	}, 
	    preloadImage:function(url){
	        var image = new Image();
	        sidebar.preloadTotal++;
	        image.src = url;
	        $(image).bind('load',function(){
	            sidebar.preloadCount++;
	            if (sidebar.preloadCount == sidebar.preloadTotal){
	                sidebar.loaded = true;
	            }
	        });
	        return image;
	        
	    },
	    checkDependency: function(){
	        //alert(this.allButtons.length);
	        for (var i = this.allButtons.length - 1; i >= 0; i--){
	            var button = this.allButtons[i];
	            
	            var dependenciesSatisfied = true;
	            //alert(button.dependency.length);
	            for (var j = button.dependency.length - 1; j >= 0; j--){
	                var found = false;
	                var dependency = button.dependency[j];
	                for (var k = game.buildings.length - 1; k >= 0; k--){
	                    var building = game.buildings[k];
	                    if(building.name == dependency && building.status != 'build'
	                     && building.life != 'ultra-damaged'){
	                        found=true;
	                        //alert(building.name)
	                        break;
	                    }
	                }; 
	                
	                if(!found){
                        dependenciesSatisfied = false;
                        break;
                    }
	            };
	
	            
	            if(button.type=='building'){
	                    //check left side
	                var buttonFound=false;
	                var foundIndex;
	                
                    for (var j = this.leftButtons.length - 1; j >= 0; j--){
                        if(this.leftButtons[j].name == button.name){
                            buttonFound = true;
                            
                            foundIndex = j;
                            break;
                        } else
                        {
                            //alert(button.name + ",lb="+this.leftButtons[j].name)
                        }
                    };
                    //alert(dependenciesSatisfied +" " + buttonFound + '  '+button.name + ' at index' + foundIndex)
                    if (dependenciesSatisfied && !buttonFound){
                        this.leftButtons.push(button);
                        button.status = '';
                        button.counter = 0;
                        button.cost = buildings.types[button.name].cost;
                        button.speed =  this.buildSpeedMultiplier/button.cost;
                        sounds.play('new_construction_options');
                    } else if (buttonFound && !dependenciesSatisfied){
 
                        this.leftButtons.splice(foundIndex,1);
                    }
	            } else if (button.type=='infantry' || button.type == 'vehicle') {
	                //check right side buttons
	                var buttonFound=false;
	                var foundIndex;
	                
                    for (var j = this.rightButtons.length - 1; j >= 0; j--){
                        if(this.rightButtons[j].name == button.name){
                            buttonFound = true;
                            foundIndex = j;
                            break;
                        }
                    };
                    
                    if (dependenciesSatisfied && !buttonFound){
                        this.rightButtons.push(button);
                        button.status = '';
                        button.counter = 0;
                        button.cost = units.types[button.name].cost;
                        button.speed = this.buildSpeedMultiplier/button.cost;
                        sounds.play('new_construction_options');
                    } else if (buttonFound && !dependenciesSatisfied){
                        this.rightButtons.splice(foundIndex,1);
                    }                 
	            }
	            
	        };
	       
	    },
	    load: function(){
	        this.background = this.preloadImage('images/sidebar/sidebar.png');
	        this.placementRed = this.preloadImage('images/sidebar/trans1.gif');
	        this.placementWhite = this.preloadImage('images/sidebar/trans0.gif');
	        this.powerIndicator = this.preloadImage('images/sidebar/power/power_indicator2.png');

	        
	        var buttonList = [
	            {name:'power-plant',type:'building',dependency:['factory']},
	            {name:'barracks',type:'building',dependency:['factory','power-plant']},
	            {name:'minigunner',type:'infantry',dependency:['barracks']},
	            /*{name:'grenadier',type:'infantry',dependency:['barracks']},
	            {name:'engineer',type:'infantry',dependency:['barracks']},
	            {name:'flamethrower',type:'infantry',dependency:['barracks']},
	            {name:'rocket_soldier',type:'infantry',dependency:['barracks']},
	            {name:'chem_warrior',type:'infantry',dependency:['barracks']},
	            {name:'commando',type:'infantry',dependency:['barracks']}*/
	        ];
	        
	        for (var i=0; i < buttonList.length; i++) {
	           var button = buttonList[i];
	           this.allButtons.push({
	                name:button.name, 
	                image:this.preloadImage('images/sidebar/icons/'+button.name+'-icon.png'),
	                type:button.type,
	                status:'',
	                dependency:button.dependency
	            });
	        }
	        
	        for (var i=0;i<110;i++){
	            var img = this.preloadImage('images/sidebar/clock/clock-'+i+'.png');
	            this.clock.push(img);
	        }
	        
	    }, 
	    finishDeploying:function(){
	        sidebar.deployMode = false;
            for (var i = this.leftButtons.length - 1; i >= 0; i--){
                this.leftButtons[i].status='';
            }
            sidebar.deployBuilding = null;
	    },

	    textBrightness:0,
	    textBrightnessDelta:-0.07, 
	    drawButtonLabel: function(label,x,y){
	        var labelOffsetX = 16
    	    var labelOffsetY=30;
	        context.fillStyle = 'rgba(255,255,255,'+this.textBrightness+')';
	        context.fillText(label,x+ labelOffsetX,y+labelOffsetY);
	    },
	    drawButtonCost: function(cost,x,y){
	        var costOffsetX = 35;
    	    var costOffsetY=10;
	        context.fillStyle = 'white';
	        context.fillText(" "+cost,x+ costOffsetX,y+costOffsetY);
	        //alert(cost+","+(x+costOffsetX)+","+(y+costOffsetY));
	    },
	    iconWidth:64,
	    iconHeight:48,
	    
	    drawButton:function(side,index){ //side is left or right; index is 0 to 5
	        var buttons = (side=='left')?this.leftButtons:this.rightButtons;
	        var offset = (side=='left')?this.leftButtonOffset:this.rightButtonOffset;
	        var button = buttons[index+offset];
	        var xOffset = (side == 'left')?500:570;
	        var yOffset = 165+index*this.iconHeight;
   
	        context.drawImage(button.image,xOffset,yOffset);
	        //this.drawButtonCost(button.cost,xOffset,yOffset);
	        //alert(button.cost);
	        //alert(xOffset+' '+yOF)
	        if (button.status == 'ready'){
	            context.globalAlpha = 0.4;
                context.drawImage(this.clock[this.clock.length-1],xOffset,yOffset);
                context.globalAlpha = 1;
                this.drawButtonLabel('READY',xOffset,yOffset);
	        } else if (button.status == 'disabled'){
                context.globalAlpha = 0.8;
                context.drawImage(this.clock[this.clock.length-1],xOffset,yOffset);
                context.globalAlpha = 1;	          
	        } else if (button.status == 'building'){
	            context.globalAlpha = 0.5;
 	            context.drawImage(this.clock[Math.floor(button.counter)],xOffset,yOffset);
 	            context.globalAlpha = 1;
 	            //alert(button.status);
 	            if(!button.speed)
 	                button.speed = 1;
 	            button.counter += button.speed;
 	            /*if (button.counter % 13  == 0){
 	                sounds.play('clock');
                }*/
                if (button.counter>109){
                    button.status = 'ready';
                    sounds.play('construction_complete');
                }  
	        } else if (button.status == 'hold'){
	            context.globalAlpha = 0.5;
 	            context.drawImage(this.clock[Math.floor(button.counter)],xOffset,yOffset);
 	            context.globalAlpha = 1; 
	            this.drawButtonLabel(' HOLD',xOffset,yOffset);
	        }
	        
	    },
	    powerOut:0,
	    powerIn:0,
	    lowPowerMode:false,
	    powerScale:1,
	    checkPower: function(){
	        var offsetX = 480;
	        var offsetY = 160;
	        var barHeight = 320;
	        var barWidth = 20;
	        
	        this.powerOut = 0;
	        this.powerIn = 0;
            for (var k = game.buildings.length - 1; k >= 0; k--){
                var building = game.buildings[k];
                var buildingType = buildings.types[building.name];
                if (buildingType.powerIn){
                    this.powerIn += buildingType.powerIn;
                }
                if (buildingType.powerOut){
                    this.powerOut += buildingType.powerOut;
                }
            };
            
                if (this.powerOut < this.powerIn){

                }
            
            //alert(this.powerGreen);
            
            var red = 'rgba(174,52,28,0.7)';
            //var red = 'rgba(240,75,35,0.6)';
            var orange = 'rgba(250,100,0,0.6)';
            //var green = 'rgba(48,85,44,0.6)';
            var green = 'rgba(84,252,84,0.3)';
            
            
            
            //context.drawImage(this.powerRed,offsetX,offsetY+barHeight-this.powerOut/this.powerScale);
            if (this.powerOut/this.powerIn >= 1.1){
                context.fillStyle=green;//'rgba(100,200,0,0.3)';
                this.lowerPowerMode = false;
            } else if (this.powerOut /this.powerIn >= 1){ 
                context.fillStyle=orange;
                this.lowerPowerMode = false;
            } else if (this.powerOut < this.powerIn){
                context.fillStyle=red;
                if(this.lowPowerMode == false){
                    sounds.play('low_power')
                }
                this.lowerPowerMode = true;
            }
            context.fillRect(offsetX+8,offsetY+barHeight-this.powerOut/this.powerScale,barWidth-14,this.powerOut);
            context.drawImage(this.powerIndicator,offsetX,offsetY+barHeight-this.powerIn/this.powerScale);
            
	    },
	    draw: function(){
	        // check if new constructions options available or existing ones are gone
	        this.checkDependency(); 
	        
	        context.drawImage(this.background,this.x,this.y);
	        this.checkPower();
	        this.textBrightness = this.textBrightness + this.textBrightnessDelta;
	        if (this.textBrightness <0){
	            this.textBrightness = 1;
	        }
	        //context.strokeStyle = 'red';
	        //context.strokeRect(485,146,45,14);// Repair
	        //context.strokeRect(538,146,45,14);// Sell
	        //context.strokeRect(590,146,45,14);// Map
	        

	        var maxLeft = this.leftButtons.length > 6 ? 6:this.leftButtons.length;
	        for (var i=0; i < maxLeft; i++) {
	            this.drawButton('left',i);       
	        }
	        var maxRight = this.rightButtons.length > 6 ? 6:this.rightButtons.length;
	        for (var i=0; i < maxRight; i++) {
	            this.drawButton('right',i);	            
	        }	        
	    },
	    click:function(rightClick){
	        // press a top button
	        if (mouse.y>=146 && mouse.y<= 160){
	            if (mouse.x>=485 && mouse.x <= 530){
	                this.repairMode = !this.repairMode;
	                this.sellMode = this.mapMode = this.deployMode = false;
	                //alert('repair')
	            } else if (mouse.x>=538 && mouse.x <= 582){
	                this.sellMode = !this.sellMode;
	                this.repairMode = this.mapMode = this.deployMode = false;
	            } else if (mouse.x >=590 && mouse.x <= 635){
	                this.mapMode = !this.mapMode;
	                this.repairMode = this.sellMode = this.deployMode = false;
	            }
	            // press a scroll button
	        } else if (mouse.y>=455 && mouse.y <= 480){
	            if (mouse.x>=500 && mouse.x<= 530){
	                if (this.leftButtonOffset > 0){
	                    this.leftButtonOffset --;
	                    sounds.play('button');
	                }
	            } else if (mouse.x>=532 && mouse.x<= 562){
                    if (this.leftButtonOffset+6 < this.leftButtons.length){
                        this.leftButtonOffset++;
                        sounds.play('button');
                    }
    	        } else if (mouse.x>=570 && mouse.x<= 600){
	                if (this.rightButtonOffset > 0){
	                    this.rightButtonOffset --;
	                    sounds.play('button');
	                }
    	        } else if (mouse.x>=602 && mouse.x<= 632){
                    if (this.rightButtonOffset+6 < this.rightButtons.length){
                        this.rightButtonOffset++;
                        sounds.play('button');
                    }
    	        }
    	        // Press a unit icon
	        } else if (mouse.y>=165 && mouse.y <= 455){
	            var buttonPosition = 0;
	            for (var i=0; i < 6; i++) {
    	            if (mouse.y >= 165+i*48 && mouse.y <= 165+i*48+48){
    	                buttonPosition = i;
    	                break;
    	            }
    	        }
                var buttonSide,buttonPressedIndex,buttons;
                if (mouse.x>=500 && mouse.x<=564){
                    buttonSide = 'left';
                    buttonPressedIndex = this.leftButtonOffset + buttonPosition;
                    buttons = this.leftButtons;
                } else  if (mouse.x>=570 && mouse.x <= 634){
                    buttonSide = 'right';
                    buttonPressedIndex = this.rightButtonOffset + buttonPosition;
                    buttons = this.rightButtons;
                }
                if (buttons && buttons.length > buttonPressedIndex){
                    var buttonPressed = buttons[buttonPressedIndex];
                    if (buttonPressed.status == '' && !rightClick){
                        //this.buildList.push ({side:'left',counter:0,name:this.leftButtons[buttonPressed].name,buttonPressed:buttonPressed});        
                        for (var i = buttons.length - 1; i >= 0; i--){
                            buttons[i].status='disabled';
                        };
                        
                        buttonPressed.status = 'building';
                        buttonPressed.counter = 0; 
                        sounds.play('building');                      
                    } else if (buttonPressed.status == 'building' && !rightClick){    
                        sounds.play('not_ready');
                    }else if (buttonPressed.status == 'building' && rightClick){
                        buttonPressed.status = 'hold';
                        sounds.play('on_hold');
                    } else if (buttonPressed.status == 'hold' && !rightClick){
                        buttonPressed.status = 'building';
                        sounds.play('building');
                    } else if (buttonPressed.status == 'hold' && rightClick){
                            buttonPressed.status = '';
                            sounds.play('cancelled');
                            for (var i = buttons.length - 1; i >= 0; i--){
                                buttons[i].status='';
                            };     
                    } else if (buttonPressed.status == 'ready' && !rightClick){
                        if (buttonPressed.type =='building'){
                            sidebar.deployMode = true;
                    	    this.repairMode = this.sellMode = this.mapMode = false;
                            sidebar.deployBuilding = buttonPressed.name;
                        }
                    } else if (buttonPressed.status=='disabled'){
                        sounds.play('building_in_progress');
                    }
                    
                }            
	        }
	    }
	};
	
	var level = {
	    map:new Image(),
	    team:'gdi',
	    loaded: false,
	    name:'',
	    details:null,
	    obstacles:[],
	    mapGrid:[],
	    gridSizeY:0,
	    gridSizeX:0,
	    hasObstacle: function(x,y){
	        for (var i = this.obstacles.length - 1; i >= 0; i--){
	            obs = this.obstacles[i];
	           if(obs.x<= x && x <= obs.x+obs.width-1 && obs.y <= y && y <= obs.y + obs.height-1){
	               return true;
	           }
	        } 
	        return false;
	    },
	    load: function(team,levelName,callback){
	        var levelDetails = levelData [team + levelName];
	        this.gridSizeY = levelDetails.gridSizeY;
	        this.gridSizeX = levelDetails.gridSizeX;
	        this.team = team;
	        this.name = team+levelName;
	        this.obstacles = levelDetails.obstacles;
	        
	        game.viewportX = levelDetails.startX;
	        game.viewportY = levelDetails.startY;
            
            this.mapGrid = new Array(levelDetails.gridSizeY);
            for (var i=0; i < levelDetails.gridSizeY; i++) {
                this.mapGrid[i] = new Array(levelDetails.gridSizeX);
                for (var j=0; j < levelDetails.gridSizeX; j++) {
                    this.mapGrid[i][j] = this.hasObstacle(j,i)?1:0;
                }
            }
            
	        // clear the canvas 
	        //context.clearRect(0,0,canvas.width,canvas.height);
	        // load mapdetails
	        
	        // load the main map file
	        this.map.src = levelDetails.mapUrl;
	        $(this.map).bind('load',function(){   
	            // once map loaded call back any call back function (to start animation loop)
	            level.loaded = true;
	        });
	        
	        
	    }	    
	};
	
	var levelData = {
	    'gdi01': {
	        mapUrl: 'images/maps/gdi/map01.png',
	        team :'gdi',
	        startX: 264,
	        startY: 264,
	        gridSizeX:31,
	        gridSizeY:31,
	        
	        
	        obstacles : [
	            //sea
	            {x:0,y:23,width:5,height:3},
	            {x:5,y:24,width:1,height:3},
	            {x:0,y:27,width:31,height:5},
	            
	            //right side mountain
	            {x:29,y:17,width:2,height:6},
	            {x:30,y:23,width:1,height:1},
	            
	            //middle mountain
	            {x:7,y:5,width:2,height:5},
	            {x:8,y:9,width:2,height:3},
	            {x:9,y:11,width:2,height:5},
	            {x:10,y:15,width:2,height:5},
	            {x:11,y:19,width:2,height:3},
	            
	            
	            {x:12,y:21,width:5,height:3},
	            {x:12,y:24,width:2,height:1},
	            {x:17,y:21,width:1,height:2},
	            
	            /*{x:12,y:15,width:2,height:3},
	            {x:14,y:17,width:2,height:7},
	            {x:15,y:23,width:2,height:7},
	            {x:17,y:29,width:1,height:1},
	            {x:17,y:30,width:2,height:3},*/           
	        ]
	    }
	};
	
	var units = {
	    types:[],
	    loaded:true,
	    loadedCount:0,
	    totalCount:0,
	    loadImg:function(url){
            var img = new Image();
            units.totalCount++;
            units.loaded = false;
            img.src = url;
            $(img).bind('load',function() {
                units.loadedCount++;
                if(units.loadedCount == units.totalCount){
                    units.loaded = true;
                }
                
            });
            return img;      
        },
        draw: function(unit){
            var unitType = units.types[unit.name];
	        //alert(unit.name +' '+unit.direction)
	        var image = unitType.moveImages[unit.direction];
	        var unitOffsetX=image.width/2;
	        var unitOffsetY=image.height/2;
	        
	        context.drawImage(image,unit.x-game.viewportX-unitOffsetX,unit.y-game.viewportY-unitOffsetY);
	        unit.currentImage = image;
	        if(unit.carrying){
	            var tempImage = units.types[unit.carrying[0]].moveImages[unit.direction];
	            context.drawImage(tempImage,unit.x-game.viewportX-unitOffsetX,unit.y-game.viewportY-unitOffsetY);
	        }

	        
	        var viewportX = game.viewportX;
	        var viewportY = game.viewportY;
	        if (unit.selected){
	            context.strokeStyle = 'white';
	            context.strokeWidth = 2;
	            context.beginPath();

	            context.moveTo(unit.x-viewportX-unitOffsetX,unit.y-viewportY-unitOffsetY+5);
	            context.lineTo(unit.x-viewportX-unitOffsetX,unit.y-viewportY-unitOffsetY);
	            context.lineTo(unit.x-viewportX-unitOffsetX+5,unit.y-viewportY-unitOffsetY);

	            context.moveTo(unit.x-viewportX-unitOffsetX+image.width-5,unit.y-viewportY-unitOffsetY);
	            context.lineTo(unit.x-viewportX-unitOffsetX+image.width,unit.y-viewportY-unitOffsetY);
	            context.lineTo(unit.x-viewportX-unitOffsetX+image.width,unit.y-viewportY-unitOffsetY+5);

	            context.moveTo(unit.x-viewportX-unitOffsetX+image.width-1,unit.y-viewportY-unitOffsetY-5+image.height-1);
    	        context.lineTo(unit.x-viewportX-unitOffsetX+image.width-1,unit.y-viewportY-unitOffsetY+image.height-1);
    	        context.lineTo(unit.x-viewportX-unitOffsetX+image.width-5-1,unit.y-viewportY-unitOffsetY+image.height-1);

	            context.moveTo(unit.x-viewportX-unitOffsetX+5,unit.y-viewportY-unitOffsetY+image.height -1);
    	        context.lineTo(unit.x-viewportX-unitOffsetX,unit.y-viewportY-unitOffsetY+image.height -1);
	            context.lineTo(unit.x-viewportX-unitOffsetX,unit.y-viewportY-unitOffsetY-5+image.height -1);    	        
                context.stroke();

                context.beginPath();
                var life = unit.health/unitType.hitPoints;
                context.rect(unit.x-viewportX-unitOffsetX,unit.y-viewportY-unitOffsetY-10,image.width*life,5);
                if (life>-0.7) { 
                    context.fillStyle = 'lightgreen';
                } else if (life>0.3){
                    context.fillStyle = 'yellow';
                } else {
                    context.fillStyle = 'red';
                }
                context.fill();
                context.beginPath();
	            context.rect(unit.x-viewportX-unitOffsetX,unit.y-viewportY-unitOffsetY-10,image.width,5);
	            context.stroke();
	            
	            //game.highlightGrid(unitGridX,unitGridY,1,1);
	        }
	        
        },
        click: function(selectedUnit,ev){
            if (sidebar.deployMode || sidebar.repairMode || sidebar.sellMode){
                // do nothing
            }else if(selectedUnit.name == 'mcv' && selectedUnit.selected && game.selectedItems.length == 1
             && buildings.canConstruct('factory',
                Math.floor((selectedUnit.x-selectedUnit.currentImage.width/2)/game.gridSize),
                Math.floor((selectedUnit.y)/game.gridSize))){
                game.deselectAll();
                selectedUnit.status = 'build';
            } else {
                if (!ev.shiftKey){
                    game.deselectAll();
                }
                if (!selectedUnit.selected && !(selectedUnit.status == 'build')) {
                    selectedUnit.selected = true;
                    //alert(selectedUnit.status)
                    game.selectedItems.push(selectedUnit);
                    if (selectedUnit.type == 'vehicle'){
                        sounds.play('vehicle_select');
                    } else if(selectedUnit.type =='infantry'){
                        sounds.play('unit_select');
                    }
                    
                } 
            }
        },
	    load: function(details,moveImageCount){
	        var unit = details;
	        var moveImages = [];
	        var imagesPath = 'images/units/'+unit.team+'/'+unit.name+'/';
	        for (var i=0; i < moveImageCount; i++) {
	           moveImages.push(units.loadImg(imagesPath+unit.name+'-'+i+'.png'));
	        };
	        unit.moveImages = moveImages;
    	    units.types[unit.name] = unit;
	    },
	    pathfind:function(unit){
	        var unitGridX = Math.floor(unit.x/game.gridSize);
	        var unitGridY = Math.floor(unit.y/game.gridSize);
	        var destinationGridX = Math.floor(unit.destinationX/game.gridSize);
	        var destinationGridY = Math.floor(unit.destinationY/game.gridSize); 
	        
	       	//var path = pathFinder.aStar({x:unitGridX,y:unitGridY},{x:destinationGridX,y:destinationGridY});
            //var path = pathFinder.aStar({x:1,y:1},{x:3,y:3});       
            
            var g = game.mapGrid;
            var start = [unitGridX,unitGridY];
            var end = [destinationGridX,destinationGridY];
            var path = AStar(g,start,end,'Diagonal');
        //alert(path);
        
            if(game.debugMode){
                for (var i = path.length - 1; i >= 0; i--){
                   game.highlightGrid(path[i].x,path[i].y,1,1);
                } 
            }
            
	        if (path.length>1){
	            unit.deltaX = path[1].x - path[0].x;
	            unit.deltaY = path[1].y - path[0].y;
	        } else if (Math.abs(unit.destinationX-unit.x) < unit.speed 
	        || Math.abs(unit.destinationY-unit.y) < unit.speed){
	            unit.deltaX = 0;
	            unit.deltaY = 0;
	            unit.destinationX = null;
	            unit.destinationY = null;
	        }
	        
	    },
	    loadAll:function(){
	        units.load({
    	        name:'mcv',
    	        team:'gdi',
    	        type:'vehicle',
    	        label:'Mobile Construction Vehicle',
    	        turnSpeed:5,
    	        speed:12,
    	        armor:2,
    	        buildLevel:15,
    	        cost:5000,
    	        sight:2,
    	        hitPoints:600,
    	        buildable:true,
    	        techLevel:7,                
    	    },32);
    	    
    	    units.load({
    	        name:'apc',
    	        team:'gdi',
    	        label:'APC',
    	        type:'vehicle',
    	        turnSpeed:5,
    	        speed:35,
    	        armor:3,
    	        primaryWeapon:16,
    	        buildLevel:5,
    	        cost:700,
    	        sight:4,
    	        hitPoints:200,
    	        buildable:true,
    	        techLevel:4,                
    	    },32);
    	    	    
    	    units.load({
    	        name:'minigunner',
    	        team:'gdi',
    	        label:'Minigunner',
    	        type:'infantry',
    	        speed:8,
    	        weapon:3,
    	        buildLevel:1,
    	        cost:100,
    	        sight:1,
    	        hitPoints:50,
    	        techLevel:1,                
    	    },0);
    	    
    	    units.load({
    	        name:'hovercraft',
    	        team:'gdi',
    	        label:'Hovercraft',
    	        type:'vehicle',
    	        speed:30,
    	        armor:2,
                turnSpeed:127,
    	        buildLevel:99,
    	        cost:300,
    	        sight:3,
    	        invulnerable:true,
    	        buildable:false,
    	        hitPoints:400,
    	        techLevel:99,                
    	    },4);
	    }
	}

    var buildings = {
	    types:[],
	    loaded:true,
	    loadedCount:0,
	    totalCount:0,
	    loadImg:function(url){
            var img = new Image();
            buildings.totalCount++;
            buildings.loaded = false;
            img.src = url;
            $(img).bind('load',function() {
                buildings.loadedCount++;
                if(buildings.loadedCount == buildings.totalCount){
                    buildings.loaded = true;
                }
                
            });
            return img;      
        },
        draw: function(building){
            
            var buildingType = buildings.types[building.name];
            //alert(buildingType);
            
	        //var image = unitType.moveImages[unit.direction];
	        var life = building.health/buildingType.hitPoints;
	       
	        if(life > 0.7){
	            building.life = "healthy";
	        } else if (life>0.4){
	            building.life = "damaged";        
	        } else {
	            building.life = "ultra-damaged";
	        }
	        var imageCategory = "";
	        if (building.status == "construct" && building.life=="ultra-damaged"){
	            building.status ="";
	        }
	        
	        if (building.status=="build" || building.status=="sell"){
	            imageCategory = 'build';
	        } else if (building.status ==""){
	            imageCategory = building.life;
	        } else {
	            imageCategory = building.life+"-"+building.status;
	            //alert(imageCategory);
	        }
	        
	        var imageList = buildingType.images[imageCategory];
	        
	        //alert(imageList)
	        
	        var image = imageList[Math.floor(building.animationLoop/building.animationSpeed)];
	        if (building.status =='sell'){
	            image = imageList[imageList.length-1 - Math.floor(building.animationLoop/building.animationSpeed)];
	        }
	        
	        building.currentImage = image;
	        building.animationLoop++;
	        if (building.animationLoop/building.animationSpeed >= imageList.length){
	            building.animationLoop = 0;
	            if (building.status=='build'){
	                //alert('build complete'); 
	                building.status = '';
	            } else if (building.status=='construct'){
    	            //alert('construct complete');
    	            building.status = '';
    	        } else if (building.status == 'sell'){
    	            building.status = 'destroy';
    	        }
	        }
	        
	        context.drawImage(image,building.x-game.viewportX,building.y-game.viewportY);
	        var viewportX = game.viewportX;
	        var viewportY = game.viewportY;
	        if (building.selected){
	            context.strokeStyle = 'white';
	            context.strokeWidth = 2;
	            context.beginPath();

	            context.moveTo(building.x-viewportX,building.y-viewportY+5);
	            context.lineTo(building.x-viewportX,building.y-viewportY);
	            context.lineTo(building.x-viewportX+5,building.y-viewportY);

	            context.moveTo(building.x-viewportX+image.width-5,building.y-viewportY);
	            context.lineTo(building.x-viewportX+image.width,building.y-viewportY);
	            context.lineTo(building.x-viewportX+image.width,building.y-viewportY+5);

	            context.moveTo(building.x-viewportX+image.width-1,building.y-viewportY-5+image.height-1);
    	        context.lineTo(building.x-viewportX+image.width-1,building.y-viewportY+image.height-1);
    	        context.lineTo(building.x-viewportX+image.width-5-1,building.y-viewportY+image.height-1);

	            context.moveTo(building.x-viewportX+5,building.y-viewportY+image.height -1);
    	        context.lineTo(building.x-viewportX,building.y-viewportY+image.height -1);
	            context.lineTo(building.x-viewportX,building.y-viewportY-5+image.height -1);    	        
                context.stroke();

                context.beginPath();
                
                context.rect(building.x-viewportX,building.y-viewportY-10,image.width*life,5);
                if (building.life == 'healthy') { 
                    context.fillStyle = 'lightgreen';
                } else if (building.life == 'damaged') { 
                    context.fillStyle = 'yellow';
                } else {
                    context.fillStyle = 'red';
                }
                context.fill();
                context.beginPath();
	            context.rect(building.x-viewportX,building.y-viewportY-10,image.width,5);
	            context.stroke();
	            building.gridX = Math.floor(building.x/game.gridSize);
    	        building.gridY = Math.floor(building.y/game.gridSize);
	        }
	        
        },
	    load: function(details,imagesToLoad){
	        var building = details;
	        var imagesPath = 'images/buildings/'+building.team+'/'+building.name+'/';
	        var imageArray = [];
	        
	        for (var i = imagesToLoad.length - 1; i >= 0; i--){
	            var constructImages = [];
	            var constructImageCount = imagesToLoad[i].count; 
	            var constructImageName = imagesToLoad[i].name;
	            for (var j=0; j < constructImageCount; j++) {
    	           constructImages.push(buildings.loadImg(imagesPath+building.name+'-'+constructImageName+'-'+j+'.png'));
    	        };   
	            imageArray[constructImageName] = constructImages;
	        }
	        
	        building.images = imageArray;
    	    buildings.types[building.name] = building;
	    },
	    click: function(selectedBuilding,ev){
	        if (sidebar.deployMode || sidebar.repairMode){
                // do nothing
            } else if (sidebar.sellMode){
                selectedBuilding.status = 'sell';
                sounds.play('sell');
                sidebar.sellMode = false;
            } else {
    	        if (!ev.shiftKey){
                    game.deselectAll();
                }
                if (!sidebar.sellMode && !selectedBuilding.selected && selectedBuilding.status != 'sell') {
                    selectedBuilding.selected = true;
                    game.selectedItems.push(selectedBuilding);
                }
            }

	    },
	    canConstruct: function(name,x,y){
	        var buildingType  = buildings.types[name];
	        //alert(buildingType.gridShape)
	        for (var i=0; i < buildingType.gridWidth; i++) {
	            for (var j=0; j < buildingType.gridHeight; j++) {
	               if(buildingType.gridShape[j][i] ==1){
	                   // check if building or obstructions there
	                   //alert('checking []' +  (x+i)+' , ' + ((y+j))+ ' '+game.mapGrid[y+j][x+i])
	                   if (game.mapGrid[y+j][x+i] == 1){
	                      
	                       return false;
	                   }
	                   // check if vehicle there
	                   
	               }
	            }
	        }
	     return true;  
	    },
	
	    loadAll:function(){
	        buildings.load({
    	        name:'factory',
    	        team:'gdi',
    	        label:'Construction Yard',
    	        powerIn:15,
    	        powerOut:30,
    	        armor:1,
    	        buildLevel:1,
    	        animationSpeed:2,
    	        cost:5000,
    	        sight:3,
    	        hitPoints:400,
    	        constructionType:8,
    	        buildable:false,
    	        techLevel:99,
    	        gridWidth:3,
    	        gridHeight:2, 
    	        gridShape: [[1,1,1],
    	                    [1,1,1]]               
    	    },[
    	        {name:'build',count:32},{name:"healthy",count:4},{name:"damaged",count:4},{name:"ultra-damaged",count:1},
    	        {name:'healthy-construct',count:20},{name:'damaged-construct',count:20}]);
	        
	        buildings.load({
    	        name:'power-plant',
    	        team:'gdi',
    	        label:'Power Plant',
    	        powerOut:100,
    	        armor:1,
    	        buildLevel:1,
    	        animationSpeed:2,
    	        cost:300,
    	        sight:2,
    	        hitPoints:200,
    	        buildable:true,
    	        techLevel:0,
    	        gridWidth:2,
    	        gridHeight:2,
    	        gridShape: [[1,1],
    	                    [1,1]]               
    	    },[
    	        {name:'build',count:20},{name:"healthy",count:4},{name:"damaged",count:4},{name:"ultra-damaged",count:1}]);

    	        buildings.load({
        	        name:'barracks',
        	        team:'gdi',
        	        label:'Power Plant',
        	        powerIn:20,
        	        armor:1,
        	        buildLevel:1,
        	        animationSpeed:2,
        	        cost:300,
        	        sight:3,
        	        hitPoints:400,
        	        buildable:true,
        	        techLevel:0,
        	        gridWidth:2,
        	        gridHeight:2,
        	        gridShape: [[1,1],
        	                    [1,1]]               
        	    },[
        	        {name:'build',count:20},{name:"healthy",count:10},{name:"damaged",count:10},{name:"ultra-damaged",count:1}]);

        	        units.load({
            	        name:'gun-turret',
            	        team:'gdi',
            	        label:'Gun Turret',
            	        powerIn:20,
            	        armor:3,
            	        primaryWeapon:12,
            	        buildLevel:8,
            	        animationSpeed:2,
            	        cost:600,
            	        sight:5,
            	        hitPoints:200,
            	        buildable:true,
            	        techLevel:2,
            	        gridWidth:1,
            	        gridHeight:1,
            	        gridShape: [[1]]               
            	    },[
            	        {name:'build',count:20},{name:"healthy",count:32},{name:"damaged",count:32}]);


	    }
	}

    var sounds = {
        sound_list:[],
        loaded:true,
        load:function(name,path){  
            var sound = new Audio('audio/'+path+'/'+name+'.ogg');
            sound.load();
            //alert(sound.src);
            return sound;
        },
        play: function(name){
            var options = this.sound_list[name];
            if (options.length == 1){
                options[0].play();
            } else {
                var i = Math.floor(options.length*Math.random());
                //alert(i +" " +options.length);
                options[i].play();
            }
        },
        loadAll:function(){
            this.sound_list['building_in_progress'] = [this.load('building_in_progress','voice')];
            this.sound_list['building'] = [this.load('building','voice')];
            this.sound_list['on_hold'] = [this.load('on_hold','voice')];
            this.sound_list['cancelled'] = [this.load('cancelled','voice')];
            this.sound_list['cannot_deploy_here'] = [this.load('cannot_deploy_here','voice')];
            this.sound_list['new_construction_options'] = [this.load('new_construction_options','voice')];
            this.sound_list['construction_complete'] = [this.load('construction_complete','voice')];
            this.sound_list['not_ready'] = [this.load('not_ready','voice')];
            this.sound_list['reinforcements_have_arrived'] = [this.load('reinforcements_have_arrived','voice')];
            this.sound_list['low_power'] = [this.load('low_power','voice')];
            
            this.sound_list['construction'] = [this.load('construction','sounds')];
            this.sound_list['crumble'] = [this.load('crumble','sounds')];
            this.sound_list['sell'] = [this.load('sell','sounds')];
            this.sound_list['button'] = [this.load('button','sounds')];
            this.sound_list['clock'] = [this.load('clock','sounds')];

            this.sound_list['vehicle_select'] = [this.load('ready_and_waiting','talk'),this.load('vehicle_reporting','talk'),this.load('awaiting_orders','talk')];
            this.sound_list['vehicle_move'] = [this.load('affirmative','talk'),this.load('moving_out','talk'),this.load('acknowledged','talk'),this.load('over_and_out','talk')];            
            
            this.sound_list['unit_select'] = [this.load('reporting','talk'),this.load('unit_reporting','talk'),this.load('awaiting_orders','talk')];
            this.sound_list['unit_move'] = [this.load('affirmative','talk'),this.load('yes_sir','talk'),this.load('acknowledged','talk'),this.load('right_away','talk')];
        }
    }

/*
	var pathFinder2 = {
	    start:{},
	    end:{},
	    openList:[],
	    closedList:[],
	    aStar: function(start,end){
	        this.start = start;
	        this.end = end;
	        openList = [];
	        closedList = [];
	        start.g = 0;
	        start.h = 10*(Math.abs(end.x-start.x)+Math.abs(end.y-start.y));
	        start.f = start.g+start.h;
	        openList[start.x+'_'+start.y] = start;
	        var foundEnd = this.processNode(start);
	        if (foundEnd){
	            var finalSolution = [{x:end.x,y:end.y}];
	            
	            var current = this.closedList[end.x+'_'+end.y];
	            do {
	                current = current.parent;
	                finalSolution.push({x:current.x,y:current.y});              
	            } while (current.parent);
	            return finalSolution;
	        } else {
	            return [];
	        }    
	    },
	    processNode: function(current,parent){
	        //console.log('Processing node '+current.x+ ' ' +current.y + ' with g ' + current.g);
	        this.addNode(current.x-1,current.y,current.g+10,current);
	        this.addNode(current.x+1,current.y,current.g+10,current);
	        this.addNode(current.x,current.y-1,current.g+10,current);
	        this.addNode(current.x,current.y+1,current.g+10,current);
	        
	        this.addNode(current.x+1,current.y+1,current.g+14,current);
	        this.addNode(current.x-1,current.y+1,current.g+14,current);
	        this.addNode(current.x-1,current.y-1,current.g+14,current);
	        this.addNode(current.x+1,current.y-1,current.g+14,current);
	        
	        delete this.openList[current.x+'_'+current.y];
	        this.closedList[current.x+'_'+current.y] = current;
	        
	        if (current.x == this.end.x && current.y == this.end.y){
	            return true;
	        } else {
	            var lowestF = null;
    	        for (var currCode in this.openList){  
    	            curr = this.openList[currCode];	            
    	            if (!lowestF || curr.f < lowestF.f){
    	                lowestF = curr;
    	                //console.log('curr ' +curr.x+'_'+curr.y);
    	            }
    	        }     
    	        //console.log('Found lowest F '+lowestF.x +' ,' +lowestF.y+' with f ' + lowestF.f);   
	            if (lowestF) {
	                return this.processNode(lowestF);
	            } else {
	                return false;
	            }
	        }
	    },
	    addNode: function(x,y,g,parent){
	        var current = {x:x,y:y,g:g,parent:parent}
	        current.h =  10*(Math.abs(this.end.x-current.x)+Math.abs(this.end.y-current.y));
	        current.f = current.g + current.h;
	        //console.log('try adding: '+current.x+'_'+ current.y);
	        if (!this.openList[x+'_'+y] && !this.closedList[x+'_'+y]){
	            //console.log('added to open list: '+current.x+'_'+ current.y + ' with an f of ' +current.f + 'g of ' +current.g + ' h of '+current.h);
	            this.openList[x+'_'+y] = current;
	        } else if (!this.closedList[x+'_'+y]){
	            //console.log('repeating '+current.x+'_'+ current.y )
	            var oldCurrent = this.openList[x+'_'+y];
	            if (oldCurrent.g > current.g){
	                this.openList[x+'_'+y] = current;
	                //console.log('modified to open list: '+current.x+'_'+ current.y + ' with an f of ' +current.f + 'g of ' +current.g + ' h of '+current.h);
    	            
	            }
	        }
	    }    
	}
*/	
	var AStar = (function () {

        /**
         * A* (A-Star) algorithm for a path finder
         * @author  Andrea Giammarchi
         * @license Mit Style License
         */

        function diagonalSuccessors($N, $S, $E, $W, N, S, E, W, grid, rows, cols, result, i) {
            if($N) {
                $E && !grid[N][E] && (result[i++] = {x:E, y:N});
                $W && !grid[N][W] && (result[i++] = {x:W, y:N});
            }
            if($S){
                $E && !grid[S][E] && (result[i++] = {x:E, y:S});
                $W && !grid[S][W] && (result[i++] = {x:W, y:S});
            }
            return result;
        }

        function diagonalSuccessorsFree($N, $S, $E, $W, N, S, E, W, grid, rows, cols, result, i) {
            $N = N > -1;
            $S = S < rows;
            $E = E < cols;
            $W = W > -1;
            if($E) {
                $N && !grid[N][E] && (result[i++] = {x:E, y:N});
                $S && !grid[S][E] && (result[i++] = {x:E, y:S});
            }
            if($W) {
                $N && !grid[N][W] && (result[i++] = {x:W, y:N});
                $S && !grid[S][W] && (result[i++] = {x:W, y:S});
            }
            return result;
        }

        function nothingToDo($N, $S, $E, $W, N, S, E, W, grid, rows, cols, result, i) {
            return result;
        }

        function successors(find, x, y, grid, rows, cols){
            var
                N = y - 1,
                S = y + 1,
                E = x + 1,
                W = x - 1,
                $N = N > -1 && !grid[N][x],
                $S = S < rows && !grid[S][x],
                $E = E < cols && !grid[y][E],
                $W = W > -1 && !grid[y][W],
                result = [],
                i = 0
            ;
            $N && (result[i++] = {x:x, y:N});
            $E && (result[i++] = {x:E, y:y});
            $S && (result[i++] = {x:x, y:S});
            $W && (result[i++] = {x:W, y:y});
            return find($N, $S, $E, $W, N, S, E, W, grid, rows, cols, result, i);
        }

        function diagonal(start, end, f1, f2) {
            return f2(f1(start.x - end.x), f1(start.y - end.y));
        }

        function euclidean(start, end, f1, f2) {
            var
                x = start.x - end.x,
                y = start.y - end.y
            ;
            return f2(x * x + y * y);
        }

        function manhattan(start, end, f1, f2) {
            return f1(start.x - end.x) + f1(start.y - end.y);
        }

        function AStar(grid, start, end, f) {
            var
                cols = grid[0].length,
                rows = grid.length,
                limit = cols * rows,
                f1 = Math.abs,
                f2 = Math.max,
                list = {},
                result = [],
                open = [{x:start[0], y:start[1], f:0, g:0, v:start[0]+start[1]*cols}],
                length = 1,
                adj, distance, find, i, j, max, min, current, next
            ;
            end = {x:end[0], y:end[1], v:end[0]+end[1]*cols};
            switch (f) {
                case "Diagonal":
                    find = diagonalSuccessors;
                case "DiagonalFree":
                    distance = diagonal;
                    break;
                case "Euclidean":
                    find = diagonalSuccessors;
                case "EuclideanFree":
                    f2 = Math.sqrt;
                    distance = euclidean;
                    break;
                default:
                    distance = manhattan;
                    find = nothingToDo;
                    break;
            }
            find || (find = diagonalSuccessorsFree);
            do {
                max = limit;
                min = 0;
                for(i = 0; i < length; ++i) {
                    if((f = open[i].f) < max) {
                        max = f;
                        min = i;
                    }
                };
                current = open.splice(min, 1)[0];
                if (current.v != end.v) {
                    --length;
                    next = successors(find, current.x, current.y, grid, rows, cols);
                    for(i = 0, j = next.length; i < j; ++i){
                        (adj = next[i]).p = current;
                        adj.f = adj.g = 0;
                        adj.v = adj.x + adj.y * cols;
                        if(!(adj.v in list)){
                            adj.f = (adj.g = current.g + distance(adj, current, f1, f2)) + distance(adj, end, f1, f2);
                            open[length++] = adj;
                            list[adj.v] = 1;
                        }
                    }
                } else {
                    i = length = 0;
                    do {
                        result[i++] = {x:current.x, y:current.y};
                    } while (current = current.p);
                    result.reverse();
                }
            } while (length);
            return result;
        }

        return AStar;

    }());

    
	
	game.begin();
    
	
});