#Design Document

##First look
*A new player spawns in as a little orb. This player will see other orbs, glowing, around them. They move their mouse, the little player*orb follows it.
*The player eats a glowy orb and gets a little bigger. That orb vanishes. The player sees another player, bigger than them.
*That other player bites the intrepid newbie, who shrinks and has little glowy orbs come out of their body.
*Confused, the intrepid newbie pushes buttons to try and fight back, but is unable to harm their aggressor and dies.
*The newbie spawns in again. This time, they looks around at the screen and see a bar on the bottom.
*They remember seeing it filling up as they ate orbs last time, so they go around eating orbs and growing.
*When the bar fills up, the newbie is given a choice of weapons to have after evolving. 
*Remembering how effective it was when they were bitten, the newbie decides to evolve a powerful bitin' jaw.
*Now prowling the world, the less-fresh newbie finds themself some fresh meat and devours them whole, growing and evolving all the while.
*Steam vents populate the world, spewing glowy orbs of delicousness

##Introduction
*Ebbio is a mouse-controlled competitive online multiplayer game. 
*The goal is to become the largest thing around, then stay that way for as long as you can.
*Players gain points by moving their avatars into glowing objects of differing sizes, making those orbs disappear and 'eating' them.
*As players gain points, they eventually reach growth thresholds, where they get a choice between new abilities for their avatar.
*As players get bigger, they need more points for each threshold but glowing objects give fewer.
*After their first growth threshold, players can attack other players of similar size to eat part or all of them, growing themselves whilst shrinking or killing the other player.
*Players cannot be eaten by a player that's 10 times their size or larger.
*Players spawn into an ocean filled with glowing objects and populated by other players.
*When you damage a player, chunks fly off and that player loses some size.
*Any player can consume those chunks to grow.
*The amount of size in those chunks is less than the amount of size the damaged player lost.
*Also populating the ocean are a collection of steam vents, from which orbs regularly spawn.

##Controls
*Players control their avatars with the mouse.
*Left mouse button is attack, right mouse button is used for special actions.

##User Interface
*Unless they're at the edge of the map, a player's avatar will be at the center of their screen.
*In the bottom center, a player can see their below that a bar that fills as their score increases, representing progress to their growth threshold.
*In the top*right corner of the screen, players can see the top 10 players of the ocean they're in, their names and scores.
*At the bottom of that scoreboard players can see themselves (if they aren't in the top 10) with their score and place.
*When a player reaches a growth threshold, an overlay appears on their screen asking them to choose a new ability.
**While this overlay is displayed, players cannot be harmed.
**This overlay explains each ability in detail.
**Players make a selection by moving their mouse over an option and left clicking it.
*After making a selection, players are fully healed and get about a half-second of invulnerability to move away.

##Client/Server
*The server keeps track of players online, their locations, and their evolution choices (in such a way that the player can't spoof it). A client never tells the server how much it grows, client says it ate something.
*Client renders game, keeps track of when its bitten another player or eaten something.
*The server verifies the client's actions and allows them to occur if they pass validation.

*The world is a hash table of arrays saying what (non-player) things it has

*To validate eating an orb, the client says 'I ate an orb with id #123456A', and the server checks the location of the orb with the specified ID and the location of the player. if those locations line up, the orb is eaten.

# Concept
* You're an orb. You're gliding (flowing? oozing?) around the world, minding your own business, when you see a glowy thing.
* You decide to eat it.
* You grow.
* You keep on eating glowy things, until you feel yourself on the cusp of a revelation.
* Now, you choose between teeth and ink.
* With your newfound tools, you eat more glowy things, and find other orbs (are they other players too?) and keep on eating and changing
* Eventually, you realize that you've become so big that now you have other orbs inside of you and you're producing your own glowy things!

# Mechanics
* Orb moves with mouse.  

* When you eat a glowy thing, you get bigger. At certain bigger-ness thresholds, you evolve. When you evolve, you are presented a pair of choices.  

* Running into players smaller than you (but not too much smaller. Spitballing to 10% of your mass or larger.), or biting players of a comparable size to you (or does biting let you eat chunks off of bigger players when careful?), eats them, which kills them and gives you an increase in size based off of how big they were.  

* When you progress to the third evolution, you're offered a choice between symbiote and parasite.
* Symbiotes coordinate with each other, and are encouraged to work together.
* Parasites are individually stronger, and seek out and consume symbiotes and other parasites.  

* If you're sufficiently small compared to another player, they cannot eat you in the first place and you can pass into their bodies and live inside them.
* The inside of symbiotes is a peaceful environment filled with glowy-eaties.
* The inside of parasites is an acidic hellscape bereft of any value save the malice dwelling within their hearts, and a small number of anemic glowy*eaties.