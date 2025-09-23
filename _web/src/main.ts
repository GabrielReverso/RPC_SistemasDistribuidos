async function somar() {
	const a_input = document.getElementById("a") as HTMLInputElement;
	const b_input = document.getElementById("b") as HTMLInputElement;
	const res = document.getElementById("res") as HTMLInputElement;
	const a = parseInt(a_input.value);
	const b = parseInt(b_input.value);

	if (isNaN(a) || isNaN(b)) {
		console.error("Por favor, insira números válidos.");
		return;
	}
	const response = await fetch("http://localhost:3000/add", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ a, b }),
	});
	const data: { result: number } = await response.json();
	console.log(data);
	res.value = data.result.toString();
}

const button = document.querySelector("button") as HTMLButtonElement;
button.addEventListener("click", somar);
