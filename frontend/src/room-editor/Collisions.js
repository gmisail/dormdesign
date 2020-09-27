const Collisions = (function () {
  function pointInRect(point, bbox) {
    return (
      point.x >= bbox.p1.x &&
      point.x <= bbox.p2.x &&
      point.y >= bbox.p1.y &&
      point.y <= bbox.p2.y
    );
  }

  return {
    pointInRect: pointInRect,
  };
})();

export default Collisions;
