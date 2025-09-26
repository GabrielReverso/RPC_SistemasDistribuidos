async function somar() {
	const response = await fetch("http://localhost:3000/spin", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ bet: 20 }),
	});
	const data: { result: number } = await response.json();
	console.table(data);
}

const button = document.querySelector("button") as HTMLButtonElement;
button.addEventListener("click", somar);

const lever = document.getElementById("lever")!;
const handle = document.getElementById("lever-handle")!;

handle.addEventListener("click", () => {
	lever.classList.add("pulled");
	handle.classList.add("pulled");

	// volta a posição original depois de 1s
	setTimeout(() => {
		lever.classList.remove("pulled");
		handle.classList.remove("pulled");
	}, 1000);
});
