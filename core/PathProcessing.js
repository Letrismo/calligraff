class PathProcessing {
  static process(points, settings = {}) {
    if (!Array.isArray(points) || points.length < 2) return points || [];

    let path = points.map(PathProcessing.copyPoint);
    const tolerance = Math.max(0, Number(settings.simplificationTolerance) || 0);

    if (tolerance > 0 && settings.simplificationAlgorithm === "douglas-peucker") {
      path = PathProcessing.douglasPeucker(path, tolerance);
    }

    if (tolerance > 0 && settings.simplificationAlgorithm === "visvalingam-whyatt") {
      path = PathProcessing.visvalingamWhyatt(path, tolerance * tolerance);
    }

    const iterations = Math.max(0, Math.round(Number(settings.curveSmoothing) || 0));
    const amount = Math.min(0.48, Math.max(0, Number(settings.smoothingAmount) || 0));

    for (let i = 0; i < iterations; i += 1) {
      path = PathProcessing.chaikin(path, amount);
    }

    return path;
  }

  static copyPoint(point) {
    const next = { x: point.x, y: point.y };

    if (Number.isFinite(point.pressure)) {
      next.pressure = Math.min(1, Math.max(0, point.pressure));
    }

    return next;
  }

  static chaikin(points, amount = 0.25) {
    if (points.length < 3 || amount <= 0) return points;

    const next = [PathProcessing.copyPoint(points[0])];

    for (let i = 0; i < points.length - 1; i += 1) {
      const a = points[i];
      const b = points[i + 1];
      next.push(PathProcessing.interpolatePoint(a, b, amount));
      next.push(PathProcessing.interpolatePoint(a, b, 1 - amount));
    }

    next.push(PathProcessing.copyPoint(points[points.length - 1]));
    return next;
  }

  static interpolatePoint(a, b, amount) {
    const next = {
      x: a.x + (b.x - a.x) * amount,
      y: a.y + (b.y - a.y) * amount
    };
    const pressureA = PathProcessing.pointPressure(a);
    const pressureB = PathProcessing.pointPressure(b);

    next.pressure = pressureA + (pressureB - pressureA) * amount;
    return next;
  }

  static pointPressure(point) {
    return Number.isFinite(point.pressure) ? Math.min(1, Math.max(0, point.pressure)) : 0.5;
  }

  static douglasPeucker(points, epsilon) {
    if (points.length <= 2) return points;

    let maxDistance = 0;
    let splitIndex = 0;
    const first = points[0];
    const last = points[points.length - 1];

    for (let i = 1; i < points.length - 1; i += 1) {
      const distance = PathProcessing.perpendicularDistance(points[i], first, last);

      if (distance > maxDistance) {
        maxDistance = distance;
        splitIndex = i;
      }
    }

    if (maxDistance <= epsilon) return [first, last];

    const left = PathProcessing.douglasPeucker(points.slice(0, splitIndex + 1), epsilon);
    const right = PathProcessing.douglasPeucker(points.slice(splitIndex), epsilon);
    return left.slice(0, -1).concat(right);
  }

  static perpendicularDistance(point, lineStart, lineEnd) {
    const dx = lineEnd.x - lineStart.x;
    const dy = lineEnd.y - lineStart.y;
    const length = Math.hypot(dx, dy);

    if (length === 0) {
      return Math.hypot(point.x - lineStart.x, point.y - lineStart.y);
    }

    return Math.abs(dy * point.x - dx * point.y + lineEnd.x * lineStart.y - lineEnd.y * lineStart.x) / length;
  }

  static visvalingamWhyatt(points, minArea) {
    if (points.length <= 2) return points;

    const remaining = points.map(PathProcessing.copyPoint);

    // Fleischmann describes Visvalingam-Whyatt as repeatedly removing the point
    // whose neighboring triangle is smaller than the area tolerance.
    while (remaining.length > 2) {
      let smallestArea = Infinity;
      let smallestIndex = -1;

      for (let i = 1; i < remaining.length - 1; i += 1) {
        const area = PathProcessing.triangleArea(remaining[i - 1], remaining[i], remaining[i + 1]);

        if (area < smallestArea) {
          smallestArea = area;
          smallestIndex = i;
        }
      }

      if (smallestArea >= minArea || smallestIndex < 0) break;
      remaining.splice(smallestIndex, 1);
    }

    return remaining;
  }

  static triangleArea(a, b, c) {
    return Math.abs((a.x * (b.y - c.y) + b.x * (c.y - a.y) + c.x * (a.y - b.y)) / 2);
  }
}
