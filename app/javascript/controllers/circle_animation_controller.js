import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = [ "path" ]
  static values = {
    size: { type: Number, default: 200 },
    radiusPercentage: { type: Number, default: 80 },
    points: { type: Number, default: 16 },
    rippleAmplitude: { type: Number, default: 8 },
    rippleFrequency: { type: Number, default: 0.5 }
  }

  connect() {
    this.centerX = this.sizeValue / 2;
    this.centerY = this.sizeValue / 2;
    this.baseRadius = (this.sizeValue / 2) * (this.radiusPercentageValue / 100.0);

    this.initializeCircle();
    // this.startRippleAnimation();
  }

  initializeCircle() {
    this.basePoints = this.generateCirclePoints();
    this.updatePath(this.basePoints);
  }

  generateCirclePoints() {
    const points = [];

    debugger

    // Calculate points and bezier handle positions for a perfect circle
    for (let i = 0; i < this.pointsValue; i++) {
      const angle = (i / this.pointsValue) * Math.PI * 2;
      const nextAngle = ((i + 1) / this.pointsValue) * Math.PI * 2;

      // Current point on the circle
      const x = this.centerX + Math.cos(angle) * this.baseRadius;
      const y = this.centerY + Math.sin(angle) * this.baseRadius;

      // Next point on the circle
      const nextX = this.centerX + Math.cos(nextAngle) * this.baseRadius;
      const nextY = this.centerY + Math.sin(nextAngle) * this.baseRadius;

      // Calculate control points for smooth circle
      // The magic number 0.551784 is to make bezier curves form a perfect circle
      const handleLength = this.baseRadius * 0.551784;

      // Control point 1 (from current point)
      const cp1x = x - handleLength * Math.sin(angle);
      const cp1y = y + handleLength * Math.cos(angle);

      // Control point 2 (to next point)
      const cp2x = nextX + handleLength * Math.sin(nextAngle);
      const cp2y = nextY - handleLength * Math.cos(nextAngle);

      points.push({
        point: { x, y },
        nextPoint: { x: nextX, y: nextY },
        controlPoint1: { x: cp1x, y: cp1y },
        controlPoint2: { x: cp2x, y: cp2y }
      });
    }

    return points;
  }

  startRippleAnimation() {
    let time = 0;

    const animate = () => {
      // Increment time
      time += 0.01;

      // Create a copy of base points to modify
      const rippledPoints = JSON.parse(JSON.stringify(this.basePoints));

      // Apply ripple effect to each point
      for (let i = 0; i < this.pointsValue; i++) {
        const point = rippledPoints[i];

        // Calculate ripple offsets based on sine waves
        // Use different frequencies and phases for more organic movement
        const angleOffset = (i / this.pointsValue) * Math.PI * 2;
        const rippleFactor1 = Math.sin(time * this.rippleFrequencyValue + angleOffset);
        const rippleFactor2 = Math.cos(time * this.rippleFrequencyValue * 0.7 + angleOffset * 1.3);

        // Combined ripple effect (mix of two waves)
        const ripple = (rippleFactor1 * 0.6 + rippleFactor2 * 0.4) * this.rippleAmplitudeValue;

        // Apply ripple to main point
        const angle = (i / this.pointsValue) * Math.PI * 2;
        point.point.x += ripple * Math.cos(angle);
        point.point.y += ripple * Math.sin(angle);

        // Apply smaller ripple to control points for smooth transitions
        const rippleControl = ripple * 0.7;
        point.controlPoint1.x += rippleControl * Math.cos(angle - 0.2);
        point.controlPoint1.y += rippleControl * Math.sin(angle - 0.2);
        point.controlPoint2.x += rippleControl * Math.cos(angle + 0.2);
        point.controlPoint2.y += rippleControl * Math.sin(angle + 0.2);
      }

      // Fix the nextPoint references (each point's nextPoint should be the next point's point)
      for (let i = 0; i < this.pointsValue; i++) {
        rippledPoints[i].nextPoint = rippledPoints[(i + 1) % this.pointsValue].point;
      }

      // Update the SVG path
      this.updatePath(rippledPoints);

      // Continue animation
      this.animationId = requestAnimationFrame(animate);
    };

    this.animationId = requestAnimationFrame(animate);
  }
 
  updatePath(points) {
    let pathData = `M ${points[0].point.x} ${points[0].point.y}`;

    // Add cubic bezier curves for each segment
    for (let i = 0; i < points.length; i++) {
      const p = points[i];
      pathData += ` C ${p.controlPoint1.x} ${p.controlPoint1.y}, ${p.controlPoint2.x} ${p.controlPoint2.y}, ${p.nextPoint.x} ${p.nextPoint.y}`;
    }

    // Update the path
    this.pathTarget.setAttribute("d", pathData);
  }

  disconnect() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }
}
