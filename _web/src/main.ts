import { CalculateJackpotResponse } from "../../_service/slotMachine";
import { ApiResponse } from "../../api-response";

/* -------------------- CONSTANTES -------------------- */
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

/* -------------------- ELEMENTOS DO DOM -------------------- */
const tooltip = document.getElementById("tooltip")! as HTMLParagraphElement;
const lever = document.getElementById("lever")! as HTMLButtonElement;
const handle = document.getElementById("lever-handle")! as HTMLDivElement;
const slots = document.querySelectorAll<HTMLSpanElement>(".slot")!;
const displayText = document.querySelector<HTMLParagraphElement>(".display p")!;
const menuButton = document.getElementById(
	"menu-handler"
)! as HTMLButtonElement;
const menu = document.getElementById("config")! as HTMLDivElement;

const moneySpan = document.getElementById("current-money")! as HTMLSpanElement;
const betSpan = document.getElementById("current-bet")! as HTMLSpanElement;

const addMoneyInput = document.querySelectorAll<HTMLInputElement>(
	"aside input[type=number]"
)[0];
const addMoneyBtn =
	document.querySelectorAll<HTMLButtonElement>("aside button")[0];

const betInput = document.querySelectorAll<HTMLInputElement>(
	"aside input[type=number]"
)[1];
const setBetBtn =
	document.querySelectorAll<HTMLButtonElement>("aside button")[1];

/* -------------------- VARIÁVEIS -------------------- */
let spinInterval: NodeJS.Timeout | null = null;
let tooltipTimeout: NodeJS.Timeout | null = setTimeout(
	() => tooltip.classList.remove("none"),
	100000
);

let money = parseInt(getCookie("money") || "0", 10);
let bet = parseInt(getCookie("bet") || "0", 10);

moneySpan.textContent = money.toFixed(2);
betSpan.textContent = bet.toFixed(2);

/* -------------------- FUNÇÕES AUXILIARES -------------------- */
function setCookie(name: string, value: string, days = 365) {
	const expires = new Date(Date.now() + days * 864e5).toUTCString();
	document.cookie = `${name}=${encodeURIComponent(
		value
	)}; expires=${expires}; path=/`;
}

function getCookie(name: string): string | null {
	return document.cookie.split("; ").reduce((r, v) => {
		const parts = v.split("=");
		return parts[0] === name ? decodeURIComponent(parts[1]) : r;
	}, null as string | null);
}

function showMessage(message: string) {
	switch (message) {
		case "JACKPOT":
			displayText.style.fontSize = "60px";
			displayText.classList.add("winner");
			setTimeout(() => displayText.classList.remove("winner"), 4000);
			break;
		case "2 OF A KIND":
			displayText.style.fontSize = "57px";
			displayText.classList.add("winner");
			setTimeout(() => displayText.classList.remove("winner"), 3000);
			break;
		case "BETTER LUCK NEXT TIME!":
			displayText.style.fontSize = "30px";
			break;
		default:
			displayText.classList.remove("winner");
			displayText.style.fontSize = "60px";
	}
	displayText.innerText = message;
}

function startSpinAnimation() {
	if (spinInterval) clearInterval(spinInterval);

	slots.forEach((slot) => slot.classList.remove("has-result"));

	spinInterval = setInterval(() => {
		slots.forEach((slot) => {
			if (!slot.classList.contains("has-result")) {
				const randomEmoji =
					emojis[Math.floor(Math.random() * emojis.length)];
				slot.innerText = randomEmoji;
			}
		});
	}, 100);
}

function stopSpinAnimation(finalResult: string[], message: string) {
	// slot 0
	slots[0].classList.add("has-result");
	slots[0].innerText = finalResult[0] ?? "❓";

	// slot 1
	setTimeout(() => {
		slots[1].classList.add("has-result");
		slots[1].innerText = finalResult[1] ?? "❓";
	}, 1000);

	// slot 2 e fim da animação
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

async function spin(timeout = 8000) {
	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), timeout);

	try {
		const response = await fetch("http://localhost:3000/spin", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ bet }),
			signal: controller.signal,
		});

		const data: ApiResponse<CalculateJackpotResponse> =
			await response.json();
		return data;
	} catch (err) {
		if (err instanceof DOMException && err.name === "AbortError") {
			throw new Error("Request timed out");
		}
		throw err;
	} finally {
		clearTimeout(timer);
	}
}
/* -------------------- EVENTOS -------------------- */
handle.addEventListener("click", () => {
	if (tooltipTimeout) clearTimeout(tooltipTimeout);

	if (money < bet || bet <= 0) {
		alert("Not enough money or invalid bet!");
		return;
	}

	money -= bet;
	setCookie("money", money.toFixed(2));
	moneySpan.textContent = money.toFixed(2);

	tooltip.classList.add("none");
	lever.classList.add("pulled");
	handle.classList.add("pulled", "spining");

	showMessage("SPINNING");

	setTimeout(() => {
		lever.classList.remove("pulled");
		handle.classList.remove("pulled");
	}, 1000);

	startSpinAnimation();

	spin()
		.then((data) => {
			console.table(data);
			if (data.success) {
				const resultData = data.data;
				setTimeout(() => {
					stopSpinAnimation(
						[resultData.slot0, resultData.slot1, resultData.slot2],
						resultData.result
					);

					if (resultData.profit !== 0) {
						money += resultData.profit;
						setCookie("money", money.toFixed(2));
						moneySpan.textContent = money.toFixed(2);
					}
				}, 2000);
			}
		})
		.catch((reason) => {
			console.error("Error: ", reason);
			stopSpinAnimation([undefined, undefined, undefined], "ERROR");
		});
});

menuButton.addEventListener("click", () => {
	menu.classList.toggle("open");
});

addMoneyBtn.addEventListener("click", () => {
	const value = parseInt(addMoneyInput.value || "0", 10);
	if (value > 0) {
		money += value;
		setCookie("money", money.toFixed(2));
		moneySpan.textContent = money.toFixed(2);
		addMoneyInput.value = "";
	}
});

setBetBtn.addEventListener("click", () => {
	const value = parseInt(betInput.value || "0", 10);
	if (value > 0 && value <= money) {
		bet = value;
		setCookie("bet", bet.toFixed(2));
		betSpan.textContent = bet.toFixed(2);
		betInput.value = "";
	}
});
