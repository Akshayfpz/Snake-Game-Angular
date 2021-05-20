import { Component, OnInit,ChangeDetectorRef,AfterContentChecked, ChangeDetectionStrategy, ɵbypassSanitizationTrustResourceUrl } from '@angular/core';
import { CONTROLS, COLORS, GRID_SIZE } from './app.contants';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:keydown)': 'SnkHandleKeyboardEvents($event)'
  }
})
export class AppComponent implements OnInit,AfterContentChecked  {

  // Snk=> Prefix for this component

  private SnkInterval: number; // Sets Speed of the snake
  private SnkTempDirection: number; // Snakes Direction
  private SnkIsGameOver = false; // Boolean flag to check whether game over

  public SnkBoard = [];
  public SnkScore = 0;
  public SnkShowGameOver = false;
  public SnkGameStarted = false;
  public SnkNewScore = false;
  
  private snake = { // Initial Snake declaration
    direction: CONTROLS.LEFT,
    parts: [
      {
        x: -1,
        y: -1
      }
    ]
  };

  private fruit = { // Initial Fruit declaration
    x: -1,
    y: -1
  };

  constructor(
    private changeDetector:ChangeDetectorRef
  ) {}

  // On Initial page rendering
  ngOnInit(): void {
    this.SnkSetBoard(); // Setting the Grid Board 15*15
  }

  // On After Content Checked
  ngAfterContentChecked() : void {
    this.changeDetector.detectChanges();
  }

  // Setting the Board on UI
  SnkSetBoard(): void {
    this.SnkBoard = [];
    for (let i = 0; i < GRID_SIZE; i++) {
      this.SnkBoard[i] = [];
      for (let j = 0; j < GRID_SIZE; j++) {
        this.SnkBoard[i][j] = false;
      }
    }
  }

  // Creating a new Game
  SnkCreateNewGame(mode: string): void {
    this.SnkShowGameOver = false;
    this.SnkNewScore = false;
    this.SnkGameStarted = true;
    this.SnkScore = 0;
    this.SnkTempDirection = CONTROLS.LEFT;
    this.SnkIsGameOver = false;
    this.SnkInterval = 150;
    this.snake = {
      direction: CONTROLS.LEFT,
      parts: []
    };

    for (let i = 0; i < 3; i++) {
      this.snake.parts.push({ x: 8 + i, y: 8 });
    }
    this.SnkResetFruit(); // Reset Fruit
    this.SnkUpdatePositions(); // Update the Position
  }

  // Handles the Keyboard Events
  SnkHandleKeyboardEvents(e: KeyboardEvent) {
    if ((e.keyCode === CONTROLS.LEFT || e.keyCode === CONTROLS.KEY_A ) && this.snake.direction !== CONTROLS.RIGHT) { // Checks the Arrow left and keyboard 'A' key
      this.SnkTempDirection = CONTROLS.LEFT;
    } else if ((e.keyCode === CONTROLS.UP || e.keyCode === CONTROLS.KEY_W) && this.snake.direction !== CONTROLS.DOWN) { // Checks the Arrow up and keyboard 'W' key
      this.SnkTempDirection = CONTROLS.UP;
    } else if ((e.keyCode === CONTROLS.RIGHT || e.keyCode === CONTROLS.KEY_D) && this.snake.direction !== CONTROLS.LEFT) { // Checks the Arrow right and keyboard 'D' key
      this.SnkTempDirection = CONTROLS.RIGHT;
    } else if ((e.keyCode === CONTROLS.DOWN || e.keyCode === CONTROLS.KEY_S) && this.snake.direction !== CONTROLS.UP) { // Checks the Arrow down and keyboard 'S' key
      this.SnkTempDirection = CONTROLS.DOWN;
    }
  }

  // Setting Colors for Snake Head,Body and also for Board Color and Game Over
  SnkSetColors(col: number, row: number): string {
    if (this.SnkIsGameOver) {
      this.SnkShowGameOver = !this.SnkShowGameOver; // // Returns color for the game over overlay from constants
      return COLORS.GAME_OVER; // Returns color for the game over from constants
    } else if (this.snake.parts[0].x === row && this.snake.parts[0].y === col) {
      return COLORS.HEAD; // Returns color for the snake head from constans
    } else if (this.SnkBoard[col][row] === true) {
      return COLORS.BODY; // Returns color for the snake body from constans
    }
    return COLORS.BOARD; // Returns color for the snake body from constans
  };

  // Creating an apple 
  SnkSetApple(col: number, row: number) {
    if (this.fruit.x === row && this.fruit.y === col) // returns true if the snake eats or collide with apple
    return true;
  }

  // Snake Position updating while eating apple or while collision with body or walls
  SnkUpdatePositions(): void {
    let newHead = this.SnkRepositionHead();
    let that = this;

    if (this.SnkBoardCollision(newHead)) { // checking for collision with walls and if true then set game over
      return this.SnkGameOver();
    }

    if (this.SnkSelfCollision(newHead)) { // Checking for self collision and if true then set game over
      return this.SnkGameOver();
    } else if (this.SnkFruitCollision(newHead)) { // Checking the collision with fruits and if true then eat and increase the snake size
      this.SnkEatFruit();
    }

    let oldTail = this.snake.parts.pop();
    this.SnkBoard[oldTail.y][oldTail.x] = false;

    this.snake.parts.unshift(newHead);
    this.SnkBoard[newHead.y][newHead.x] = true;

    this.snake.direction = this.SnkTempDirection;

    setTimeout(() => {
      that.SnkUpdatePositions(); // Updates position with each block when the snake moves to that direction
    }, this.SnkInterval);
  }

  // Repositions the snakes head each time when it changes the directon
  SnkRepositionHead(): any {
    let newHead = Object.assign({}, this.snake.parts[0]);

    if (this.SnkTempDirection === CONTROLS.LEFT) {
      newHead.x -= 1;
    } else if (this.SnkTempDirection === CONTROLS.RIGHT) {
      newHead.x += 1;
    } else if (this.SnkTempDirection === CONTROLS.UP) {
      newHead.y -= 1;
    } else if (this.SnkTempDirection === CONTROLS.DOWN) {
      newHead.y += 1;
    }
    return newHead;
  }

  // Checks the snake for Board Collision
  SnkBoardCollision(part: any): boolean {
    return part.x === GRID_SIZE || part.x === -1 || part.y === GRID_SIZE || part.y === -1;
  }

  // Checks the snake for Self Collision
  SnkSelfCollision(part: any): boolean {
    return this.SnkBoard[part.y][part.x] === true;
  }

  // Checks the snake for Fruit Collision
  SnkFruitCollision(part: any): boolean {
    return part.x === this.fruit.x && part.y === this.fruit.y;
  }

  // Generating Random location or path for the Fruit
  SnkRandomNumber(): any {
    return Math.floor(Math.random() * GRID_SIZE);
  }

  // Resets fruit each time when the snake eats or collides the apple
  SnkResetFruit(): void {
    let x = this.SnkRandomNumber();
    let y = this.SnkRandomNumber();

    if (this.SnkBoard[y][x] === true) {
      return this.SnkResetFruit();
    }
    // setting new location for fruit
    this.fruit = {
      x: x,
      y: y
    };
  }

  // When Snake eats fruit
  SnkEatFruit(): void {
    this.SnkScore++; // Increase the score and also the snake body
    let tail = Object.assign({}, this.snake.parts[this.snake.parts.length - 1]);
    this.snake.parts.push(tail);
    this.SnkResetFruit(); // reset the fruit location

    if (this.SnkScore % 5 === 0) { // Increase the Snakes speed when score increase by 5
      this.SnkInterval -= 15;
    }
  }

  // Game Over
  SnkGameOver(): void {
    this.SnkIsGameOver = true;
    this.SnkGameStarted = false;
    let me = this;
    this.SnkNewScore = true;
    
    setTimeout(() => {
      me.SnkIsGameOver = false;
    }, 500);

    this.SnkSetBoard(); // Set the board
  }
  
  // Work against memory leak if component is destroyed
  ngOnDestroy() {
    
  }

}
