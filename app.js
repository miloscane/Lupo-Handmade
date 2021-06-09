//Server
var server				=	require('express')();
var http				=	require('http').Server(server);
var net					=	require('net');
var io					=	require('socket.io')(http);
var express				=	require('express');
var fs					=	require('fs');
var bodyParser			=	require('body-parser');
var session				=	require('express-session');
var cookieParser		=	require('cookie-parser');
var crypto				=	require('crypto');
var nodemailer 			= 	require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();

server.set('view engine','ejs'); 
var viewArray	=	[__dirname+'/views'];
var viewFolder	=	fs.readdirSync('views');
for(var i=0;i<viewFolder.length;i++){
	if(viewFolder[i].split(".").length==1){
		viewArray.push(__dirname+'/'+viewFolder[i])
	}
}
server.set('views', viewArray);
server.use(express.static(__dirname + '/public'));
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended: true }));
server.use(cookieParser());

console.log(process.env.PORT)

http.listen(process.env.PORT, function(){
  console.log('Server Started');
});

var mainFileVersion	=	1.1;

var pageInfo	=	{};

pageInfo.fileVersion	=	mainFileVersion;
pageInfo.siteName		=	"Lupo - Handmade shoes";

require('events').EventEmitter.prototype._maxListeners = 0;


var transporter = nodemailer.createTransport({
	host: process.env.transporterhost,
	port: 465,
	secure: true,
	auth: {
		user: process.env.transporteruser,
		pass: process.env.transporterpass
	}
});

//Minify resourcessss
/*var htmlModulesList	=	fs.readdirSync('./public/html-modules');
for(var i=0;i<htmlModulesList.length;i++){
	if(htmlModulesList[i].split('.').length>1){
		var code	=	fs.readFileSync('./public/html-modules/'+htmlModulesList[i],'utf-8');
		code	=	code.replace(/[\t\n\r]/gm,'');
		fs.writeFileSync('./public/html-modules/minified/'+htmlModulesList[i].split('.')[0]+'.min.'+htmlModulesList[i].split('.')[1],code);
	}
}*/

function fetchPageInfo(pageName){
	var pageInfoObject	=	JSON.parse(JSON.stringify(pageInfo));
	if(fs.existsSync('./info/'+ pageName + ".json")){
		var pageJson	=	JSON.parse(fs.readFileSync('./info/'+ pageName + ".json",'utf-8'));
	}else{
		var pageJson	=	JSON.parse(fs.readFileSync('./info/home.json','utf-8'));
	}
	for(var i=0;i<Object.keys(pageJson).length;i++){
		pageInfoObject[Object.keys(pageJson)[i]]	=	pageJson[Object.keys(pageJson)[i]].toString();
	}

	return pageInfoObject
}

/*io.on('connection', function(socket){
	
	socket.on('disconnect',function(){
		
	});
});*/


server.get('/',function(req,res){
	var imageNames	=	fs.readdirSync('./public/images/shoes/drive');
	var imageExtensions	=	['jpg','jpeg','png'];
	for(var i=0;i<imageNames.length;i++){
		var extension 	=	imageNames[i].split(".")[eval(imageNames[i].split(".").length-1)];
		if(imageExtensions.indexOf(extension)<0){
			imageNames.splice(i,1);
		}
	}
	res.render('home',{
		pageInfo: fetchPageInfo('home'),
		shoes: imageNames 
	});
});

server.post('/send-message',function(req,res){
	var mailOptions = {
		from: '"Lupo Handmade Website" <admin@solver.rs>',
		to: 'lepsin66699@gmail.com,miloscane@gmail.com',
		subject: 'Lupo Handmade Website Contact',
		html: req.body.message2+"<br>&nbsp;<br><b>Phone: </b>"+req.body.tel+"<br><b>Email: </b>"+req.body.email+"<br>&nbsp;<br>Kind regards,<br><a href='http://site.solver.rs' style='color:rgba(19,170,82)'>solver.rs</a>"
	};
	transporter.sendMail(mailOptions, (error, info) => {
		if (error) {
			res.redirect('/?message=fail')
			return console.log(error);
		}
		console.log('Message sent: %s', info.messageId);
		console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
		res.redirect('/?message=success')
	});
});

server.get('*',function(req,res){
	res.redirect('/');
});