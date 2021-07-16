$("#form").submit(e => {
	e.preventDefault()
	fetch("/password", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			password: $("#password").val(),
		}),
		mode: "same-origin",
	})
		.then(async res => {
			return { text: await res.text(), status: res.status }
		})
		.then(({ text, status }) => {
			if (status === 200) {
				location.reload()
			} else {
				error(status, text)
			}
		})
		.catch(error)
	return false
})

function error(status, text) {
	$("#error").html(status ? status + ": " + text : "Unknown error")
}

$(document).ready(() => {
	$("#password").focus()
})
