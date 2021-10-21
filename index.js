const express = require("express")
const hbs = require("express-handlebars")
const config = require("./config")
const app = express()
const rateLimit = require("express-rate-limit")
const table = require("./table")

table.init()

const limiter = rateLimit({
	windowMs: 12 * 60 * 60 * 1000, // 12h
	max: 3,
	skipSuccessfulRequests: true,
})

app.set("trust proxy", "loopback")
app.engine(
	"hbs",
	hbs({
		extname: ".hbs",
		defaultLayout: "main",
		layoutsDir: "views",
	})
)
app.use(express.static("./public"))
app.set("view engine", "hbs")
app.use(express.json())

app.post("/password", limiter, async (req, res) => {
	if (await table.exist(req.ip)) {
		res.send("OK")
		return
	}
	if (!req.body.password) {
		res.status(403).send("Bad password")
		return
	}
	if (req.body.password !== config.password) {
		res.status(401).send("Incorrect password")
		return
	}

	table
		.add(req.ip)
		.then(() => {
			res.status(200).send()
		})
		.catch(err => {
			res.status(500).send(err.message)
		})
})

app.get("/", async (req, res) => {
	res.render("main", { isWhitelisted: await table.exist(req.ip) })
})

app.listen(config.port, () => {
	console.log("Listening at port: " + config.port)
})
