
function randomIntFromInterval(min, max) { // min and max included 
    return Math.floor(Math.random() * (max - min + 1) + min)
}

var sparkInstances = 0; // ugh

var PointerShenanigansSparks = function(parentContainer, settings) {
    var self = this;

    self.parentContainer = parentContainer; // the element we are applying the animations too
    self.defaults = {
        frameDelay : 30,                    // essentially how fast the animation runs
        makeSparkOnClick : true,
        makeSparkOnMove : true,
        percentChangeOfSparkOnMove : 20,
        colours : [ 'white' ], //'red', 'blue', 'green', 'white'
    }
    self.settings = $.extend( {}, self.defaults, settings );

    self.sparkCounter = 0;
    self.sparkInstance = 0;

    self.createSpark = function(x , y) {
        // we're going to rotate it randomly - the options are from 0 to 1 where 1 = 1 full rotation
        let rotation = randomIntFromInterval(1,100) / 100;
        let colourIndex = randomIntFromInterval(0,self.settings.colours.length - 1);
        self.sparkCounter++;
        let newSparkCount = self.sparkCounter;
        let elementId = 'spark'+self.sparkInstance+"-"+newSparkCount;
        let newElement = $('<div>', {
            id : elementId,
            class: '',
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
        $(self.parentContainer).append(newElement);
        setTimeout(function() { self.animateSpark(elementId) }, self.settings.frameDelay );
    }
    

    self.animateSpark = function(elementId) {
        let currentFrame = $("#"+elementId).data("frame");
        let nextFrame = currentFrame+1;
        // if we've past the last frame then delete the element
        if(nextFrame >= 8) {
            $("#"+elementId).remove();
            return;
        }
        // our spark animation is on a sprite sheet, so we have to figure out which sprite on the sheet to
        // show. There are four columns and two rows.
        let x = 0, y = 0;   // the x and the y is where you are positioning the image in the background of the element
        if(nextFrame > 3) y = 25 * -1;      // lazy but true. If you're on the 4th frame it's the second row.
        x = ((nextFrame % 4)) * 25 * -1;    
        
        $("#"+elementId).data("frame", nextFrame); // we store the current frame in the html
        $("#"+elementId).css({ "background-position" : x+"px "+y+"px" })

        setTimeout(function() { self.animateSpark(elementId) }, self.settings.frameDelay );
    }

    self.initialize = function() 
    {
        console.log("start sparks")

        // I want to put unique ids on each spark, but what if there are multiple instances of sparks happening
        // man that sucks, our ids will clash. We're going to track each created instance
        // kelvin is going to fix this by not passing the id around
        if(!sparkInstances) {
            sparkInstances = 0;
        }
        sparkInstances = sparkInstances + 1;
        self.sparkInstance = sparkInstances;
        
        if(self.settings.makeSparkOnClick) {
            // we're going to make a spark on mouse click
            $(self.parentContainer).click(function(event) {
                self.createSpark(event.pageX,event.pageY);
            });
        }
        if(self.settings.makeSparkOnMove) {
            // we're going to make a spark on mouse move
            $(self.parentContainer).mousemove(function(event) {
                // we're only going to make the spark some of the time
                // get a random number and see if it is below our threshold
                let random = randomIntFromInterval(1,100);
                if(random <= self.settings.percentChangeOfSparkOnMove) {
                    self.createSpark(event.pageX,event.pageY);
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
            var distance = self.calculateDistanceBetweenPoints(self.mousePosition, self.lastCreationPosition);
            if(distance > self.settings.travelDistanceForNewIcon) {

                // <i class="fa-solid fa-bicycle"></i>
                if(self.settings.useFontAwesome) {
                    // if they're using one of the fontawesome icons
                    $(self.parentContainer).append($('<div>', {
                        class: 'shen-icon fa-solid fa-'+self.settings.icon,
                        css: {
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

    self.calculateDistanceBetweenPoints = function(p1, p2) {
        let x = p1.x - p2.x;
        let y = p1.y - p2.y;

        let hyp = Math.sqrt( x*x + y*y );
        return hyp;
    }

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
    } else {
        console.log("mate, I dunno what " + pointerType + " is.");
    }

};