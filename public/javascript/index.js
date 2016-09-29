$(document).ready(function() {
    var session_id = '';
    var logoutClicked = '';
    var cancelclicked = '';
    //establish socket connection
    io = io.connect();
    io.emit("page_load");

    //show pop up if user doesn't have an active id in session_info
    io.on("get_user_name", function(data) {
        var name = prompt("Please enter your name:");
        if (name === null || name === ''){
            cancelclicked = true;
            window.location = "/";
        } else{
            io.emit("new_user", {
                name: name
            });
        }
        current_user = name;
    });

    //if new user enters chatroom, let other users know
    io.on("new_user_entry", function(data) {
        $("#message_board").append("<p><span class='event'>" + data.name + " has entered the room</span></p>");
        //scroll messages div to bottom to follow most recent event.
        var div = $("#message_board");
        div.scrollTop(div.prop('scrollHeight'));
    });

    //new message submit
    $("#new_message").submit(function() {
        io.emit("new_message", {
            message: $("#message").val()
        });
        return false;
    });

    //allows user to press enter key to submit message
    $("#new_message").keypress(function(e) {
        var key = e.which;
        if (key == 13) {
            io.emit("new_message", {
                message: $("#message").val()
            });
            return false;
        }
    });

    //show a line for each message in the array on page load.
    io.on("load_messages", function(data) {
        var messages = data.messages;
        var message_thread = "";
        session_id = data.session_id;

        for (var ctr = 0; ctr < messages.length; ctr++) {
            message_thread += "<p>" + messages[ctr].name + ": " + messages[ctr].message + "</p>";
        }
        //append messages to board, and scroll message div to the bottom.
        $("#message_board").append(message_thread);
        var div = $("#message_board");
        div.scrollTop(div.prop('scrollHeight'));
    });

    //show new messages that were posted
    io.on("post_new_message", function(data) {
        //if user who is posting the message
        if (data.session_id == session_id) {
            $("#message_board").append("<p><span class='user'>" + data.user + ":</span> " + data.new_message + "</p>");
            //clear the message field after user submits
            $('#message').val('');
        } else {
            $("#message_board").append("<p><span class='guest'>" + data.user + ":</span> " + data.new_message + "</p>");
        }
        //scroll the message div to the bottom once new messages are added.
        var div = $("#message_board");
        div.scrollTop(div.prop('scrollHeight'));
    });

    //log user out
    $("#logout").click(function() {
        logoutClicked = true;
        io.emit("user_logout", {
            loggingout_user: session_id,
        });
        return false;
    });

    //perform logout actions if user closes tab/window too
    window.onunload = function (event) {
        //makes sure users aren't logged out twice and popped off of chatusers array on index.js
        if ((logoutClicked !== true) && (cancelclicked !== true)) {
            logoutClicked = '';
            io.emit("user_logout", {
                loggingout_user: session_id,
            });
            return false;
        }
    };

    // broadcast leaving event to others in chatroom
    io.on('user_loggedout', function(data) {
        $("#message_board").append("<p><span class='event'>" + data.userloggedout + " has left the room. </span></p>");
    });

    // redirect logout user to home page
    io.on('gohome', function() {
        window.location = "/";
    });

//Google Analytics
  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

  ga('create', 'UA-82133906-1', 'auto');
  ga('send', 'pageview');
});
