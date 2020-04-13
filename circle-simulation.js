var maxLen = 1;
var height = document.getElementById("circleCanvas").height - 10;
document.getElementById("circleCanvas").width = document.getElementById("circleCanvas").height + 100;
var width = document.getElementById("circleCanvas").height;
var numZeroDistCollisions = 0;
var roundValue = 1000000000;

//Holds all of the lines being created.
var lines = [];

document.getElementById("xCord").addEventListener("change",
function() {
        var x = Number(document.getElementById("xCord").value);
        var y = Number(document.getElementById("yCord").value) == 0.5 ? 0.499999 : Number(document.getElementById("yCord").value);
        if (x != null && x > 0 && x < 1 && y != null && y > 0 && y < 1) {
            lines = [];
            startWithLine(x,y,0);
          }
    }
);

document.getElementById("yCord").addEventListener("change",
function() {
    var x = Number(document.getElementById("xCord").value);
    var y = Number(document.getElementById("yCord").value) == 0.5 ? 0.499999 : Number(document.getElementById("yCord").value);
        if (x != null && x > 0 && x < 1 && y != null && y > 0 && y < 1) {
            lines = [];
            startWithLine(x,y,0);
        }
    }
);


document.getElementById("btn-submit").addEventListener("click",
function() {
        var x = Number(document.getElementById("xCord").value);
        
        var y = Number(document.getElementById("yCord").value) == 0.5 ? 0.499999 : Number(document.getElementById("yCord").value);
        
        if (x != null && x > 0 && x < 1 && y != null && y > 0 && y < 1) {
            lines = [];
            startWithLine(x,y,0);
        } else {
            alert("Please enter values between 0 and 1 for both coordinates");
        }
    }
);

function polarLine(x1, y1, ang) {

    //y = R sin t and x = R cos t
    var endPtX = (maxLen*Math.cos(ang * (Math.PI / 180)) + x1);
    var endPtY = (maxLen*Math.sin(ang * (Math.PI / 180)) + y1);
    var line = {startx: x1, starty:y1, endx: endPtX, endy: endPtY, length: maxLen, angle: ang};
    line = roundLine(line);
    return line;
}

function setPolarLine(x1,y1,len,ang) {
    var line = {startx: x1, starty: y1, length: len, angle: ang, endx: 0, endy: 0};
    line.endx = Math.cos(ang * (Math.PI / 180))*len+x1;
    line.endy = Math.sin(ang* (Math.PI / 180))*len+y1;
    line = roundLine(line);
    return line;
}

function updateLine(line,x2,y2) {
    line.endx = x2;
    line.endy = y2;
    line.length = getDistance(line.startx,line.starty,x2,y2);
    line = roundLine(line);
}

function getDistance(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x1-x2,2) + Math.pow(y1-y2,2));
}

function roundNum(val) {
    val = Math.round((val + Number.EPSILON)*roundValue)/roundValue;
    return val;
}

function roundLine(lineToRound) {
    lineToRound.startx = Math.round((lineToRound.startx + Number.EPSILON)*roundValue)/roundValue;
    lineToRound.endx = Math.round((lineToRound.endx + Number.EPSILON)*roundValue)/roundValue;
    lineToRound.starty = Math.round((lineToRound.starty + Number.EPSILON)*roundValue)/roundValue;
    lineToRound.endy = Math.round((lineToRound.endy + Number.EPSILON)*roundValue)/roundValue;
    lineToRound.length = Math.round((lineToRound.length + Number.EPSILON)*roundValue)/roundValue;
    lineToRound.angle = Math.round((lineToRound.angle + Number.EPSILON)*roundValue)/roundValue;
    return lineToRound;
}

function startWithLine(x1,y1,ang) {
    //Create the start line and add it to the lines list
    var startLine = polarLine(x1,y1,ang);
    var currentLine = startLine;

    //TODO: Replace with grabbing the value of lines to be created.
    var numLines = document.getElementById("f-iterations").value;

    //Create the number of lines requested
    for (var i = 0; i < numLines; i++) {
        var distance = maxLen;
        var collissionPoint = null;
        var collissionLine = null;

        for (var j = 0; j < lines.length; j++) {
            var intersect = findIntersection(currentLine,lines[j]);
            if (intersect != null) {
                distToIntersect = getDistance(currentLine.startx,currentLine.starty,intersect.x2,intersect.y2);
                if (distToIntersect > 0.000000001 && distance > distToIntersect) {
                    distance = distToIntersect;
                    collissionPoint = intersect;
                    collissionLine = lines[j];
                }
            }
        }
        
        
        /*
        if (numZeroDistCollisions >= 3) {
            numLines = i;
        } else {
            */
            //Check if collission is outside circle. If so, hit circle edge instead
            if (collissionPoint == null || collissionPoint == undefined || 
                getDistance(0.5,0.5,collissionPoint.x2,collissionPoint.y2) >= 1) {
                var m = Math.tan(currentLine.angle*Math.PI/180);
                var b = currentLine.starty - m*currentLine.startx;
                
                //Quadratic formula variables
                var aQuad = 1 + Math.pow(m,2);
                var bQuad = 2*m*b - m - 1;
                var cQuad = Math.pow(b,2)-b+0.25;

                //Calculate the plus and minus results of the quadratic formula
                var xPlus = (-bQuad + Math.sqrt(Math.pow(bQuad,2) - 4*aQuad*cQuad))/(2*aQuad);
                var xMinus = (-bQuad - Math.sqrt(Math.pow(bQuad,2) - 4*aQuad*cQuad))/(2*aQuad);
                
                //Set the true intersections to null (for now)
                var xInt = null;
                var yInt = null;
                
                //Keep the unrounded values around
                var xMinusUnrounded = xMinus;
                var xPlusUnrounded = xPlus;

                //Round the values before testing them.
                xMinus = roundNum(xMinus);
                xPlus = roundNum(xPlus);

                //Set the current x-intersection value
                //If true, x-intersect has to be greater than or equal to current x
                if (currentLine.angle >= 270 || currentLine.angle <= 90) {
                    xInt = xPlus > currentLine.startx ? xPlusUnrounded : xMinusUnrounded;
                } else {
                    xInt = xPlus < currentLine.startx ? xPlusUnrounded : xMinusUnrounded;
                }
                

                //Set the current y-intersection value
                var yPlus = 0.5 + Math.sqrt(0.25-Math.pow(xInt-0.5,2));
                var yMinus = 0.5 - Math.sqrt(0.25-Math.pow(xInt-0.5,2));

                var yPlusUnrounded = yPlus;
                var yMinusUnrounded = yMinus;

                //Round the number to 9 decimal places
                yPlus =  roundNum(yPlus);
                yMinus = roundNum(yMinus);
                
                //Set the current y-intersection value
                //If true, the y-intersect has to be greater than or equal to current y
                if (currentLine.angle == 0 || currentLine.angle == 180) {
                    yInt = yPlus == currentLine.starty ? yPlusUnrounded : yMinusUnrounded;
                }
                else if (currentLine.angle < 180) {
                    yInt = yPlus > currentLine.starty ? yPlusUnrounded : yMinusUnrounded;
                } else {
                    yInt = yPlus < currentLine.starty ? yPlusUnrounded : yMinusUnrounded;
                }

                //Now calculate the reflection off of the edge of the circle
                var radiansNeg = -(xInt-0.5)/(yInt-0.5);

                //Round the number to 9 decimal places
                xInt = roundNum(xInt);
                yInt = roundNum(yInt);
                console.log("Coordinate: " + xInt + "," + yInt+ "\nRadians  = " + radiansNeg+"\nAngle of edge reflection = " + (radiansNeg*180/Math.PI));
					if (radiansNeg == null || radiansNeg == undefined) {
						radiansNeg = Math.PI/2;
                    }
                    updateLine(currentLine,xInt,yInt);
                    lines.push(currentLine);
                    var collLine = polarLine(xInt,yInt,radiansNeg*180/Math.PI);
                    var newLine = createCollissionLine(xInt, yInt,currentLine,collLine);
                    currentLine = newLine;

            } else {
                if (collissionLine == null) {
                    numLines = i;
                } else {
                    //Elsewise do normal collission
                    updateLine(currentLine,collissionPoint.x2,collissionPoint.y2);
                    lines.push(currentLine);
                    var newLine = createCollissionLine(collissionPoint.x2, collissionPoint.y2,currentLine,collissionLine);
                    currentLine = newLine;
                }
            }
        //}
        numZeroDistCollisions = 0;
    }
    drawShape();
}

function createCollissionLine(x1,y1,currLine,collLine) {
    var newAngle = 2*collLine.angle - currLine.angle;
    console.log(newAngle);
    while (newAngle < 0) {
        newAngle += 360;
    }
    while (newAngle >= 360) {
        newAngle -= 360;
    }
    var newLine = polarLine(x1,y1,newAngle);
    return newLine;
}

function drawShape() {
    var c = document.getElementById("circleCanvas");
    var ctx = c.getContext("2d");
    ctx.clearRect(0,0,c.width,c.height);
    ctx.beginPath();
    ctx.arc(50+width/2, (height)/2, (width)/2, 0, 2 * Math.PI);
    ctx.strokeStyle = document.getElementById("f-border-color").value;
    ctx.stroke();
    ctx.closePath();

    ctx.beginPath();
    ctx.moveTo(50 + lines[0].startx*width, height - (height*lines[0].starty));
    for (var i = 0; i < lines.length; i++) {
        ctx.lineTo(50 + lines[i].endx*width,height - (height*lines[i].endy));
    }
    ctx.strokeStyle = document.getElementById("f-line-color").value;
    ctx.stroke();
    ctx.closePath();
}

/**
 * Checks to see if there is an intersection between 2 lines within the bounds of line 2.
 * @param {*} line1 The line BEING reflected. (The "moving" line)
 * @param {*} line2 The line DOING the reflecting. (The "stationary" line)
 */
function findIntersection(line1, line2) {
    var xDiff1 = getXDiff(line1);
    var yDiff1 = getYDiff(line1);
    var xDiff2 = getXDiff(line2);
    var yDiff2 = getYDiff(line2);

    //Calculate the determinant of the line
    var det = -(yDiff1*xDiff2-xDiff1*yDiff2);
    //Calculate the x determinant
    var detx = getC(line1)*xDiff2 - xDiff1*getC(line2);
    //Calculate the y determinant
    var dety = yDiff1*getC(line2) - getC(line1)*yDiff2;

    //y = R sin t and x = R cos t

    //If the determinant is not 0 then the lines intersect
    if (det != 0) {
        //Calculates the x coordinate of the intersection between the lines
        var xIntersect = detx/det;
        //Calculates the y coordinate of the intersection between the lines
        var yIntersect = dety/det;

        if (getDistance(line1.startx,line1.starty,xIntersect,yIntersect) < 0.000000001) {
            numZeroDistCollisions++;
        }
        yDiff2 = line2.endy - line2.starty;
        //Grabs the sign of the x-intersection point. 
        //If 0 then it's positive for intersection checking
        var signX = Math.sign(xDiff2);
        if (signX == 0) {
            signX = 1;
        }
        //Grabs the sign of the y-intersection point. 
        //If 0 then it's positive for intersection checking
        var signY = Math.sign(yDiff2);
        if (signY === 0) {
            signY = 1;
        }
        //Check if the X part of the intersection is within the bounds of line2.
        if ((line2.angle == 90 || line2.angle == 270) || 
            (signX*(line2.startx+xDiff2) >= signX*xIntersect 
                && signX*(line2.endx-xDiff2) <= signX*xIntersect)) {
            //Check if the Y part of the intersection is within the bounds of line2.
            if ((line2.angle == 0 || line2.angle == 180) || 
                (signY*(line2.starty+yDiff2) >= signY*yIntersect && 
                    signY*(line2.endy-yDiff2) <= signY*yIntersect)) {
                //Check if the intersection occurs above the start point if the angle is <= 180 degrees
                if (Math.sin(line1.angle*(Math.PI/180)) >= 0 && yIntersect + 0.000000001 >= line1.starty) {
                    //Checks if the intersection occurs in the positive x direction if angle is <= 90 OR >= 270 degrees.
                    if (Math.cos(line1.angle*(Math.PI/180)) >= 0 && xIntersect + 0.000000001 >= line1.startx) {
                        //Return the coordinates of the valid intersection
                        var endpoints = {x2: xIntersect, y2: yIntersect};
                        return endpoints;
                    //Checks if the intersection occurs in the negative x direction if the 90 < angle < 270 degrees.
                    } else if (Math.cos(line1.angle*(Math.PI/180)) < 0 && xIntersect - 0.000000001 <= line1.startx) {
                        //Return the coordinates of the valid intersection
                        var endpoints = {x2: xIntersect, y2: yIntersect};
                        return endpoints;
                    }
                //Check if the intersection occurs below the start point if the angle is > 180 degrees
                } else if (Math.sin(line1.angle*(Math.PI/180)) < 0 && yIntersect - 0.000000001 <= line1.starty) {
                    //Checks if the intersection occurs in the positive x direction if angle is <= 90 OR >= 270 degrees.
                    if (Math.cos(line1.angle*(Math.PI/180)) >= 0 && xIntersect + 0.000000001 >= line1.startx) {
                        //Return the coordinates of the valid intersection
                        var endpoints = {x2: xIntersect, y2: yIntersect};
                        return endpoints;
                    //Checks if the intersection occurs in the negative x direction if the 90 < angle < 270 degrees.
                    } else if (Math.cos(line1.angle*(Math.PI/180)) < 0 && xIntersect - 0.000000001 <= line1.startx) {
                        //Return the coordinates of the valid intersection
                        var endpoints = {x2: xIntersect, y2: yIntersect};
                        return endpoints;
                    }
                }
            }
        }
    }
    //If there is no valid intersection, then return null
    return null;
}

function getYDiff(line) {
    return line.starty - line.endy;
}

function getXDiff(line) {
    return line.endx - line.startx;
}

function getC(line) {
    return line.startx*line.endy - line.endx*line.starty;
}