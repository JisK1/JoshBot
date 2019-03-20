//app.js


// Load up the discord.js library
const Discord = require("discord.js");
var fs = require('fs');	
// This is your client. Some people call it `bot`, some people call it `self`, 
// some might call it `cootchie`. Either way, when you see `client.something`, or `bot.something`,
// this is what we're refering to. Your client.
const client = new Discord.Client();

// Here we load the config.json file that contains our token and our prefix values. 
const config = require("./config.json");
// config.token contains the bot's token
// config.prefix contains the message prefix.

const YTDL = require("ytdl-core");



client.on("ready", () => {
  // This event will run if the bot starts, and logs in, successfully.
  console.log(`Bot has started, with ${client.users.size} users, in ${client.channels.size} channels of ${client.guilds.size} guilds.`);
  // Example of changing the bot's playing game to something useful. `client.user` is what the
  // docs refer to as the "ClientUser".
  client.user.setActivity(`on ${client.guilds.size} servers`);
});

client.on("guildCreate", guild => {
	
  // This event triggers when the bot joins a guild.
  console.log(`New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`);
  client.user.setActivity(`on ${client.guilds.size} servers`);
});

client.on("guildDelete", guild => {
  // this event triggers when the bot is removed from a guild.
  console.log(`I have been removed from: ${guild.name} (id: ${guild.id})`);
  client.user.setActivity(`on ${client.guilds.size} servers`);
});


var poll = {
	pollName: "newpoll",
	//number of choices.
	numChoices: 0,
	//array of strings which holds the description of the choices.
	choices: new Array(),
	//array the same size of choices array that adds points to the choices.
	votes: new Array(),
	//the users who have already voted.
	voted: new Array()
};
var pollActive = "";

//list of servers.
var serverList = {};

client.on("message", async message => {
  // This event will run on every single message received, from any channel or DM.
  
  // It's good practice to ignore other bots. This also makes your bot ignore itself
  // and not get into a spam loop (we call that "botception").
  if(message.author.bot) return;
  
  
  
 /* if(command === "thing") {
    message.channel.send("This is without the slash.");
  }*/
  
  
  // Also good practice to ignore any message that does not start with our prefix, 
  // which is set in the configuration file.
  if(message.content.indexOf(config.prefix) !== 0) return;

   // Here we separate our "command" name, and our "arguments" for the command. 
  // e.g. if we have the message "+say Is this the real life?" , we'll get the following:
  // command = say
  // args = ["Is", "this", "the", "real", "life?"]
  const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();
  
  // Let's go with a few common example commands! Feel free to delete or change those.
  
  if(command === "help"){
	  fs.readFile('help.txt', 'utf8', (err, data) => {
		if (err) throw err;
	 
		message.channel.send(data);
	  });
  }
  
  if(command === "ping") {
    // Calculates ping between sending a message and editing it, giving a nice round-trip latency.
    // The second ping is an average latency between the bot and the websocket server (one-way, not round-trip)
    const m = await message.channel.send("Ping?");
    m.edit(`Pong! Latency is ${m.createdTimestamp - message.createdTimestamp}ms. API Latency is ${Math.round(client.ping)}ms`);
  }
  
  if(command === "say") {
    // makes the bot say something and delete the message. As an example, it's open to anyone to use. 
    // To get the "message" itself we join the `args` back into a string with spaces: 
    const sayMessage = args.join(" ");
    // Then we delete the command message (sneaky, right?). The catch just ignores the error with a cute smiley thing.
    message.delete().catch(O_o=>{}); 
    // And we get the bot to say the thing: 
    message.channel.send(sayMessage);
  }
  
  if(command === "kick") {
    // This command must be limited to mods and admins. In this example we just hardcode the role names.
    // Please read on Array.some() to understand this bit: 
    // https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Array/some?
    if(!message.member.roles.some(r=>["Administrator", "Moderator"].includes(r.name)) )
      return message.reply("Sorry, you don't have permissions to use this!");
    
    // Let's first check if we have a member and if we can kick them!
    // message.mentions.members is a collection of people that have been mentioned, as GuildMembers.
    let member = message.mentions.members.first();
    if(!member)
      return message.reply("Please mention a valid member of this server");
    if(!member.kickable) 
      return message.reply("I cannot kick this user! Do they have a higher role? Do I have kick permissions?");
    
    // slice(1) removes the first part, which here should be the user mention!
    let reason = args.slice(1).join(' ');
    if(!reason)
      return message.reply("Please indicate a reason for the kick!");
    
    // Now, time for a swift kick in the nuts!
	
	  await member.kick(reason)
      .catch(error => message.reply(`Sorry ${message.author} I couldn't kick because of : ${error}`));
    message.reply(`${member.user.tag} has been kicked by ${message.author.tag} because: ${reason}`);

  }
  
  if(command === "ban") {
    // Most of this command is identical to kick, except that here we'll only let admins do it.
    // In the real world mods could ban too, but this is just an example, right? ;)
    if(!message.member.roles.some(r=>["Administrator"].includes(r.name)) )
      return message.reply("Sorry, you don't have permissions to use this!");
    
    let member = message.mentions.members.first();
    if(!member)
      return message.reply("Please mention a valid member of this server");
    if(!member.bannable) 
      return message.reply("I cannot ban this user! Do they have a higher role? Do I have ban permissions?");

    let reason = args.slice(1).join(' ');
    if(!reason)
      return message.reply("Please indicate a reason for the ban!");
    
    await member.ban(reason)
      .catch(error => message.reply(`Sorry ${message.author} I couldn't ban because of : ${error}`));
    message.reply(`${member.user.tag} has been banned by ${message.author.tag} because: ${reason}`);
	
	  }
  
  if(command === "compliment"){
    let member = message.mentions.members.first();
    if(!member)
      return message.reply("Please mention a valid member of this server");
  
          //the array of compliments that is used to generate a complement.
          var complements = ["your awesome!", "you are great!", "you smell nice", "i like your boobs!", "you have nice hair!"]; 
          //the message to be sent with the arguments of the command.
		  var sayMessage = args[0];
          //the compliment is taken from the array and added to sayMessage.
          sayMessage += " ";
          sayMessage += complements[ Math.floor(Math.random() * complements.length)];
          //the message is sent.
          message.channel.send(sayMessage);
          
  }
  
  if(command === "roll"){
		
		if(args[0] < 1 || args[0] > 9000000000000000 || (args[1] < 1 || args[1] > 9000000000000000)){
			message.channel.send("HEY!! only enter integer numbers between 1 and 9000000000000000 lol.");
			return false;
		}
		
		var sayMessage = " ";
		console.log("before switch");
		switch(args.length) {
			case 0:
				console.log("0");
				sayMessage += (1 + Math.floor(Math.random() * 6));
				break;
			case 1:
				console.log(1);
				sayMessage += (1 + Math.floor(Math.random() * args[0]));
				break;
			case 2:
				console.log(2);
				var rollNum = (Math.max(args[0], args[1]) - Math.min(args[0], args[1]));
				
				sayMessage += (Math.min(args[0], args[1]) + Math.floor(Math.random() * rollNum));
				break;
			default:
				console.log("default");
				message.channel.send("Default - HEY!! only enter integer numbers between 1 and 9000000000000000 lol.");		
			}
			//send the message.
			message.channel.send(sayMessage);
  }
  
  if(command === "8ball"){
          console.log("8ball?");
         
          //the array of response that is used to generate a complement.
          var responses = ["It is certain", "It is decidedly so", "Without a doubt", "Yes definitely", "You may rely on it", 
		  		"As I see it, yes", "Most likely", "Outlook good", "Yes", "Signs point to yes", "Reply hazy try again", 
		  		"Ask again later", "Better not tell you now", "Cannot predict now", "Concentrate and ask again", 
		  		"Don't count on it", "My reply is no", "My sources say no", "Outlook not so good", "Very doubtful"]; 
		  
		  
		  
          //the message to be sent that randomly selects a response.
      var sayMessage = " ";
                  sayMessage = responses[ Math.floor(Math.random() * responses.length)];
          //the message is sent.
          message.channel.send(sayMessage);
          
  }

  
  //startpoll pollname number_of_choices choice1 choice2 choice3 ....  
  if(command === "startpoll"){
	  if(pollActive){
		  message.channel.send("There is already a poll active!!!");
	  }
	  else if(args.length === 0){	  
		  message.channel.send("Please type the command like this /pollstart pollname choice1 choice2 choice3 ...");
	  }
	  else{
		  pollActive = true;
		  console.log("start poll!");
		  poll.pollName = args[0];
		  var say = "";
		  var input = "";
		  
		  say += "Please vote on the ";
		  say += poll.pollName;
		  say += " poll by typing  /vote and the corresponding number below."
		  for(i = 1; i < args.length; i++){
				poll.numChoices++;
				
				say += "\n";
				say += i;
				say += " ";
				say += args[i];
				
				poll.votes[i] = 0;
				poll.choices[i] = args[i];  
				input += poll.choices[i];
				input += " ";
		  }

		  message.channel.send(say);
	  }
  }
    
  
  if(command === "vote"){
	  
	  if(pollActive == false){
		  	message.channel.send("The is no active poll.");
			return;
	  }
	  
	  if(votedAlready(message.author)){
		 var say = "You have already voted ";
		 say += message.author;
		 say += ".";
		 
		 message.channel.send(say); 
		 return;
	  }

	  if(args[0] > poll.numChoices || args[0] < 1){
			message.channel.send("That is not a valid choice.");  
			return;
	  }
		poll.votes[args[0]]++;
		poll.voted.push(message.author);
  }
    
  /*---Games Poll---
1. XXX
2. XXXXX
3. XXX
4. XXXXXX

Winner is option 4!*/

  if(command === "endpoll"){
	  
	  if(pollActive == false){
		  	message.channel.send("The is no active poll.");
			return;
	  }
	  
	  var say = "";
	  say += "The results of the "
	  say += poll.pollName;
	  say += " poll are ";
	  for(i = 1; i < poll.votes.length; i++){
		
		
		say += "\n";
		say += poll.choices[i];
		say += " with ";
		say += poll.votes[i];
		say += " votes";	
			
	  }
	  say += "\nThe winner is "
	  say += poll.choices[winner()];
	  message.channel.send(say);
		
		poll.Name = "newPoll"
		poll.numChoices = 0;
		poll.choices = new Array();
		poll.votes = new Array();
		poll.voted = new Array();

	  pollActive = false;
  }
  
  function votedAlready(user){
	  var voted = false;
	  for(var i = 0; i < poll.voted.length; i++){
		  if(user === poll.voted[i])
			  voted = true;
	  }
	  return voted;
  }
  
  function winner(){
	  
	  var winner = 0;
	 // var ties = new Array();
	  
	  for(var i = 0; i < poll.votes.length; i++){
		  if(poll.votes[i] > winner){
			winner = i;
		  }else if(poll.votes[i] === winner){
			  
		  }
	  }
	  return winner;
  }
  
  if(command === "blah"){
	  var say = "";
	  say += message.author;
	   message.channel.send(say);
  }
  
  if(command === "exit"){
	  if(!message.member.roles.some(r=>["Administrator", "Moderator"].includes(r.name)) )
      return message.reply("Sorry, you don't have permissions to use this!");
  
	  client.destroy();
  }
  
  //play a song from youtube.
  if(command === "play"){
		//check if user has permission.
		//if(!message.member.roles.some(r=>["Administrator", "Moderator"].includes(r.name)) )
		//return message.reply("Sorry, you don't have permissions to use this!");
		
		//check if they're in a voice channel.
		if(!message.member.voiceChannel){
			return message.reply("You must be in a voice channel!" + message.member.voiceChannel);
		}
	
		//check if they posted a link.
		if(!args[0]){
			return message.reply("Please enter a valid link!");
		}
		
		if(!serverList[message.guild.id]){
			serverList[message.guild.id] = {
				queue: []
			};
		}
		
		var server = serverList[message.guild.id];
		
		server.queue.push(args[0]);
		if(!message.guild.voiceConnection) message.member.voiceChannel.join().then(function(connection){
			play(connection, message);
		});
		
  }
  //skip current song.
  if(command === "skip"){
	//check if user has permission.
	//if(!message.member.roles.some(r=>["Administrator", "Moderator"].includes(r.name)) )
	//return message.reply("Sorry, you don't have permissions to use this!");
 
	var server = serverList[message.guild.id];
	if(server.dispatcher){
		server.dispatcher.end();
	}
  }
  //Disconnects the bot from server.
  if(command === "stop"){
	//check if user has permission.
	//if(!message.member.roles.some(r=>["Administrator", "Moderator"].includes(r.name)) )
	//return message.reply("Sorry, you don't have permissions to use this!");
 
	var server = serverList[message.guild.id];
	if(message.guild.voiceConnection){
		message.guild.voiceConnection.disconnect();
	}
  }
  
  /*
  if(command === "purge") {
    // This command removes all messages from all users in the channel, up to 100.
    
    // get the delete count, as an actual number.
    const deleteCount = parseInt(args[0], 10);
    
    // Ooooh nice, combined conditions. <3
    if(!deleteCount || deleteCount < 2 || deleteCount > 100)
      return message.reply("Please provide a number between 2 and 100 for the number of messages to delete");
    
    // So we get our messages, and delete them. Simple enough, right?
    const fetched = await message.channel.fetchMessages({count: deleteCount});
    message.channel.bulkDelete(fetched)
      .catch(error => message.reply(`Couldn't delete messages because of: ${error}`));
  }*/
});
	
client.on("disconnect", async message => {
	console.log("The bot has been disconnected from the server.");
	process.exit;

});

//plays the 
function play(connection, message){
	var server = serverList[message.guild.id];

	server.dispatcher = connection.playStream(YTDL(server.queue[0], {filter: "audioonly"}));
	server.queue.shift();
	server.dispatcher.on("end", function(){
		if(server.queue[0]){
			play(connection, message);
		}
		else{
			connection.disconnect();
		}
	})
}

client.login(config.token);