var maxLen = Math.sqrt(2);
var height = document.getElementById("triangleCanvas").height - 10;
document.getElementById("triangleCanvas").width = document.getElementById("triangleCanvas").height + 100;
var width = document.getElementById("triangleCanvas").height;
var numZeroDistCollisions = 0;

//Holds all of the lines being created.
var lines = [];

document.getElementById("btn-submit").addEventListener("click",
function() {
    if (document.getElementById("safeCheck").value != "unSafe") {
        //Resets the lines to be holding nothing
        lines = [];

        //Create initial shape and add to the lines list.
        createShape(3);

        var height = document.getElementById("safeCheck").value;
        var constant = 1 - height;
        var xPos = lines[1].endx-(1-height)/Math.sqrt(3);
        var yPos = lines[1].endy - constant;
        startWithLine(xPos,yPos,0);
    }}
);
//0.5 - (1-height)/Math.sqrt(3) == x
//1 - constant == y
//altitude = 1
//h = #

function polarLine(x1, y1, ang) {
    var line = {startx: x1, starty:y1, endx: 0, endy: 0, length: maxLen, angle: ang};
    //y = R sin t and x = R cos t
    line.endx = line.length*Math.cos(line.angle * (Math.PI / 180)) + line.startx;
    line.endy = line.length*Math.sin(line.angle * (Math.PI / 180)) + line.starty;
    return line;
}

function setPolarLine(x1,y1,len,ang) {
    var line = {startx: x1, starty: y1, length: len, angle: ang, endx: 0, endy: 0};
    line.endx = Math.cos(ang * (Math.PI / 180))*len+x1;
    line.endy = Math.sin(ang* (Math.PI / 180))*len+y1;
    return line;
}

function updateLine(line,x2,y2) {
    line.endx = x2;
    line.endy = y2;
    line.length = getDistance(line.startx,line.starty,x2,y2);
}

function getDistance(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x1-x2,2) + Math.pow(y1-y2,2));
}

function startWithLine(x1,y1,ang) {
    //Create the start line and add it to the lines list
    var startLine = polarLine(x1,y1,ang);
    var currentLine = startLine;

    //TODO: Replace with grabbing the value of lines to be created.
    var numLines = document.getElementById("f-iterations").value;

    //Create the number of lines requested
    for (var i = 1; i < numLines; i++) {
        var distance = maxLen;
        var collissionPoint = null;
        var collissionLine = null;
        for (var j = 0; j < lines.length; j++) {
            var intersect = findIntersection(currentLine,lines[j]);
            if (intersect != null) {
                distToIntersect = getDistance(currentLine.startx,currentLine.starty,intersect.x2,intersect.y2);
                if (distToIntersect > 0.000001 && distance > distToIntersect) {
                    distance = distToIntersect;
                    collissionPoint = intersect;
                    collissionLine = lines[j];
                }
            }
        }
        //console.log("Line #" + i + " has: " + numZeroDistCollisions);
        console.log(currentLine);
        if (collissionPoint == null || numZeroDistCollisions >= 3) {
            numLines = i;
        } else {
            updateLine(currentLine,collissionPoint.x2,collissionPoint.y2);
            lines.push(currentLine);
            var newLine = createCollissionLine(collissionPoint.x2, collissionPoint.y2,currentLine,collissionLine);
            currentLine = newLine;
        }
        numZeroDistCollisions = 0;
    }
    drawShape();
}

function createCollissionLine(x1,y1,currLine,collLine) {
    var newAngle = 2*collLine.angle - currLine.angle;
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
    var c = document.getElementById("triangleCanvas");
    var ctx = c.getContext("2d");
    ctx.clearRect(0,0,c.width,c.height);
    ctx.beginPath();
    ctx.moveTo(50 + lines[0].startx*width,height - (height*lines[0].starty));
    for (var i = 0; i < 3; i++) {
        ctx.lineTo(50 + lines[i].endx*width,height - (height*lines[i].endy));
    }
    ctx.strokeStyle = document.getElementById("f-border-color").value;
    ctx.stroke();
    ctx.closePath();

    ctx.beginPath();
    ctx.moveTo(50 + lines[3].startx*width, height - (height*lines[3].starty));
    for (var i = 3; i < lines.length; i++) {
        ctx.lineTo(50 + lines[i].endx*width,height - (height*lines[i].endy));
    }
    ctx.strokeStyle = document.getElementById("f-line-color").value;
    ctx.stroke();
    ctx.closePath();
}
//0,0 == 0,500
//1,1 == 500,0
//500*x     ,   500 - 500*y

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

        if (getDistance(line1.startx,line1.starty,xIntersect,yIntersect) < 0.000001) {
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
        console.log(xIntersect + "," + yIntersect);
        console.log(line1);
        console.log(line2);
        //Check if the X part of the intersection is within the bounds of line2.
        if ((line2.angle == 90 || line2.angle == 270) || 
            (signX*(line2.startx+xDiff2) >= signX*xIntersect 
                && signX*(line2.endx-xDiff2) <= signX*xIntersect)) {

            //Check if the Y part of the intersection is within the bounds of line2.
            if ((line2.angle == 0 || line2.angle == 180) || 
                (signY*(line2.starty+yDiff2) >= signY*yIntersect && 
                    signY*(line2.endy-yDiff2) <= signY*yIntersect)) {

                //Check if the intersection occurs above the start point if the angle is <= 180 degrees
                if (Math.sin(line1.angle*(Math.PI/180)) >= 0 && yIntersect + 0.000001 >= line1.starty) {

                    //Checks if the intersection occurs in the positive x direction if angle is <= 90 OR >= 270 degrees.
                    if (Math.cos(line1.angle*(Math.PI/180)) >= 0 && xIntersect >= line1.startx) {
                        //Return the coordinates of the valid intersection
                        var endpoints = {x2: xIntersect, y2: yIntersect};
                        return endpoints;
                    //Checks if the intersection occurs in the negative x direction if the 90 < angle < 270 degrees.
                    } else if (Math.cos(line1.angle*(Math.PI/180)) < 0 && xIntersect <= line1.startx) {
                        //Return the coordinates of the valid intersection
                        var endpoints = {x2: xIntersect, y2: yIntersect};
                        return endpoints;
                    }
                //Check if the intersection occurs below the start point if the angle is > 180 degrees
                } else if (Math.sin(line1.angle*(Math.PI/180)) < 0 && yIntersect <= line1.starty) {
                    //Checks if the intersection occurs in the positive x direction if angle is <= 90 OR >= 270 degrees.
                    if (Math.cos(line1.angle*(Math.PI/180)) >= 0 && xIntersect >= line1.startx) {
                        //Return the coordinates of the valid intersection
                        var endpoints = {x2: xIntersect, y2: yIntersect};
                        return endpoints;
                    //Checks if the intersection occurs in the negative x direction if the 90 < angle < 270 degrees.
                    } else if (Math.cos(line1.angle*(Math.PI/180)) < 0 && xIntersect <= line1.startx) {
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

function createShape(n_gon) {
    var degreesPerAngle = 0;
    if (n_gon <= 3) {
        n_gon = 3;
        degreesPerAngle = ((n_gon-2)*180)/n_gon + n_gon/10000000;
    } else {
        degreesPerAngle = ((n_gon-2)*180)/n_gon;
    }

    var sum = 0;
    for (var i = 1; i <= ((n_gon)/2); i++) {
        sum += Math.abs(Math.sin(((180-degreesPerAngle)*i)* (Math.PI / 180)));
    }

    sum = 1/sum;

    degreesPerAngle = 180 - degreesPerAngle;
    var baseLine = setPolarLine(0.5-sum/2,0,sum,0);
    lines.push(baseLine);
    for (var i = 0; i < n_gon-1; i++) {
        var temp = setPolarLine(lines[i].endx,lines[i].endy,sum,(i+1)*degreesPerAngle);
        lines.push(temp);
    }
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

createShape(3);
drawShape();