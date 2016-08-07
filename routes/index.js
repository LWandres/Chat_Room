// store user session information
var session_info = [];
// stores session messsages
var messages = [];
//stores all chatusers (pop off to clear all when no users are in chatroom)
var chatusers = [];
//checks if logout button was clicked to avoid double logout with unload.
var logout = '';
// function to check if user is already logged in / session credentials are active
var is_user = function(session_id){
	console.log("Session info start",session_info);
	number_of_users = session_info.length;
	var current_user = false;

	if(number_of_users > 0){
		for(var ctr = 0; ctr < number_of_users; ctr++){
			if(session_info[ctr].id == session_id){
				current_user = session_info[ctr];
				break;
			}
			else{
				current_user = false;
			}
		}
	}
	return current_user;
}

module.exports = function Route(app){
	app.get("/", function(req, res){
		res.render("home");
	});
	app.get("/start", function(req, res){
		res.render("index", {title: "Chat Room"});
	});
	app.get("/home", function(req, res){
		res.render("home");
	});

// SOCKET ROUTES
	//load the existing chat messages on page load
	app.io.route("page_load", function(req){
		req.io.emit("load_messages", {messages: messages, session_id:req.session.id});

		//Check if the user is new based on session id.
		if(is_user(req.session.id) === false){
			req.io.emit("get_user_name");
		}else{
			//if a user already exists in session info, push them back into the chatusers array.
			var user = is_user(req.session.id);
			chatusers.push(user.name);
			app.io.broadcast("new_user_entry", {name: user.name});
		}

	})
	//Saves a new user and pushes info into the session_info and chatuser arrays.
	app.io.route("new_user", function(req){
		session_info.push({id: req.session.id, name: req.data.name});
		chatusers.push(req.data.name);
		app.io.broadcast("new_user_entry", {name: req.data.name});
		return session_info;
	})

	//Save to messages array in server.
	app.io.route("new_message", function(req){
		var user = is_user(req.session.id);
		if(user){
			messages.push({ name: user.name, message: req.data.message });
			app.io.broadcast("post_new_message", { new_message: req.data.message, user: user.name, session_id:req.session.id });
		}
	})

	app.io.route("user_logout", function(req,res){
		//getting and sending the user name of the person logging out
		var user = is_user(req.session.id);

		app.io.broadcast("user_loggedout", { userloggedout: user.name });

		// If the logging out user is the client's user, redirect to home page.
		if (req.data.loggingout_user == req.session.id){
			//used to keep track of dynamic # of users in chatroom at a time.
			if (chatusers.length > 0){
				chatusers.pop();
				console.log(chatusers);
			}
			//if all users have left the chatroom, clear out data
			if (chatusers.length < 1){
				messages = [];
				chatusers = [];
				session_info = [];
				console.log("cleared messages",messages);
				console.log("cleared chatusers",chatusers);
				console.log("cleared session_info",session_info);

			}
			req.io.emit("gohome");
		} else {
			return;
		}
	})
}
