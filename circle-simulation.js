/**************** settings & top level fields ********************/
const circleCanvas = document.getElementById("circleCanvas")
const height =  circleCanvas.height - 10;
const width = circleCanvas.height;
circleCanvas.width = circleCanvas.height + 100;
const maxLen = 1;
let numZeroDistCollisions = 0;
const roundValue = 1000000000;
let lines = []; // Holds all of the lines being created.



/*********************** helper tools ***************************/
const getYDiff = line => line.starty - line.endy;
const getXDiff = line => line.startx - line.endx;
const getC = line => line.startx * line.endy - line.endx * line.starty;
const getDistance = (x1, y1, x2, y2) =>
    Math.sqrt(Math.pow(x1-x2,2) + Math.pow(y1-y2,2));
const roundNum = val =>
    Math.round((val + Number.EPSILON) * roundValue) / roundValue;
const roundLine = line => {
    Object.keys(line).map(field => line[field] = roundNum(line[field]));
    return line;
}



/******************* interaction with webpage *******************/
const resetCords = () => {
    const yCord = Number(document.getElementById("yCord").value)
    const y = yCord == 0.5 ? 0.499999 : yCord;
    const x = Number(document.getElementById("xCord").value);
    const valid = n => n != null && 0 <= n && n <= 1;
    if (valid(x) && valid(y)) {
        lines = [];
        startWithLine(x, y, 0);
    }
}

document.getElementById("xCord").addEventListener("change", resetCords);
document.getElementById("yCord").addEventListener("change", resetCords);
document.getElementById("btn-submit").addEventListener("click", resetCords);

const drawShape = () => {
    const c = document.getElementById("circleCanvas");
    const ctx = c.getContext("2d");
    const circleColor = document.getElementById("f-border-color").value;
    const lineColor = document.getElementById("f-line-color").value;

    ctx.clearRect(0, 0, c.width, c.height);

    // draw the circle
    ctx.beginPath();
    ctx.arc(50+width/2, (height)/2, (width)/2, 0, 2 * Math.PI);
    ctx.strokeStyle = circleColor;
    ctx.stroke();
    ctx.closePath();

    // draw the lines
    ctx.beginPath();
    ctx.moveTo(50 + lines[0].startx*width, height - (height*lines[0].starty));
    lines.forEach(line =>
        ctx.lineTo(50 + line.endx*width, height - (height*line.endy))
    );
    ctx.strokeStyle = lineColor;
    ctx.stroke();
    ctx.closePath();
}



/*********************** math stuff *****************************/
//y = R sin t and x = R cos t
const polarLine = (x1, y1, ang) => roundLine({
    startx: x1,
    starty: y1,
    endx: maxLen * Math.cos(ang * (Math.PI / 180)) + x1,
    endy: maxLen * Math.sin(ang * (Math.PI / 180)) + y1,
    length: maxLen,
    angle: ang
});

const setPolarLine = (x1, y1, len, ang) => roundLine({
    startx: x1,
    starty: y1,
    endx: Math.cos(ang * (Math.PI / 180)) * len + x1,
    endy: Math.sin(ang * (Math.PI / 180)) * len + y1,
    length: len,
    angle: ang
});

const updateLine = (line, x2, y2) => {
    line.endx = x2;
    line.endy = y2;
    line.length = getDistance(line.startx, line.starty, x2, y2);
    line = roundLine(line);
}

const createCollissionLine = (x1, y1, currLine, collLine) => {
    let newAngle = 2 * collLine.angle - currLine.angle;
    console.log(newAngle);
    while (newAngle < 0)        newAngle += 360;
    while (newAngle >= 360)     newAngle -= 360;
    return polarLine(x1, y1, newAngle);
}

const startWithLine = (x1, y1, ang) => {
    //Create the start line and add it to the lines list
    let startLine = polarLine(x1, y1, ang);
    let currentLine = startLine;

    //TODO: Replace with grabbing the value of lines to be created.
    const numLines = document.getElementById("f-iterations").value;

    //Create the number of lines requested
    for (let i = 0; i < numLines; i++) {
        let distance = maxLen;
        let collissionPoint = null;
        let collissionLine = null;

        // Check for intersections
        for (let j = 0; j < lines.length; j++) {
            let intersect = findIntersection(currentLine,lines[j]);
            if (intersect != null) {
                distToIntersect = getDistance(currentLine.startx,currentLine.starty,intersect.x2,intersect.y2);
                if (distToIntersect > 0.000000001 && distance > distToIntersect) {
                    distance = distToIntersect;
                    collissionPoint = intersect;
                    collissionLine = lines[j];
                }
            }
        }


        //Check if collission is outside circle. If so, hit circle edge instead
        if (collissionPoint == null || collissionPoint == undefined || 
            getDistance(0.5,0.5,collissionPoint.x2,collissionPoint.y2) >= 1) {
            let m = Math.tan(currentLine.angle * Math.PI/180);
            let b = currentLine.starty - m * currentLine.startx;

            //Quadratic formula letiables
            let aQuad = 1 + Math.pow(m,2);
            let bQuad = 2 * m * b - m - 1;
            let cQuad = Math.pow(b,2)-b+0.25;

            //Calculate the plus and minus results of the quadratic formula
            let xPlus = (-bQuad + Math.sqrt(Math.pow(bQuad,2) - 4 * aQuad * cQuad))/(2 * aQuad);
            let xMinus = (-bQuad - Math.sqrt(Math.pow(bQuad,2) - 4 * aQuad * cQuad))/(2 * aQuad);

            //Set the true intersections to null (for now)
            let xInt = null;
            let yInt = null;

            //Keep the unrounded values around
            let xMinusUnrounded = xMinus;
            let xPlusUnrounded = xPlus;

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
            let yPlus = 0.5 + Math.sqrt(0.25-Math.pow(xInt-0.5,2));
            let yMinus = 0.5 - Math.sqrt(0.25-Math.pow(xInt-0.5,2));

            let yPlusUnrounded = yPlus;
            let yMinusUnrounded = yMinus;

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
            let radiansNeg = -(xInt - 0.5) / (yInt - 0.5);

            //Round the number to 9 decimal places
            xInt = roundNum(xInt);
            yInt = roundNum(yInt);
            console.log(`Coordinate: ${xInt}, ${yInt}
                         Radians = ${radiansNeg}
                         Angle of edge reflection = ${(radiansNeg * 180 / Math.PI)}`
            );
            if (radiansNeg == null || radiansNeg == undefined) {
                radiansNeg = Math.PI / 2;
            }
            updateLine(currentLine, xInt, yInt);
            lines.push(currentLine);
            let collLine = polarLine(xInt, yInt, radiansNeg * 180 / Math.PI);
            let newLine = createCollissionLine(xInt, yInt, currentLine, collLine);
            currentLine = newLine;

        } else {
            if (collissionLine == null) {
                numLines = i;
                return
            }
            //Elsewise do normal collission
            updateLine(currentLine,collissionPoint.x2,collissionPoint.y2);
            lines.push(currentLine);
            let newLine = createCollissionLine(collissionPoint.x2, collissionPoint.y2,currentLine,collissionLine);
            currentLine = newLine;
        }
    }
    numZeroDistCollisions = 0;
    drawShape();
}


/**
 * Checks to see if there is an intersection between 2 lines within the bounds of line 2.
 * @param {*} movingLine The line BEING reflected.
 * @param {*} staticLine The line DOING the reflecting.
 */
const findIntersection = (movingLine, staticLine) => {
    let xDiffM = getXDiff(movingLine);
    let yDiffM = getYDiff(movingLine);
    let xDiffS = getXDiff(staticLine);
    let yDiffS = getYDiff(staticLine);

    let det = -(yDiffM * xDiffS - xDiffM * yDiffS); // line determinant
    let detx = getC(movingLine) * xDiffS - xDiffM * getC(staticLine); // x determinant
    let dety = yDiffM * getC(staticLine) - getC(movingLine) * yDiffS; // y determinant

    // y = R sin t and x = R cos t
    if (det == 0) return null;

    // If the determinant is not 0 then the lines intersect
    // Calculates coordinates of the intersection between the lines
    let xIntersect = detx / det;
    let yIntersect = dety / det;

    if (getDistance(movingLine.startx, movingLine.starty, xIntersect, yIntersect) < 0.000000001) {
        numZeroDistCollisions++;
    }
    yDiffS = staticLine.endy - staticLine.starty;


    // Grabs the signs of the intersection point. 
    // If 0 then it's positive for intersection checking
    let signX = Math.sign(xDiffS);
    let signY = Math.sign(yDiffS);
    if (signX == 0) signX = 1;
    if (signY === 0) signY = 1;


    // If intersection outside bounds of staticLine, ignore
    if (!   ((staticLine.angle == 90 || staticLine.angle == 270)
        || (signX * (staticLine.startx + xDiffS) >= signX * xIntersect 
        && signX * (staticLine.endx - xDiffS) <= signX * xIntersect)))
        return;
    if (!   ((staticLine.angle == 0 || staticLine.angle == 180)
        ||  (signY * (staticLine.starty + yDiffS) >= signY * yIntersect
        && signY * (staticLine.endy - yDiffS) <= signY * yIntersect)))
        return;


    // Check if the intersection occurs above the start point if the angle is <= 180 degrees
    if (Math.sin(movingLine.angle*(Math.PI/180)) >= 0 && yIntersect + 0.000000001 >= movingLine.starty) {
        //Checks if the intersection occurs in the positive x direction if angle is <= 90 OR >= 270 degrees.
        if (Math.cos(movingLine.angle*(Math.PI/180)) >= 0 && xIntersect + 0.000000001 >= movingLine.startx) {
            //Return the coordinates of the valid intersection
            return {x2: xIntersect, y2: yIntersect};
            //Checks if the intersection occurs in the negative x direction if the 90 < angle < 270 degrees.
        } else if (Math.cos(movingLine.angle*(Math.PI/180)) < 0 && xIntersect - 0.000000001 <= movingLine.startx) {
            //Return the coordinates of the valid intersection
            return {x2: xIntersect, y2: yIntersect};
        }
        //Check if the intersection occurs below the start point if the angle is > 180 degrees
    } else if (Math.sin(movingLine.angle*(Math.PI/180)) < 0 && yIntersect - 0.000000001 <= movingLine.starty) {
        //Checks if the intersection occurs in the positive x direction if angle is <= 90 OR >= 270 degrees.
        if (Math.cos(movingLine.angle*(Math.PI/180)) >= 0 && xIntersect + 0.000000001 >= movingLine.startx) {
            //Return the coordinates of the valid intersection
            return {x2: xIntersect, y2: yIntersect};
            //Checks if the intersection occurs in the negative x direction if the 90 < angle < 270 degrees.
        } else if (Math.cos(movingLine.angle*(Math.PI/180)) < 0 && xIntersect - 0.000000001 <= movingLine.startx) {
            //Return the coordinates of the valid intersection
            return {x2: xIntersect, y2: yIntersect};
        }
    }
}

