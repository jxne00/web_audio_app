/**
 * A class to create a knob that can be dragged to change its value
 * @param {number} posX - x-position of knob
 * @param {number} posY - y-position of knob
 * @param {number} radius - radius
 * @param {number} minVal - minimum value
 * @param {number} maxVal - maximum value
 * @param {number} value - initial value
 * @param {string} label - label to show above knob
 */
class Knob {
  constructor(posX, posY, radius, minVal, maxVal, value, label) {
    this.posX = posX;
    this.posY = posY;
    this.radius = radius;
    this.minVal = minVal;
    this.maxVal = maxVal;
    // constrain start value within min and max
    this.value = constrain(value, this.minVal, this.maxVal);
    this.label = label;

    this.angle = this.valueToAngle(this.value);
    this.dragging = false;
    this.offsetAngle = 0;
  }

  /** convert knob value to an angle relative to a circle */
  valueToAngle(value) {
    return map(value, this.minVal, this.maxVal, -PI, PI);
  }

  /** convert the angle back to a value */
  angleToValue(angle) {
    return map(angle, -PI, PI, this.minVal, this.maxVal);
  }

  /** get the knob's current value */
  getValue() {
    return this.value;
  }

  /** set the knob's value when dragged */
  mousePressed() {
    let mouseIsOnKnob = dist(mouseX, mouseY, this.posX, this.posY) < this.radius;
    if (!this.dragging && mouseIsOnKnob) {
      this.dragging = true;

      // calculate distance between mouse and knob center
      let dx = mouseX - this.posX;
      let dy = mouseY - this.posY;

      // calculate angle between mouse and knob center (reference point)
      this.offsetAngle = atan2(dy, dx) - this.angle;
    }
  }

  /** stop dragging when mouse is released */
  mouseReleased() {
    if (this.dragging) {
      this.dragging = false;
    }
  }

  isDragged() {
    return this.dragging;
  }

  /** draw the knob */
  draw() {
    push();
    if (this.dragging) {
      // update angle and value when dragged
      let dx = mouseX - this.posX;
      let dy = mouseY - this.posY;
      let mouseAngle = atan2(dy, dx);
      this.angle = constrain(mouseAngle - this.offsetAngle, -PI, PI);
      this.value = this.angleToValue(this.angle);
    }

    // draw knob circle
    fill(this.dragging ? 200 : 84, 82, 107);
    strokeWeight(1);
    stroke(183, 162, 219);
    translate(this.posX, this.posY);
    rotate(this.angle);
    circle(0, 0, this.radius * 2 + 8);

    strokeWeight(3);
    line(15, 0, this.radius + 3, 0);
    pop();

    // draw current knob value
    push();
    fill(196, 190, 235);
    textAlign(CENTER, CENTER);
    textSize(11);
    textFont('Courier');

    // show decimal if value is between 0.1 and 10
    let valueText =
      this.value < 10 && this.value > 0.1
        ? this.value.toFixed(1)
        : this.value.toFixed(0);

    text(valueText, this.posX, this.posY);
    pop();

    // draw label above knob
    push();
    fill(0);
    textSize(11);
    textLeading(13);
    noStroke();
    textAlign(CENTER, BOTTOM);
    text(this.label, this.posX, this.posY - this.radius - 10);
    pop();
  }
}
