const express = require("express")
const hbs = require("express-handlebars")
const config = require("./config")
const fsp = require("fs/promises")
const app = express()
const rateLimit = require("express-rate-limit")
const util = require("util")
const exec = util.promisify(require("child_process").exec)

fsp.stat("allowed.list").catch(err => {
	fsp.writeFile("allowed.list", "127.0.0.1\n").catch(() => {
		console.error("Failed to create allowed.list")
		process.exit(1)
	})
})

const limiter = rateLimit({
	windowMs: 24 * 60 * 60 * 1000, // 24h
	max: 3,
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
	if (await isWhitelisted(req.ip)) {
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

	addWhitelist(req.ip)
		.then(() => {
			res.status(200).send()
		})
		.catch(err => {
			res.status(500).send(err.message)
		})
})

app.get("/", async (req, res) => {
	res.render("main", { isWhitelisted: await isWhitelisted(req.ip) })
})

app.listen(config.port, () => {
	console.log("Listening at port: " + config.port)
})

async function isWhitelisted(ip) {
	const data = await fsp.readFile("allowed.list", "utf8")
	return data.includes(ip)
}

async function addWhitelist(ip) {
	const { error } = await exec(
		"sudo iptables -I DOCKER-USER -p tcp -s " + ip + " --dport 53 -j RETURN"
	)
	if (error) throw error
	const { error2 } = await exec(
		"sudo iptables -I DOCKER-USER -p udp -s " + ip + " --dport 53 -j RETURN"
	)
	if (error2) throw error2

	await fsp.appendFile("allowed.list", ip + "\n")
	console.log(ip + " was added")
	return
}
