
$(function() {
    var canvas = $('#canvas')[0];
	var context = canvas.getContext('2d');
	

	var mouse = {
	    x:0,
	    y:0,
	    gridX:0,
	    gridY:0,
	    gameX:0,
	    gameY:0,
	    insideCanvas:false,
	    panDirection:"",
	    panningThreshold:48,
        panningVelocity:24,
	    handlePanning: function(){
            var panDirection = "";
            if(mouse.insideCanvas){
                if(mouse.y <= game.viewportTop+mouse.panningThreshold &&  mouse.y >= game.viewportTop) {
        			game.viewportDeltaY = -mouse.panningVelocity;
        			panDirection += "_top";
        		} else if (mouse.y >= game.viewportTop+game.viewportHeight-mouse.panningThreshold && mouse.y <= game.viewportTop+game.viewportHeight){
        			game.viewportDeltaY = mouse.panningVelocity;
        			panDirection += "_bottom";
        		} else {
        			game.viewportDeltaY = 0;
        			panDirection += "";
        		}   

                if(mouse.x < mouse.panningThreshold && mouse.y >= game.viewportTop && mouse.y <= game.viewportTop+game.viewportHeight) {
        			game.viewportDeltaX = -mouse.panningVelocity;
        			panDirection += "_left";
        		} else if (mouse.x > game.screenWidth-mouse.panningThreshold && mouse.y >= game.viewportTop && mouse.y <= game.viewportTop+game.viewportHeight){
        			game.viewportDeltaX = mouse.panningVelocity;
        			panDirection += "_right";
        		} else {
        			game.viewportDeltaX = 0;
        			panDirection += "";
    		    }
		    }

    		if ((game.viewportX+game.viewportDeltaX < 0)
    		    || (game.viewportX+game.viewportDeltaX +game.screenWidth+(sidebar.visible?-sidebar.width:0)> game.currentLevel.mapImage.width)){
    			game.viewportDeltaX = 0;
    			//console.log (game.viewportX+game.viewportDeltaX +game.screenWidth+(sidebar.visible?-sidebar.width:0));
    			//console.log (game.currentLevel.mapImage.width);
    		} 
    		
    		if (!sidebar.visible && (game.viewportX+game.screenWidth>game.currentLevel.mapImage.width)){
    		    game.viewportX=game.currentLevel.mapImage.width-game.screenWidth;
    		    game.viewportDeltaX = 0;
    		}

    		if ((game.viewportY + game.viewportDeltaY< 0)
    		    || (game.viewportY+game.viewportDeltaY +game.viewportHeight> game.currentLevel.mapImage.height)){
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
    		game.viewportX += game.viewportDeltaX;
    	    game.viewportY += game.viewportDeltaY;
			mouse.gameX = mouse.x + game.viewportX-game.viewportLeft;
			mouse.gameY = mouse.y + game.viewportY-game.viewportTop;
			
			game.viewportAdjustX = game.viewportLeft - game.viewportX;
			game.viewportAdjustY = game.viewportTop - game.viewportY;
			
        },
	    cursorLoop:0,
	    drawCursor:function(){
	        if (!this.insideCanvas){
	            return;
	        }
	        this.cursorLoop ++;
	        if(this.cursorLoop >= this.cursor.cursorSpeed * this.cursor.count){
                this.cursorLoop = 0;
            }
            //alert(mouse.spriteImage)
            // If drag selecting, draw a white selection rectangle
    	    if(this.dragSelect){    
    	        var x = Math.min(this.gameX,this.dragX);
    	        var y = Math.min(this.gameY,this.dragY);
    	        var width = Math.abs(this.gameX-this.dragX)
    	        var height = Math.abs(this.gameY-this.dragY)
    	        context.strokeStyle = 'white';
			    context.strokeRect(x+game.viewportAdjustX,y+game.viewportAdjustY, width, height);
    	    }
    	    
            //var image = this.cursor.images[Math.floor(this.cursorLoop/this.cursor.cursorSpeed)];
            var imageNumber = this.cursor.spriteOffset+Math.floor(this.cursorLoop/this.cursor.cursorSpeed);
            context.drawImage(this.spriteImage,30*(imageNumber),0,30,24,this.x-this.cursor.x,this.y-this.cursor.y,30,24);
	    },
	    checkOverObject:function(){
	        this.overObject = null;
            for (var i = game.overlay.length - 1; i >= 0; i--){
    	        var overlay = game.overlay[i];
    	        
    	        if (overlay.name == 'tiberium' && this.gridX==overlay.x && this.gridY == overlay.y){
    	            //
    	            //console.log(overlay.name + ' ' +overlay.x + ' ' +overlay.y + ' '+this.gridX + ' '+this.gridY )
    	            this.overObject = overlay;
    	            //alert('overlay')
    	        }
    	    };
    	    for (var i = game.buildings.length - 1; i >= 0; i--){
    	        if(game.buildings[i].underPoint(this.gameX,this.gameY)){
    	            this.overObject = game.buildings[i];
    	            break;
    	        }
    	    };
    	    
    	    for (var i = game.turrets.length - 1; i >= 0; i--){
    	        if(game.turrets[i].underPoint(this.gameX,this.gameY)){
    	            this.overObject = game.turrets[i];
    	            break;
    	        }
    	    };
    	    
    	    for (var i = game.units.length - 1; i >= 0; i--){
    	        if(game.units[i].underPoint && game.units[i].underPoint(this.gameX,this.gameY)){
    	            this.overObject = game.units[i];
    	            break;
    	        }
    	    };
    	    
    	    
    	    return this.overObject;
	    },
	    draw:function(){
	        this.cursor = this.cursors['default'];
	        var selectedObject = this.checkOverObject();
	        
	        if(this.y < game.viewportTop || this.y>game.viewportTop + game.viewportHeight){
	            // default cursor if too much to the top
	        } else if (sidebar.deployMode){
        	    var buildingType = buildings.types[sidebar.deployBuilding]||turrets.types[sidebar.deployBuilding];
        	    var grid = $.extend([],buildingType.gridShape);
        	    grid.push(grid[grid.length-1]);
        	    //grid.push(grid[1]);
        	    for (var y=0; y < grid.length; y++) {
        	       for (var x=0; x < grid[y].length; x++) {
        	           if(grid[y][x] == 1){
        	               if (mouse.gridY+y<0||mouse.gridY+y>=game.buildingObstructionGrid.length||mouse.gridX+x<0||mouse.gridX+x>= game.buildingObstructionGrid[mouse.gridY+y].length|| game.buildingObstructionGrid[mouse.gridY+y][mouse.gridX+x] == 1){
        	               //if (game.buildingObstructionGrid[mouse.gridY+y][mouse.gridX+x] == 1){
        	                   game.highlightGrid(mouse.gridX+x,mouse.gridY+y,1,1,sidebar.placementRedImage);
        	                } else {
        	                    game.highlightGrid(mouse.gridX+x,mouse.gridY+y,1,1,sidebar.placementWhiteImage);
        	                }
                        }
        	       }
        	    }
        	} else if (sidebar.repairMode){
	            if(selectedObject && selectedObject.team == game.currentLevel.team 
	                && (selectedObject.type=='building'||selectedObject.type=='turret') && (selectedObject.health < selectedObject.hitPoints)){
	                    this.cursor = this.cursors['repair'];
	                } else {
	                    this.cursor = this.cursors['no_repair'];
	                }
	        } else if (sidebar.sellMode){
	            if(selectedObject && selectedObject.team == game.currentLevel.team 
	                && (selectedObject.type=='building'||selectedObject.type=='turret')){
	                    this.cursor = this.cursors['sell'];
	                } else {
	                    this.cursor = this.cursors['no_sell'];
	                }
	        } else if (sidebar.visible && mouse.x>sidebar.left){
	            //over a button
	            var hovButton = sidebar.hoveredButton();
                if (hovButton){
                    var tooltipName = hovButton.type;
                    switch(hovButton.type){
                        case 'infantry': tooltipName = infantry.types[hovButton.name].label;break;
                        case 'building': tooltipName = buildings.types[hovButton.name].label;break;
                        case 'turret': tooltipName = turrets.types[hovButton.name].label;break;
                        case 'vehicle': tooltipName = vehicles.types[hovButton.name].label;break;
                        
                    }
                    var tooltipCost = "$"+hovButton.cost;
                    //context.fillRect()
                    
                    context.fillStyle = 'black';
                    context.fillRect(Math.round(this.x),Math.round(this.y+16),tooltipName.length*5.5+8,32);
                    context.strokeStyle = 'darkgreen';
                    context.strokeRect(Math.round(this.x),Math.round(this.y+16),tooltipName.length*5.5+8,32);
                    context.fillStyle = 'darkgreen';
                    
            	    context.font = '12px "Command and Conquer"';
                    context.fillText(tooltipName,Math.round(this.x+4),Math.round(this.y+30));
                    context.fillText(tooltipCost,Math.round(this.x+4),Math.round(this.y+44));
                }	            
	        } else if(this.dragSelect){
	            this.cursor = this.cursors['default'];
	        } else if(selectedObject && !this.isOverFog){
	            if(selectedObject.team && selectedObject.team != game.currentLevel.team  && game.selectedAttackers.length>0){
	                this.cursor = this.cursors['attack'];
	            } else if (game.selectedUnits.length == 1 && game.selectedUnits[0].name== 'harvester' 
	                    && game.selectedUnits[0].team == game.currentLevel.team
	                    && (selectedObject.name == 'tiberium'||selectedObject.name=='refinery')) {
	            //My team's harvester is selected alone
	                if (selectedObject.name == 'tiberium') {
	                    this.cursor = this.cursors['attack']; // Harvester attacks tiberium 
	                }
	                if (selectedObject.name == 'refinery' && selectedObject.team == game.currentLevel.team){
	                    this.cursor = this.cursors['load_vehicle']; // Harvester enters my refinery
	                }
	            } else if(game.selectedUnits.length==1 && selectedObject.selected && selectedObject.team == game.currentLevel.team){
	                if(selectedObject.name=='mcv'){
	                    this.cursor = this.cursors['build_command'];
	                } 
	            } else if(!selectedObject.selected && selectedObject.name != 'tiberium'){
	                this.cursor = this.cursors['select'];
	            } else if(selectedObject.name == 'tiberium'){
	                if(game.obstructionGrid[mouse.gridY] && game.obstructionGrid[mouse.gridY][mouse.gridX] == 1){
    	                this.cursor = this.cursors['no_move'];
    	            } else {
    	               this.cursor = this.cursors['move'];
    	            }
	                
	            }
	        } else if (this.panDirection && this.panDirection != ""){
        	    this.cursor = this.cursors[this.panDirection];
        	}
            else if(game.selectedUnits.length>0){           
	            if(game.obstructionGrid[mouse.gridY] && game.obstructionGrid[mouse.gridY][mouse.gridX] == 1 && !this.isOverFog) {
	                this.cursor = this.cursors['no_move'];
	            } else {
	               this.cursor = this.cursors['move'];
	            }
	            
	        } 

    	    

    	    if(this.insideCanvas){
    	        this.drawCursor();
    	    }
    	    
	        
	    },
	    click: function(ev,rightClick){
	        if(mouse.y <= game.viewportTop && mouse.y > game.viewportTop - 15){
                // Tab Area Clicked    
                if (mouse.x>=0 && mouse.x< 160){
                    // Options button clicked
                    //alert ('No Options yet.');
                } else if (mouse.x>=320 && mouse.x< 480){
	                // Score button clicked
	                //alert ('Score button clicked');
                } else    if (mouse.x>=480 && mouse.x< 640){
                    // Sidebar button clicked
                    //alert ('Sidebar button clicked');
                    sidebar.visible = !sidebar.visible;
                } 
            } else if(mouse.y >= game.viewportTop && mouse.y <= game.viewportTop+game.viewportHeight){
                //Game Area Clicked
                if (sidebar.visible && mouse.x>sidebar.left){
                    //alert ('sidebar clicked');
                    sidebar.click(ev,rightClick);
                } else {
                    game.click(ev,rightClick);
                    //alert('game area clicked');
                }
                
	        }    
	    },
	    listenEvents: function(){
	        $('#canvas').mousemove(function(ev) {
	            var offset = $('#canvas').offset();
    			mouse.x = ev.pageX - offset.left;
    			mouse.y = ev.pageY - offset.top;  
    			

    			mouse.gridX = Math.floor((mouse.gameX) / game.gridSize);
    			mouse.gridY = Math.floor((mouse.gameY) / game.gridSize);
                mouse.isOverFog = fog.isOver(mouse.gameX,mouse.gameY);
    			//mouse.panDirection = mouse.handlePanning();
    			//mouse.showAppropriateCursor();
    			if (mouse.buttonPressed){
    			    if (Math.abs(mouse.dragX -mouse.gameX) > 5 ||
    			        Math.abs(mouse.dragY - mouse.gameY) > 5){
    			            mouse.dragSelect = true
    			        }
    			} else {
    			    mouse.dragSelect = false;
    			}         
	        });
	        
	        $('#canvas').click(function(ev) {
	            //Handle click hotspots
	            mouse.click(ev,false);
	            mouse.dragSelect = false;	            
	            return false;
	        });
	        
	        $('#canvas').mousedown(function(ev) {
	            if(ev.which == 1){
	                mouse.buttonPressed = true;
	                mouse.dragX = mouse.gameX;
	                mouse.dragY = mouse.gameY;
	                ev.preventDefault();
	            }
	            return false;
	        });
	        
	        $('#canvas').bind('contextmenu',function(ev){
	            mouse.click(ev,true);
	            return false;
	        });
	        
	        $('#canvas').mouseup(function(ev) {
	            if(ev.which ==1){
	                if (mouse.dragSelect){
	                    if (!ev.shiftKey){
    			            game.clearSelection();
    			        }
    			        var x1 = Math.min(mouse.gameX,mouse.dragX);
                	    var y1 = Math.min(mouse.gameY,mouse.dragY);
                	    var x2 = Math.max(mouse.gameX,mouse.dragX);
                	    var y2 = Math.max(mouse.gameY,mouse.dragY);
                        for (var i = game.units.length - 1; i >= 0; i--){
                            var unit = game.units[i];
                            if(!unit.selected && unit.team==game.currentLevel.team && x1<= unit.x*game.gridSize && x2 >= unit.x*game.gridSize
                                && y1<= unit.y*game.gridSize && y2 >= unit.y*game.gridSize){
                                    game.selectItem(unit,ev.shiftKey);
                                }
                        };
    			        //mouse.dragSelect = false;
	                }
	                mouse.buttonPressed = false;
	            }
	            return false;
	        });
	        
	        $('#canvas').mouseleave(function(ev) {
	            mouse.insideCanvas = false;
	        });
	        
	        $('#canvas').mouseenter(function(ev) {
	            mouse.buttonPressed = false;
	            mouse.insideCanvas = true;
	        });	        
	        
	        
	        $(document).keypress(function(ev) {
	            game.keyPressed(ev);
	        });
	        
	    },
	    loaded:false,
	    preloadCount:0,
	    loadedCount:0,
	    preloadImage:preloadImage,
	    spriteImage:null,
	    cursors:[],
    	cursorCount:0,
	    loadCursor:function(name,x,y,imageCount,cursorSpeed){
	        if(!x && !y){
	            x = 0;
	            y = 0;
	        }
	        if(!cursorSpeed){
	            cursorSpeed = 1;
	        }
	        if(!imageCount){
	            imageCount = 1;
	        }
	        this.cursors[name] = {x:x,y:y,name:name,count:imageCount,spriteOffset:this.cursorCount,cursorSpeed:cursorSpeed};
	        this.cursorCount += imageCount;
	        
	    },
	    loadAllCursors:function(){
	        mouse.spriteImage = this.preloadImage('cursors.png');
	        mouse.loadCursor('attack',15,12,8);
	        mouse.loadCursor('big_detonate',15,12,3);
            mouse.loadCursor('build_command',15,12,9);
            mouse.loadCursor('default');
            mouse.loadCursor('detonate',15,12,3);
            mouse.loadCursor('load_vehicle',15,12,3,2);
            
            mouse.loadCursor('unknown');
            mouse.loadCursor('unknown');
            mouse.loadCursor('move',15,12);
            mouse.loadCursor('no_default');
            mouse.loadCursor('no_move',15,12);
            
            mouse.loadCursor('no_pan_bottom', 15,24); 
            mouse.loadCursor('no_pan_bottom_left',0,24);
            mouse.loadCursor('no_pan_bottom_right',30,24); 
            mouse.loadCursor('no_pan_left',0,12); 
            mouse.loadCursor('no_pan_right', 30,12);
            mouse.loadCursor('no_pan_top', 15,0);
            mouse.loadCursor('no_pan_top_left',0,0);
            mouse.loadCursor('no_pan_top_right', 30,0);
            
            mouse.loadCursor('no_repair',15,0);
            mouse.loadCursor('no_sell',15,12);
            
            mouse.loadCursor('pan_bottom', 15,24); 
            mouse.loadCursor('pan_bottom_left',0,24);
            mouse.loadCursor('pan_bottom_right',30,24); 
            mouse.loadCursor('pan_left',0,12); 
            mouse.loadCursor('pan_right', 30,12);
            mouse.loadCursor('pan_top', 15,0);
            mouse.loadCursor('pan_top_left',0,0);
            mouse.loadCursor('pan_top_right', 30,0);
            mouse.loadCursor('repair',15,0,24);
            mouse.loadCursor('select',15,12,6,2); 
            mouse.loadCursor('sell',15,12,24);
	    }
	}; 
	
	var game = {
	    screenWidth:canvas.width,
	    screenHeight:canvas.height,
	    viewportTop:35,
	    viewportLeft:0,
	    viewportX:0,
	    viewportY:0,
	    viewportDeltaX:0,
	    viewportDeltaY:0,
	    gridSize:24,
	    animationLoop:null,
	    animationTimeout:50,
	    debugMode:false,
	    speedAdjustmentFactor:0.2,
	    setViewport:function(){
    	    context.beginPath();
    	    this.viewportWidth = (sidebar.visible)?(this.screenWidth-sidebar.width):this.screenWidth;
    	    this.viewportHeight = 480;
    	    context.rect(this.viewportLeft,this.viewportTop,this.viewportWidth-this.viewportLeft,this.viewportHeight);
    	    context.clip();
    	},
    	drawMap:function(){
  	    //context.drawImage(this.currentLevel.mapImage,0,0);
  	        mouse.handlePanning();
    	    context.drawImage(this.currentLevel.mapImage,
    			this.viewportX,this.viewportY,this.viewportWidth,this.viewportHeight, 
    			this.viewportLeft,this.viewportTop,this.viewportWidth,this.viewportHeight);
    	    
    	    
    	    // Create an obstruction grid from the level 
    	    game.obstructionGrid = []; // normal obstructions
    	    game.heroObstructionGrid = []; // Cannot see in fog, so pretend
    	    game.buildingObstructionGrid = [];  // Cannot build on fog; Cannot build on bib
    	    
    	    for (var y=0; y < this.currentLevel.obstructionGrid.length; y++) {
    	        game.obstructionGrid[y] = [];
    	        game.heroObstructionGrid[y] = [];
    	        game.buildingObstructionGrid[y] = [];
    	       for (var x=0; x < this.currentLevel.obstructionGrid[y].length; x++) {
    	           game.obstructionGrid[y][x] = this.currentLevel.obstructionGrid[y][x];
    	           game.heroObstructionGrid[y][x] = this.currentLevel.obstructionGrid[y][x];
    	           game.buildingObstructionGrid[y][x] = this.currentLevel.obstructionGrid[y][x];
	           }
    	    }
            
    	    for (var i = this.buildings.length - 1; i >= 0; i--){
    	        var bldng = this.buildings[i];
    	        for (var y = 0;y<bldng.gridShape.length;y++){
    	            for(var x = 0;x<bldng.gridShape[y].length;x++){
    	                if(bldng.gridShape[y][x]==1){
    	                    game.obstructionGrid[y+bldng.y][x+bldng.x] = 1;
    	                    game.heroObstructionGrid[y+bldng.y][x+bldng.x] = 1;
    	                    game.buildingObstructionGrid[y+bldng.y][x+bldng.x] = 1;

    	                    //include an extra row for bib as a no building zone
    	                    if(y == bldng.gridShape.length-1){
    	                        game.buildingObstructionGrid[y+1+bldng.y][x+bldng.x] = 1;
    	                    }
    	                }
    	            }
    	        }

    	    };
    	    for (var i = this.turrets.length - 1; i >= 0; i--){
    	        game.obstructionGrid[this.turrets[i].y][this.turrets[i].x] = 1;
    	        game.heroObstructionGrid[y+bldng.y][x+bldng.x] = 1;
    	        game.buildingObstructionGrid[y+bldng.y][x+bldng.x] = 1;
    	    };
    	    
    	    
    	    for (var i = this.units.length - 1; i >= 0; i--){
    	            var unit = this.units[i];
    	        
    	            var x = unit.x;
        	        var y = unit.y;
        	        //var collisionRadius = unit.collisionRadius/game.gridSize;
        	        game.buildingObstructionGrid[Math.floor(y)][Math.floor(x)] = 1;
    	            //game.obstructionGrid[Math.floor(y-collisionRadius)][Math.floor(x-collisionRadius)] = 1;
    	            //game.obstructionGrid[Math.floor(y-collisionRadius)][Math.floor(x+collisionRadius)] = 1;
    	            //game.obstructionGrid[Math.floor(y+collisionRadius)][Math.floor(x-collisionRadius)] = 1;
    	            //game.obstructionGrid[Math.floor(y+collisionRadius)][Math.floor(x+collisionRadius)] = 1;
    	        
    	    };
    	    
    	    for (var i = this.overlay.length - 1; i >= 0; i--){
    	        var over= this.overlay[i];
                 if(over.name == 'tree'){
                    game.obstructionGrid[over.y][over.x] = 1;
                    game.heroObstructionGrid[over.y][over.x] = 1;
                    game.buildingObstructionGrid[over.y][over.x] = 1;
                } else if(over.name == 'trees'){
                    game.obstructionGrid[over.y][over.x] = 1;
                    game.obstructionGrid[over.y][over.x+1] = 1;
                    game.heroObstructionGrid[over.y][over.x] = 1;
                    game.heroObstructionGrid[over.y][over.x+1] = 1;
                    game.buildingObstructionGrid[over.y][over.x] = 1;
                    game.buildingObstructionGrid[over.y][over.x+1] = 1;
                }else if(over.name == 'tiberium'){
                    game.buildingObstructionGrid[over.y][over.x] = 1;
                }
    	    };
    	    
    	    
    	    // If hero cannot see under fog, he assumes he can travel there... 
    	    // when he sees the building, he goes oops!!! and then starts avoiding it....
    	    
    	    // Buildings can't be built on fog either
    	    for (var y=0; y < game.heroObstructionGrid.length; y++) {
    	       for (var x=0; x < game.heroObstructionGrid[y].length; x++) {
    	           if(fog.isOver((x+0.5)*game.gridSize,(y+0.5)*game.gridSize)){
    	               //game.heroObstructionGrid[y][x] = 0;
    	               game.buildingObstructionGrid[y][x] = 1;
    	           }
	           }
    	    }
    	    
    	},
    	controlGroups:[],
    	keyPressed:function(ev){
    	    var keyCode = ev.which;
    	    var ctrlPressed = ev.ctrlKey;
    	    //keys from 0 to 9 pressed
    	    if (keyCode >= 48 && keyCode <= 57) {
    	        var keyNumber = (keyCode-48)
    	        if (ctrlPressed){
    	            if (game.selectedItems.length > 0){
    	                game.controlGroups[keyNumber] = $.extend([],game.selectedItems);
    	                //console.log(keyNumber + ' now has ' +game.controlGroups[keyNumber].length +' items');
    	            }
    	            //console.log ("Pressed Ctrl"+ (keyNumber-48));   
    	        } else {
    	            if (game.controlGroups[keyNumber]){
    	                game.clearSelection();
    	                //console.log ("Pressed"+ (keyNumber));
    	                //console.log(game.controlGroups[keyNumber].length)
    	                for (var i = game.controlGroups[keyNumber].length - 1; i >= 0; i--){
    	                    if (game.controlGroups[keyNumber][i].status=='destroy'){
    	                        game.controlGroups[keyNumber].splice(i,1);
    	                    } else {
    	                        game.selectItem(game.controlGroups[keyNumber][i]);
    	                    }
    	                    
    	                    //console.log ('selecting '+game.controlGroups[keyNumber][i].name)
    	                };
    	            }
    	            
    	        }
    	        
    	    }
    	},
    	highlightGrid: function(i,j,width,height,optionalImage){
            //alert('('+i+','+j+')');
            var gridSize = game.gridSize;
            
            if (optionalImage && $(optionalImage).is('img')){
                context.drawImage(optionalImage,i*gridSize+game.viewportAdjustX,j*gridSize + game.viewportAdjustY,width*gridSize,height*gridSize);
            } else {
                if (optionalImage){
                    context.fillStyle = optionalImage;
                } else {
                    context.fillStyle = 'rgba(225,225,225,0.5)';
                }
                context.fillRect(i*gridSize+game.viewportAdjustX,j*gridSize + game.viewportAdjustY,width*gridSize,height*gridSize);
            }
        },
    	drawGrid: function(){
    	    var gridSize = game.gridSize;
    	    var mapWidth = game.currentLevel.mapImage.width;
    	    var mapHeight = game.currentLevel.mapImage.height;
    	    var viewportX = game.viewportX;
    	    var viewportY = game.viewportY;
    	    
    	    var gridWidth = mapWidth/gridSize;
    	    var gridHeight = mapHeight/gridSize;
    	    context.beginPath();
    	    context.strokeStyle = 'rgba(30,0,0,.6)';
    	    for (var i=0; i < gridWidth ; i++) {
    	        context.moveTo(i*gridSize-viewportX+game.viewportLeft,0-viewportY+game.viewportTop);
    	        context.lineTo(i*gridSize-viewportX+game.viewportLeft,mapHeight-viewportY+game.viewportTop);
    	    }
    	    for (var i=0; i < gridHeight; i++) {
    	        context.moveTo(0-viewportX+game.viewportLeft,i*gridSize-viewportY+game.viewportTop);
    	        context.lineTo(mapWidth-viewportX+game.viewportLeft,i*gridSize-viewportY+game.viewportTop);
    	    }
    	    context.stroke();
    	    
    	    
    	    
    	    for (var i = game.obstructionGrid.length - 1; i >= 0; i--){
    	       for (var j = game.obstructionGrid[i].length - 1; j >= 0; j--){
    	           if(game.heroObstructionGrid[i][j] == 1){
    	               game.highlightGrid(j,i,1,1,'rgba(100,0,0,0.5)');
    	           }
    	       };
    	    };
    	    
    	},
    	units:[],
    	buildings:[],
    	turrets:[],
    	overlay:[],
    	bullets:[],
    	fireBullet:function(bullet){
    	    bullet.x = bullet.x - 0.5*Math.sin(bullet.angle);
            bullet.y = bullet.y - 0.5*Math.cos(bullet.angle);
            bullet.range = bullet.range - 0.5;
            //alert(bullet.x +' '+bullet.y)
            this.bullets.push(bullet);
            setTimeout(function() {bullet.source.bulletFiring = false;},bullet.source.reloadTime);
    	},
    	drawBullets:function(){
    	    
    	    for (var j = this.bullets.length - 1; j >= 0; j--){
    	        var bullet = this.bullets[j];
    	           
    	        bullet.speed=5;
                bullet.range = bullet.range - 0.1*bullet.speed;
                bullet.x = bullet.x - 0.1*bullet.speed*Math.sin(bullet.angle);
                bullet.y = bullet.y - 0.1*bullet.speed*Math.cos(bullet.angle);
                
                
                var x = (bullet.x*game.gridSize);
    	        var y = (bullet.y*game.gridSize);
                //alert(x + ' ' + y)
                
    	        if(!bullet.dead){
    	            var overObject;
        	        for (var i = game.units.length - 1; i >= 0; i--){
            	        if(game.units[i].underPoint && game.units[i].underPoint(x,y) && game.units[i].team != bullet.source.team){
                            overObject = game.units[i];
            	            break;
            	        }
            	    };
            	    for (var i = game.buildings.length - 1; i >= 0; i--){
            	        if(game.buildings[i].underPoint(x,y)){
            	            overObject = game.buildings[i];
            	            break;
            	        }
            	    };
            	    
            	    for (var i = game.turrets.length - 1; i >= 0; i--){
            	        if(game.turrets[i].underPoint(x,y)){
            	            overObject = game.turrets[i];
            	            break;
            	        }
            	    };

                    if (overObject){
                        bullet.dead = true;
                        //alert(overObject.health);
                        overObject.health = overObject.health - Math.floor((bullet.damage?bullet.damage:10)+10*Math.random());
                        if (overObject.health <= 0){
                            overObject.status = 'destroy';
                        }
                    }

    	            context.fillStyle = 'red';
                    context.fillRect(x+game.viewportAdjustX,y+game.viewportAdjustY,2,2);
    	        }
    	        
                //alert(x +' '+y)
                if (bullet.range<=0){
                    //bullet.source.bulletFiring = false;
                    this.bullets.splice(j,1);
                }
                
    	    };
    	},
    	drawObjects:function(){
    	    var objects = [];
    	    for (var i = this.buildings.length - 1; i >= 0; i--){
    	        if(this.buildings[i].status == 'destroy'){
    	            this.buildings.splice(i,1);
    	        }
    	    };
    	    
    	    for (var i = this.units.length - 1; i >= 0; i--){
    	        if(this.units[i].status == 'destroy'){
    	            this.units.splice(i,1);
    	        }
    	    };
    	    
    	    for (var i = this.turrets.length - 1; i >= 0; i--){
    	        if(this.turrets[i].status == 'destroy'){
    	            this.turrets.splice(i,1);
    	        }
    	    };
    	    
    	    for (var i = this.selectedItems.length - 1; i >= 0; i--){
    	        if(this.selectedItems[i].status == 'destroy'){
    	            this.selectedItems.splice(i,1);
    	        }
    	    };
    	    
            for (var i = this.selectedAttackers.length - 1; i >= 0; i--){
    	        if(this.selectedAttackers[i].status == 'destroy'){
    	            this.selectedAttackers.splice(i,1);
    	        }
    	    };
    	    
    	    for (var i = this.selectedUnits.length - 1; i >= 0; i--){
    	        if(this.selectedUnits[i].status == 'destroy'){
    	            this.selectedUnits.splice(i,1);
    	        }
    	    };
    	    
    	    $.merge(objects,this.units);
    	    $.merge(objects,this.buildings);
    	    $.merge(objects,this.overlay);
    	    $.merge(objects,this.turrets);
    	    
    	    var cgY=function(obj){
    	        if (obj.type=="building"){
    	            return obj.y+obj.gridShape.length/2;
    	        } 
    	        return obj.y
    	    }
    	    objects.sort(function(a,b){
    	        return cgY(b)-cgY(a);
    	        //return b.y - a.y;
    	    });
    	    
    	    for (var i = this.overlay.length - 1; i >= 0; i--){
    	        var overlay = this.overlay[i];
    	        if(overlay.name=='tiberium'){
    	            overlay.draw();
    	        }
	        };
    	    
    	    for (var i = objects.length - 1; i >= 0; i--){
    	        if (objects[i].name != 'tiberium'){
    	            objects[i].draw();
    	        }
    	       
    	    };
    	    
    	    
    	    /*for (var i = this.units.length - 1; i >= 0; i--){
    	       this.units[i].draw();
    	    };
    	    
    	    for (var i = this.buildings.length - 1; i >= 0; i--){
    	       this.buildings[i].draw();
    	    };*/
    	},
    	moveObjects:function(){
    	    for (var i = this.units.length - 1; i >= 0; i--){
    	        if(this.units[i].processOrders){
    	            this.units[i].processOrders();
    	        }
    	        this.units[i].move();
    	    };
    	    for (var i = this.turrets.length - 1; i >= 0; i--){
    	        if(this.turrets[i].processOrders){
    	            this.turrets[i].processOrders();
    	        }
    	        this.turrets[i].move();
    	    };
    	},
    	showDebugger:function(){
    	    var getKeys = function(item) {
    	        var html = '<ul>';
    	        for (key in item){
    	            if (item.hasOwnProperty(key)) {
    	                var o = item[key];
    	                if (typeof o != "function" || o === null){
    	                    
    	                    if(typeof o == "object"){
    	                        html += "<li>"+key+" : ";
    	                        if(o instanceof HTMLImageElement){
    	                            html += (o.src).replace(/^.+images\//,'');
    	                        } else if (o instanceof Array) {
        	                        html += 'Array['+o.length+']';
        	                    } else {
    	                            html += 'Object';//getKeys(o);
    	                        }    
    	                    } else {
    	                        html += "<li>"+key+" : "+o+"</li>";
    	                    }
    	                     
    	                }
    	                
	                }
    	        }
    	        html += "</ul>";
    	        return html;
    	    };
    	    var html = "";
    	    
    	    html += "Level";
    	    html += getKeys(levels);
    	    html += "Mouse";
    	    html += getKeys(mouse);
    	    if(game.selectedItems.length==1){
    	        html += "Selected Item";
    	        html += getKeys(game.selectedItems[0]);
            }
    	    html += "Game";
    	    html += getKeys(game);
    	    html += "Sidebar";
            html += getKeys(sidebar);
            html += "Vehicles";
            html += getKeys(vehicles);
            html += "Buildings";
            html += getKeys(buildings);
            
            html += "Infantry";
            html += getKeys(infantry);

    	    $('#debugger').html(html);
    	},
    	animate: function(){
    	    // main animation loop once game has started
    	    if (game.debugMode){
    	        game.showDebugger();
    	    }
    	    
    	    if(!levels.loaded || !sidebar.loaded 
    	        || !vehicles.loaded|| !infantry.loaded || !buildings.loaded){
    	        context.clearRect(0,0,canvas.width,canvas.height);
    	        return;
    	        
    	    }
    	    
    	    context.save();
    	    // Draw the top panels
    	    // Draw sidebar if appropriate
    	    // set viewport
    	    
    	    sidebar.draw();
    	    game.setViewport();
    	    
    	    game.drawMap();
            if (game.debugMode){
                game.drawGrid();
                
            }
    	    
    	    // Draw the map
    	    //////////////
    	    // Test scripted events and handle
    	    // Draw the overlay
    	    // Draw the buildings
    	    // Any animation if necessary
    	    game.moveObjects();
    	    // Draw the units
    	    game.drawObjects();
    	    
    	    //
    	    
    	    game.drawBullets();
    	    if(!game.debugMode){
    	        fog.draw();
    	    }
    	    
    	    context.restore();
    	    
    	    
    	    game.drawMessage();
    	    // show appropriate mouse cursor
    	    mouse.draw();
    	    
    	    ///game.missionStatus();
    	    //
    	    
    	},
    	messageVisible:true,
    	messageHeadingVisible : true,
    	messageText:'\nCreate a base by deploying your MCV. Build a power plant and weapons factory.\n\nUse your tanks to get rid of all enemy presence in the area.',
    	drawMessage:function(){
    	    if(!this.messageVisible){
    	        return;
    	    }    	        
    	    context.drawImage(sidebar.messageBox,game.viewportLeft+22,game.viewportTop+150);
    	    if (!this.messageHeadingVisible){
    	        context.fillStyle = 'black';
    	        context.fillRect(265,198,120,20)
    	    }
    	    
    	    
    	    context.fillStyle = 'green';
    	    context.font = '16px "Command and Conquer"';
    	    var msgs = this.messageText.split('\n');
    	    for (var i=0; i < msgs.length; i++) {
    	        context.fillText(msgs[i],game.viewportLeft+80,game.viewportTop+200+i*18)
    	    };
    	    
    	},
    	displayMessage:function(text,displayHeader){
            this.messageText = text;
            this.messageVisible = true;
            this.messageHeadingVisible = !!displayHeader;
    	},
    	missionStatus:function(){
    	    var heroUnits=[],heroBuildings=[],heroTurrets=[],villainBuildings=[],villainUnits=[],villainTurrets=[];
    	    for (var i = game.units.length - 1; i >= 0; i--){
    	       item = game.units[i];
    	       if (item.team == game.currentLevel.team){
    	           heroUnits.push(item);
    	       } else {
    	           villainUnits.push(item);
    	       }
    	    };
    	    for (var i = game.buildings.length - 1; i >= 0; i--){
    	       item = game.buildings[i];
    	       if (item.team == game.currentLevel.team){
    	           heroBuildings.push(item);
    	       } else {
    	           villainBuildings.push(item);
    	       }
    	    };
    	    for (var i = game.turrets.length - 1; i >= 0; i--){
    	       item = game.turrets[i];
    	       if (item.team == game.currentLevel.team){
    	           heroTurrets.push(item);
    	       } else {
    	           villainTurrets.push(item);
    	       }
    	    };
    	    
    	    //alert(heroBuildings.length)
    	    if(heroUnits.length ==0  && heroBuildings.length==0){
    	       //mission failed;
    	       sounds.play('mission_failure');
    	       game.end();
    	       //alert('Game over \n If you liked this, please share with your friends using the Like button and leave me a comment');
    	    }
    	    if (villainTurrets.length == 0 && villainBuildings.length==0 && villainUnits.length==0){
    	        //mission accomplished
    	        sounds.play('mission_accomplished');
    	        game.end();
    	        //alert('Game over \n If you liked this, please share with your friends using the Like button and leave me a comment');
    	    }
    	},
    	selectedItems:[],
    	selectedAttackers:[],
    	selectedUnits:[],
    	clearSelection:function(){
    	    for (var i = this.selectedItems.length - 1; i >= 0; i--){
    	       this.selectedItems[i].selected = 0;
    	       this.selectedItems.splice(i,1);
    	    };
    	    this.selectedAttackers = [];
    	    this.selectedUnits = []
    	},
    	selectItem:function(item,shiftPressed){
    	    if (shiftPressed && item.selected){
    	        // deselect item
    	        item.selected = false;
    	        this.selectedItems.remove(item);
    	        this.selectedUnits.remove(item);
    	        this.selectedAttackers.remove(item);
    	        return;    	    
    	    }
    	    
    	    item.selected = true;
            this.selectedItems.push(item);
            //alert(1)
            if(item.type != 'building' && item.team == game.currentLevel.team){
                this.selectedUnits.push(item);
                sounds.play(item.type+'_select');
                if (item.primaryWeapon){
                    this.selectedAttackers.push(item);
                }
            }
    	},
    	click: function(ev,rightClick){
    	    
    	    if (game.messageVisible){
    	        if (mouse.x>= 290 && mouse.x<= 350 && mouse.y>=310 && mouse.y <= 325){
    	            game.messageVisible = false;
    	            return;
    	        }
    	    }
	        var selectedObject = mouse.checkOverObject();
	        if (rightClick){
	            this.clearSelection();
	            sidebar.repairMode = false;
	            sidebar.deployMode = false;
	            sidebar.sellMode = false;
	            return;
	        }	        
	        if (sidebar.repairMode){
	            if(selectedObject && selectedObject.team == game.currentLevel.team 
	                && (selectedObject.type=='building'||selectedObject.type=='turret') && (selectedObject.health < selectedObject.hitPoints)){
	                    // do repair
	                    //alert('repairing')
	                    selectedObject.repairing = true;
	                }
	        } else if (sidebar.deployMode){
                //if (buildings.canConstruct(sidebar.deployBuilding,mouse.gridX,mouse.gridY)){
                    var buildingType = buildings.types[sidebar.deployBuilding]||turrets.types[sidebar.deployBuilding];
            	    var grid = $.extend([],buildingType.gridShape);
            	    grid.push(grid[grid.length-1]);
            	    //grid.push(grid[1]);
            	    for (var y=0; y < grid.length; y++) {
            	       for (var x=0; x < grid[y].length; x++) {
            	          
            	           if(grid[y][x] == 1){
            	               //console.log("mouse.gridX+x"+(mouse.gridX+x)+"mouse.gridY+y:"+(mouse.gridY+y))
            	               if (mouse.gridY+y<0||mouse.gridY+y>=game.buildingObstructionGrid.length||mouse.gridX+x<0||mouse.gridX+x>= game.buildingObstructionGrid[mouse.gridY+y].length|| game.buildingObstructionGrid[mouse.gridY+y][mouse.gridX+x] == 1){
            	                   sounds.play('cannot_deploy_here');
            	                   return;
            	                }
                            }
            	       }
        	        }
                    sidebar.finishDeployingBuilding();                        
                //} else {
                //    sounds.play('cannot_deploy_here');
                //}
            } else if (sidebar.sellMode){
	            if(selectedObject && selectedObject.team == game.currentLevel.team 
	                && (selectedObject.type=='building'||selectedObject.type=='turret')){
	                    if (selectedObject.name=='refinery' && selectedObject.status=='unload'){
	                        game.units.push(vehicles.add({name:'harvester',team:selectedObject.team,x:selectedObject.x+0.5,
            	                y:selectedObject.y + 2,health:selectedObject.harvester.health,moveDirection:14,orders:{type:'guard'}}));
            	                selectedObject.harvester = null;       
	                    }
	                    selectedObject.status = 'sell';
	                    sounds.play('sell');
	                    sidebar.cash += selectedObject.cost/2;
	                }
	        } else if (!rightClick && !mouse.dragSelect){
    	        if (selectedObject){
    	            if(game.selectedUnits.length==1 && selectedObject.selected && selectedObject.team == game.currentLevel.team){
    	                if (selectedObject.name=='mcv'){
    	                    // check building deployment
    	                    this.clearSelection();                    
    	                    selectedObject.orders = {type:'build'};
    	                    //alert('put a building here')
    	                }
    	            } else if (game.selectedUnits.length == 1 && game.selectedUnits[0].name== 'harvester' 
        	                    && game.selectedUnits[0].team == game.currentLevel.team
        	                    && (selectedObject.name == 'tiberium'||selectedObject.name=='refinery') && !mouse.isOverFog) {
        	            //My team's harvester is selected alone
        	                if (selectedObject.name == 'tiberium') {
        	                    game.selectedUnits[0].orders = {type:'harvest',to:{x:selectedObject.x,y:selectedObject.y}};
        	                    sounds.play('vehicle_move');
        	                }
        	                if (selectedObject.name == 'refinery' && selectedObject.team == game.currentLevel.team){
        	                    game.selectedUnits[0].orders = {type:'harvest-return',to:selectedObject};
        	                    sounds.play('vehicle_move');
        	                }
        	        } else if(selectedObject.team == game.currentLevel.team){
    	                if(!ev.shiftKey){
    	                    this.clearSelection();
    	                }
                        this.selectItem(selectedObject,ev.shiftKey);
                    } else if(game.selectedAttackers.length>0 && selectedObject.name != 'tiberium' && !mouse.isOverFog){
                        for (var i = game.selectedAttackers.length - 1; i >= 0; i--){
                            if (game.selectedAttackers[i].primaryWeapon){
                                game.selectedAttackers[i].orders = {type:'attack',target:selectedObject}; 
                    	        sounds.play(game.selectedAttackers[i].type+'_move');
                            }
            	           
            	        };  
                    } else if (selectedObject.name == 'tiberium') {
                        if(game.selectedUnits.length>0){
            	            if(game.obstructionGrid[mouse.gridY] && game.obstructionGrid[mouse.gridY][mouse.gridX] == 1 && !mouse.isOverFog){
                                // Don't do anything
            	            } else {
            	                for (var i = game.selectedUnits.length - 1; i >= 0; i--){
                    	           game.selectedUnits[i].orders = {type:'move',to:{x:mouse.gridX,y:mouse.gridY}}; 
                    	           sounds.play(game.selectedUnits[i].type+'_move');
                    	        };
            	            }
                	    }
                    } else {
                        if(!ev.shiftKey){
    	                    this.clearSelection();
    	                }
                        this.selectItem(selectedObject,ev.shiftKey);   
                    }
    	        } else { // no object under mouse
        	        if(game.selectedUnits.length>0){
        	            if(game.obstructionGrid[mouse.gridY] && game.obstructionGrid[mouse.gridY][mouse.gridX] == 1 && !mouse.isOverFog){
                            // Don't do anything
        	            } else {
        	                for (var i = game.selectedUnits.length - 1; i >= 0; i--){
                	           game.selectedUnits[i].orders = {type:'move',to:{x:mouse.gridX,y:mouse.gridY}}; 
                	           sounds.play(game.selectedUnits[i].type+'_move');
                	        };
        	            }
            	    }
    	        }
    	    }
	    },
    	start: function(){
    	    // Show main menu screen
    	    // Wait for level click
    	    //$(canvas).css("cursor", "cursor:url(cursors/blank.png),none !important;");
    	    // load all sounds
    	    // load level
    	    mouse.loadAllCursors();
    	    sounds.loadAll();
    	    overlay.loadAll();
    	    
    	    this.currentLevel = levels.load('gdi1');
    	    this.overlay = this.currentLevel.overlay;
    	    //this.team = this.currentLevel.team;
    	    sidebar.load();
    	    
    	    mouse.listenEvents();
            fog.init();
            
            game.viewportX = 96;
            game.viewportY = 264;
            sidebar.visible = false;
            // Enemy Stuff
            this.turrets.push(turrets.add({name:'gun-turret',x:8,y:6,turretDirection:16,team:'nod'}));
            this.turrets.push(turrets.add({name:'gun-turret',x:9,y:3,turretDirection:16,team:'nod'}));
            this.turrets.push(turrets.add({name:'gun-turret',x:7,y:5,turretDirection:16,team:'nod'}));
            this.turrets.push(turrets.add({name:'gun-turret',x:8,y:2,turretDirection:16,team:'nod'}));
            
            this.turrets.push(turrets.add({name:'gun-turret',x:16,y:25,turretDirection:24,team:'nod'}));
            this.turrets.push(turrets.add({name:'gun-turret',x:13,y:26,turretDirection:24,team:'nod'}));
            
            this.turrets.push(turrets.add({name:'gun-turret',x:11,y:23,turretDirection:18,team:'nod'}));
            this.turrets.push(turrets.add({name:'gun-turret',x:10,y:24,turretDirection:20,team:'nod'}));
            this.turrets.push(turrets.add({name:'gun-turret',x:9,y:25,turretDirection:24,team:'nod'}));
            //this.turrets.push(turrets.add({name:'gun-turret',x:9,y:26,turretDirection:26,team:'nod'}));
            
            this.buildings.push(buildings.add({name:'refinery',team:'nod',x:26,y:8,status:'build',health:200}));
            //this.units.push(vehicles.add({name:'harvester',team:'nod',x:24,y:18,moveDirection:0}));
            
            
            //this.units.push(vehicles.add({name:'harvester',x:25,y:18,moveDirection:0}));
            
            this.buildings.push(buildings.add({name:'construction-yard',x:1,y:14,team:'nod'}));
            this.buildings.push(buildings.add({name:'power-plant',x:5,y:14,team:'nod'}));
            
            this.buildings.push(buildings.add({name:'hand-of-nod',x:5,y:19,team:'nod'}));
            
            //this.buildings.push(buildings.add({name:'barracks',x:4,y:14,team:'nod'}));             
            //this.buildings.push(buildings.add({name:'power-plant',x:18,y:10,health:200,team:'nod'})); 
    	    this.units.push(vehicles.add({name:'light-tank',x:7,y:6,team:'nod',orders:{type:'patrol',from:{x:9,y:24},to:{x:12,y:8}}}));      	    
    	    this.units.push(vehicles.add({name:'light-tank',x:2,y:20,team:'nod',orders:{type:'patrol',from:{x:2,y:5},to:{x:6,y:20}}}));
    	    this.units.push(vehicles.add({name:'light-tank',x:5,y:10,team:'nod',orders:{type:'patrol',from:{x:17,y:12},to:{x:22,y:2}}}));
    	    
    	    //this.units.push(vehicles.add({name:'light-tank',x:2,y:2,team:'nod',orders:{type:'patrol',from:{x:25,y:5},to:{x:17,y:25}}}));
    	    this.units.push(vehicles.add({name:'light-tank',x:4,y:23,team:'nod',orders:{type:'patrol',from:{x:4,y:23},to:{x:22,y:25}}}));
    	    this.units.push(vehicles.add({name:'light-tank',x:2,y:10,team:'nod',orders:{type:'protect',target:game.units[0]}}));

    	    this.units.push(vehicles.add({name:'mcv',x:23.5,y:23.5,moveDirection:0,orders:{type:'move',to:{x:23,y:21}}}));
    	    this.units.push(vehicles.add({name:'light-tank',x:23,y:27,moveDirection:0,orders:{type:'move',to:{x:22,y:23}}}));
    	    this.units.push(vehicles.add({name:'light-tank',x:24,y:27,moveDirection:0,orders:{type:'move',to:{x:24,y:23}}}));
    	    
    	    
    	    //this.buildings.push(buildings.add({name:'weapons-factory',x:18,y:6}));
    	    
    	    
    	    //this.buildings.push(buildings.add({name:'weapons-factory',x:24,y:18}));

    	    
    	    //this.units.push(vehicles.add({name:'mcv',x:7,y:4,moveDirection:8}));
    	    //this.units.push(infantry.add({name:'minigunner',x:27,y:12,team:'nod'}));
    	    //this.units.push(infantry.add({name:'minigunner',x:6,y:22,team:'nod'}));
    	    //this.units.push(infantry.add({name:'minigunner',x:5,y:22,team:'nod'}));
    	    //this.units.push(infantry.add({name:'minigunner',x:28,y:12,team:'nod'}));
    	    
    	    
    	    
    	    //this.units.push(vehicles.add({name:'light-tank',x:23,y:25,moveDirection:0}));
    	    
    	    //sounds.play('reinforcements_have_arrived');
    	    //this.units.push(infantry.add({name:'minigunner',x:8,y:13}));
    	    //this.units.push(vehicles.add({name:'light-tank',x:5,y:13,orders:{type:'patrol',from:{x:5,y:13},to:{x:4,y:4}},team:'nod'})); 
        	//this.units.push(vehicles.add({name:'light-tank',x:16,y:8,orders:{type:'protect',target:game.units[3]}}));
    	    
    	    /*
    	    this.units.push(infantry.add({name:'minigunner',x:7,y:13,team:'nod'}));
    	    this.units.push(vehicles.add({name:'light-tank',x:5,y:13,orders:{type:'patrol',from:{x:5,y:13},to:{x:4,y:4}},team:'nod'})); 
    	    this.units.push(vehicles.add({name:'light-tank',x:16,y:8,orders:{type:'protect',target:game.units[3]}}));
    	    this.units.push(vehicles.add({name:'light-tank',x:10,y:10,orders:{type:'protect',target:game.units[0]},team:'nod'}));
    	    
    	    this.units.push(turrets.add({name:'gun-turret',x:12,y:13,moveDirection:9,team:'nod'}));
    	    
    	    */
    	    //this.buildings.push(buildings.add({name:'power-plant',x:12,y:8,health:100,primaryBuilding:true})); 
    	    //this.buildings.push(buildings.add({name:'construction-yard',x:9,y:4,primaryBuilding:true})); 
    	    //this.buildings.push(buildings.add({name:'barracks',x:12,y:4,status:'build'}));
    	    //this.buildings.push(buildings.add({name:'weapons-factory',x:15,y:12})); 
    	    /*this.buildings.push(buildings.add({name:'construction-yard',x:3,y:9,status:'build',team:'nod'}));  
    	    
    	    
    	    this.buildings.push(buildings.add({name:'barracks',x:12,y:4}));
    	    this.buildings.push(buildings.add({name:'barracks',x:14,y:4,team:'nod'})); 
    	    
    	    this.buildings.push(buildings.add({name:'power-plant',x:12,y:8,status:'build',health:100,primaryBuilding:true})); 
    	    
    	    this.buildings.push(buildings.add({name:'power-plant',x:18,y:10,status:'build',health:200,team:'nod'})); 
    	    
    	    this.buildings.push(buildings.add({name:'weapons-factory',x:15,y:12,status:'construct',health:200})); 
    	    
    	    
    	    this.buildings.push(buildings.add({name:'weapons-factory',x:13,y:16,status:'build',health:200,team:'nod'}));
    	    
            */
    	    this.animationLoop = setInterval(this.animate,this.animationTimeout);
    	    
    	    this.tiberiumLoop = setInterval(function(){
    	        for (var i=0; i < game.overlay.length; i++) {
                    var overlay = game.overlay[i];
                    if (overlay.name == 'tiberium' & overlay.stage<11){
                        overlay.stage++;             
                    }
                };
    	        
    	        
    	    },game.animationTimeout*40*600);
    	    
    	    this.statusLoop = setInterval(game.missionStatus,3000);
 	    
    	},
    	end:function(){
    	    //clearInterval(this.animationLoop);
    	    clearInterval(this.statusLoop);
    	    clearInterval(this.tiberiumLoop);
    	    sidebar.visible = false;
    	    game.displayMessage('Thank you for trying this demo.'
        	    +'This is still a work in progress. \nAny comments, feedback (including bugs), and advice is appreciated.\n\nIf you liked this demo, please share this page with all your friends. ');
       	    
    	}
	    
	};
	
	var sidebar = {
	    loaded:true,
	    preloadCount:0,
	    loadedCount:0,
	    preloadImage:preloadImage,
	    tabsImage:null,
	    width:160,
	    visible:true,
	    cash:0,
	    finishDeployingBuilding:function(){
	        for (var i=0; i < game.buildings.length; i++) {
	            if(game.buildings[i].name=='construction-yard' && game.buildings[i].team  == game.currentLevel.team){
	                game.buildings[i].status='construct';
	                break;
	            }
	        };
	        if (buildings.types[sidebar.deployBuilding]){
	            game.buildings.push(buildings.add({name:sidebar.deployBuilding,x:mouse.gridX,y:mouse.gridY,status:'build'}));
	        } else {
	            game.turrets.push(turrets.add({name:sidebar.deployBuilding,x:mouse.gridX,y:mouse.gridY,status:'build'}));
	        }
	        
            sounds.play('construction')
	        sidebar.deployMode = false;
            for (var i = this.leftButtons.length - 1; i >= 0; i--){
                this.leftButtons[i].status='';
            }
            sidebar.deployBuilding = null;
	    },
	    finishDeployingUnit:function(unitButton){
	        var constructedAt;
	        for (var i=0; i < game.buildings.length; i++) {
	            if(game.buildings[i].name==unitButton.dependency[0]){
	                constructedAt = game.buildings[i];
	                //game.buildings[i].status='construct';
	                break;
	            }
	        };
	        
	        if (unitButton.type == 'infantry'){
	            game.units.push(infantry.add({name:unitButton.name,x:constructedAt.x+constructedAt.gridWidth/2,
	                y:constructedAt.y + constructedAt.gridHeight,moveDirection:4 ,instructions:[{type:'move',distance:2}]}));
	        } else if(unitButton.type == 'vehicle'){
	            constructedAt.status = 'construct';
	            var vehicle = vehicles.add({name:unitButton.name,x:constructedAt.x+1,
	                y:constructedAt.y + 3,moveDirection:16,turretDirection:16,
	                orders:{type:'move',to:{x:Math.floor(constructedAt.x-1+ (Math.random()*4)),
	                //    orders:{type:'move',to:{x:Math.floor(constructedAt.x-1),
    	                y:Math.floor(constructedAt.y+5)}}});
	            game.units.push(vehicle);   
    	                
    	        //alert(vehicle.orders.to.x + ' '+vehicle.orders.to.y)
    	        
    	                   
	        }
	        //game.buildings.push(buildings.add({name:sidebar.deployBuilding,x:mouse.gridX,y:mouse.gridY,status:'build'}));
            //sounds.play('construction')
	        //sidebar.deployMode = false;
            for (var i = this.rightButtons.length - 1; i >= 0; i--){
                if(this.rightButtons[i].dependency[0] == unitButton.dependency[0]){
                    this.rightButtons[i].status='';
                }
            }
            sidebar.deployBuilding = null;
	    },
	    hoveredButton:function(){
	        var clickY = mouse.y - sidebar.top;
	        var clickX = mouse.x;
            if (clickY>=165 && clickY <= 455){
                var buttonPosition = 0;
                for (var i=0; i < 6; i++) {
    	            if (clickY >= 165+i*48 && clickY <= 165+i*48+48){
    	                buttonPosition = i;
    	                break;
    	            }
    	        }
                var buttonSide,buttonPressedIndex,buttons;
                if (clickX>=500 && clickX<=564){
                    buttonSide = 'left';
                    buttonPressedIndex = this.leftButtonOffset + buttonPosition;
                    buttons = sidebar.leftButtons;
                } else  if (clickX>=570 && clickX <= 634){
                    buttonSide = 'right';
                    buttonPressedIndex = this.rightButtonOffset + buttonPosition;
                    buttons = sidebar.rightButtons;
                }
                if (buttons && buttons.length > buttonPressedIndex){
                    var buttonPressed = buttons[buttonPressedIndex];
                    return buttonPressed;
                }
            }
	        
	    },
	    click: function(ev,rightClick){
	        var clickY = mouse.y - this.top;
	        var clickX = mouse.x;
	        //alert(2)
            // press a top button
            if (clickY>=146 && clickY<= 160){
                if (clickX>=485 && clickX <= 530){
                    this.repairMode = !this.repairMode;
                    this.sellMode = this.mapMode = this.deployMode = false;
                    //alert('repair')
                } else if (clickX>=538 && clickX <= 582){
                    this.sellMode = !this.sellMode;
                    this.repairMode = this.mapMode = this.deployMode = false;
                    //alert('map')
                } else if (clickX >=590 && clickX <= 635){
                    this.mapMode = !this.mapMode;
                    this.repairMode = this.sellMode = this.deployMode = false;
                }
                // press a scroll button
            } else if (clickY>=455 && clickY <= 480){
                if (clickX>=500 && clickX<= 530){
                    if (this.leftButtonOffset > 0){
                        this.leftButtonOffset --;
                        sounds.play('button');
                    }
                } else if (clickX>=532 && clickX<= 562){
                    if (this.leftButtonOffset+6 < this.leftButtons.length){
                        this.leftButtonOffset++;
                        sounds.play('button');
                    }
    	        } else if (clickX>=570 && clickX<= 600){
                    if (this.rightButtonOffset > 0){
                        this.rightButtonOffset --;
                        sounds.play('button');
                    }
    	        } else if (clickX>=602 && clickX<= 632){
                    if (this.rightButtonOffset+6 < this.rightButtons.length){
                        this.rightButtonOffset++;
                        sounds.play('button');
                    }
    	        }
    	        // Press a unit icon
            } else if (clickY>=165 && clickY <= 455){
                var buttonPosition = 0;
                for (var i=0; i < 6; i++) {
    	            if (clickY >= 165+i*48 && clickY <= 165+i*48+48){
    	                buttonPosition = i;
    	                break;
    	            }
    	        }
                var buttonSide,buttonPressedIndex,buttons;
                if (clickX>=500 && clickX<=564){
                    buttonSide = 'left';
                    buttonPressedIndex = this.leftButtonOffset + buttonPosition;
                    buttons = this.leftButtons;
                } else  if (clickX>=570 && clickX <= 634){
                    buttonSide = 'right';
                    buttonPressedIndex = this.rightButtonOffset + buttonPosition;
                    buttons = this.rightButtons;
                }
                if (buttons && buttons.length > buttonPressedIndex){
                    var buttonPressed = buttons[buttonPressedIndex];
                    if (buttonPressed.status == '' && !rightClick){
                        //this.buildList.push ({side:'left',counter:0,name:this.leftButtons[buttonPressed].name,buttonPressed:buttonPressed});        
                        // Disable all other buttons with same dependency
                       // if(buttonPressed.cost <= sidebar.cash) {
                            for (var i = buttons.length - 1; i >= 0; i--){
                                if(buttons[i].dependency[0] == buttonPressed.dependency[0]){
                                    buttons[i].status='disabled';
                                }
                            };
                            buttonPressed.status = 'building';
                            buttonPressed.counter = 0; 
                            buttonPressed.spent = buttonPressed.cost; 
                            sounds.play('building');
                        //} else {
                        //    sounds.play('insufficient_funds');
                        //}
                    } else if (buttonPressed.status == 'building' && !rightClick){    
                        sounds.play('not_ready');
                    }else if (buttonPressed.status == 'building' && rightClick){
                        buttonPressed.status = 'hold';
                        sounds.play('on_hold');
                    } else if (buttonPressed.status == 'hold' && !rightClick){
                        buttonPressed.status = 'building';
                        sounds.play('building');
                    } else if ((buttonPressed.status == 'hold'  ||buttonPressed.status == 'ready')&& rightClick){
                            buttonPressed.status = '';
                            sounds.play('cancelled');
                            sidebar.cash += buttonPressed.cost-buttonPressed.spent;
                            for (var i = buttons.length - 1; i >= 0; i--){
                                buttons[i].status='';
                            };     
                    } else if (buttonPressed.status == 'ready' && !rightClick){
                        if (buttonPressed.type =='building'){
                            sidebar.deployMode = true;
                            //alert('deploy')
                    	    this.repairMode = this.sellMode = this.mapMode = false;
                            sidebar.deployBuilding = buttonPressed.name;
                        }
                    } else if (buttonPressed.status=='disabled'){
                        sounds.play('building_in_progress');
                    }

                }            
            }
	    },
	    allButtons:[],
	    leftButtons:[],
	    rightButtons:[],
	    checkDependency: function(){
	        //alert(this.allButtons.length);
	        for (var i = 0; i <this.allButtons.length ; i++){
	            var button = this.allButtons[i];
	            
	            var dependenciesSatisfied = true;
	            //alert(button.dependency.length);
	            for (var j = button.dependency.length - 1; j >= 0; j--){
	                var found = false;
	                var dependency = button.dependency[j];
	                for (var k = game.buildings.length - 1; k >= 0; k--){
	                    var building = game.buildings[k];
	                    if(building.name == dependency 
	                        && building.status != 'build'
	                        && building.life != 'ultra-damaged'
	                        && building.team == game.currentLevel.team
	                     ){
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
                        //button.cost = buildings.types[button.name].cost;
                        button.speed =  this.buildSpeedMultiplier/button.cost;
                        sounds.play('new_construction_options');
                        sidebar.visible = true;
                    } else if (buttonFound && !dependenciesSatisfied){
                        if (this.leftButtons[foundIndex].status == 'building' 
                        || this.leftButtons[foundIndex].status == 'hold' 
                        || this.leftButtons[foundIndex].status == 'ready'){
                            for (var j = this.leftButtons.length - 1; j >= 0; j--){
                                this.leftButtons[j].status='';
                            }   
                        }
                        this.leftButtons.splice(foundIndex,1);
                        this.leftButtonOffset = 0;
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
                        
                        /*switch (button.type){
                            case 'infantry':
                                button.cost = 100;//infantry.types[button.name].cost;
                                break;
                            default:
                                button.cost = 0;
                                break;
                        }
                        */
                        button.speed = this.buildSpeedMultiplier/button.cost;
                        sounds.play('new_construction_options');
                    } else if (buttonFound && !dependenciesSatisfied){
                        if (this.rightButtons[foundIndex].status == 'building' 
                        || this.rightButtons[foundIndex].status == 'hold' 
                        || this.rightButtons[foundIndex].status == 'ready'){
                            for (var j = this.rightButtons.length - 1; j >= 0; j--){
                                if(this.rightButtons[j].dependency[0] == this.rightButtons[foundIndex].dependency[0])
                                this.rightButtons[j].status='';
                            }   
                        }               
                        this.rightButtons.splice(foundIndex,1);
                        this.rightButtonOffset = 0;
                    }                 
	            }
	            
	        };
	       
	    },
	    load:function(){
	        this.tabsImage = this.preloadImage('sidebar/tabs.png');
	        this.sidebarImage = this.preloadImage('sidebar/sidebar.png');
	        this.primaryBuildingImage = this.preloadImage('sidebar/primary.png');
	        this.readyImage = this.preloadImage('sidebar/ready.png');
	        this.holdImage = this.preloadImage('sidebar/hold.png');
	        this.placementWhiteImage = this.preloadImage('sidebar/placement-white.gif');
	        this.placementRedImage = this.preloadImage('sidebar/placement-red.gif');
	        this.powerIndicator = this.preloadImage('sidebar/power/power_indicator2.png');
	        this.messageBox = this.preloadImage('sidebar/message_box.jpg');
	        
	        this.repairButtonPressed = this.preloadImage('sidebar/buttons/repair-pressed.png');
	        this.sellButtonPressed = this.preloadImage('sidebar/buttons/sell-pressed.png');
	        
	        this.repairImageBig = this.preloadImage('sidebar/repair-big.png');
	        this.repairImageSmall = this.preloadImage('sidebar/repair-small.png');
	        
	        this.top = game.viewportTop-2;
	        this.left = canvas.width - this.width;
	        var buttonList = [
	            {name:'power-plant',type:'building',cost:300,dependency:['construction-yard']},
	            {name:'advanced-power-plant',type:'building',cost:700,dependency:['construction-yard','power-plant']},
	            //{name:'barracks',type:'building',cost:300,dependency:['construction-yard','power-plant']},
	            //{name:'guard-tower',type:'building',cost:500,dependency: ['construction-yard','barracks']},
	            {name:'refinery',type:'building',cost:2000,dependency:['construction-yard','power-plant']},
	            {name:'tiberium-silo',type:'building',cost:150,dependency:['construction-yard','refinery']},
	            {name:'weapons-factory',type:'building',cost:2000,dependency:['construction-yard','power-plant','refinery']},
	            //{name:'minigunner',type:'infantry',cost:100,dependency:['barracks']},
	            {name:'harvester',type:'vehicle',cost:1400,dependency:['weapons-factory','refinery']},
	            //{name:'jeep',type:'vehicle',cost:400,dependency:['weapons-factory']},
	            {name:'light-tank',type:'vehicle',cost:600,dependency:['weapons-factory']}
	        ];
	        this.allButtons = [];
	        
	        for (var i=0; i < buttonList.length; i++) {
	           var button = buttonList[i];
	           this.allButtons.push({
	                name:button.name, 
	                image:this.preloadImage('sidebar/icons/'+button.name+'-icon.png'),
	                type:button.type,
	                status:'',
	                cost:button.cost,
	                dependency:button.dependency
	            });
	        }
	       
	    },
	    
	    textBrightness:0,
	    textBrightnessDelta:-0.1, 
	    drawButtonLabel: function(labelImage,x,y){
	        var labelOffsetX = this.iconWidth/2 - labelImage.width/2;
    	    var labelOffsetY=this.iconHeight/2;
	        //context.fillStyle = 'rgba(255,255,255,'+this.textBrightness+')';
	        //context.fillText(label,x+ labelOffsetX,y+labelOffsetY);
	        //asdf
	        context.globalAlpha = this.textBrightness;
            context.drawImage(labelImage,x+labelOffsetX,y+labelOffsetY);
            context.globalAlpha = 1;
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
	    leftButtonOffset:0,
	    rightButtonOffset:0,
	    buildSpeedMultiplier :300, 	    
	    drawButton:function(side,index){ //side is left or right; index is 0 to 5
	        var buttons = (side=='left')?this.leftButtons:this.rightButtons;
	        var offset = (side=='left')?this.leftButtonOffset:this.rightButtonOffset;
	        var button = buttons[index+offset];
	        var xOffset = (side == 'left')?500:570;
	        var yOffset = 165+this.top+index*this.iconHeight;
            
	        context.drawImage(button.image,xOffset,yOffset);
	        if (button.status == 'ready'){
                this.drawButtonLabel(this.readyImage,xOffset,yOffset);
	        } else if (button.status == 'disabled'){
                context.fillStyle = 'rgba(200,200,200,0.6)';
                context.fillRect(xOffset,yOffset,this.iconWidth,this.iconHeight);         
	        } else if (button.status == 'building'){
	            spriteContext.clearRect(0,0,this.iconWidth,this.iconHeight);
	            spriteContext.fillStyle = 'rgba(200,200,200,0.6)';
                spriteContext.beginPath();
                spriteContext.moveTo(this.iconWidth/2,this.iconHeight/2);
                spriteContext.arc(this.iconWidth/2,this.iconHeight/2,40,Math.PI*2*button.counter/100-Math.PI/2,-Math.PI/2);
                spriteContext.moveTo(this.iconWidth/2,this.iconHeight/2);
                spriteContext.fill();
                context.drawImage(spriteCanvas,0,0,this.iconWidth,this.iconHeight,xOffset,yOffset,this.iconWidth,this.iconHeight);
                //alert(button.speed) 
	        } else if (button.status == 'hold'){
	            spriteContext.clearRect(0,0,this.iconWidth,this.iconHeight);
	            spriteContext.fillStyle = 'rgba(100,100,100,0.6)';
                spriteContext.beginPath();
                spriteContext.moveTo(this.iconWidth/2,this.iconHeight/2);
                spriteContext.arc(this.iconWidth/2,this.iconHeight/2,40,Math.PI*2*button.counter/100-Math.PI/2,-Math.PI/2);
                spriteContext.moveTo(this.iconWidth/2,this.iconHeight/2);
                spriteContext.fill();
                context.drawImage(spriteCanvas,0,0,this.iconWidth,this.iconHeight,xOffset,yOffset,this.iconWidth,this.iconHeight);
                
	            this.drawButtonLabel(this.holdImage,xOffset,yOffset);
	        }    
	    },
	    processButton:function(side,index){ //side is left or right; index is 0 to 5
	        var buttons = (side=='left')?this.leftButtons:this.rightButtons;
	        var offset = 0;// (side=='left')?this.leftButtonOffset:this.rightButtonOffset;
	        var button = buttons[index+offset];
	        var xOffset = (side == 'left')?500:570;
	        var yOffset = 165+this.top+index*this.iconHeight;
            if (button.status == 'building'){
                if (this.cash==0){
                    if (!this.insufficientFunds){
                        sounds.play('insufficient_funds');
                        this.insufficientFunds = true;
                    }
                    return;
                }
                this.insufficientFunds = false;
                
                if (this.cash< Math.round(button.cost * button.speed/100)){
                    button.counter += button.speed*this.cash/Math.round(button.cost * button.speed/100);
                    button.spent -= this.cash;
                    this.cash = 0;
                    return;
                }
                
	            button.counter += button.speed;
	            button.spent -= Math.round(button.cost * button.speed/100);
 	            this.cash -= Math.round(button.cost * button.speed/100);
                if (button.counter>99){
                    this.cash -= button.spent;
                    button.status = 'ready';
                    if(side == 'left'){
                        sounds.play('construction_complete');
                    } else {
                        if(button.type=='infantry' || button.type=='vehicle'){
                            sounds.play('unit_ready')
                            this.finishDeployingUnit(button);
                        }
                    }
                }  
	        }    
	    },
	    powerOut:0,
	    powerIn:0,
	    lowPowerMode:false,
	    powerScale:4,
	    checkPower: function(){
	        var offsetX = this.left;
	        var offsetY = this.top+160;
	        var barHeight = 320;
	        var barWidth = 20;
	        
	        this.powerOut = 0;
	        this.powerIn = 0;
            for (var k = game.buildings.length - 1; k >= 0; k--){
                var building = game.buildings[k];
                if (building.powerIn && building.team == game.currentLevel.team){
                    this.powerIn += building.powerIn;
                }
                if (building.powerOut && building.team == game.currentLevel.team){
                    this.powerOut += building.powerOut;
                }
            };
            
            //alert(this.powerGreen);
            
            var red = 'rgba(174,52,28,0.7)';
            //var red = 'rgba(240,75,35,0.6)';
            var orange = 'rgba(250,100,0,0.6)';
            //var green = 'rgba(48,85,44,0.6)';
            var green = 'rgba(84,252,84,0.3)';
            
            
            
            //context.drawImage(this.powerRed,offsetX,offsetY+barHeight-this.powerOut/this.powerScale);
            if (this.powerOut/this.powerIn >= 1.1){
                context.fillStyle=green;//'rgba(100,200,0,0.3)';
                this.lowPowerMode = false;
            } else if (this.powerOut /this.powerIn >= 1){ 
                context.fillStyle=orange;
                this.lowPowerMode = false;
            } else if (this.powerOut < this.powerIn){
                context.fillStyle=red;
                if(this.lowPowerMode == false){
                    sounds.play('low_power')
                } 
                this.lowPowerMode = true;
                
            }
            context.fillRect(offsetX+8,offsetY+barHeight-this.powerOut/this.powerScale,barWidth-14,this.powerOut/this.powerScale);
            context.drawImage(this.powerIndicator,offsetX,offsetY+barHeight-this.powerIn/this.powerScale);
            
	    },	    
	    
	    draw:function(){
	        context.drawImage(this.tabsImage,0,this.top-this.tabsImage.height+2);
	        context.fillStyle = 'lightgreen';
	        context.font = '12px "Command and Conquer"';
	        // convert the cash score to a string and space separate to pirnt it proerly
	        var c = (this.cash+'').split('').join(' ');
	        context.fillText(c,400 -c.length*5/2,31);
	        
	        
	        
	        this.checkDependency();
	        
	        this.textBrightness = this.textBrightness + this.textBrightnessDelta;
	        if (this.textBrightness <0){
	            this.textBrightness = 1;
	        }
	        
             for (var i=0; i < this.leftButtons.length; i++) {
                 this.processButton('left',i);       
             }
             for (var i=0; i < this.rightButtons.length; i++) {
                 this.processButton('right',i);	            
             }
             
	         if(this.visible){
	            context.drawImage(this.sidebarImage,this.left,this.top);
	            
	            if (this.repairMode){
    	            context.drawImage(this.repairButtonPressed,this.left+4,this.top+145);
    	        }
    	        if (this.sellMode){
    	            context.drawImage(this.sellButtonPressed,this.left+57,this.top+145);
    	        }
	            this.checkPower();
                var maxLeft = this.leftButtons.length > 6 ? 6:this.leftButtons.length;
                for (var i=0; i < maxLeft; i++) {
                    this.drawButton('left',i);       
                }
                var maxRight = this.rightButtons.length > 6 ? 6:this.rightButtons.length;
                for (var i=0; i < maxRight; i++) {
                    this.drawButton('right',i);	            
                }
	            
	        }
	        
	        context.clearRect(0,game.viewportTop+game.viewportHeight,canvas.width,30);
	    }
	    
	}
	
	var ai = {
	    team:'nod',
	    cash:0	    
	}
	
	var buildings = {
	    types:[],
	    buildingDetails: {
	        'construction-yard':{
	            name:'construction-yard',
	            label:'Construction Yard',
	            type:'building',
	            powerIn:15,
        	    powerOut:30,
        	    cost:5000,
        	    sight:3,
        	    hitPoints:400,
        	    imagesToLoad:[
        	        {name:'build',count:32},
        	        {name:"damaged",count:4},
        	        {name:'damaged-construct',count:20},
        	        {name:"healthy",count:4},
        	        {name:'healthy-construct',count:20},
        	        {name:"ultra-damaged",count:1}],       
        	    gridShape: [
        	        [1,1,1],
        	        [1,1,1]]
	        },
	        'refinery':{
	            name:'refinery',
	            label:'Tiberium Refinery',
	            type:'building',
	            powerIn:40,
        	    powerOut:10,
        	    cost:2000,
        	    tiberiumStorage:1000,
        	    sight:4,
        	    hitPoints:450,
        	    imagesToLoad:[
        	        {name:'build',count:20},
        	        {name:"damaged",count:12},
        	        {name:'damaged-unload',count:18},
        	        {name:"healthy",count:12},
        	        {name:'healthy-unload',count:18},
        	        {name:"ultra-damaged",count:1}],      	        
        	    gridShape: [
        	        [1,1,1],
        	        [1,1,1],
        	        [1,1,1]]
	        },
	        'barracks':{
    	        name:'barracks',
    	        label:'Barracks',
    	        type:'building',
    	        powerIn:20,
    	        cost:300,
    	        sight:3,
    	        hitPoints:400,
    	        imagesToLoad:[
        	        {name:'build',count:20},
        	        {name:"damaged",count:10},
        	        {name:"healthy",count:10},
        	        {name:"ultra-damaged",count:1}],
    	        gridShape: [[1,1],
    	                    [1,1]]
         
    	    },
    	    'power-plant':{
                name:'power-plant',
    	        label:'Power Plant',
    	        type:'building',
    	        powerOut:100,
    	        cost:300,
    	        sight:2,
    	        hitPoints:200,
    	        imagesToLoad:[
        	        {name:'build',count:20},
        	        {name:"damaged",count:4},
        	        {name:"healthy",count:4},
        	        {name:"ultra-damaged",count:1}],
    	        gridShape: [[1,0],
    	                    [1,1]]          
    	    },	    
    	    'advanced-power-plant':{
                name:'advanced-power-plant',
    	        label:'Advanced Power Plant',
    	        type:'building',
    	        powerOut:200,
    	        cost:700,
    	        sight:2,
    	        hitPoints:300,
    	        imagesToLoad:[
        	        {name:'build',count:20},
        	        {name:"damaged",count:4},
        	        {name:"healthy",count:4},
        	        {name:"ultra-damaged",count:1}],
    	        gridShape: [[1,0],
    	                    [1,1]]          
    	    },
    	    'tiberium-silo':{
                name:'tiberium-silo',
    	        label:'Tiberium Silo',
    	        type:'building',
    	        powerIn:10,
    	        cost:150,
    	        sight:2,
    	        hitPoints:150,
    	        imagesToLoad:[
        	        {name:'build',count:20},
        	        {name:"damaged",count:5},
        	        {name:"healthy",count:5},
        	        {name:"ultra-damaged",count:1}],
    	        gridShape: [[1,1]]          
    	    },
    	    'hand-of-nod':{
                name:'hand-of-nod',
    	        label:'Hand of Nod',
    	        type:'building',
    	        powerIn:20,
    	        cost:300,
    	        sight:3,
    	        hitPoints:400,
    	        imagesToLoad:[
        	        {name:'build',count:20},
        	        {name:"damaged",count:1},
        	        {name:"healthy",count:1},      
        	        {name:"ultra-damaged",count:1}],
    	        gridShape: [[0,0],
    	                    [1,1],
    	                    [1,1]]          
    	    }, 	    
    	    'weapons-factory':{
                name:'weapons-factory',
    	        label:'Weapons Factory',
    	        type:'building',
    	        powerIn:30,
    	        cost:2000,
    	        sight:3,
    	        hitPoints:200,
    	        imagesToLoad:[
        	        {name:'build',count:20},
        	        {name:"damaged",count:1},
        	        {name:'damaged-base',count:1},
        	        {name:'damaged-construct',count:9},
        	        
        	        {name:"healthy",count:1},
        	        {name:'healthy-base',count:1},
        	        {name:'healthy-construct',count:9},
        	        {name:"ultra-damaged",count:0},
                    {name:'ultra-damaged-base',count:1}
        	        ],
    	        gridShape: [[1,1,1],
    	                    [1,1,1],
    	                    [1,1,1]]               
    	    }
	    },
	    preloadImage:preloadImage,
	    loadImageArray:loadImageArray,
	    preloadCount:0,
	    loadedCount:0,
	    draw:function(){
	        
            var teamYOffset = 0;  
            if (this.team != game.currentLevel.team){
               teamYOffset = this.pixelHeight;
            }
            
            //First draw the bottom grass
	        context.drawImage(this.bibImage,this.x*game.gridSize +game.viewportAdjustX,(this.y+this.gridHeight-1)*game.gridSize+game.viewportAdjustY);
	        
	        

	        
	        var life = this.getLife();
	        if (this.status=="build" || this.status=="sell"){
	            imageCategory = 'build';
	        } else if (this.status ==""||this.life=="ultra-damaged"){
	            imageCategory = this.life;
	        } else {
	            imageCategory = this.life+"-"+this.status;
	        }
            
            
            var imageWidth = this.gridShape[0].length*game.gridSize;
	        var imageHeight = this.spriteImage.height;
            
	        // Then draw the base with baseOffset
	        var baseImage = this.spriteArray[this.life+"-base"];
	        if (baseImage && this.status != 'build' && this.status !='sell'){	            
	            context.drawImage(this.spriteCanvas,baseImage.offset*imageWidth,teamYOffset,imageWidth,imageHeight,game.gridSize*(this.x) +game.viewportAdjustX,(this.y)*game.gridSize+game.viewportAdjustY,imageWidth,imageHeight);
	        }
	        
	        
	        // Finally draw the top part with appropriate animation
	        
	        var imageList = this.spriteArray[imageCategory];
	        if(!this.animationIndex){
	            this.animationIndex = 0;
	        }
	        if (imageList.count>=Math.floor(this.animationIndex/this.animationSpeed)){
	            var imageIndex = Math.floor(this.animationIndex/this.animationSpeed);
	            if (this.status =='sell'){
	                imageIndex = imageList.count-1 - Math.floor(this.animationIndex/this.animationSpeed);
	            }   
	            context.drawImage(this.spriteCanvas,(imageList.offset+imageIndex)*imageWidth,teamYOffset,imageWidth,imageHeight,game.gridSize*(this.x) +game.viewportAdjustX,(this.y)*game.gridSize+game.viewportAdjustY,imageWidth,imageHeight);
	        }
	        
	        
	        this.animationIndex++;
	        if (this.animationIndex/this.animationSpeed >= imageList.count){
	            this.animationIndex = 0;
	            if (this.name == 'refinery'&& (this.status == "build"||this.status == 'unload')){
	                if (this.status== 'build'){
	                    game.units.push(vehicles.add({name:'harvester',team:this.team,x:this.x+0.5,
        	                y:this.y + 2,moveDirection:14,orders:{type:'harvest',from:this}}));
        	            this.status = ""; 
	                } else {
	                    if (this.harvester.tiberium){
	                        var subtractAmount = this.harvester.tiberium>4?5:this.harvester.tiberium;
	                        if (this.team == game.currentLevel.team){
	                            sidebar.cash += subtractAmount*50;
	                        } else {
	                            ai.cash += subtractAmount;
	                        }
	                        
	                        this.harvester.tiberium -= subtractAmount;
	                    } 
	                    if (!this.harvester.tiberium) {
	                        game.units.push(vehicles.add({name:'harvester',team:this.team,x:this.x+0.5,
            	                y:this.y + 2,health:this.harvester.health,moveDirection:14,orders:{type:'harvest',from:this,to:this.harvester.orders.from}}));
            	                this.harvester = null;  
	                        this.status = ""; 
	                    }	                    
	                }
	                
    	               
	            
	            } else if (this.status == "build" || this.status == "construct"||this.status == "unload"){
	                this.status = "";
	            } 
	            if (this.status == 'sell'){
	                this.status = 'destroy';    
	            }
	        }
	        
	        this.drawSelection();  
	        if (this.repairing){
	            //alert('repairing');
	            context.globalAlpha = sidebar.textBrightness;
	            context.drawImage(sidebar.repairImageBig,(this.x+this.gridShape[0].length/2-1)*game.gridSize+game.viewportAdjustX,(this.y+this.gridShape.length/2-1)*game.gridSize+game.viewportAdjustY);        
	            context.globalAlpha = 1;
	            
                if (this.health >= this.hitPoints){
                    this.repairing = false;
                    this.health = this.hitPoints;
                } else {
                    var cashSpent = 1;
                    if (sidebar.cash>cashSpent){
                        sidebar.cash -= cashSpent;
                        this.health += (cashSpent*2*this.hitPoints/this.cost);
                        //console.log (this.health + " " +2*cashSpent*this.hitPoints/this.cost)     
                    }  
                }
	        }
	            
	    },
	    
	    
	    
	    load:function(name){
	        var details = this.buildingDetails[name];
	        var buildingType = {};
	        buildingType.defaults = {
	            type:'building',
	            draw: buildings.draw,
	            underPoint: underPoint,
	            drawSelection: drawSelection,
	            getLife:getLife,
	            animationSpeed:2,
	            status: "",
	            health:details.hitPoints,
	            gridHeight: details.gridShape.length,
	            gridWidth: details.gridShape[0].length,
	            pixelHeight: details.gridShape.length*game.gridSize,
	            pixelWidth: details.gridShape[0].length*game.gridSize,
	            bibImage: this.preloadImage('buildings/bib/bib-'+details.gridShape[0].length+'.gif'),
	            pixelOffsetX:0,
        	    pixelOffsetY:0,
	            pixelTop:0,
	            pixelLeft:0
	             
	        }
	        
	        this.loadSpriteSheet(buildingType,details,'buildings');

	        $.extend(buildingType,details);
	        this.types[name]=buildingType;
	    },
	    loadSpriteSheet:loadSpriteSheet,
	    add:function(details){
	        var newBuilding = {};
            newBuilding.team = game.currentLevel.team;
            //alert(game.currentLevel.team)
	        var name = details.name;
            $.extend(newBuilding,this.types[name].defaults);
	        $.extend(newBuilding,this.types[name]);
	        $.extend(newBuilding,details);
	        
	        return newBuilding;
	    }
	    
	    
	};
	
	function loadSpriteSheet(forObject,details,from){ 
	    forObject.spriteCanvas = document.createElement('canvas');
	    forObject.spriteImage = this.preloadImage
	        (from+'/'+details.name+'-sprite-sheet.png',
	        function() {
	            transformSpriteSheet(forObject,details);
	        });
	    forObject.spriteArray = [];
        forObject.spriteCount = 0;
        for (var i=0; i < details.imagesToLoad.length; i++){
            var constructImageCount = details.imagesToLoad[i].count; 
            var constructImageName = details.imagesToLoad[i].name;
            forObject.spriteArray[constructImageName] = 
            {name:constructImageName,count:constructImageCount,offset:forObject.spriteCount};
	        forObject.spriteCount += constructImageCount;        
        }     
	}
	
	function transformSpriteSheet(forObject,details){
	    forObject.spriteCanvas.width = forObject.spriteImage.width;
	    forObject.spriteCanvas.height = forObject.spriteImage.height*2;
	    //document.body.appendChild(forObject.spriteCanvas);
	    var spriteContext = forObject.spriteCanvas.getContext('2d');
	    spriteContext.drawImage(forObject.spriteImage,0,0);
	    spriteContext.drawImage(forObject.spriteImage,0,forObject.spriteImage.height);
	    
	    var colorMap = [
                 // gun turret

                 {gdi:[198,170,93],nod :[218,0,0]},
                 {gdi:[178,149,80],nod :[191,26,7]},
                 {gdi:[97,76,36],nod :[108,0,0]},

                 //power plant
                 {gdi:[145,137,76],nod :[169,27,26]},
                 {gdi:[125,117,64],nod :[133,39,30]},
                 {gdi:[109,101,56],nod :[125,1,0]},
                 {gdi:[89,85,44],nod :[96,41,24]},
                 {gdi:[170,153,85],nod :[190,26,7]},
                 {gdi:[194,174,97],nod :[220,0,0]},
                 {gdi:[246,214,121],nod :[255,0,1]},
                 {gdi:[222,190,105],nod :[246,1,0]},
                 

            ];
	    
	    var imgData = spriteContext.getImageData(0,0,forObject.spriteCanvas.width,forObject.spriteCanvas.height);
    	var imgDataArray = imgData.data;
    	var size = imgDataArray.length/4;
        
    	   for (var p=size/2; p < size; p++) {
    	     
    	      //console.log(p)
    	       var r = imgDataArray[p*4];
    	       var g = imgDataArray[p*4+1];
    	       var b = imgDataArray[p*4+2];
    	       var a = imgDataArray[p*4+2];
               
                   if(details.type =='turret'||details.type=='building'||details.name=='mcv'||details.name=='harvester'){
                       // long color map convert each yellow to re
                       for (var i = colorMap.length - 1; i >= 0; i--){
                           //alert(1)
                              if(r==colorMap[i].gdi[0] && g==colorMap[i].gdi[1]  && b == colorMap[i].gdi[2]){
                                  imgDataArray[p*4+0] = colorMap[i].nod[0];
                                  imgDataArray[p*4+1] = colorMap[i].nod[1];
                                  imgDataArray[p*4+2] = colorMap[i].nod[2];
                                  break;
                              }
                          };
                   } else if (details.type =='vehicle'||details.type=='infantry'){
                       // quick hack. Just make it grayscale
                        imgDataArray[p*4+0] = (r+g+b)/3;
                        imgDataArray[p*4+1] = (r+g+b)/3;
                        imgDataArray[p*4+2] = (r+g+b)/3;
                   }

    	   };

           for (var p=0; p < size; p++) {
       	       var r = imgDataArray[p*4];
       	       var g = imgDataArray[p*4+1];
       	       var b = imgDataArray[p*4+2];
       	       var a = imgDataArray[p*4+2];

                  // convert to transparent shadow
                     if (g == 255 && (b==96||b==89||b==85) &&(r==0||r==85)) {
                        imgDataArray[p*4] = 0;
                        imgDataArray[p*4+1] = 0;
                        imgDataArray[p*4+2] = 0;
                        imgData.data[p*4+3] = 0.8;
                     }
            };

 	    spriteContext.putImageData(imgData,0,0);
	    
	}
	
	
	var infantry = {
	    types:[],
	    loaded:true,
	    infantryDetails: {
	        'minigunner':{
	            name:'minigunner',
	            label:'Minigunner',
	            speed:8,
        	    cost:100,
        	    sight:1,
        	    hitPoints:50,
        	    collisionRadius:5,
        	    imagesToLoad:[
        	        {name:'stand',count:1,directionCount:8},
        	        {name:"walk",count:6,directionCount:8},
        	        {name:"fire",count:8,directionCount:8}
        	        ]
	        }    
	    },
	    preloadImage:preloadImage,
	    loadImageArray:loadImageArray,
	    preloadCount:0,
	    loadedCount:0,
	    collision:function(otherUnit){
	        if(this == otherUnit){
	            return false;
	        }
	        var distanceSquared = Math.pow(this.x -otherUnit.x,2) + Math.pow(this.y -otherUnit.y,2);
	        var radiusSquared = Math.pow((this.collisionRadius + otherUnit.collisionRadius)/game.gridSize ,2);
	        //alert(distanceSquared +' '+ radiusSquared)
	        return distanceSquared <= radiusSquared;
	    },
	    load:function(name){
	        var details = this.infantryDetails[name];
	        var infantryType = {};
	        infantryType.defaults = {
	            type:'infantry',
    	        draw:this.draw,
    	        drawSelection: drawSelection,
    	        underPoint: underPoint,
    	        collision:this.collision,
    	        move:this.move,
    	        getLife:getLife,
    	        status:'stand',
    	        animationSpeed:4,
    	        health:details.hitPoints,
    	        pixelOffsetX:-50/2,
        	    pixelOffsetY:-39/2,
        	    pixelWidth: 16,
	            pixelHeight: 16,
	            pixelTop:6,
	            pixelLeft:16
    	    };

            //$.extend(infantryType,defaults);
            
	        // Load all the images
	        infantryType.imageArray = [];
	        for (var i = details.imagesToLoad.length - 1; i >= 0; i--){
	            var constructImageCount = details.imagesToLoad[i].count;
	            var constructImageDirectionCount = details.imagesToLoad[i].directionCount; 
	            var constructImageName = details.imagesToLoad[i].name;
	            var imgArray = [];
	            for (var j = 0; j < constructImageDirectionCount;j++){
	                imgArray[j]=(this.loadImageArray('units/infantry/'+name+'/'+name+'-'+constructImageName+'-'+j,constructImageCount,'.gif'));
	            }
	            //alert(imgArray)
	            infantryType.imageArray[constructImageName] = imgArray;
	        }
            // Add all the basic unit details
	        $.extend(infantryType,details);
	        this.types[name]=infantryType;
	    },
	    draw:function(){
	        //alert(this.status);
	        //alert(this.imageArray[this.status][this.moveDirection])
	        var imageList = this.imageArray[this.status][this.moveDirection];
	        //alert(imageList.length)
	        
            this.animationIndex ++;
            
	        if (this.animationIndex/this.animationSpeed >= imageList.length){
	            //alert(this.animationIndex + ' / '+ this.animationSpeed)
	            this.animationIndex = 0;
	            
	        }
	        var moveImage = imageList[Math.floor(this.animationIndex/this.animationSpeed)];
            
	        //alert(this.moveOffsetX)
	        
	        var x = this.x*game.gridSize+game.viewportAdjustX + this.pixelOffsetX;
	        var y = this.y*game.gridSize+game.viewportAdjustY + this.pixelOffsetY;
            //context.drawImage
            drawSprite(moveImage,x,y,this.team,this.type);
	        //context.fillRect(this.x*game.gridSize+game.viewportAdjustX+this.pixelWidth/2,this.y*game.gridSize+game.viewportAdjustY+this.pixelHeight/2,10,10);
	        this.drawSelection();
	    }, 
	    add:function(details){
	        var newInfantry = {};
	        var name = details.name;
	        
	        newInfantry.moveDirection = 0;
	        newInfantry.animationIndex = 0;
	        newInfantry.team = game.currentLevel.team;
	        $.extend(newInfantry,this.types[name].defaults);
	        $.extend(newInfantry,this.types[name]);
	        $.extend(newInfantry,details);
	        
	        return newInfantry;
	    },
	    move: function(){
	        if (!this.speedCounter){
	            this.speedCounter = 0;
	        }
	        this.speedCounter ++;
	        var angle = (this.moveDirection/8)*2*Math.PI; //Math.round( (90+(unit.direction/32)*360)%360);
            ///alert(angle);
            if(this.status == 'walk'){
                this.x = this.x - 0.005*this.speed*Math.sin(angle);
                this.y = this.y - 0.005*this.speed*Math.cos(angle);
	        }
	        if (this.speedCounter >= 7) {
	            this.speedCounter = 0;

	            this.moveDirection = Math.floor(this.moveDirection+(Math.round((Math.random()-0.5)*10)*1/10));
	            if (this.moveDirection>7){
	                this.moveDirection = 0;
	            } else if(this.moveDirection<0){
	                this.moveDirection = 7;
	            }
	            this.status=Math.random()>0.7?'fire':Math.random()>0.7?'stand':'walk';
	            /*if (this.status == 'fire'){
	                sounds.play('machine_gun');
	            }*/
	        }
	    }
	};
	
	var vehicles = {
	    types:[],
	    vehicleDetails: {
	        'mcv':{
	            name:'mcv',
	            label:'Mobile Construction Vehicle',
	            type:'vehicle',
    	        turnSpeed:5,
    	        speed:12,
    	        cost:5000,
    	        hitPoints:200,
    	        sight:2,
    	        moveImageCount:32,
    	        pixelWidth:48,
    	        pixelHeight:48, 
    	        pixelOffsetX:-24,
        	    pixelOffsetY:-24,
        	    collisionRadius:12, //20
        	    softCollisionRadius:16,
        	    imagesToLoad:[
    	            {name:'move',count:32}
        	    ],

	        },
	        'harvester':{
	            name:'harvester',
	            label:'Harvester',
	            type:'vehicle',
    	        turnSpeed:5,
    	        speed:12,
    	        cost:1400,
    	        hitPoints:600,
    	        sight:2,
    	        tiberium:0,
    	        moveImageCount:32,
    	        imagesToLoad:[
    	            {name:'move',count:32},
        	        {name:'harvest-00',count:4},
        	        {name:'harvest-04',count:4},
        	        {name:'harvest-08',count:4},
        	        {name:'harvest-12',count:4},
        	        {name:'harvest-16',count:4},
        	        {name:'harvest-20',count:4},
        	        {name:'harvest-24',count:4},
        	        {name:'harvest-28',count:4},
        	    ],
    	        pixelWidth:48,
    	        pixelHeight:48, 
    	        pixelOffsetX:-24,
        	    pixelOffsetY:-24,
        	    collisionRadius:6, //20
        	    softCollisionRadius:12
	        },
	        'light-tank':{
	            name:'light-tank',
	            label:'Light Tank',
	            type:'vehicle',
    	        turnSpeed:5,
    	        speed:18,
    	        cost:600,
    	        sight:3,
    	        hitPoints:300,
    	        primaryWeapon:9,
    	        reloadTime:2000,
    	        moveImageCount:32,
    	        turretImageCount:32,
    	        imagesToLoad:[
    	            {name:'move',count:32},
    	            {name:'turret',count:32}
        	    ],
                
    	        pixelWidth:24,
    	        pixelHeight:24,
    	        pixelOffsetX:-12,
        	    pixelOffsetY:-12,
        	    collisionRadius:5,
        	    softCollisionRadius:9 //10
	        }	        
	    },
	    preloadImage:preloadImage,
	    loadImageArray:loadImageArray,
	    preloadCount:0,
	    loadedCount:0,	    
	    collision:function(otherUnit){
	        if(this == otherUnit){
	            return false;
	        }
	        
            //alert(otherUnit.x + ' ' + otherUnit.y)
	        var distanceSquared = Math.pow(this.x -otherUnit.x,2) + Math.pow(this.y -otherUnit.y,2);
	        var radiusSquared = Math.pow((this.collisionRadius + otherUnit.collisionRadius)/game.gridSize ,2);
	        var softHardRadiusSquared = Math.pow((this.softCollisionRadius + otherUnit.collisionRadius)/game.gridSize ,2);
	        var softRadiusSquared = Math.pow((this.softCollisionRadius + otherUnit.softCollisionRadius)/game.gridSize ,2);
	        
	        
	        if (distanceSquared <= radiusSquared) {
	            return {type:'hard',distance:Math.pow(distanceSquared,0.5)};
            } else if (distanceSquared < softHardRadiusSquared) {
                return {type:'soft-hard',distance:Math.pow(distanceSquared,0.5)};
            }else if (distanceSquared <= softRadiusSquared){
                   return {type:'soft',distance:Math.pow(distanceSquared,0.5)}; 
            }else {
                return false;
            }
	    },
	    load:function(name){
	        var details = this.vehicleDetails[name];
	        var vehicleType = {};
	        vehicleType.defaults = {
    	        type:'vehicle',
    	        draw:this.draw,
    	        drawSelection: drawSelection,
    	        underPoint: underPoint,
    	        processOrders:this.processOrders,
    	        moveTo:this.moveTo,
    	        move:this.move,
    	        collision:this.collision,
    	        getLife:getLife,
    	        animationSpeed:4,
    	        health:details.hitPoints,
    	        pixelLeft:0,
    	        pixelTop:0,
    	        pixelOffsetX:0,
    	        pixelOffsetY:0, 
    	        moveDirection:0,
    	        turretDirection:0,
    	        status:''   
    	    };
    	    
    	    this.loadSpriteSheet(vehicleType,details,'units/vehicles');
	        
	        $.extend(vehicleType,details);
	        this.types[name]=(vehicleType);
	    },
	    loadSpriteSheet:loadSpriteSheet,
	    draw:function(){
	        
	        // Finally draw the top part with appropriate animation
	        var imageWidth = this.pixelWidth;
	        var imageHeight = this.pixelHeight;
	        var x = Math.round(this.x*game.gridSize+this.pixelOffsetX+game.viewportAdjustX);
        	var y = Math.round(this.y*game.gridSize+this.pixelOffsetY+game.viewportAdjustY); 
        	var teamYOffset = 0;  
            if (this.team != game.currentLevel.team){
               teamYOffset = this.pixelHeight;
            }

            

	        if (this.status == "") {
	            var imageList = this.spriteArray["move"];	            
	            var imageIndex = Math.floor(this.moveDirection);
	            context.drawImage(this.spriteCanvas,(imageList.offset+imageIndex)*imageWidth,teamYOffset,imageWidth,imageHeight,x,y,imageWidth,imageHeight);
	        } else {
	            if(!this.animationIndex){
    	            this.animationIndex = 0;
    	        }
    	        var imageList = this.spriteArray[this.status];
	            if (imageList.count>=Math.floor(this.animationIndex/this.animationSpeed)){	                
    	            var imageIndex = Math.floor(this.animationIndex/this.animationSpeed);
    	            context.drawImage(this.spriteCanvas,(imageList.offset+imageIndex)*imageWidth,teamYOffset,imageWidth,imageHeight,x,y,imageWidth,imageHeight); 
	            }
	            this.animationIndex++;
	            if (this.animationIndex/this.animationSpeed >= imageList.count){
    	            //alert(this.animationIndex + ' / '+ this.animationSpeed)
    	            this.animationIndex = 0;
    	            if(this.status.indexOf('harvest')>-1){
    	                if (!this.tiberium){
    	                    this.tiberium = 0;
    	                }
    	                this.tiberium ++;
    	                if (this.tiberium % 5 == 0){
    	                    this.orders.to.stage --;
    	                }
    	                
    	            }
    	            this.status = "";
    	            
    	        }
	        }
	        
	        if (this.turretDirection >=0 ){
                var turretList = this.spriteArray['turret'];
                if (turretList) {
                     var imageIndex = Math.floor(this.turretDirection);
                     context.drawImage(this.spriteCanvas,(turretList.offset+imageIndex)*imageWidth,teamYOffset,imageWidth,imageHeight,x,y,imageWidth,imageHeight);
                }
            }
	        
	        
	        
	       
            this.drawSelection();
            if (game.debugMode) {

                context.fillStyle = 'white';
                context.fillText(this.orders.type,x,y);
                context.fillText(Math.floor(this.x) +','+Math.floor(this.y),x,y+10);
                this.orders.to && context.fillText(this.orders.to.x +','+this.orders.to.y,x,y+20);
            }
            
              if (game.debugMode) {
                    context.fillStyle = 'rgba(100,200,100,0.4)';
                    context.beginPath();
                    context.arc(this.x*game.gridSize+game.viewportAdjustX,this.y*game.gridSize+game.viewportAdjustY,this.softCollisionRadius,0,Math.PI*2);
                    context.fill();


                    context.fillStyle = 'rgba(200,0,0,0.4)';
                    context.beginPath();
                    context.arc(this.x*game.gridSize+game.viewportAdjustX,this.y*game.gridSize+game.viewportAdjustY,this.collisionRadius,0,Math.PI*2);
                    context.fill();

                    
                }

	    },
	    movementSpeed:0,
	    moveTo:function(destination,turretAtTarget){
	        var start = [Math.floor(this.x),Math.floor(this.y)];
            var end = [destination.x,destination.y];
            this.path = findPath(start,end,this.team == game.currentLevel.team);
            //this.path = [];
            //this.path = [{x:start[0],y:start[1]},{x:end[0],y:end[1]}];
            this.instructions = [];
            if (this.path.length<=1){
                if (Math.abs(this.x-destination.x)<1 && Math.abs(this.y-destination.y)<1){
                    if (this.x==end.x && this.y == end.y){
                        //reached
                    } else {
                        this.path = [{x:start[0],y:start[1]},{x:end[0],y:end[1]}];
                    }
                }
            }
            if (this.path.length>1){       
                  var newAngle=findAngle(this.path[1],this.path[0],32);  
                  var movement = this.movementSpeed*game.speedAdjustmentFactor/game.gridSize;

                  var angleRadians = (this.moveDirection/32)*2*Math.PI;               
                  this.x = (this.x - movement*Math.sin(angleRadians));
                  this.y = (this.y - movement*Math.cos(angleRadians));
                  this.colliding = false;
                  
                  var collision;          
                  for (var k = game.units.length - 1; k >= 0; k--){
                       
                        if (collision = this.collision(game.units[k])){        
                            if (collision.distance<this.collisionDistance){
                                this.collisionType = collision.type;
                                this.collisionDistance = collision.distance;
                                this.collisionWith = game.units[k];    
                                this.colliding = true;
                                //alert('colliding' + this.collisionType)
                            }
                        }
                    };
                
                    for (var k =0; k< game.obstructionGrid.length;k++){
                        for(var l=0;l<game.obstructionGrid[k].length;l++){
                            if (game.obstructionGrid[k][l]>0){
                                //alert((k+0.5)*game.gridSize +' '+(l+0.5)*game.gridSize + ' game.gridSize*0.5')
                                var tile = {x:(l+0.5),y:(k+0.5),
                                        collisionRadius:game.gridSize*0.5,softCollisionRadius:game.gridSize*0.7};
                                if(collision = this.collision(tile)){
                                   if (collision.distance<this.collisionDistance){
                                        this.collisionType = collision.type;
                                        this.collisionDistance = collision.distance;
                                        this.collisionWith = tile;    
                                        this.colliding = true;
                                        //alert('colliding' + this.collisionType)
                                    }    
                                }
                            }
                        }
                    }
 
                    this.x = (this.x + movement*Math.sin(angleRadians));
                    this.y = (this.y + movement*Math.cos(angleRadians));
                    
                
                //this.movementSpeed = this.speed;
                if (this.colliding){
                    //his.movementSpeed = 0;
                    var collDirection=findAngle(this.collisionWith,this,32);
                    var dTurn = angleDiff(this.moveDirection,collDirection,32);
                    var dTurnDestination = angleDiff(newAngle,collDirection,32);
                   
                    /*if(this.collisionWith && this.collisionWith.type=='vehicle' && this.collisionType.indexOf('hard')>-1 && Math.abs(dTurn)<9){
                          if(this.collisionWith.instructions.length==0 && this.collisionWith.orders.type == 'guard'){
                              this.collisionWith.orders = {type:'make-way',for:this};

                          }
                     }*/

                    switch (this.collisionType){

                        case 'hard':
 
                            //alert('collDirection'+collDirection + 'moveDirection '+this.moveDirection + ' dTurn ' +dTurn);
               	            /**/
                            this.movementSpeed = 0;
                            if (Math.abs(dTurn) == 0){ // Bumping into something ahead
                                if(Math.abs(dTurnDestination)>0){
                                    newAngle = addAngle(this.moveDirection,-1*dTurnDestination/Math.abs(dTurnDestination),32);
                                } else {
                                    newAngle = addAngle(this.moveDirection,-1,32);
                                }
                                
                                
                                ////console.log('moving:' + this.moveDirection +' coll: '+this.collisionType+' '+collDirection + ' dTurn:' +dTurn + ' RESULT: newAngle:' +newAngle +' speed:'+this.movementSpeed);
                                this.moveDirection = newAngle;
                                
                            } else if (Math.abs(dTurn) <= 2){ // Bumping into something ahead
    
                                //if (Math.abs(dTurn)<Math.abs(dTurnDestination)){
                                    newAngle = addAngle(this.moveDirection,-1*dTurn/Math.abs(dTurn),32);
                                    ////console.log('moving:' + this.moveDirection +' coll: '+this.collisionType+' '+collDirection + ' dTurn:' +dTurn + ' RESULT: newAngle:' +newAngle +' speed:'+this.movementSpeed);
                                    this.moveDirection = newAngle;
                                //}
                                
                                //newAngle = this.moveDirection;
                                //addAngle(this.moveDirection,-dTurn*1,32);
                                
                            } else if (Math.abs(dTurn) < 4){

                                    //this.movementSpeed -= this.speed/2;
                                //if (this.movementSpeed < -this.speed){
                                  //      this.movementSpeed = -this.speed;
                                //}
                                //if (Math.abs(dTurn)<Math.abs(dTurnDestination)){
                                newAngle = addAngle(this.moveDirection,-1*dTurn/Math.abs(dTurn),32);
                                //console.log('moving:' + this.moveDirection +' coll: '+this.collisionType+' '+collDirection + ' dTurn:' +dTurn + ' RESULT: newAngle:' +newAngle +' speed:'+this.movementSpeed);
                                //}
                                this.moveDirection = newAngle;
 
                            } else if (Math.abs(dTurn) < 9) {
                                    newAngle = addAngle(this.moveDirection,-dTurn/Math.abs(dTurn),32);
                                    this.moveDirection = newAngle;
                            } else {
                                this.movementSpeed = this.speed;
                            }
                            
                            break;
                        case 'soft-hard':  
                            /*if(this.collisionWith && this.collisionWith.type=='vehicle' && Math.abs(dTurn)<2 ){
                                 if(this.collisionWith.instructions.length==0 && this.collisionWith.orders.type == 'guard'){
                                     this.collisionWith.orders = {type:'make-way',for:this};

                                 }
                            }*/
                            if (Math.abs(dTurn) == 0){ // Bumping into something ahead
                                this.movementSpeed = 0;
                                
                                if(Math.abs(dTurnDestination)>0){
                                    newAngle = addAngle(this.moveDirection,-1*dTurnDestination/Math.abs(dTurnDestination),32);
                                } else {
                                    newAngle = addAngle(this.moveDirection,-1,32);
                                }
                                //console.log('moving:' + this.moveDirection +' coll: '+this.collisionType+' '+collDirection + ' dTurn:' +dTurn + ' RESULT: newAngle:' +newAngle +' speed:'+this.movementSpeed);
                                
                                this.moveDirection = newAngle;
                            } else if (Math.abs(dTurn) <= 2){ // Bumping into something ahead
                                this.movementSpeed = 0;
                                /*this.movementSpeed = this.speed*(this.collisionDistance-this.collisionRadius)/(this.softCollisionRadius - this.collisionRadius);
                                if (this.movementSpeed<0) {
                                    this.movementSpeed = 0;
                                }*/
                                //this.movementSpeed  =this.speed/3;//-= this.speed*1/3;
                                newAngle = addAngle(this.moveDirection,-1*dTurn/Math.abs(dTurn),32);
                                //console.log('moving:' + this.moveDirection +' coll: '+this.collisionType+' '+collDirection + ' dTurn:' +dTurn + ' RESULT: newAngle:' +newAngle +' speed:'+this.movementSpeed);
                                this.moveDirection = newAngle;
                            } else if (Math.abs(dTurn) < 4){
                                this.movementSpeed = 0;                                
                                //if (Math.abs(dTurn)<Math.abs(dTurnDestination)){
                                newAngle = addAngle(this.moveDirection,-1*dTurn/Math.abs(dTurn),32);
                                //}
                                //console.log('moving:' + this.moveDirection +' coll: '+this.collisionType+' '+collDirection + ' dTurn:' +dTurn + ' RESULT: newAngle:' +newAngle +' speed:'+this.movementSpeed);
                                
                                this.moveDirection = newAngle;
                            } else if (Math.abs(dTurn) < 9) {
                                //this.movementSpeed = this.speed*(this.collisionDistance-this.collisionRadius)/(this.softCollisionRadius - this.collisionRadius);
                                //if (this.movementSpeed<0) {
                                this.movementSpeed = 0;
                                //}
                                //this.movementSpeed =this.speed/2;//-= this.speed/3;
                                newAngle = addAngle(this.moveDirection,-1*dTurn/Math.abs(dTurn),32);
                                //console.log('moving:' + this.moveDirection +' coll: '+this.collisionType+' '+collDirection + ' dTurn:' +dTurn + ' RESULT: newAngle:' +newAngle +' speed:'+this.movementSpeed);
                                
                                this.moveDirection = newAngle;
                            } else {
                                this.movementSpeed = this.speed;
                                //console.log('moving:' + this.moveDirection +' coll: '+this.collisionType+' '+collDirection + ' dTurn:' +dTurn + ' RESULT: newAngle:' +newAngle +' speed:'+this.movementSpeed);
                                
                                //newAngle = this.moveDirection;
                            }
                            break;                    
                            
                        case 'soft':
                            if (Math.abs(dTurn) == 0){ // Bumping into something ahead
                                this.movementSpeed = this.speed*(this.collisionDistance-this.collisionRadius)/(this.softCollisionRadius - this.collisionRadius);
                                if (this.movementSpeed<0) {
                                    this.movementSpeed = 0;
                                }
                                if(Math.abs(dTurnDestination)>0){
                                    newAngle = addAngle(this.moveDirection,-1*dTurnDestination/Math.abs(dTurnDestination),32);
                                } else {
                                    newAngle = addAngle(this.moveDirection,-1,32);
                                }
                                //console.log('moving:' + this.moveDirection +' coll: '+this.collisionType+' '+collDirection + ' dTurn:' +dTurn + ' RESULT: newAngle:' +newAngle +' speed:'+this.movementSpeed);
                                //this.moveDirection = newAngle;
                                //this.moveDirection = newAngle;
                            } else if (Math.abs(dTurn) <= 2){ // Bumping into something ahead
                                this.movementSpeed = this.speed*(this.collisionDistance-this.collisionRadius)/(this.softCollisionRadius - this.collisionRadius);
                                if (this.movementSpeed<0) {
                                    this.movementSpeed = 0;
                                }
                                
                                newAngle = addAngle(this.moveDirection,-dTurn*1,32);
                                //console.log('moving:' + this.moveDirection +' coll: '+this.collisionType+' '+collDirection + ' dTurn:' +dTurn + ' RESULT: newAngle:' +newAngle +' speed:'+this.movementSpeed);
                                //this.moveDirection = newAngle;
                            } else if (Math.abs(dTurn) < 4){
                                this.movementSpeed = this.speed*(this.collisionDistance-this.collisionRadius)/(this.softCollisionRadius - this.collisionRadius);
                                if (this.movementSpeed<0) {
                                    this.movementSpeed = 0;
                                }
                                
                                newAngle = addAngle(this.moveDirection,-dTurn*1,32);
                                //console.log('moving:' + this.moveDirection +' coll: '+this.collisionType+' '+collDirection + ' dTurn:' +dTurn + ' RESULT: newAngle:' +newAngle +' speed:'+this.movementSpeed);
                                //this.moveDirection = newAngle;
                            } else if (Math.abs(dTurn) < 9) {
                               this.movementSpeed = this.speed;
                                
                                newAngle = addAngle(this.moveDirection,-dTurn*1,32);
                                //console.log('moving:' + this.moveDirection +' coll: '+this.collisionType+' '+collDirection + ' dTurn:' +dTurn + ' RESULT: newAngle:' +newAngle +' speed:'+this.movementSpeed);
                                //this.moveDirection = newAngle;
                            } else {
                                this.movementSpeed = this.speed;
                                //console.log('moving:' + this.moveDirection +' coll: '+this.collisionType+' '+collDirection + ' dTurn:' +dTurn + ' RESULT: newAngle:' +newAngle +' speed:'+this.movementSpeed);
                                //newAngle = this.moveDirection;
                            }
                            break;
                    }
                } else {
                    this.movementSpeed = this.speed;
                }
                
                if (this.movementSpeed > this.speed){
                    this.movementSpeed = this.speed;
                } else if(this.movementSpeed < -this.speed){
                    this.movementSpeed = -this.speed;
                }
                if (this.moveDirection != newAngle){
                    this.instructions.push({type:'turn',toDirection:newAngle});
                }  
                var magTurn = Math.abs(angleDiff(this.moveDirection,newAngle,32));
                //if (magTurn<2 || this.colliding){
                    
                var collision2;          
                for (var k =0; k< game.obstructionGrid.length;k++){
                    for(var l=0;l<game.obstructionGrid[k].length;l++){
                        if (game.obstructionGrid[k][l]>0){
                            //alert((k+0.5)*game.gridSize +' '+(l+0.5)*game.gridSize + ' game.gridSize*0.5')
                            var tile = {x:(l+0.5),y:(k+0.5),
                                    collisionRadius:game.gridSize*0.5,softCollisionRadius:game.gridSize*0.7};
                            if(collision2 = this.collision(tile)){
                                break;
                            }
                        }
                    }
                };
            
                if (magTurn<3 || this.colliding){
                    this.instructions.push({type:'move',distance:1}); 
                }
                
                var turretAngle;
                if (turretAtTarget){
                    turretAngle = findAngle(destination,this,32);
                } else {
                    //turretAngle = this.moveDirection;
                    //if (this.path.length>0)
                    turretAngle =  findAngle(this.path[1],this.path[0],32); 
                    // turretAngle = findAngle({x:targetX,y:targetY},this,32);
                    //this.turretDirection = newAngle;
                }
                if (this.turretDirection != turretAngle ){
                    this.instructions.push({type:'aim',toDirection:turretAngle});
                }
                 
        
            }
	    },
        
	    processOrders:function(){
	        this.colliding = false;
            this.collisionType = '';
            this.collisionDistance = this.softCollisionRadius+1;
            this.collisionWith = null;
            this.movementSpeed = 0;
            this.instructions = [];
            
	        if(!this.orders){
	            this.orders = {type:'guard'};
	        }
	        
	        if (this.orders.type == 'harvest'){
	            
	            
                
	            if (!this.orders.to){
	                this.orders.to = findTiberiumInRange(this);      
	            }
	            if (!this.orders.to){
	                if (this.tiberium){
	                    this.orders = {type:'harvest-return'};
	                }
	                return;
	            }
	            var distance = Math.pow(Math.pow(this.orders.to.y+0.5-this.y,2)+Math.pow(this.orders.to.x+0.5-this.x,2),0.5);
	            
                if (distance >1.5*this.softCollisionRadius/game.gridSize){              
                    this.moveTo(this.orders.to);
                } else {
                    if (this.tiberium && this.tiberium >= 14) {
                        this.orders = {type:'harvest-return',to:this.orders.from,from:this.orders.to};
                        return;      
                    }
                    
                    if (this.orders.to.stage< 1){
                        this.orders.to = findTiberiumInRange(this);
                    } else {
                        if (!this.tiberium|| this.tiberium<14){
                            if (this.status==""){
                                this.status = "harvest-"+((Math.floor(this.moveDirection/4)*4)<10?'0':'')+(Math.floor(this.moveDirection/4)*4);
                            }
                        } 
                        
                    }              
                }
	            
	        } else if (this.orders.type == 'harvest-return'){
	               
    	            if (!this.orders.to){
    	                this.orders.to = findRefineryInRange(this);         
    	                if (!this.orders.to){
        	                return;
        	            }
    	            }
    	            
    	            var destination = {x:this.orders.to.x,y:this.orders.to.y+2};  	             
    	            var distance = Math.pow(Math.pow(destination.y-this.y,2)+Math.pow(destination.x-this.x,2),0.5);
                    //alert(distance)
                    if (distance >  3*this.softCollisionRadius/game.gridSize){              
                        this.moveTo(destination);
                        //this.moveTo({x:10,y:10})
                    } else if (this.orders.to.life != "ultra-damaged"){
                        if (this.tiberium ==0){
                            this.orders = {type:'harvest',to:this.orders.from,from:this.orders.to};
                            return;
                        }
                        
                        if (this.moveDirection != 14){
        	                this.instructions.push({type:'turn',toDirection:14});
        	                return;
        	            } 
        	            
        	            if (this.orders.to.status == ""){
        	                this.status = 'destroy';   
        	                //alert(this.orders.to.name)
        	                //alert (this.name)
        	                //alert(this.orders.from)
        	                this.orders.to.harvester = this;      	                
            	            this.orders.to.status = 'unload';
            	            this.orders.to.animationIndex = 0;
            	            
        	            }        
                    }
                    return;
    	        } else if (this.orders.type == 'make-way'){
	            //alert('Make way for '+this.orders.for)
	            
	            //this.orders = {type:'move',to:{x:Math.round(this.orders.for.x+2),y:Math.round(this.orders.for.y+1)}};
	            
	            //var collDirection=findAngle(this.orders.for,this,32);
                //var dTurn = angleDiff(this.moveDirection,collDirection,32);
                
                if (Math.abs(collDirection) > 16){
                    this.instructions.push({type:'move',distance:0.25});
                } else {
                    this.instructions.push({type:'move',distance:-0.25});
                }
	            
	            this.movementSpeed = this.speed;
	            this.orders={type:'guard'};
	        } 
	        else if (this.orders.type == 'move'){
                //alert(this.processOrders)
                
                this.moveTo(this.orders.to);
                //alert(this.collisionRadius/game.gridSize)
                
                var distance = Math.pow(Math.pow(this.orders.to.y+0.5-this.y,2)+Math.pow(this.orders.to.x+0.5-this.x,2),0.5);
                //console.log(distance + ' '+1.5*2*this.softCollisionRadius/game.gridSize)
                var reachedThreshold = this.softCollisionRadius/game.gridSize <0.5?0.5+this.softCollisionRadius/game.gridSize:this.softCollisionRadius/game.gridSize;
                if ((distance <=reachedThreshold) 
                    //(this.path.length <= 1) 
                    ||(this.colliding && this.collisionType=='soft' && distance<= reachedThreshold +this.collisionRadius/game.gridSize)
                    || (this.colliding && this.collisionType=='soft-hard' && distance<= reachedThreshold+2*this.collisionRadius/game.gridSize)
                    || (this.colliding && this.collisionType=='hard' && distance<= reachedThreshold+3*this.collisionRadius/game.gridSize)){                    
                    this.orders={type:'guard'};
                    //alert(this.collisionType + ' '+distance)
                    /*if (this.name == 'harvester'){
                        if (this.tiberium && this.tiberium >= 10) {
                            this.orders = {type:'harvest-return'};
                        } else {
                            this.orders = {type:'harvest'};  
                        }
                        
                    }*/
                }
                
                
	        } 
	        else if (this.orders.type == 'patrol'){
	            // if i see enemy while patrolling, go jump to the first enemy :)
	            var enemiesInRange = findEnemiesInRange(this,2);
	            if (enemiesInRange.length > 0){
	                var enemy = enemiesInRange[0];
	                this.orders = {type:'attack',target:enemy,lastOrders:this.orders};
	                return;
	            }
                
                this.moveTo(this.orders.to);
                var distance = Math.pow(Math.pow(this.orders.to.y-this.y,2)+Math.pow(this.orders.to.x-this.x,2),0.5);
                if(distance< 4*this.softCollisionRadius/game.gridSize){
                    this.orders={type:'patrol',to:this.orders.from,from:this.orders.to};
                }
	        } 
	        else if (this.orders.type == 'protect' || this.orders.type == 'attack'){
                
                if (this.orders.target.status=='destroy'){
                    var enemiesInRange = findEnemiesInRange(this,2);
    	            if (enemiesInRange.length > 0){
    	                var enemy = enemiesInRange[0];
    	                this.orders = {type:'attack',target:enemy,lastOrders:this.orders};
    	                return;
    	            } else {
    	                if (this.orders.lastOrders){
    	                    this.orders = this.orders.lastOrders
    	                } else {
    	                    this.orders = {type:'guard'}; 
    	                }
    	                
                        return;
    	            }
                    
                }
                
                if(this.orders.type=='protect'){
                    var enemiesInRange = findEnemiesInRange(this,2);
    	            if (enemiesInRange.length > 0){
    	                var enemy = enemiesInRange[0];
    	                this.orders = {type:'attack',target:enemy,lastOrders:this.orders};
    	                return;
    	            }
                }
                //var start = [Math.floor(this.x),Math.floor(this.y)];
                //adjust to center of target for buildings
                
                
                
                var targetX = this.orders.target.x;
                var targetY = this.orders.target.y;
                var targetCGX = this.orders.target.x;
                var targetCGY = this.orders.target.y;
                
                if (this.orders.target.type=='turret'){
                    targetX += this.orders.target.pixelWidth/(2*game.gridSize);
                    targetY += this.orders.target.pixelHeight/(2*game.gridSize);
                    targetCGX = targetX;
                    targetCGY = targetY;
                    
                } 
                
                if (this.orders.target.type == 'building'){
                    targetX += this.orders.target.gridWidth/2
                    targetY += this.orders.target.gridHeight;   
                    targetCGX = targetX;
                    targetCGY += this.orders.target.gridHeight/2;
                    
                }
                
                
           

                
                if(Math.pow(targetX-this.x,2)+Math.pow(targetY-this.y,2) > Math.pow(this.sight-1,2)){
                    this.moveTo({x:Math.floor(targetX),y:Math.floor(targetY)},true);
                }
                
                if(Math.pow(targetX-this.x,2)+Math.pow(targetY-this.y,2)<= Math.pow(this.sight,2)){ 
                    if(this.orders.type == 'attack'){
                        var turretAngle = findAngle({x:targetCGX,y:targetCGY},this,32);
                        if (this.turretDirection == turretAngle){
                            // aiming turret at him and within range... FIRE!!!!!
                            this.instructions.push({type:'fire'});
                            //this.instructions=[{type:'fire'}];
                        } else {
                            this.instructions.push({type:'aim',toDirection:turretAngle});
                            //console.log('turret '+this.turretDirection +'  -> '+turretAngle)
                        }
                    }
                    // do nothing... wait...
                }
	        } 
	        else if (this.orders.type == 'build'){
	            if (this.moveDirection != 15){
	                this.instructions.push({type:'turn',toDirection:15});
	            } else {
	                this.status = 'destroy';
	                sounds.play('construction');
	                game.buildings.push(buildings.add({name:'construction-yard',x:Math.floor(this.x)-1,y:Math.floor(this.y)-1,status:'build'}));
	            }
	        }
	        else if (this.orders.type == 'guard'){
	            // first see if an evil unit is in sight and track it :)
	            var enemiesInRange = findEnemiesInRange(this,2);
	            if (this.primaryWeapon && enemiesInRange.length > 0){
	                var enemy = enemiesInRange[0];
	                this.orders = {type:'attack',target:enemy};
	            }
	        }
	    },
	    move: function(){
	        this.moving = false;
	        this.attacking = false;
	        if(!this.instructions){
	            this.instructions = [];
	        }
	        if(this.instructions.length == 0){
	            
	            return;
	        }
	        
	        for (var i = 0; i< this.instructions.length; i++){
	           var instr = this.instructions[i];
   	           if (instr.type == 'turn'){
   	                if(instr.toDirection == this.moveDirection){
       	                // instruction complete...
       	               instr.type = 'done';
       	                //return;
       	            }
       	            if ((instr.toDirection > this.moveDirection && (instr.toDirection - this.moveDirection) < 16)
       	                || (instr.toDirection < this.moveDirection && (this.moveDirection- instr.toDirection ) > 16)){
                           //alert(this.turnSpeed*0.05)
       	                this.moveDirection = this.moveDirection + this.turnSpeed*0.1;
       	                if((this.moveDirection-instr.toDirection)*(this.moveDirection + this.turnSpeed*0.1-instr.toDirection) <=0){
       	                    this.moveDirection = instr.toDirection;
       	                }
       	            } else {
       	                this.moveDirection = this.moveDirection - this.turnSpeed*0.1;
       	                if((this.moveDirection-instr.toDirection)*(this.moveDirection - this.turnSpeed*0.1-instr.toDirection) <=0){
       	                    this.moveDirection = instr.toDirection;
       	                }
       	            }
       	            if (this.moveDirection>31){
       	                this.moveDirection = 0;
       	            } else if(this.moveDirection<0){
       	                this.moveDirection = 31;
       	            }        
       	        }
       	          
      	        if (instr.type == 'move'){
      	            //alert(1);
      	            
       	            if(instr.distance<=0){
       	                //this.instructions.splice(0,1);
       	                //return;
       	                instr.type = 'done';
       	                return;
       	            }
       	            this.moving = true;
       	            //alert(this.movementSpeed)
       	            var movement = this.movementSpeed*game.speedAdjustmentFactor/game.gridSize;
       	            instr.distance -= movement;
       	            var angle = (this.moveDirection/32)*2*Math.PI; 
       	           
       	            this.x = (this.x - movement*Math.sin(angle));
                    this.y = (this.y - movement*Math.cos(angle));
                    
       	        }
                if (instr.type == 'aim'){
	            
    	            //alert('aiming: ' + instr.toDirection + ' and turret is at '+this.turretDirection)
                    if(instr.toDirection == this.turretDirection){
    	                // instruction complete...
    	               instr.type = 'done';
    	                //return;
    	            } else {
    	                
    	                var delta = angleDiff(Math.floor(this.turretDirection),Math.floor(instr.toDirection),32);
    	                if(Math.abs(delta) < 1){
    	                    //this.turretDirection = instr.toDirection
    	                    this.turretDirection = instr.toDirection;
    	                    instr.type = 'done';
    	                } else {
    	                    this.turretDirection = addAngle(this.turretDirection,delta/Math.abs(delta),32)
    	                }
    	            }
    	        }
    	        
                if (instr.type == 'fire'){
                   // alert(this.fireCounter)
                    if (!this.bulletFiring){
                        sounds.play('tank_fire');
                        this.bulletFiring = true;
                        var angle = (this.turretDirection/32)*2*Math.PI;                      
                        game.fireBullet({x:this.x,y:this.y,angle:angle,range:this.sight,source:this});
                    }

                    
       	        }
   	        };
	    },
        add:function(details){
	        var newVehicle = {};
	        var name = details.name;
	        newVehicle.team = game.currentLevel.team;
	        $.extend(newVehicle,this.types[name].defaults);

	        $.extend(newVehicle,this.types[name]);
	        $.extend(newVehicle,details);
	        
	        return newVehicle;
	    }
	};

    var turrets = {
         types:[],
         turretDetails: {
 	        'gun-turret':{
 	            name:'gun-turret',
 	            label:'Gun Turret',
 	            type:'turret',
 	            powerIn:20,
     	        primaryWeapon:12,
     	        cost:600,
     	        hitPoints:200,
     	        sight:5,
     	        turnSpeed:5,
     	        reloadTime:1500,
     	        pixelWidth:24,
     	        pixelHeight:24,
     	        imagesToLoad:[
        	        {name:'build',count:20},
        	        {name:'damaged',count:32},
        	        {name:"healthy",count:32}                  
        	    ], 
     	        pixelOffsetX:-12,
         	    pixelOffsetY:-12,
	            pixelTop:12,
	            pixelLeft:12,
	            gridWidth:1,
        	    gridHeight:1,
	            gridShape:[[1]]
 	        },
 	        'guard-tower':{
 	            name:'guard-tower',
 	            label:'Guard Tower',
 	            type:'turret',
 	            powerIn:10,
     	        primaryWeapon:1,
     	        cost:500,
     	        hitPoints:200,
     	        sight:5,
     	        reloadTime:1000,
     	        pixelWidth:24,
     	        pixelHeight:24, 
     	        pixelOffsetX:-12,
         	    pixelOffsetY:-12,
	            pixelTop:12,
	            pixelLeft:12,
	            imagesToLoad:[
        	        {name:'build',count:20},
        	        {name:'damaged',count:1},
        	        {name:"healthy",count:1}                  
        	    ],
        	    gridWidth:1,
        	    gridHeight:1,
	            gridShape:[[1,1]]
 	        },
 	        
 	    },
 	    preloadImage:preloadImage,
 	    loadImageArray:loadImageArray,
 	    preloadCount:0,
 	    loadedCount:0,
 	    load:function(name){
 	        var details = this.turretDetails[name];
 	        var turretType = {};
 	        turretType.defaults = {
     	        type:'turret',
     	        status:'',
     	        
     	        draw:this.draw,
     	        drawSelection: drawSelection,
     	        processOrders: this.processOrders,
     	        underPoint: underPoint,
     	        move:this.move,
     	        getLife:getLife,
     	        animationSpeed:4,
     	        health:details.hitPoints,
     	        pixelLeft:0,
     	        pixelTop:0,
     	        pixelOffsetX:0,
     	        pixelOffsetY:0,   
     	        turretDirection:0    
     	    };


            this.loadSpriteSheet(turretType,details,'turrets')

 	        $.extend(turretType,details);
 	        this.types[name]=(turretType);
 	    },
 	    loadSpriteSheet:loadSpriteSheet,
 	    draw:function(){
	        var life = this.getLife();
            var teamYOffset = 0;  
            if (this.team != game.currentLevel.team){
               teamYOffset = this.pixelHeight;
               //alert(teamYOffset)
            }
            
	        if (this.status=="build" || this.status=="sell"){
	            imageCategory = 'build';
	        } else if (this.status ==""){
	            imageCategory = this.life;
	            if (this.life == 'ultra-damaged'){ // turrets don't have ultra damaged. :)
    	            imageCategory ='damaged';
    	        }
	        }

	        
	        var imageList = this.spriteArray[imageCategory];
	        var imageWidth = this.gridShape[0].length*game.gridSize;
	        var imageHeight = this.spriteImage.height;
	        
	        

	        var x = this.x*game.gridSize+game.viewportAdjustX;
	        var y = this.y*game.gridSize+game.viewportAdjustY;
	        if (this.status == "") {   
	            var imageIndex = Math.floor(this.turretDirection);
	            
	            context.drawImage(this.spriteCanvas,(imageList.offset+imageIndex)*imageWidth,teamYOffset,imageWidth,imageHeight,x,y,imageWidth,imageHeight);
	        } else {
	            if(!this.animationIndex){
    	            this.animationIndex = 0;
    	        }
	            if (imageList.count>=Math.floor(this.animationIndex/this.animationSpeed)){	                
    	            var imageIndex = Math.floor(this.animationIndex/this.animationSpeed);
    	            if (this.status =='sell'){
    	                imageIndex = imageList.count-1 - Math.floor(this.animationIndex/this.animationSpeed);
    	            }
    	            context.drawImage(this.spriteCanvas,(imageList.offset+imageIndex)*imageWidth,teamYOffset,imageWidth,imageHeight,x,y,imageWidth,imageHeight);
	            }
	            this.animationIndex++;
	            if (this.animationIndex/this.animationSpeed >= imageList.count){
    	            //alert(this.animationIndex + ' / '+ this.animationSpeed)
    	            this.animationIndex = 0;
    	            this.status = "";  
	                if (this.status == 'sell'){
    	                this.status = 'destroy';    
    	            }
    	        }
	        }
	        
	        if (this.turretDirection >=0 ){
                var turretList = this.spriteArray['turret'];
                if (turretList) {
                     var imageIndex = Math.floor(this.turretDirection);
                     context.drawImage(this.spriteImage,(turretList.offset+imageIndex)*imageWidth,teamYOffset,imageWidth,imageHeight,x,y,imageWidth,imageHeight);
                }
            }
	        this.drawSelection();

 	    },
 	    processOrders:function(){
	        
	        if(!this.orders){
	            this.orders = {type:'guard'};
	        }
	        //this.orders = {type:'move',to:{x:11,y:12}}; //{type:patrol,from:{x:9,y:5},to:{x:11,y:5}} // {type:guard} // {type:move,to:{x:11,y:5}} // {type:attack} // {type:protect}


	        if (this.orders.type == 'attack'){
                this.instructions=[]; 
                if (this.orders.target.status=='destroy'){
                    this.orders = {type:'guard'};
                    return;
                }
                
                var start = [Math.floor(this.x),Math.floor(this.y)];
                //adjust to center of target for buildings
                var targetX = this.orders.target.x;
                var targetY = this.orders.target.y;
                if (this.orders.target.type=='turret'){
                    targetX += this.orders.target.pixelWidth/(2*game.gridSize);
                    targetY += this.orders.target.pixelHeight/(2*game.gridSize);
                } 
                
                if (this.orders.target.type == 'building'){
                    targetX += this.orders.target.gridWidth/2
                    targetY += this.orders.target.gridHeight/2;   
                }
                                   
                if(Math.pow(targetX-this.x,2)+Math.pow(targetY-this.y,2)>= Math.pow(this.sight,2)){ 
                    //alert('not attacking '+this.orders.target.name)
                    this.orders = {type:'guard'};// out of range go back to guard mode.
                    
                } else {
                    if(this.orders.type == 'attack'){
                        var turretAngle = findAngle({x:targetX,y:targetY},this,32);
                        if (this.turretDirection != turretAngle){
                            this.instructions.push({type:'aim',toDirection:turretAngle});
                           //alert('pusing direction ' + turretAngle)
                        } else {
                            // aiming turret at him and within range... FIRE!!!!!
                            //alert(turretAngle)
                            this.instructions.push({type:'fire'});
                            // this only processes if the guy has some ammo
                        }
                        
                    }
                    // do nothing... wait...
                }
	        } 
	        else if (this.orders.type == 'guard'){
	            // first see if an evil unit is in sight and track it :)
	            var enemiesInRange = findEnemiesInRange(this,0);
	            if (enemiesInRange.length > 0){
	                var enemy = enemiesInRange[0];
	                
	                this.orders = {type:'attack',target:enemy};
	                
	            }
	        }
	    },
	    move: function(){
	        if(!this.instructions){
	            this.instructions = [];
	        }
	        if(this.instructions.length == 0){
	            return;
	        }
	        
	        for (var i = 0; i< this.instructions.length; i++){
	           var instr = this.instructions[i];
                if (instr.type == 'aim'){
	            
    	            //alert('aiming: ' + instr.toDirection + ' and turret is at '+this.turretDirection)
                    if(instr.toDirection == this.turretDirection){
    	                // instruction complete...
    	               instr.type = 'done';
    	                //return;
    	            }
    	            if ((instr.toDirection > this.turretDirection && (instr.toDirection - this.turretDirection) < 16)
    	                || (instr.toDirection < this.turretDirection && (this.turretDirection- instr.toDirection ) > 16)){
                        //alert(this.turnSpeed*0.05)
    	                this.turretDirection = this.turretDirection + this.turnSpeed*0.1;
    	                if((this.turretDirection-instr.toDirection)*(this.turretDirection + this.turnSpeed*0.1-instr.toDirection) <=0){
    	                    this.turretDirection = instr.toDirection;
    	                }
    	            } else {
    	                this.turretDirection = this.turretDirection - this.turnSpeed*0.1;
    	                if((this.turretDirection-instr.toDirection)*(this.turretDirection - this.turnSpeed*0.1-instr.toDirection) <=0){
    	                    this.turretDirection = instr.toDirection;
    	                }
    	            }
    	            if (this.turretDirection>31){
    	                this.turretDirection = 0;
    	            } else if(this.turretDirection<0){
    	                this.turretDirection = 31;
    	            }     
    	            
    	            //alert(this.turretDirection)   
    	        }
    	        
                if (instr.type == 'fire'){
                   // alert(this.fireCounter)
                    if (!this.bulletFiring){
                        sounds.play('tank_fire');
                        this.bulletFiring = true;
                        var angle = (this.turretDirection/32)*2*Math.PI;                      
                        game.fireBullet({x:this.x+0.5,y:this.y+0.5,angle:angle,range:this.sight,source:this,damage:10});
                    }
       	        }
   	        };
	    },
 	    add:function(details){
 	        var newTurret = {};
 	        var name = details.name;
 	        newTurret.team = game.currentLevel.team;
 	        $.extend(newTurret,this.types[name].defaults);

 	        $.extend(newTurret,this.types[name]);
 	        $.extend(newTurret,details);

 	        return newTurret;
 	    }
 	    
    }
	
	var ships = {
	    types:[],
	    load:function(name){
	        var shipType = {
	            name:name
	            
	        };
	        
	        
	    },
	    add:function(newShip){

	        $.extend(newShip,this.types[name]);
	        
	    }
	};

	var overlay = {
	    types:[],
	    overlayDetails:{
	        'tiberium':{
	            name:'tiberium',
	            count:2,
	            pixelWidth:24,
	            pixelHeight:24,
	            stageCount:12, 
	            gridOffsetX:0,
	            gridOffsetY:0,
	            imagesToLoad:[
        	        {name:'0',count:12},
        	        {name:'1',count:12}                 
        	    ]     
	        },
	        'tree':{
	            name:'tree',
	            count:1,
	            stageCount:10,
	            pixelWidth:48,
	            pixelHeight:48,
	            gridOffsetX:0,
	            gridOffsetY:-1,
	            imagesToLoad:[
	                {name:'0',count:10},
        	        {name:'1',count:10},
        	        {name:'2',count:10}                 
        	    ]
	        },
	        'trees':{
	            name:'trees',
	            count:1,
	            stageCount:10,
	            gridOffsetX:0,
	            gridOffsetY:-1,
	            pixelWidth:72,
	            pixelHeight:48,
	            imagesToLoad:[
	                {name:'0',count:10}                 
        	    ]
	        }       
	    },
	    loadSpriteSheet:loadSpriteSheet,
	    load:function(name){
	        var overlayType={
	            name:name,
	            draw:this.draw
	        }
	        var details = this.overlayDetails[name];
	        
	        this.loadSpriteSheet(overlayType,details,'tiles/temperate')
	        /*
	        var imageArray = [];
	        for(i=0;i<details.count;i++){
	            imageArray[i] = this.loadImageArray('tiles/temperate/'+name+'/'+name+'-'+i,details.stageCount,'.gif');
	        }
	        overlayType.imageArray = imageArray;
	        */
	        $.extend(overlayType,details)
	        this.types[name] = overlayType;
	    },
	    draw:function(){
	        
	        // Finally draw the top part with appropriate animation
	        var imageWidth = this.pixelWidth;
	        var imageHeight = this.pixelHeight;
	        
            var x =Math.round((this.x+this.gridOffsetX)*game.gridSize+game.viewportAdjustX);
	        var y = Math.round((this.y+this.gridOffsetY)*game.gridSize+game.viewportAdjustY);
            
	        var imageList = this.spriteArray[this.type];	            
	        var imageIndex = this.stage;
	        context.drawImage(this.spriteCanvas,(imageList.offset+imageIndex)*imageWidth,0,imageWidth,imageHeight,x,y,imageWidth,imageHeight);
	        
	        return;
	    },
	    loadAll:function(){
	        this.load('tiberium');
	        this.load('tree');
	        this.load('trees');
	    },
	    add:function(details){
	        var newOverlay = {
	            type:0,
	            stage:0
	        };
	        var name = details.name;
	        
            $.extend(newOverlay,this.types[name]);
	        $.extend(newOverlay,details);  
	        return newOverlay;  
	    },
	    loaded:true,
	    preloadCount:0,
	    loadedCount:0,
	    preloadImage:preloadImage,
	    loadImageArray:loadImageArray
	}
	
	var levels = {
	    levelDetails : {
	        "gdi1" :{
	            mapUrl: 'maps/gdi/map01.jpeg', // The background map to load
	            startingCash:3000,
	            terrain : [
	                {x1:0,y1:27,x2:30,y2:30,type:'water'},
	                {x1:0,y1:26,x2:6,y2:26,type:'water'},
	                {x1:0,y1:25,x2:5,y2:25,type:'water'},
	                {x1:0,y1:24,x2:4,y2:24,type:'water'},
	                //{x1:11,y1:26,x2:11,y2:26,type:'water'},
	                
	                {x1:29,y1:17,x2:30,y2:22,type:'mountain'},
	                {x1:7,y1:6,x2:8,y2:9,type:'mountain'},
	                {x1:8,y1:10,x2:9,y2:11,type:'mountain'},
	                {x1:9,y1:11,x2:10,y2:15,type:'mountain'},
	                {x1:10,y1:15,x2:11,y2:19,type:'mountain'},
	                {x1:11,y1:19,x2:12,y2:21,type:'mountain'},
	                {x1:12,y1:21,x2:14,y2:23,type:'mountain'},
	                {x1:12,y1:24,x2:13,y2:24,type:'mountain'},
	                {x1:14,y1:21,x2:17,y2:22,type:'mountain'},
	                {x1:16,y1:23,x2:16,y2:23,type:'mountain'}
	                
	            ], // full size grid, defines water and mountains
	            overlay:[
	                {x:10,y:10,name:'tree'},
	                {x:16,y:3,name:'tree'},
	                {x:14,y:2,name:'trees'},
	                {x:9,y:2,name:'trees'},
	                {x:19,y:12,name:'trees'},
	                {x:15,y:13,name:'trees'},
	                {x:0,y:1,name:'trees'},
	                {x:2,y:1,name:'trees'},
	                {x:4,y:1,name:'trees'},
	                {x:8,y:1,name:'tree'},
	                {x:6,y:0,name:'tree'},
	                {x:7,y:0,name:'tree'},
	                
	                //{x:12,y:15,name:'tiberium',stage:11},
	                //{x:13,y:15,name:'tiberium',stage:8},
	                
	                {x:28,y:11,name:'tiberium',stage:9},
	                {x:29,y:11,name:'tiberium',stage:7},
	                {x:28,y:12,name:'tiberium',stage:9},
	                {x:29,y:12,name:'tiberium',stage:5},
	                {x:28,y:13,name:'tiberium',stage:10},
	                {x:29,y:13,name:'tiberium',stage:4},
	                {x:28,y:14,name:'tiberium',stage:8},
	                {x:29,y:14,name:'tiberium',stage:6},
	                {x:28,y:15,name:'tiberium',stage:3},
	                {x:27,y:15,name:'tiberium',stage:11},
	                {x:27,y:14,name:'tiberium',stage:1},
	                {x:27,y:13,name:'tiberium',stage:5},
	                
	                
	                {x:13,y:16,name:'tiberium',stage:1},
	                {x:14,y:16,name:'tiberium',stage:5},
	                {x:15,y:17,name:'tiberium',stage:8},
	                {x:14,y:17,name:'tiberium',stage:3},
	                {x:16,y:17,name:'tiberium',stage:6}
	                
	               // {x1:8,y1:8,x2:10,y2:10,type:'tree-1'},
	                //{x1:8,y1:8,x2:10,y2:10,type:'tiberium-1'}
	            ], //the trees and tiberium .. can terrain and overlay be in the same?
	            gridWidth:31,
	            gridHeight:31,
	            team:'gdi',
	            briefing:'This is a warning \n for all of you \n Kill enemy troops and have some fun',
	            items: {
	                infantry: [],// ['minigunner'],
	                buildings:['construction-yard','power-plant','refinery','weapons-factory','advanced-power-plant','tiberium-silo','hand-of-nod'],
	                vehicles:['mcv','light-tank','harvester'],
	                ships:['bigboat'],
	                turrets:['gun-turret']
	            },
	            scriptedEvents:[
                    {   id:'trigger1',description:'Initial four reinforcement troops land on beach',
                            actions:[
	                        {action:'wait',tigger:'time',time:100},//time in milliseconds
	                        {action:"sound",sound:'reinforcements_have_arrived'},
	                        {action:'addUnit',
	                            unit:{name:'hovercraft',type:'vehicle',unselectable:true,id:'hovercraft1',
	                                    x:30,y:30,direction:'up',carrying:[{name:'gunner'}]}},
	                        {action:'move',id:'hovercraft1',x:30,y:27},
	                        {action:'unload',id:'hovercraft1',x:30,y:28},
	                        {action:'move',id:'hovercraft1',x:30,y:30},
	                        {action:'removeUnit',id:'hovercraft1'}
	                        ]
	                }, 
	                {   id:'trigger2',description:'Blow up enemy powerplant when the time comes',
	                    actions:[
	                        {action:'wait',trigger:'condition',condition:function(){return true;}},
	                        {action:'sound',sound:'low_power'},
	                        {action:'destroyBuilding',id:'powerplant1'}
	                    ]
	                },
	                {   id:'wintrigger',
	                    actions:[
	                        {action:'wait',trigger:'condition',condition:function(){ return (units.enemyUnitCount()==0 &&buildings.enemyBuildingsCount==0);}},
    	                    {action:'endLevel',type:'success'}
	                    ]
	                }
	                
	            ]
	            
	            
	        }
	    },
	    preloadImage:preloadImage,
	    loaded:true,
	    preloadCount:0,
	    loadedCount:0,
	    load : function(id){
	        var level = {};
	        level.id = id;
	        //level.mapImage = new Image();
	        level.mapImage = this.preloadImage(this.levelDetails[id].mapUrl);
	        var details = this.levelDetails[id];
	        for (item in details.items){
	            if(item=="vehicles"){
	                for (var i = details.items[item].length - 1; i >= 0; i--){
	                    vehicles.load(this.levelDetails[id].items[item][i]);
	                };
	            }
	            if(item=="buildings"){
	                for (var i = details.items[item].length - 1; i >= 0; i--){
	                    buildings.load(details.items[item][i]);
	                };
	            }
	            
	            if(item=="infantry"){
	                for (var i = details.items[item].length - 1; i >= 0; i--){
	                    infantry.load(details.items[item][i]);
	                };
	            }
	            
	            if(item=="turrets"){
	                for (var i = details.items[item].length - 1; i >= 0; i--){
	                    turrets.load(details.items[item][i]);
	                };
	            }            
	        }
	        
	        var obstructionGrid = new Array();
	        var mapGrid = new Array();
	        for (var y=0; y < details.gridHeight; y++) {
	            obstructionGrid[y] = new Array();
	            mapGrid[y] = new Array();
	            for (var x=0; x < details.gridWidth; x++) {
	               obstructionGrid[y][x] = 0;
	            };
	        };
	        for (var i = details.terrain.length - 1; i >= 0; i--){
	            var terrain = details.terrain[i];
	            for (var x = terrain.x1;x<=terrain.x2;x++){
	                for(var y = terrain.y1;y <= terrain.y2;y++){
	                    obstructionGrid[y][x] = 1;
	                    mapGrid[y][x] = terrain.type;
	                }
	            }
	        };
	        
	        var overlayArray = [];
	        for (var i = details.overlay.length - 1; i >= 0; i--){
	            overlayArray.push(overlay.add(details.overlay[i]))
	        };
	        
	        level.mapGrid = mapGrid;
	        level.obstructionGrid = obstructionGrid;
	        level.overlay = overlayArray;
	        
	        sidebar.cash = details.startingCash;
	        level.team = details.team;
	        return level;
	    }   
	};
	
    var sounds = {
        sound_list:[],
        loaded:true,
        load:function(name,path){  
            var sound = new Audio('audio/'+path+'/'+name+'.ogg');
            sound.load();
            //alert(sound.src);
            return sound;
        },
        play: function(name,unique){
            var options = this.sound_list[name];
            //alert(name)
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
            this.sound_list['insufficient_funds'] = [this.load('insufficient_funds','voice')];
            this.sound_list['building'] = [this.load('building','voice')];
            this.sound_list['on_hold'] = [this.load('on_hold','voice')];
            this.sound_list['cancelled'] = [this.load('cancelled','voice')];
            this.sound_list['cannot_deploy_here'] = [this.load('cannot_deploy_here','voice')];
            this.sound_list['new_construction_options'] = [this.load('new_construction_options','voice')];
            this.sound_list['construction_complete'] = [this.load('construction_complete','voice')];
            this.sound_list['not_ready'] = [this.load('not_ready','voice')];
            //this.sound_list['reinforcements_have_arrived'] = [this.load('reinforcements_have_arrived','voice')];
            this.sound_list['low_power'] = [this.load('low_power','voice')];
            this.sound_list['unit_ready'] = [this.load('unit_ready','voice')];
            
            this.sound_list['mission_accomplished'] = [this.load('mission_accomplished','voice')];
            this.sound_list['mission_failure'] = [this.load('mission_failure','voice')];
            
            this.sound_list['construction'] = [this.load('construction','sounds')];
            this.sound_list['crumble'] = [this.load('crumble','sounds')];
            this.sound_list['sell'] = [this.load('sell','sounds')];
            this.sound_list['button'] = [this.load('button','sounds')];
            //this.sound_list['clock'] = [this.load('clock','sounds')];
            
            this.sound_list['machine_gun'] = [this.load('machine_gun-0','sounds'),this.load('machine_gun-1','sounds')];
            this.sound_list['tank_fire'] = [this.load('tank-fire-0','sounds'),this.load('tank-fire-1','sounds'),this.load('tank-fire-2','sounds'),this.load('tank-fire-3','sounds')];
            //this.sound_list['tank_fire'] = [this.load('tank-fire-0','sounds')];
            this.sound_list['vehicle_select'] = [this.load('ready_and_waiting','talk'),this.load('vehicle_reporting','talk'),this.load('awaiting_orders','talk')];
            this.sound_list['vehicle_move'] = [this.load('affirmative','talk'),this.load('moving_out','talk'),this.load('acknowledged','talk'),this.load('over_and_out','talk')];            
            
            this.sound_list['infantry_select'] = [this.load('reporting','talk'),this.load('unit_reporting','talk'),this.load('awaiting_orders','talk')];
            this.sound_list['infantry_move'] = [this.load('affirmative','talk'),this.load('yes_sir','talk'),this.load('acknowledged','talk'),this.load('right_away','talk')];
        }
    }
	
	// common functions used by all objects
	
    function preloadImage(imgUrl,callbackFunction){
	    var loadee = this;
	    this.loaded = false;
	    var image = new Image();
	    image.src = 'images/'+imgUrl;
	    this.preloadCount++;
	    $(image).bind('load',function() {
	        loadee.loadedCount++;
	        if (loadee.loadedCount == loadee.preloadCount){
	            loadee.loaded=true;
	        }
	        if (callbackFunction){
	            callbackFunction();
	        }
	    });
	    return image;
	}
	
	function loadImageArray(imgName, count, extn){
	    if(!extn){
	        extn = '.png';
	    }
	    var imageArray = [];
	    for (var i=0; i < count; i++) {
	        imageArray.push(this.preloadImage(imgName+'-'+(i<10?'0':'')+i+extn));
	    };
        return imageArray;
	}	
	
	function getLife(){
	    var life = this.health/this.hitPoints;
        if(life > 0.7){
            this.life = "healthy";
        } else if (life>0.4){
            this.life = "damaged";        
        } else {
            this.life = "ultra-damaged";
        }
	}
	
    function drawSelection(){
        if (this.selected){
            context.strokeStyle = 'white';
            //context.strokeWidth = 4;
            
            var selectBarSize = 5;

            var x = this.x*game.gridSize+game.viewportAdjustX + this.pixelOffsetX;
	        var y = this.y*game.gridSize+game.viewportAdjustY + this.pixelOffsetY;

            var x1 = x+this.pixelLeft;
            var y1 = y+this.pixelTop;
            var x2 = x1+this.pixelWidth;
            var y2 = y1+this.pixelHeight;

            
            // First draw the white bracket
            context.beginPath();
           //alert(x1);
            context.moveTo(x1,y1+selectBarSize);
            context.lineTo(x1,y1);
            context.lineTo(x1+selectBarSize,y1);

            context.moveTo(x2-selectBarSize,y1);
            context.lineTo(x2,y1);
            context.lineTo(x2,y1+selectBarSize);

            context.moveTo(x2,y2-selectBarSize);
	        context.lineTo(x2,y2);
	        context.lineTo(x2-selectBarSize,y2);

            context.moveTo(x1+selectBarSize,y2);
	        context.lineTo(x1,y2);
            context.lineTo(x1,y2-selectBarSize);    	        
            
            context.stroke();

            // Now draw the health bar
            this.getLife();     
   
            context.beginPath();
            context.rect(x1,y1-selectBarSize-2,this.pixelWidth*this.health/this.hitPoints,selectBarSize);
            if (this.life == 'healthy') { 
                context.fillStyle = 'lightgreen';
            } else if (this.life == 'damaged') { 
                context.fillStyle = 'yellow';
            } else {
                context.fillStyle = 'red';
            }
            context.fill();
            context.beginPath();
            context.strokeStyle = 'black';
            context.rect(x1,y1-selectBarSize-2,this.pixelWidth,selectBarSize);
            context.stroke();
            
            if(this.primaryBuilding){
               context.drawImage(sidebar.primaryBuildingImage,(x1+x2 -sidebar.primaryBuildingImage.width)/2 ,y2-sidebar.primaryBuildingImage.height);
            }
        }
        
    }
    
    function underPoint(x,y){
        var xo = this.x*game.gridSize + this.pixelOffsetX;
        var yo = this.y*game.gridSize + this.pixelOffsetY;

        var x1 = xo+this.pixelLeft;
        var y1 = yo+this.pixelTop;
        var x2 = x1+this.pixelWidth;
        var y2 = y1+this.pixelHeight;
        //

        if (x>= x1 && x<=x2 && y>= y1 && y <= y2){
            return true;
            
        }
        return false;
    }
    
    
    function findRefineryInRange(hero){
        if(!hero){
            hero = this;
        }
        var currentDistance;
        var currentRefinery;
        for (var i=0; i < game.buildings.length; i++) {
            var building = game.buildings[i];
            if (building.name == 'refinery' && building.team == hero.team){
                var distance = Math.pow(building.x-hero.x,2)+Math.pow(building.y-hero.y,2);
                if (!currentDistance || (currentDistance > distance)){
                    currentRefinery = building;
                    currentDistance = distance;
                }                
            }
        };
        return currentRefinery;
    }
    
    function findTiberiumInRange(hero){
        if(!hero){
            hero = this;
        }
        var currentDistance;
        var currentOverlay;
        for (var i=0; i < game.overlay.length; i++) {
            var overlay = game.overlay[i];
            if (overlay.name == 'tiberium' & overlay.stage>0 && !fog.isOver(overlay.x*game.gridSize,overlay.y*game.gridSize)){
                var distance = Math.pow(overlay.x-hero.x,2)+Math.pow(overlay.y-hero.y,2);
                if (!currentDistance || (currentDistance > distance)){
                    currentOverlay = overlay;
                    currentDistance = distance;
                }                
            }
        };
        return currentOverlay;
    }
    
    function findEnemiesInRange(hero,increment){
       if (!increment)
            increment = 0;
       var enemies = [];
       if(!hero){
           hero = this;
       }
       
       for (var i = game.units.length - 1; i >= 0; i--){
           var test = game.units[i];
	        if(test.team != hero.team && Math.pow(test.x-hero.x,2) + Math.pow(test.y-hero.y,2) <= Math.pow(hero.sight+increment,2)){
               enemies.push(test);
               //alert(hero.name + ':' +hero.x + ',' + hero.y+ ' too close to ' + test.name + ':' +test.x + ',' + test.y)      
	        }
	    };
        for (var i = game.buildings.length - 1; i >= 0; i--){
            var test = game.buildings[i];
 	        if(test.team != hero.team && Math.pow(test.x+test.gridWidth/2-hero.x,2) + Math.pow(test.y+test.gridHeight/2-hero.y,2) <= Math.pow(hero.sight+increment,2)){
                enemies.push(test);      
 	        }
 	    };
        for (var i = game.turrets.length - 1; i >= 0; i--){
            var test = game.turrets[i];
            
 	        if(test.team != hero.team && Math.pow(test.x+test.gridWidth/2-hero.x,2) + Math.pow(test.y+test.gridHeight/2-hero.y,2) <= Math.pow(hero.sight+increment,2)){
                enemies.push(test);    
 	        }
 	    };	 
 	    return enemies;   
    }
    
    function findPath(start,end,isHeroTeam) {
        var g = isHeroTeam? game.heroObstructionGrid:game.obstructionGrid;
        // hack to find path to buildings
        try {
            g[end[1]][end[0]] = 0;
            g[start[1]][start[0]];
       //alert(end.y)
        } catch (err){
            return [{x:start[0],y:start[1]},{x:end[0],y:end[1]}];
        }
        
        var path = AStar(g,start,end,'Euclidean'); 
        shortenPath(path,g);
        if (path.length>1 && game.debugMode){
            for(k=0;k<path.length;k++){
                //game.highlightGrid(path[k].x,path[k].y,1,1,'rgba(100,100,100,0.3)');
                context.beginPath();
                context.fillStyle='rgba(150,50,100,0.5)';
                context.arc((path[k].x+0.5)*game.gridSize+game.viewportAdjustX,(path[k].y+0.5)*game.gridSize+game.viewportAdjustY,5,0,2*Math.PI);
                context.fill();
            }                        
        }
        return path;
    }
    

    var fog = {
        fogCanvas : document.createElement('canvas'),
        isOver:function(x,y){
            var currentMap = game.currentLevel.mapImage;    
            
            var pixel = this.fogContext.getImageData(x*this.canvasWidth/currentMap.width,y*this.canvasHeight/currentMap.height,1,1).data;
            //alert("fog "+x+","+y+" "+pixel[0]+" "+pixel[1]+" "+pixel[2]+" "+pixel[3]);
            return (pixel[3] == 255);
        },
        canvasWidth:128,
        canvasHeight:128,
        init: function(){
            this.fogContext = this.fogCanvas.getContext('2d'),
            this.fogContext.fillStyle = 'rgba(0,0,0,1)';
    	    this.fogContext.fillRect(0,0,this.canvasWidth,this.canvasHeight);
    	
        },
        draw:function(){
            var fogCanvas = this.fogCanvas;
            var fogContext = this.fogContext;
            var currentMap = game.currentLevel.mapImage;
    	    fogContext.save();
            
    	    fogContext.scale(this.canvasWidth/currentMap.width,this.canvasHeight/currentMap.height);
    	
    	    fogContext.fillStyle = 'rgba(200,200,200,1)';
    	    
    	    for (var i = game.units.length - 1; i >= 0; i--){
    	        var unit = game.units[i];
    	        if (unit.team == game.currentLevel.team || unit.bulletFiring){
    	            fogContext.beginPath();    
    	            fogContext.globalCompositeOperation = "destination-out";
    	            fogContext.arc((Math.floor(unit.x)+0.5)*game.gridSize,(Math.floor(unit.y)+0.5)*game.gridSize,
    	            //fogContext.arc(((unit.x)+0.5)*game.gridSize,((unit.y)+0.5)*game.gridSize,
    	            (unit.sight+0.5)*game.gridSize,0,2*Math.PI,false);
                    //fogContext.globalAlpha = 0.2;
                    fogContext.fill()
                }
    	    };
    	    for (var i = game.buildings.length - 1; i >= 0; i--){
    	        
    	        var build = game.buildings[i];

    	        if (build.team == game.currentLevel.team){
    	            fogContext.beginPath();
        	        fogContext.globalCompositeOperation = "destination-out";
    	            fogContext.arc(
    	                (Math.floor(build.x))*game.gridSize + build.pixelWidth/2,
    	                (Math.floor(build.y))*game.gridSize +build.pixelHeight/2,
    	            build.sight*game.gridSize,0,2*Math.PI,false);               
        	        fogContext.fill()
    	        }   
    	    };
    	    
    	    for (var i = game.turrets.length - 1; i >= 0; i--){
    	        
    	        var turret = game.turrets[i];

    	        if (turret.team == game.currentLevel.team || turret.bulletFiring){
    	            fogContext.beginPath();
        	        fogContext.globalCompositeOperation = "destination-out";
    	            fogContext.arc(
    	                (Math.floor(turret.x))*game.gridSize + turret.pixelWidth/2,
    	                (Math.floor(turret.y))*game.gridSize +turret.pixelHeight/2,
    	            turret.sight*game.gridSize,0,2*Math.PI,false);               
        	        fogContext.fill()
    	        }   
    	    };
    	    
    	    fogContext.restore();
    	    context.drawImage(this.fogCanvas,0+game.viewportX*this.canvasWidth/currentMap.width,0+game.viewportY*this.canvasHeight/currentMap.height,
    	        game.viewportWidth*this.canvasWidth/currentMap.width,game.viewportHeight*this.canvasHeight/currentMap.height,
    	        game.viewportLeft,game.viewportTop,game.viewportWidth,game.viewportHeight)
    	}
            
    }
        
    var spriteCanvas = document.createElement('canvas');
    var spriteContext = spriteCanvas.getContext('2d');
	
	function angleDiff(angle1,angle2,base){
	    angle1 = Math.floor(angle1);
	    angle2 = Math.floor(angle2)
        if (angle1>=base/2){
            angle1 = angle1-base;
        }
        if (angle2>=base/2){
            angle2 = angle2-base
        }
        diff = angle2-angle1; 
        if (diff<-base/2){
            diff += base;
        }
        if (diff>base/2){
            diff -= base;
        }
	    return diff;
	}	
	
	function addAngle(angle,increment,base){
	    angle = Math.round(angle)+increment;
	    if (angle>base-1){
	        angle -= base;
	    }
	    if (angle<0){
	        angle+=base;
	    }
	    return angle;
	}
	function findAngle(object,unit,base){
	    if(!base){
	        base = 32;
	    }
	    
	    if(!unit){
	        unit = this;
	    }
	    
	    var dy = object.y - unit.y;
        var dx = object.x - unit.x;
        if (unit.type == 'turret'){
            dy = dy - 0.5;
            dx = dx - 0.5;
        }
        var angle = base/2+Math.round(Math.atan2(dx,dy)*base/(2*Math.PI));
        
        if (angle<0){
            angle += base;
        }
        if (angle>=base){
            angle -= base;
        }
        return angle;
	}
	

	function shortenPath (path,grid) {
	    //alert(1);
	    //return;
	    var nextCellVisible = true;
	    var start = path[0];
	    //alert(0)
	    while(nextCellVisible && path.length>2){
	        //alert(0.5)
	        var next = path[2];
	        if(Math.abs(next.y-start.y) > Math.abs(next.x-start.x)){
	            //along y

	            var slope = (next.x-start.x)/(next.y-start.y);
	            var deltaY = 0.4 * (next.y-start.y)/Math.abs((next.y-start.y));
	            var y = deltaY;
	            var test = {x:start.x+y*slope,y:start.y+y}
	            while (nextCellVisible && Math.abs(test.y - next.y) >0.3){
	                //alert(test.y)

                    if(grid[Math.floor(test.y)][Math.floor(test.x)]>0){
                        nextCellVisible = false;
                    }
                    y += deltaY;
                    test = {x:start.x+y*slope,y:start.y+y};
	            }
	            //nextCellVisible = false;
	        } else {
	            //alert(2);
	            var slope =(next.y-start.y)/(next.x-start.x);
	            var deltaX = 0.4 * (next.x-start.x)/Math.abs(next.x-start.x) ;
	            var x = deltaX;
	            var test = {x:start.x+x,y:start.y+slope*x}
	            while (nextCellVisible && Math.abs(test.x - next.x) >= 0.3){
                    if(grid[Math.floor(test.y)][Math.floor(test.x)]>0){
                        nextCellVisible = false;
                    }
                    x += deltaX;
                    test = {x:start.x+x,y:start.y+slope*x};
	            }
	            //along x
	            //nextCellVisible = false;
	        }
	        if (nextCellVisible){
	            path.splice(1,1);

	            //alert(path.length)
	        }
	    }
	    
	    

        
        
        
        
	}
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
	
	Array.prototype.remove = function(e) {
        var t, _ref;
        if ((t = this.indexOf(e)) > -1) {
            return ([].splice.apply(this, [t, t - t + 1].concat(_ref = [])), _ref);
        }
    };
    
    
	// begin the game
    game.start();
    $('#debugger').toggle();
    
    $('#debug_mode').bind('change',function() {
        game.debugMode = !game.debugMode;
        $('#debugger').toggle();
    });
});
