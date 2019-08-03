const express	= require('express');
const cookparse	= require('cookie-parser');
const dblite 	= require('dblite');
const path		= require('path');
const fetch		= require('node-fetch');
const sanitize	= require('sanitize-html');
const showdown 	= require('showdown');
const fs 		= require('fs');

require('dotenv').config();
showdown.setOption('simplifiedAutoLink', true);
showdown.setOption('simpleLineBreaks', true);
showdown.setOption('openLinksInNewWindow', true);
showdown.setOption('underline', true);
showdown.setOption('tables', true);
showdown.setOption('strikethrough', true);
showdown.setOption('tasklists', true);

const db	= dblite('md-data.sqlite','-header');

const app = express();

const conv = new showdown.Converter();

const CHARS = process.env.CHARACTERS;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookparse());
app.use(userAuth);

const genCode = function(table,num) {
	var codestring="";
	var codenum=0;
	while (codenum<(num==undefined ? 4 : num)){
		codestring=codestring+table[Math.floor(Math.random() * (table.length))];
		codenum=codenum+1;
	}
	return codestring;
}

async function setup() {
	db.query(`CREATE TABLE IF NOT EXISTS pages(
		id		TEXT,
		title 	TEXT,
		body 	TEXT
	)`)

	db.query(`CREATE TABLE IF NOT EXISTS users(
		id			TEXT,
		name 		TEXT NOT NULL,
		password 	TEXT NOT NULL
	)`)
}

function userAuth(req, res, next) {
	var user = (req.cookies.user ? JSON.parse(req.cookies.user) :
								   {username: req.body.name, pass: req.body.pass});
	db.query(`SELECT * FROM users WHERE name=? AND password=?`,[user.username, user.pass],(err,rows)=>{
		if(err) {
			console.log(err);
			req.verified = false;
		}
		if(rows[0]) {
			req.verified = true;
		} else {
			req.verified = false;
		}
		next()
	})
}

async function getPage(id) {
	return new Promise((res,rej)=>{
		db.query(`SELECT * FROM pages WHERE id=?`,[id],(err,rows)=>{
			if(err) {
				console.log(err);
				res(undefined);
			}
			if(rows[0]) {
				res(rows[0]);
			} else {
				res(undefined);
			}
		})
	})
}

function getPages() {
	return new Promise((res)=>{
		db.query(`SELECT * FROM pages`,(err,rows)=>{
			if(err) {
				console.log(err);
				res("ERR")
			} else {
				res(rows);
			}
		})
	})
}

function createPage(title, body) {
	return new Promise(async (res)=>{
		var code = genCode(CHARS);
		db.query(`INSERT INTO pages VALUES (?,?,?)`,[code, title, body],(err,rows)=>{
			if(err) {
				console.log(err);
				res.send("ERR")
			} else {
				res({id: code});
			}
		})
	})
}

function editPage(id, title, body) {
	var exists = getPage(id);
	if(!exists) return res.send("ERR");
	return new Promise(async (res)=>{
		db.query(`UPDATE pages SET title=?,body=? WHERE id=?`,[title, body, id],(err,rows)=>{
			if(err) {
				console.log(err);
				res.send("ERR")
			} else {
				res({id: id});
			}
		})
	})
}

function deletePage(id) {
	var exists;
	return new Promise(async (res)=>{
		exists = await getPage(id);
		if(exists) {
			db.query(`DELETE FROM pages WHERE id=?`,[id],(err,rows)=>{
				if(err) {
					console.log(err);
					res({status: "ERR"})
				} else {
					res({status: "OK"});
				}
			})
		} else {
			return res({status:'DOES NOT EXIST'});
		}
	})
}

function createUser(name, pass) {
	var exists;
	return new Promise(async (res)=> {
		exists = await getUser(name);
		var code = genCode(CHARS);
		if(!exists){
			db.query(`INSERT INTO users VALUES (?,?,?)`,[code, name, pass],(err,rows)=>{
				if(err) {
					console.log(err);
					res.send({status: "ERR"})
				} else {
					res({status: "OK"});
				}
			})
		} else {
			res.send({status: "EXISTS"});
		}
	})
}

function getUser(id) {
	return new Promise((res,rej)=>{
		db.query(`SELECT * FROM users WHERE id=?`,[id],(err,rows)=>{
			if(err) {
				console.log(err);
				res(undefined);
			}
			if(rows[0]) {
				res(rows[0]);
			} else {
				res(undefined);
			}
		})
	})
}

function getUsers() {
	return new Promise((res)=>{
		db.query(`SELECT * FROM users`,(err,rows)=>{
			if(err) {
				console.log(err);
				res("ERR")
			} else {
				res(rows.map(u => {
					return u.name;
				}));
			}
		})
	})
}

function deleteUser(id) {
	return new Promise((res,rej)=>{
		db.query(`DELETE * FROM users WHERE id=?`,[id],(err,rows)=>{
			if(err) {
				console.log(err);
				res(false);
			}
			res(true);
		})
	})
}

//Normal routes

app.get("/",async (req,res)=>{
	var index = fs.readFileSync(path.join(__dirname,'frontend','build','index.html'),'utf8');
	index = index.replace('$TITLE','MD Bin')
				 .replace('$DESC','A personal use markdown site')
				 .replace('$TWITDESC','A personal use markdown site')
				 .replace('$TWITTITLE','MD Bin')
				 .replace('$OGTITLE','MD Bin')
				 .replace('$OGDESC','A personal use markdown site')
				 .replace('$OEMBED','oembed.json');
	res.send(index);
})

app.get("/page/:id",async (req,res)=>{
	var page = await getPage(req.params.id);
	if(page) {
		var short = sanitize(page.body, {allowedTags: [], allowedAttributes: {}} )
					.replace("\n"," ")
					.split(" ")
					.slice(0,50)
					.join(" ")+"...";
		var index = fs.readFileSync(path.join(__dirname,'frontend','build','index.html'),'utf8');
		index = index.replace('$TITLE',page.title+' || MD Bin')
					 .replace('$DESC', short)
					 .replace('$TWITDESC',short)
					 .replace('$TWITTITLE',page.title+' || MD Bin')
					 .replace('$OGTITLE',page.title+' || MD Bin')
					 .replace('$OGDESC',short)
					 .replace('$OEMBED','oembed.json');
		res.send(index);
	} else {
		var index = fs.readFileSync(path.join(__dirname,'frontend','build','index.html'),'utf8');
		index = index.replace('$TITLE','404 || MD Bin')
					 .replace('$DESC', "This page wasn't found")
					 .replace('$TWITDESC',"This page wasn't found")
					 .replace('$TWITTITLE','404 || MD Bin')
					 .replace('$OGTITLE','404 || MD Bin')
					 .replace('$OGDESC',"This page wasn't found")
					 .replace('$OEMBED','oembed.json');
		res.send(index);
	}
})

app.get("/create",async (req,res)=>{
	var index = fs.readFileSync(path.join(__dirname,'frontend','build','index.html'),'utf8');
	index = index.replace('$TITLE','MD Bin')
				 .replace('$DESC','Create markdown')
				 .replace('$TWITDESC','Create markdown')
				 .replace('$TWITTITLE','MD Bin')
				 .replace('$OGTITLE','MD Bin')
				 .replace('$OGDESC','Create markdown')
				 .replace('$OEMBED','oembed.json');
	res.send(index);
})

//API routes

//Pages

//get a certain page
app.get("/api/page/:id",async (req,res)=>{
	var page = await getPage(req.params.id);
	if(!page) res.status(404).send('NOT FOUND');

	res.send(page);
})

//get all pages
app.get("/api/pages",async (req,res)=>{
	if(!req.verified) return res.status(401).send("UNAUTHORIZED");

	pages = await getPages();
	res.send(pages);
})

//create a page
app.post("/api/page",async (req,res)=>{
	if(!req.verified) return res.status(401).send("UNAUTHORIZED");
	var dat = await createPage(req.body.title,sanitize(conv.makeHtml(req.body.body), {
									allowedTags: sanitize.defaults.allowedTags.concat([ 
										'img',
										'h1',
										'h2',
										'u',
										'del'
									])
								}));
	if(dat.id) {
		res.status(200).send(dat);
	} else {
		res.status(500).send("ERR");
	}
})

//edit a page
app.put("/api/page",async (req,res)=>{
	if(!req.verified) return res.status(401).send("UNAUTHORIZED");

	var dat = await editPage(req.body.id, req.body.title,sanitize(conv.makeHtml(req.body.body), {
											allowedTags: sanitize.defaults.allowedTags.concat([ 
												'img',
												'h1',
												'h2',
												'u',
												'del'
											])
										}));
	res.send(dat);
})

//delete a page
app.delete("/api/page",async (req,res)=>{
	if(!req.verified) return res.status(401).send("UNAUTHORIZED");

	var dat = await deletePage(req.body.id);
	res.send(dat);
})

//also delete a page
app.get("/api/page/:id/delete",async (req,res)=>{
	if(!req.verified)return res.status(401).send("UNAUTHORIZED");

	var dat = await deletePage(req.params.id);
	res.send(dat);
})

//Users

//get current user, if logged in
app.get("/api/user",async (req,res)=>{
	if(!req.verified) return res.status(401).send("UNAUTHORIZED");

	res.send(req.cookies.user ? JSON.parse(req.cookies.user) : undefined);
})

//get a user by their ID
app.get("/api/user/:id",async (req,res)=>{
	if(!req.verified) return res.status(401).send("UNAUTHORIZED");
	var user = await getUser(req.params.id);
	if(user) return res.status(200).send(user);
	else return res.status(404).send('NOT FOUND');
})

//get all users
app.get("/api/users", async (req,res)=>{
	if(!req.verified) return res.status(401).send("UNAUTHORIZED");

	var dat = await getUsers();
	if(dat=="ERR") res.status(500).send('ERR');
	else res.status(200).send(dat);
	
})

//create a new user
app.post("/api/user",async (req,res)=>{
	if(!req.verified) return res.status(401).send("UNAUTHORIZED");

	var dat = await createUser(req.body.name, req.body.password);
	res.send(dat);
})

//delete a user
app.delete("/api/user", async (req,res)=>{
	if(!req.verified) return res.status(401).send("UNAUTHORIZED");

	var dat = await deleteUser(req.body.id);
	if(dat=="ERR") res.status(500).send('ERR');
	else res.status(200).send('OK');

})

//also delete a user
app.get("/api/user/:id/delete", async (req,res)=>{
	if(!req.verified) return res.status(401).send("UNAUTHORIZED");

	var dat = await deleteUser(req.body.params);
	if(dat=="ERR") res.status(500).send('ERR');
	else res.status(200).send('OK');

})

//Logging in

//logs the user in
app.post("/api/login", async (req,res)=>{
	if(!req.verified) return res.status(400).send('BAD REQUEST: Invalid credentials');

	res.cookie('user', JSON.stringify({username: req.body.name, pass: req.body.pass}), 
									  {expires: new Date("1/1/2030")});
	res.status(200).send('OK');
});

app.get("/logout", async (req,res)=> {
	if(!req.verified) return res.status(400).send('BAD REQUEST: Invalid credentials');

	res.clearCookie('user');
})

//Serve static files
app.use(express.static(path.join(__dirname, 'frontend/build')));

//Extra routes
app.use((req,res, next)=>{
	var index = fs.readFileSync(path.join(__dirname,'frontend','build','index.html'),'utf8');
	index = index.replace('$TITLE','404 || MD Bin')
				 .replace('$DESC',"This page wasn't found")
				 .replace('$TWITDESC',"This page wasn't found")
				 .replace('$TWITTITLE','404 || MD Bin')
				 .replace('$OGTITLE','404 || MD Bin')
				 .replace('$OGDESC',"This page wasn't found")
				 .replace('$OEMBED','oembed.json');
	res.send(index);
})

//Get running
setup();
console.log('md-bin online')
// module.exports = app;
app.listen(process.env.PORT || 8080);