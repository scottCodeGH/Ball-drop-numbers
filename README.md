# Ball Drop Game

A physics-based ball drop game where you drop balls through a field of pegs to land in scoring containers!

## Game Objective

Drop balls from the top of the screen and watch them bounce through a field of pegs. Your goal is to maximize your score by landing balls in the highest-value containers at the bottom.

## How to Play

### Controls
- **Drop Ball**: Click this button to release a single ball from the top center
- **Drop 5 Balls**: Click to automatically drop 5 balls in quick succession
- **Reset Game**: Clear your score and start over

### Scoring System

At the bottom of the screen, there are 9 colored containers with different point values:

| Position | Points | Color |
|----------|--------|-------|
| Far Left/Right | 100 | Red |
| 2nd from edges | 50 | Yellow |
| 3rd from edges | 20 | Blue |
| 4th from edges | 10 | Green |
| Center | 5 | Light Blue |

The scoring follows a symmetrical pattern - the outer containers (edges) award the most points (100), while the center container awards the least (5 points).

### Gameplay Mechanics

1. **Ball Drop**: Balls are released from the top center with slight randomness in their starting position and initial horizontal velocity
2. **Peg Bouncing**: As balls fall, they bounce off red pegs arranged in a triangular pattern
3. **Physics**: Balls are affected by:
   - Gravity (pulling them down)
   - Bounce physics (when hitting pegs)
   - Horizontal damping (slowing sideways movement)
   - Wall collision (bouncing off screen edges)
4. **Landing**: When a ball lands in a container, you score the points and the container flashes white
5. **Visual Feedback**:
   - Pegs glow yellow when hit by a ball
   - Each ball has a unique random color
   - Containers flash when scoring

### Strategy Tips

- The ball's path is influenced by physics and randomness, making each drop unique
- Aim for the edge containers (100 points) for maximum score, but they're harder to reach
- The peg arrangement creates a probability distribution similar to a Galton board
- Use "Drop 5 Balls" to quickly accumulate score, but watch the chaos unfold!

## Game Stats

The game tracks:
- **Total Score**: Sum of all points earned from balls landing in containers
- **Balls Dropped**: Total number of balls you've released

## Technical Details

Built with vanilla JavaScript and HTML5 Canvas for smooth physics simulation and rendering.
