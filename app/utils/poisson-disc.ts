type Point = { x: number; y: number };

export class PoissonDisc {
  private _points: (Point | null)[] = [];
  private _activeList: Point[] = [];
  private _removedPoints: Point[] = [];

  public get cols() {
    if (!this._width) return 0;
    return Math.ceil(this._width / this.cellSize);
  }
  public get rows() {
    if (!this._height) return 0;
    return Math.ceil(this._height / this.cellSize);
  }

  public set radius(value: number) {
    this._radius = value;
    this._activeList = [];
    this._points = [];
  }
  public get points() {
    return this._points;
  }

  private get cellSize() {
    if (!this._radius) return 0;
    return this._radius / Math.sqrt(2);
  }

  constructor(
    private _width: number = 0,
    private _height: number = 0,
    private _radius: number = 0,
    private _maxAttemps = 30,
  ) {
    this.fillDisc();
  }

  public removeAtIndex(index: number): Point | undefined {
    if (index < 0 || index >= this._points.length) return;
    const point = this._points[index];
    if (!point) return;
    this._points[index] = null; // intentionally leave a gap
    this._removedPoints.push(point);
  }

  public removeByCoord(x: number, y: number): number {
    const index = this._gridIndex(x, y);
    this.removeAtIndex(index);
    return index;
  }

  public resize(width?: number, height?: number, radius?: number) {
    const w = width ?? this._width;
    const h = height ?? this._height;
    const r = radius ?? this._radius;
    const cs = r / Math.sqrt(2); // cell size

    if (this.cols == Math.ceil(w / cs) && this.rows == Math.ceil(h / cs)) {
      this._activeList = [];
      this._points = [];
      this.fillDisc();
    }

    this._width = w;
    this._height = h;
    this._radius = r;
  }

  public fillDisc(radius?: number, validatedRadius?: number): [number, Point][] {

    if (!this._radius || !this._width || !this._height) return [];
    const r = radius ?? this._radius;
    const result: [number, Point][] = [];

    if (this._points.length === 0) {
      const firstPoint = {
        x: Math.random() * this._width,
        y: Math.random() * this._height,
      };
      this._activeList.push(firstPoint);
    }

    for (const point of this._points) {
      if (point) {
        this._activeList.push(point);
      }
    }

    while (this._activeList.length > 0) {
      // Pick a random point from the active list
      const randomIndex = Math.floor(Math.random() * this._activeList.length);
      const point: Point = this._activeList[randomIndex]!;

      // Try to generate a valid point around it
      for (let attempt = 0; attempt < this._maxAttemps; attempt++) {
        const angle = Math.random() * 2 * Math.PI;
        const dist = r + Math.random() * r;
        const newX = point.x + dist * Math.cos(angle);
        const newY = point.y + dist * Math.sin(angle);
        const newPoint = { x: newX, y: newY };

        if (this._isValidPoint(newPoint, validatedRadius)) {
          const gridIndex = this._gridIndex(newPoint.x, newPoint.y);
          this._points[gridIndex] = newPoint;
          this._activeList.push(newPoint);
          result.push([gridIndex, newPoint]);
        }
      }
      this._activeList.splice(randomIndex, 1);
    }
    return result;
  }

  public perturb() { }

  public fillHole() : [number, Point][] {
    const result: [number, Point][] = [];
    while(this._removedPoints.length > 0) {
      const point = this._removedPoints.shift();
      if (!point) continue;
      for (let attempt = 0; attempt < this._maxAttemps; attempt++) {
        const angle = Math.random() * 2 * Math.PI;
        const dist = Math.random() * this._radius;
        const newX = point.x + dist * Math.cos(angle);
        const newY = point.y + dist * Math.sin(angle);
        const newPoint = { x: newX, y: newY };
        if (this._isValidPoint(newPoint)) {
          const gridIndex = this._gridIndex(newPoint.x, newPoint.y);
          this._points[gridIndex] = newPoint;
          result.push([gridIndex, newPoint]);
        }
      }
    }
    return result;
  }

  public next(): Point | null {
    if (!this._radius || !this._width || !this._height) {
      return null;
    }

    while (this._activeList.length > 0) {

      const randomIndex = Math.floor(Math.random() * this._activeList.length);
      const point: Point = this._activeList[randomIndex]!;

      // Try to generate a valid point around it
      for (let attempt = 0; attempt < this._maxAttemps; attempt++) {
        const angle = Math.random() * 2 * Math.PI;
        const dist = this._radius + Math.random() * this._radius;
        const newX = point.x + dist * Math.cos(angle);
        const newY = point.y + dist * Math.sin(angle);
        const newPoint = { x: newX, y: newY };
        return newPoint;
      }

      this._activeList.splice(randomIndex, 1);
    }
    return null;
  }

  private _gridIndex(x: number, y: number) {
    if (!this._width || !this._height || !this.cellSize) return -1;
    const gridX = Math.floor(x / this.cellSize);
    const gridY = Math.floor(y / this.cellSize);
    const gridWidth = Math.ceil(this._width / this.cellSize);
    return gridY * gridWidth + gridX;
  }

  private _isValidPoint(
    point: Point,
    validatedRadius: number = this._radius,
  ): boolean {

    if (!this._width || !this._height || !this._radius) return false;
    if (
      point.x < 0 ||
      point.x >= this._width ||
      point.y < 0 ||
      point.y >= this._height
    ) {
      return false;
    }

    // Get grid cell coordinates
    const col = Math.floor(point.x / this.cellSize);
    const row = Math.floor(point.y / this.cellSize);

    // Check neighboring cells (2-cell radius is sufficient)
    const searchRadius = 1;
    for (let i = -searchRadius; i <= searchRadius; i++) {
      for (let j = -searchRadius; j <= searchRadius; j++) {
        const checkCol = col + j;
        const checkRow = row + i;

        // Check if cell is within grid bounds
        if (
          checkCol >= 0 &&
          checkCol < this.cols &&
          checkRow >= 0 &&
          checkRow < this.rows
        ) {
          const index = checkRow * this.cols + checkCol;
          const neighbor = this._points[index];

          if (neighbor) {
            const dx = point.x - neighbor.x;
            const dy = point.y - neighbor.y;
            const distSquared = dx * dx + dy * dy;
            const minDistSquared = validatedRadius * validatedRadius;

            if (distSquared < minDistSquared) {
              return false;
            }
          }
        }
      }
    }

    return true;
  }

  private _reactivateNearbyPoint(point: Point): Point[] {
    const result: Point[] = [];
    const col = Math.floor(point.x / this.cellSize);
    const row = Math.floor(point.y / this.cellSize);

    const searchRadius = 3;
    for (let i = -searchRadius; i <= searchRadius; i++) {
      for (let j = -searchRadius; j <= searchRadius; j++) {
        const checkCol = col + j;
        const checkRow = row + i;

        if (
          checkCol >= 0 &&
          checkCol < this.cols &&
          checkRow >= 0 &&
          checkRow < this.rows
        ) {
          const index = checkRow * this.cols + checkCol;
          const neighbor = this._points[index];

          if (neighbor) {
            result.push(neighbor);
          }
        }
      }
    }
    return result;
  }
}
