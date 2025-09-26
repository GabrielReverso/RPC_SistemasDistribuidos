import { CalculateJackpotResponse } from "../../_service/slotMachine";
import { ApiResponse } from "../../api-response";

const emojis: string[] = [
	"🍒",
	"🍋",
	"🍊",
	"🍉",
	"🍇",
	"🍓",
	"🥝",
	"🍍",
	"🥭",
	"🍌",
	"🍎",
	"🍏",
	"🥥",
	"🍑",
	"🍐",
	"🍈",
	"🍆",
	"🥑",
	"🌽",
	"🥕",
];

let spinInterval: NodeJS.Timeout | null = null;

const tooltip = document.getElementById("tooltip")! as HTMLParagraphElement;
const lever = document.getElementById("lever")! as HTMLButtonElement;
const handle = document.getElementById("lever-handle")! as HTMLDivElement;
const slots = document.querySelectorAll<HTMLSpanElement>(".slot")!;
const displayText = document.querySelector<HTMLParagraphElement>(".display p")!;

const tooltipTimeout: NodeJS.Timeout | null = setTimeout(
	() => tooltip.classList.remove("none"),
	10000
);

handle.addEventListener("click", () => {
	if (tooltipTimeout) {
		clearTimeout(tooltipTimeout);
	}

	tooltip.classList.add("none");

	lever.classList.add("pulled");
	handle.classList.add("pulled", "spining");

	showMessage("SPINNING");

	// volta a posição original depois de 1s
	setTimeout(() => {
		lever.classList.remove("pulled");
		handle.classList.remove("pulled");
	}, 1000);

	startSpinAnimation();

	spin()
		.then((data) => {
			console.table(data);
			if (data.success) {
				setTimeout(() => {
					stopSpinAnimation(
						[data.data.slot0, data.data.slot1, data.data.slot2],
						data.data.result
					);
				}, 2000);
			}
		})
		.catch((reason) => console.error("Error: ", reason));
});

async function spin() {
	const response = await fetch("http://localhost:3000/spin", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ bet: 20 }),
	});
	const data: ApiResponse<CalculateJackpotResponse> = await response.json();
	return data;
}

function startSpinAnimation() {
	if (spinInterval) clearInterval(spinInterval);

	slots.forEach((slot) => {
		slot.classList.remove("has-result");
	});

	spinInterval = setInterval(() => {
		slots.forEach((slot) => {
			if (!slot.classList.contains("has-result")) {
				const randomEmoji =
					emojis[Math.floor(Math.random() * emojis.length)];
				slot.innerText = randomEmoji;
			}
		});
	}, 100); // troca a cada 100ms
}

function stopSpinAnimation(finalResult: string[], message: string) {
	// mostra resultado final nos 3 slots
	slots[0].classList.add("has-result");
	slots[0].innerText = finalResult[0] ?? "❓";
	setTimeout(() => {
		slots[1].classList.add("has-result");
		slots[1].innerText = finalResult[1] ?? "❓";
	}, 1000);
	setTimeout(() => {
		slots[2].classList.add("has-result");
		slots[2].innerText = finalResult[2] ?? "❓";
		handle.classList.remove("spining");
		if (spinInterval) {
			clearInterval(spinInterval);
			spinInterval = null;
		}
		showMessage(message);
	}, 2000);
}

function showMessage(message: string) {
	switch (message) {
		case "JACKPOT": {
			displayText.style.fontSize = "60px";
			displayText.classList.add("winner");
			setTimeout(() => displayText.classList.remove("winner"), 4000);
			break;
		}
		case "2 OF A KIND": {
			displayText.style.fontSize = "57px";
			displayText.classList.add("winner");
			setTimeout(() => displayText.classList.remove("winner"), 3000);
			break;
		}
		case "BETTER LUCK NEXT TIME!": {
			displayText.style.fontSize = "30px";
			break;
		}
		default: {
			displayText.classList.remove("winner");
			displayText.style.fontSize = "60px";
		}
	}
	displayText.innerText = message;
}
