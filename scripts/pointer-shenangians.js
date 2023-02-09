
function randomIntFromInterval(min, max) { // min and max included 
    return Math.floor(Math.random() * (max - min + 1) + min)
}
function calculateDistanceBetweenPoints(p1, p2) {
    let x = p1.x - p2.x;
    let y = p1.y - p2.y;

    let hyp = Math.sqrt( x*x + y*y );
    return hyp;
}

function getAngle(targetA, sourceA) {
    var a = targetA - sourceA;
    a += (a > 180) ? -360 : (a < -180) ? 360 : 0;
    return a;
}
function angle(cx, cy, ex, ey) {
    var dy = ey - cy;
    var dx = ex - cx;
    var theta = Math.atan2(dy, dx); // range (-PI, PI]
    theta *= 180 / Math.PI; // rads to degs, range (-180, 180]
    //if (theta < 0) theta = 360 + theta; // range [0, 360)
    return theta;
}

var PointerShenanigansFlyingImage = function(parentContainer, settings) {
    var self = this;

    // we want to know how many instances of this have been created so we can generate unique ids/classes
    if (typeof flyingImageCounter === 'undefined' || flyingImageCounter === null) {
        flyingImageCounter = 0;
    }
    flyingImageCounter+=1;
    self.instanceIndex = flyingImageCounter;
    self.elementId = 'flying-image-'+self.instanceIndex;

    self.parentContainer = parentContainer; // the element we are applying the animations too
    self.defaults = {
        image: '',                                  // the image that does the flying
        plane: 3,                                   // the default plane to use; there are three!
        containingElement: "body",                  // the element we are going to put our new elements in
        animationDelay: 100,                        // how long we wait before redoing our animation loop
    }
    self.settings = $.extend( {}, self.defaults, settings );
    self.mousePosition = { x: null, y: null };          // the x,y of the mouseposition
    self.delay = 50;

    // plane settings
    self.currentAngle = 0;
    self.currentSpeed = 50;
    self.turnIteration = 5;
    self.currentLocation = { x: 100, y: 900 };

    self.addImageToPage = function() {

        // this is an attempt to start the image in the top left of the parent container
        var x = self.currentLocation.x;// $(self.parentContainer).offset().left;
        var y = self.currentLocation.y;// $(self.parentContainer).offset().top;

        let imagePath = self.settings.image || 'images/plane'+ self.settings.plane +'.png';


        $(self.settings.containingElement).append($('<img/>', {
            class: 'flying-image',
            id: self.elementId,
            src: imagePath,
            alt: 'image that flies around',
            css: {
                "position" : "absolute",
                "top": y,
                "left": x
            }
        }));
    };

    self.getCurrentTargetXY = function() {
        return self.mousePosition;
    }

    // this method just updates the screen based on our plane's current values
    self.draw = function() {
        //console.log(self.currentAngle)

        $("#"+self.elementId).css({
            "transform": "rotate("+self.currentAngle+"deg)",
            "top": self.currentLocation.y,
            "left": self.currentLocation.x,
        });

        setTimeout(function () { self.draw(); }, self.delay);
    }
    self.draw();

    self.turn = function () {
        // workout the angle to our target
        var theTarget = self.getCurrentTargetXY();
        var angleToTarget = angle(self.currentLocation.x, self.currentLocation.y, theTarget.x, theTarget.y);

        //console.log("angle to target is " + angleToTarget + ", current angle is " + self.currentAngle);
        // if the angle to the target is not the same as our current angle then adjust the current angle
        if (angleToTarget != self.currentAngle) {
            // angleToTarget ranges from -180 to 180. 0 is to the right, -90 is straight up, 90 is straight down.
            var newAngle;
            // if the turn iteration is larger than difference in angles then just put us on the target angle
            if (self.turnIteration > Math.abs(angleToTarget - self.currentAngle)) { // Math.abs(lol)
                console.log("zapping to target angle");
                self.currentAngle = angleToTarget;
                return;
            }
            
            // this needs to take into account the direction we are facing and the direction to the target
            if (getAngle(angleToTarget, self.currentAngle) <= 0) {
                // turn counter clock wise
                newAngle = self.currentAngle - self.turnIteration;
                //console.log("going CCW");
                if (newAngle < -180) {
                    //console.log("angle past -180; flipping");
                    newAngle = (newAngle + 360);
                }
            } else {
                // turn clock wise
                newAngle = self.currentAngle + self.turnIteration;
                //console.log("going CW");
                if (newAngle > 180) {
                    //console.log("angle past 180; flipping");
                    newAngle = (newAngle - 360);
                }
            }

            self.currentAngle = newAngle;

        }
    };
    self.move = function() {
        // if we need to turn, do it before moving forwards
        self.turn();
        // move forwards in the direction we are facing
        var angleInRads = self.currentAngle * (Math.PI / 180);
        var distance = self.currentSpeed / 10; 
        // what is the adjacent (X)
        var adjacent = Math.cos(angleInRads) * distance;
        // what is the opposite (Y)
        var opposite = Math.sin(angleInRads) * distance;
        self.currentLocation.x = self.currentLocation.x + adjacent;
        self.currentLocation.y = self.currentLocation.y + opposite;
        setTimeout(function () { self.move(); }, self.delay);
    }
    self.move();

    self.initialize = function() {
        // we want to know where the mouse is so we can do stuff at that location
        $(self.parentContainer).mousemove(function(event) {
            self.mousePosition.x = event.pageX;
            self.mousePosition.y = event.pageY;
        });
        self.addImageToPage();
    };
    self.initialize();


}

var PointerShenanigansFollowingImage = function(parentContainer, settings) {
    var self = this;

    // we want to know how many instances of this have been created so we can generate unique ids/classes
    if (typeof followingImageCounter === 'undefined' || followingImageCounter === null) {
        followingImageCounter = 0;
    }
    followingImageCounter+=1;
    self.instanceIndex = followingImageCounter;
    self.elementId = 'following-image-'+self.instanceIndex;

    self.parentContainer = parentContainer; // the element we are applying the animations too
    self.defaults = {
        image: 'images/randysavage.png',                // the image that follows the cursor
        containingElement: "body",                  // the element we are going to put our new elements in
        animationDelay: 100,                        // how long we wait before redoing our animation loop
    }
    self.settings = $.extend( {}, self.defaults, settings );
    self.mousePosition = { x: null, y: null };          // the x,y of the mouseposition

    self.updateImagePositionLoop = function() {

        if(self.mousePosition.x && self.mousePosition.y){

            $("#"+self.elementId).css({
                "transform": "translate("+self.mousePosition.x+"px, "+self.mousePosition.y+"px)"
            });
        }
        setTimeout(self.updateImagePositionLoop, self.settings.animationDelay);
    }
    self.updateImagePositionLoop();

    self.addImageToPage = function() {

        // this is an attempt to start the image in the top left of the parent container
        var x = $(self.parentContainer).offset().left;
        var y = $(self.parentContainer).offset().top;

        $(self.settings.containingElement).append($('<img/>', {
            class: 'following-image',
            id: self.elementId,
            src: self.settings.image,
            alt: 'image the follows the cursor',
            css: {
                "position" : "absolute",
                "top": 0,
                "left": 0,
                "transition-duration": "1s",
                "transition-delay": "0s",
                "transition-timing-function": "linear",
                "transform": "translate("+ x+"px, "+ y+"px)"
            }
        }));
    };

    self.initialize = function() {
        // we want to know where the mouse is so we can potentially put text at that location
        $(self.parentContainer).mousemove(function(event) {
            self.mousePosition.x = event.pageX;
            self.mousePosition.y = event.pageY;
        });
        self.addImageToPage();
    };
    self.initialize();


}

var PointerShenanigansTextTrail = function(parentContainer, settings) {
    var self = this;

    // we want to know how many instances of this have been created so we can generate unique ids/classes
    if (typeof textTrailCounter === 'undefined' || textTrailCounter === null) {
        textTrailCounter = 0;
    }
    textTrailCounter+=1;
    self.instanceIndex = textTrailCounter;

    self.parentContainer = parentContainer; // the element we are applying the animations too
    self.defaults = {
        textToDisplay : "The 90s called, they want their cursor animations back.      ", // the text to output - just pad it with some spaces if you want a delay before it repeats
        makeLetterDelay : 50,                       // how often we should check to see if we should output a new letter
        travelDistanceForOutput : 15,               // the minimum gap from the last letter before we output another
        repeatText : true,                          // do we say the text over and over or just once
        fadeText : true,                            // fade the text from the page of leave it there forever (lol)
        animationDelay : 200,                       // controls how fast our animation loop runs
        opacityIncrement: 0.025,                    // how much opacity we take off at each animation loop when fading letters
        style: "",                                  // any thing put in there will just be dumped on the letter as style
        containingElement: "body"                   // the element we are going to put our new elements in
    }
    self.settings = $.extend( {}, self.defaults, settings );
    self.currentLetterIndex = 0;                        // the index of the letter we are displaying from the self.settings.textToDisplay
    self.mousePosition = { x: null, y: null };          // the x,y of the mouseposition
    self.lastCreationPosition = { x: null, y: null };   // the x,y of where we last output something
    self.completedTimes = 0;                            // tracks how many times we have output the entire text

    self.maybeOutputLetter = function() {
        if(self.mousePosition.x || self.mousePosition.y) {

            // how far have we moved since the last output; only output more if it is over a certain threshold
            var distance = calculateDistanceBetweenPoints(self.mousePosition, self.lastCreationPosition);
            if(distance > self.settings.travelDistanceForOutput) {
                // make a new letter please
                self.outputLetter(self.mousePosition.x, self.mousePosition.y);
                self.lastCreationPosition.x = self.mousePosition.x;
                self.lastCreationPosition.y = self.mousePosition.y;
            }
        }
        // if we have completed the text, and they don't want to show it again then just end
        if(!self.settings.repeatText && self.completedTimes > 0) {
            return;
        }
        setTimeout(self.maybeOutputLetter, self.settings.makeLetterDelay);
    }
    self.maybeOutputLetter();

    self.animationLoop = function() {
        // fade out the elements containing our text trails
        $(self.settings.containingElement).find(".text-trail-" + self.instanceIndex).each(function( index, element ) {
            let currentOpacity = $(element).css("opacity");
            currentOpacity -= self.settings.opacityIncrement;
            // if you can't see the element anymore then remove the element from the html
            if(currentOpacity <= 0) {
                $(this).remove();
            } else {
                $(element).css({
                    "opacity": currentOpacity
                });
            }
        });
        setTimeout(self.animationLoop, self.settings.animationDelay);
    }
    // only do the animation loop if we are fading the text
    if(self.settings.fadeText) {
        self.animationLoop();
    }

    self.outputLetter = function(x,y) {
        let letter = self.settings.textToDisplay.substring(self.currentLetterIndex,self.currentLetterIndex+1);
        self.currentLetterIndex+=1;
        if(self.currentLetterIndex>=self.settings.textToDisplay.length-1) {
            self.currentLetterIndex=0;
            self.completedTimes+=1;
        }
        if(!x || !y) return;
        let newElement = $('<div>', {
            class: 'text-trail-' + self.instanceIndex,
            text: letter,
            style : self.settings.style,
            css: {
                "top": y,
                "left": x,
                "position" : "absolute",
            }
        });
        $(self.settings.containingElement).append(newElement);
    };

    self.initialize = function() {
        // we want to know where the mouse is so we can potentially put text at that location
        $(self.parentContainer).mousemove(function(event) {
            self.mousePosition.x = event.pageX;
            self.mousePosition.y = event.pageY;
        });

    };
    self.initialize();


}

var PointerShenanigansCrapFireworks = function(parentContainer, settings) {
    var self = this;

    self.parentContainer = parentContainer; // the element we are applying the animations too
    self.defaults = {
        makeFireworksOnClick : true,
        makeFireworksOnMove : true,
        percentChanceOfFireworkOnMove : 10,
        widthDecrement : 2,
        fadeDelay : 50,
    }
    self.settings = $.extend( {}, self.defaults, settings );

    self.mousePosition = { x: null, y: null };
    self.lastRotation = 0;

    self.getNewRotation = function() {
        let newRotation = self.lastRotation + 0.025;
        if(newRotation >= 1)
            newRotation = 0;
        self.lastRotation = newRotation;
        return newRotation;
    }

    self.createFirework = function(x,y) {
        if(!x || !y) return;
        let newRotation = self.getNewRotation();
        let newElement = $('<div>', {
            class: 'shrinking-laser',
            css: {
                "top": y,
                "left": x,
                "width": '1px',
                "height": '50px',
                "position" : "absolute",
                "background-color": "blue",
                "transform-origin": "0 0",  // rotate from the top corner
                "transform": "rotate("+newRotation+"turn)",
                "pointer-events": "none",
                // "background-image" : "url('images/spark-sprites-" + self.settings.colours[colourIndex] + ".png')",
                // "background-position-x" : 0,
                // "background-position-y" : 0,
                // "transform": "rotate("+ rotation +"turn)"
            }
        });
        $(self.parentContainer).append(newElement);
    };

    self.creationLoop = function() {
        self.createFirework(self.mousePosition.x,self.mousePosition.y);
        setTimeout(function() {
            self.creationLoop();
        }, 20);
    };
    self.creationLoop();
    
    self.animate = function() {

            $(self.parentContainer).find(".shrinking-laser").each(function( index, element ) {

                let currentWidth = $(element).height();
                currentWidth -= self.settings.widthDecrement;
                // if you can't see the element anymore then remove the element from the html
                if(currentWidth <= 0) {
                    $(this).remove();
                } else {
                    $(element).height(currentWidth);
                }
            });
        
            setTimeout(function() {
                self.animate();
            }, self.settings.fadeDelay);
    };
    self.animate();

    self.initialize = function() 
    {
        
        if(self.settings.makeFireworksOnClick) {
            // we're going to make a spark on mouse click
            $(self.parentContainer).click(function(event) {
                self.createFirework(event.pageX,event.pageY);
            });
        }
        if(self.settings.makeFireworksOnMove) {
            // we're going to make a spark on mouse move
            $(self.parentContainer).mousemove(function(event) {
                //console.log(self.parentContainer)
                // we're only going to make the spark some of the time
                // get a random number and see if it is below our threshold
                // let random = randomIntFromInterval(1,100);
                // if(random <= self.settings.percentChanceOfFireworkOnMove) {
                //     self.createFirework(event.pageX,event.pageY);
                // }
                self.mousePosition.x = event.pageX;
                self.mousePosition.y = event.pageY;

                $('html').find('.shrinking-laser').each(function( index, element ) {
                    $(element).css({
                        "top": (event.pageY) + "px",
                        "left": (event.pageX) + "px",
                    })
                });
            });
        }
    }
    self.initialize();
};

var PointerShenanigansSparks = function(parentContainer, settings) {
    var self = this;

    self.parentContainer = parentContainer; // the element we are applying the animations too
    self.defaults = {
        frameDelay : 30,                    // essentially how fast the animation runs
        makeSparkOnClick : true,
        makeSparkOnMove : true,
        percentChangeOfSparkOnMove : 20,    // spelt this wrong and never noticed
        colours : [ 'white' ], //'red', 'blue', 'green', 'white',
        sparkSticksToMouse : false,
    }
    self.settings = $.extend( {}, self.defaults, settings );

    self.sparkHalf = 25 / 2; // how big is half our spark picture - so we can center things

    self.createSpark = function(x , y) {
        //console.log("creating a spark at "+x+","+y)
        // we're going to rotate it randomly - the options are from 0 to 1 where 1 = 1 full rotation
        let rotation = randomIntFromInterval(1,100) / 100;
        let colourIndex = randomIntFromInterval(0,self.settings.colours.length - 1);
        let newElement = $('<div>', {
            class: self.settings.sparkSticksToMouse ? 'sparky-move-me' : '',
            'data-frame': '0',
            css: {
                "top": y,
                "left": x,
                "width": '25px',
                "height": '25px',
                "position" : "absolute",
                // "background-color": "black",
                "background-image" : "url('images/spark-sprites-" + self.settings.colours[colourIndex] + ".png')",
                "background-position-x" : 0,
                "background-position-y" : 0,
                "transform": "rotate("+ rotation +"turn)"
            }
        });
        if(self.settings.sparkSticksToMouse) {
            // this is going to cause some awesome performance issues when there's a lot of sparks
            console.log("setting up mousemove for spark");

        }
        $(self.parentContainer).append(newElement);
        setTimeout(function() { self.animateSpark(newElement) }, self.settings.frameDelay );
    }
    

    self.animateSpark = function(element) {
        
        let currentFrame = $(element).data("frame");
        let nextFrame = currentFrame+1;
        // if we've past the last frame then delete the element
        if(nextFrame >= 8) {
            $(element).remove();
            return;
        }
        // our spark animation is on a sprite sheet, so we have to figure out which sprite on the sheet to
        // show. There are four columns and two rows.
        let x = 0, y = 0;   // the x and the y is where you are positioning the image in the background of the element
        if(nextFrame > 3) y = 25 * -1;      // lazy but true. If you're on the 4th frame it's the second row.
        x = ((nextFrame % 4)) * 25 * -1;    
        
        $(element).data("frame", nextFrame); // we store the current frame in the html
        $(element).css({ "background-position" : (x - self.sparkHalf)+"px "+(y - self.sparkHalf)+"px" })

        setTimeout(function() { self.animateSpark(element) }, self.settings.frameDelay );
    }

    self.initialize = function() 
    {
        
        if(self.settings.makeSparkOnClick) {
            // we're going to make a spark on mouse click
            $(self.parentContainer).click(function(event) {
                self.createSpark(event.pageX,event.pageY);
            });
        }
        if(self.settings.makeSparkOnMove) {
            // we're going to make a spark on mouse move
            $(self.parentContainer).mousemove(function(event) {
                //console.log(self.parentContainer)
                // we're only going to make the spark some of the time
                // get a random number and see if it is below our threshold
                let random = randomIntFromInterval(1,100);
                if(random <= self.settings.percentChangeOfSparkOnMove) {
                    self.createSpark(event.pageX,event.pageY);
                }

                if(self.settings.sparkSticksToMouse) {
                    $('html').find('.sparky-move-me').each(function( index, element ) {
                        $(element).css({
                            "top": (event.pageY - self.sparkHalf) + "px",
                            "left": (event.pageX - self.sparkHalf) + "px",
                        })
                    });
                }
            });
        }
    }
    self.initialize();
}


var PointerShenanigansIconTrail = function(parentContainer, settings) {
    var self = this;

    self.parentContainer = parentContainer; // the element we are applying the animations too

    self.defaults = {
        icon : "skull",                     // any icon free and solid icon from https://fontawesome.com/icons/shoe-prints?s=solid&f=classic
        iconColour : "black",               // a colour value that is valid for css e.g. 'red' or '#ff0000' etc
        opacityIncrement : 0.05,            // how much do we change the opacity by each time
        fadeIconEnabled : true,             // maybe keep the icons forever ... ?
        fadeDelay : 50,                     // the timeout value between changing the opacity / fading
        travelDistanceForNewIcon : 20,      // how much distance do we travel before making a new icon
        useFontAwesome : false,             // flag on whether to use icons from fontawesome or not
        makeIconDelay : 50,                 // how often do we check to see if we need a new icon
        iconScale: 1                        // uses css scaling to change image size 1 = no scaling, 0.5 = half size etc
    }

    self.settings = $.extend( {}, self.defaults, settings );

    self.mousePosition = { x: null, y: null };
    self.lastCreationPosition = { x: null, y: null };

    self.makeIcon = function() {
        if(self.mousePosition.x || self.mousePosition.y) {

            // how far have we moved since the last icon creations; only create another one if it is over a certain threshold
            var distance = calculateDistanceBetweenPoints(self.mousePosition, self.lastCreationPosition);
            if(distance > self.settings.travelDistanceForNewIcon) {

                // <i class="fa-solid fa-bicycle"></i>
                if(self.settings.useFontAwesome) {
                    // if they're using one of the fontawesome icons
                    $(self.parentContainer).append($('<div>', {
                        class: 'shen-icon fa-solid fa-'+self.settings.icon,
                        css: {
                            "position" : "absolute",
                            "top": self.mousePosition.y,
                            "left": self.mousePosition.x,
                            "color" : self.settings.iconColour,
                            "transform": "scale("+ self.settings.iconScale +")"
                        }
                    }));
                } else {
                    // if they've specified an image file to use
                    $(self.parentContainer).append($('<img/>', {
                        //class: 'horizontalloader-image-' + i,
                        class: 'shen-icon',
                        src: self.settings.icon,
                        alt: 'trail icon',
                        css: {
                            "position" : "absolute",
                            "top": self.mousePosition.y,
                            "left": self.mousePosition.x,
                            "transform": "scale("+ self.settings.iconScale +")"
                        }
                    }));
                }
                self.lastCreationPosition.x = self.mousePosition.x;
                self.lastCreationPosition.y = self.mousePosition.y;

            }
        }
        setTimeout(self.makeIcon, self.settings.makeIconDelay);
    }
    self.makeIcon();


    // does the animation required by the specific loader
    self.animate = function() {

        if(self.settings.fadeIconEnabled) {
            $(self.parentContainer).find(".shen-icon").each(function( index, element ) {
                // we're going to fade the icon, and we're going to do it ourselves rather than trusting jquery
                // because we're all about reinventing the wheel due to ***performance***
                let currentOpacity = $(element).css("opacity");
                currentOpacity -= self.settings.opacityIncrement;
                // if you can't see the element anymore then remove the element from the html
                if(currentOpacity <= 0) {
                    $(this).remove();
                } else {
                    $(element).css({
                        "opacity": currentOpacity
                    });
                }
            });
        
            setTimeout(function() {
                self.animate();
            }, self.settings.fadeDelay);
        }
    };
    self.animate();


    self.initialize = function() {
        // we want to know where the mouse is so we can potentially put images at that location
        $(self.parentContainer).mousemove(function(event) {
            self.mousePosition.x = event.pageX;
            self.mousePosition.y = event.pageY;
        });

    };
    self.initialize();
};

// wrapper to create as jquery function
$.fn.StartShenanigans = function(pointerType, settings) {

    if(pointerType === 'iconTrail') {
        new PointerShenanigansIconTrail($(this),settings);
    } else if (pointerType === 'sparks') {
        new PointerShenanigansSparks($(this),settings); 
    } else if (pointerType === 'crapFireworks') {
        new PointerShenanigansCrapFireworks($(this),settings);
    } else if (pointerType === 'textTrail') {
        new PointerShenanigansTextTrail($(this),settings);
    } else if (pointerType === 'followingImage') {
        new PointerShenanigansFollowingImage($(this),settings);
    } else if (pointerType === 'flyingImage') {
        new PointerShenanigansFlyingImage($(this),settings);
    } else {
        console.log("mate, I dunno what " + pointerType + " is.");
    }

};