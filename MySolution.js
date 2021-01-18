{
    init: function(elevators, floors) {
        var num = 0;
        var upQueue = [];
        var downQueue = [];
        var maxfloor = floors.length - 1;


        function sortNumber(a, b) {
            return a - b;
        }

        function getUpDestFloor(UpQ,DownQ,RequestedFloors)
        {
            var ans = 0;
            var n1 = Math.max.apply(Math, DownQ);
            var n2 = Math.max.apply(Math, UpQ);
            var n3 = Math.max.apply(Math, RequestedFloors);  
            if (n1 > 1000) {n1=0;}
            if (n1 > 1000) {n2=0;}    
            if (n1 > 1000) {n3=0;}                 
            ans = Math.max(n1, n2, n3,0);   
            return ans;
        }

        function getDownDestFloor(UpQ,DownQ,RequestedFloors,maxf)
        {
            var ans = 0;
            var n1 = Math.min.apply(Math, DownQ);
            var n2 = Math.min.apply(Math, UpQ);
            var n3 = Math.min.apply(Math, RequestedFloors);                  
            ans = Math.min(n1,n2,n3,maxf);   
            return ans;
        }       


        const indicateElevatorGoingUp = function(elevator) {
            elevator.goingUpIndicator(true);
            elevator.goingDownIndicator(false);
        };

        const indicateElevatorGoingDown = function(elevator) {
            elevator.goingUpIndicator(false);
            elevator.goingDownIndicator(true);
        };

        _.each(elevators, function(elevator) {
            var mydest = 0;
            var i = 0;
            elevator.num = num++;
            indicateElevatorGoingUp(elevator);
            var mydirection = "Up";
            var newFloor = 0;

            elevator.on("passing_floor", function(floorNum, direction) 
                {
                console.log("Elevator", elevator.num, "passing ", floorNum, "destination", elevator.destinationQueue, "going ", direction, "Pressed floors", elevator.getPressedFloors(),"upQueue",upQueue, "downQueue",downQueue, "loadfactor", elevator.loadFactor());
                if (elevator.getPressedFloors().indexOf(floorNum) >= 0) 
                {
                    elevator.goToFloor(floorNum, true);
					if (direction === "up")
						{
						i = upQueue.indexOf(floorNum);
						if (i >= 0) upQueue.splice(i, 1);	
						}

					if (direction === "down")
						{
						i = downQueue.indexOf(floorNum);
						if (i >= 0) downQueue.splice(i, 1);	
						}					
                    console.log("Elevator", elevator.num, "in elevator button pressed here floor",floorNum,"destination queue is",elevator.destinationQueue);
                }
                else if (direction === "up" && upQueue.indexOf(floorNum) >= 0 && elevator.loadFactor() < 0.75) 
                {
                    elevator.goToFloor(floorNum, true);
					if (direction === "up")
						{
						i = upQueue.indexOf(floorNum);
						if (i >= 0) upQueue.splice(i, 1);	
						}					
					
                    console.log("Overriding - Elevator", elevator.num, "in passing UP func floor",floorNum,"Q is",elevator.destinationQueue);
                }           
                else if (direction === "down" && downQueue.indexOf(floorNum) >= 0 && elevator.loadFactor() < 0.75) 
                {
                    elevator.goToFloor(floorNum, true);
					
					if (direction === "down")
						{
						i = downQueue.indexOf(floorNum);
						if (i >= 0) downQueue.splice(i, 1);	
						}	
					
                    console.log("Overriding - Elevator", elevator.num, "in passing DOWN func floor",floorNum,"Q is",elevator.destinationQueue); 
                }
                else 
                {
                    if (direction === 'up')
                    {
                        newFloor = getUpDestFloor(upQueue,downQueue,elevator.getPressedFloors());
                        console.log("*****UP newFloor is ",newFloor, "currentFloor is",floorNum, "destq is ",elevator.destinationQueue);
                        if (newFloor < floorNum)
                        {
                            direction = 'down';
                            console.log("Elevator", elevator.num, "in passing func floor ", floorNum, "swithcing from UP to DOWN, new dest is", newFloor);
                        }                        
                    }
                    else if (direction === 'down')
                    {  
                        newFloor = getDownDestFloor(upQueue,downQueue,elevator.getPressedFloors(),maxfloor); 
                        console.log("*****DOWN newFloor is ",newFloor, "currentFloor is",floorNum,"destq is ",elevator.destinationQueue,"people pressing down at floors",downQueue);
                        if (newFloor > floorNum)
                        {
                            direction = 'up';
                            console.log("Elevator", elevator.num, "in passing func floor ", floorNum, "swithcing from DOWN to UP, new dest is", newFloor);
                        }
                    }

                    elevator.destinationQueue = []; 
                    elevator.goToFloor(newFloor, true); 
                    console.log("Elevator", elevator.num, "CLEARQ2 at floor ", floorNum, "new destion",newFloor,"destq is ",elevator.destinationQueue);    
                }
            });


            elevator.on("idle", function() {
                elevator.goToFloor(elevator.currentFloor()); //hack
                console.log("Elev #", elevator.num, "is idle at floor", elevator.currentFloor(), "dirn", mydirection, "PPL pressed UP @ floors", upQueue,"PPL pressed DOWN @ floors", downQueue, "Elev buttons", elevator.getPressedFloors(), "dest is", elevator.destinationQueue, "maxfloor",maxfloor);
                if (elevator.currentFloor() === 0) {
                    indicateElevatorGoingUp(elevator);
                    mydirection = "Up";
                    i = upQueue.indexOf(0);
                    if (i >= 0) 
                    {
                        console.log("Splicing 0 at floor 0, i value is ",i,"before splice upqueue is ",upQueue);
                        upQueue.splice(i, 1);
                    }
                    mydest = getUpDestFloor(upQueue,downQueue,elevator.getPressedFloors());
                    elevator.goToFloor(mydest);
                    console.log("Elev #", elevator.num, "Loop 1, floor", elevator.currentFloor(), "dirn", mydirection, "--UP ppl waiting", upQueue, "Elev buttons", elevator.getPressedFloors(), "dest is", elevator.destinationQueue, );
                                } 
                                else if (elevator.currentFloor() < maxfloor && mydirection === "Up") 
                    {
                        console.log("Starting 2nd loop elevator ", elevator.num, "floor", elevator.currentFloor(), "direction ", mydirection, "Elev queue is ", upQueue, "Pressed floors", elevator.getPressedFloors());
                        i = upQueue.indexOf(elevator.currentFloor());
                        if (i >= 0) 
                        {
                            console.log("Splicing at UP floor",elevator.currentFloor(), "i value is ",i,"before splice upqueue is ",upQueue);
                            upQueue.splice(i, 1);
                        }

                        mydest = getUpDestFloor(upQueue,downQueue,elevator.getPressedFloors());
                        console.log("loop 2 mydest was ",mydest);
                        if (mydest <= elevator.currentFloor()) 
                        {
                            mydirection = "Down"; 
                            indicateElevatorGoingDown(elevator);
                            mydest = elevator.currentFloor();
                            i = downQueue.indexOf(mydest);
                            if (i >= 0) downQueue.splice(i, 1);
                            console.log("Switching direction..... at & going to floor",elevator.currentFloor(),"destinations are",elevator.destinationQueue);
                        }
                        elevator.destinationQueue = [];
                        elevator.goToFloor(mydest,true);
                        console.log("Elev #", elevator.num, "Loop 2, floor", elevator.currentFloor(), "dirn", mydirection, "UP ppl waiting", upQueue, "Elev buttons", elevator.getPressedFloors(), "dest is", elevator.destinationQueue, );
                                    } 
                                    else if (elevator.currentFloor() <= maxfloor && mydirection === "Down") 
                        {
                            i = downQueue.indexOf(elevator.currentFloor());
                            if (i >= 0) 
                            {
                                console.log("Splicing at DOWN floor",elevator.currentFloor(), "i value is ",i,"before splice downqueue is ",downQueue);
                                downQueue.splice(i, 1);
                            }

                            mydest = getDownDestFloor(upQueue,downQueue,elevator.getPressedFloors(),maxfloor);
                            if (mydest > elevator.currentFloor()) 
                            {
                                mydirection = "Up"; 
                                indicateElevatorGoingUp(elevator);
                                console.log("$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$");
                            }
                            elevator.destinationQueue = [];
                            elevator.goToFloor(mydest,true);

                            console.log("Elev #", elevator.num, "Loop 3, floor", elevator.currentFloor(), "dirn", mydirection, "DOWN ppl waiting", downQueue, "Elev buttons", elevator.getPressedFloors(), "dest is", elevator.destinationQueue, );
                                        } 
                                        else if (elevator.currentFloor() === maxfloor) 
                            {
                                mydirection = "Down";
                                indicateElevatorGoingDown(elevator);
                                i = downQueue.indexOf(maxfloor);
                                if (i >= 0) 
                                {
                                    console.log("Splicing at MAX floor",elevator.currentFloor(), "i value is ",i,"before splice downqueue is ",downQueue);	
                                    downQueue.splice(i, 1);
                                }

                                mydest = getDownDestFloor(upQueue,downQueue,elevator.getPressedFloors(),maxfloor);
                                console.log("Minimum mydest found", mydest);
                                elevator.goToFloor(mydest);
                                console.log("Elev #", elevator.num, "Loop 4 MAX floor", elevator.currentFloor(), "dirn", mydirection, "DOWN ppl waiting @ floors", downQueue, "Elev buttons", elevator.getPressedFloors(), "dest is", elevator.destinationQueue, );
                                            }

                                            else {console.log("Missed all idle loops! Direction",mydirection,"upQueue",upQueue,"downQueue",downQueue,"floor", elevator.currentFloor());}


                        });

                    });


                    floors.forEach(function(floor) {
                        var d = new Date();

                        // If a floor button is pressed, relevant queue is added to. Q's are sorted.
                        floor.on("up_button_pressed", function() {
                            if (upQueue.indexOf(floor.floorNum()) === -1) {
                                upQueue.push(floor.floorNum());
                                upQueue.sort(sortNumber);
                            }
                            console.log("Up button pressed floor ", floor.floorNum(), "up queue is ", upQueue);
                        });

                        floor.on("down_button_pressed", function() {

                            if (downQueue.indexOf(floor.floorNum()) === -1) {
                                downQueue.push(floor.floorNum());
                                downQueue.sort(sortNumber);
                            }
                            console.log("Down button pressed floor ", floor.floorNum(), "down queue is ", downQueue);
                        });
                    });


                },
                    update: function(dt, elevators, floors) {
                        // We normally don't need to do anything here
                    }
            }
