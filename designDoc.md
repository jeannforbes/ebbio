<h1>Design Document</h1>

<h2>Introduction</h2>
Ebbio is a mouse-controlled competitive online multiplayer game. 
The goal is to become the largest thing around, then stay that way for as long as you can.
Players gain points by moving their avatars into glowing objects of differing sizes, making those orbs disappear and 'eating' them.
As players gain points, they eventually reach growth thresholds, where they get a choice between new abilities for their avatar.
As players get bigger, they need more points for each threshold but glowing objects give fewer.
After their first growth threshold, players can attack other players of similar size to eat part or all of them, growing themselves whilst shrinking or killing the other player.
Players cannot be eaten by a player that's 10 times their size or larger.
Players spawn into an ocean filled with glowing objects and populated by other players.
When you damage a player, chunks fly off and that player loses some size.
Any player can consume those chunks to grow.
The amount of size in those chunks is less than the amount of size the damaged player lost.

Our new player spawns in as a little orb. They see other orbs, glowing, around them. They move their mouse, the little player-orb follows it.
The player eats a glowy orb and gets a little bigger. That orb vanishes. The player sees another player, bigger than them.
That other player bites our intrepid newbie, who shrinks and has little glowy orbs come out of his body.
Confused, our intrepid newbie pushes buttons to try and fight back, but is unable to harm his aggressor and dies.
Our newbie spawns in again. This time, he looks around at our screen and sees a bar on the bottom.
He remembers seeing it filling up as he ate orbs last time, so he goes around eating orbs and growing.
When the bar fills up, the newbie is given a choice of weapons to have after evolving. 
Remembering how effective it was when he was bitten, our newbie decides to evolve a powerful bitin' jaw.
Now prowling the world, our less-fresh newbie finds himself some fresh meat and devours them whole, growing and evolving al the while.

<h2>Controls</h2>
Players control their avatars with the mouse.
Left mouse button is attack, right mouse button is used for special actions.

Unless they're at the edge of the map, a player's avatar will be at the center of their screen.
In the bottom center, a player can see their below that a bar that fills as their score increases, representing progress to their growth threshold.
In the top-right corner of the screen, players can see the top 10 players of the ocean they're in, their names and scores.
At the bottom of that scoreboard players can see themselves (if they aren't in the top 10) with their score and place.
When a player reaches a growth threshold, an overlay appears on their screen asking them to choose a new ability.
While this overlay is displayed, players cannot be harmed.
This overlay explains each ability in detail.
Players make a selection by moving their mouse over an option and left clicking it.
After making a selection, players are fully healed and get about a half-second of invulnerability to move away.


Server keeps track of players online, their locations, and their evolution choices (in such a way that the player can't spoof it). Player never tells the server it grows, player says it ate something.
Client renders game, keeps track of when it's bitten another player or eaten something.

Client renders game, and tells the server everything it does. Server verifies, and if that's a valid action, allows it.

world is a hash table of arrays saying what (non-player) things it has

to validate eating an orb, the client says 'I ate an orb with <this id>', and the server checks the location of the orb with the specified ID and the location of the player. if those locations line up, the orb is eaten.

