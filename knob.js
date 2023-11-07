/** A class to create a knob */
class Knob {
  /**
   * @param {number} posX - x-position of knob
   * @param {number} posY - y-position of knob
   * @param {number} radius - radius
   * @param {number} minVal - minimum value
   * @param {number} maxVal - maximum value
   * @param {number} value - initial value
   * @param {string} label - label to show above knob
   */
  constructor(posX, posY, radius, minVal, maxVal, value, label) {
    this.posX = posX;
    this.posY = posY;
    this.radius = radius;
    this.minVal = minVal;
    this.maxVal = maxVal;
    this.value = constrain(value, this.minVal, this.maxVal);
    this.angle = this.valueToAngle(this.value);
    this.dragging = false;
    this.offsetAngle = 0;
    this.label = label;
  }

  // convert value to angle between -PI and PI
  valueToAngle(value) {
    return map(value, this.minVal, this.maxVal, -PI, PI);
  }

  // convert angle to value between minVal and maxVal
  angleToValue(angle) {
    return map(angle, -PI, PI, this.minVal, this.maxVal);
  }

  draw() {
    push();
    // update angle and value when dragged
    if (this.dragging) {
      let dx = mouseX - this.posX;
      let dy = mouseY - this.posY;
      let mouseAngle = atan2(dy, dx);
      this.angle = constrain(mouseAngle - this.offsetAngle, -PI, PI);
      this.value = this.angleToValue(this.angle);
    }

    // draw knob
    fill(this.dragging ? 175 : 255);
    strokeWeight(1);
    translate(this.posX, this.posY);
    rotate(this.angle);
    circle(0, 0, this.radius * 2);
    strokeWeight(3);
    line(15, 0, this.radius - 1, 0);
    pop();

    // draw knob value
    push();
    fill(40, 44, 239);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(10);

    let valueText =
      this.value < 10 && this.value > 0.1
        ? this.value.toFixed(1)
        : this.value.toFixed(0);

    text(valueText, this.posX, this.posY + 10);
    pop();

    // draw label above knob
    push();
    fill(0);
    noStroke();
    textSize(11);
    textFont('Verdana');
    textLeading(10);
    textAlign(CENTER, BOTTOM);
    text(this.label, this.posX, this.posY - this.radius - 10);
    pop();
  }

  getValue() {
    return this.value;
  }

  mousePressed() {
    // check that mouse is within knob radius
    if (dist(mouseX, mouseY, this.posX, this.posY) < this.radius) {
      this.dragging = true;
      let dx = mouseX - this.posX;
      let dy = mouseY - this.posY;
      this.offsetAngle = atan2(dy, dx) - this.angle;
    }
  }

  mouseReleased() {
    this.dragging = false;
  }
}
